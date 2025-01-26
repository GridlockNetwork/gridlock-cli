import crypto from 'crypto';
import { fromSeed, encode, createCurve, decode } from '@nats-io/nkeys';
import { loadKey } from './storage.service.js';
async function deriveKey(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 32, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
            if (err)
                reject(err);
            else
                resolve(derivedKey);
        });
    });
}
export async function encryptKey({ key, password }) {
    const salt = crypto.randomBytes(16);
    const derivedKey = await deriveKey(password, salt);
    const stretchedKey = crypto.createHash('sha256').update(derivedKey).digest();
    const iv = crypto.randomBytes(12); // Random IV for AES-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', stretchedKey, iv);
    const encryptedKey = Buffer.concat([cipher.update(key, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
        key: encryptedKey.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        salt: salt.toString('base64'),
        algorithm: 'aes-256-gcm',
        createdAt: new Date().toISOString(),
    };
}
export async function decryptKey({ encryptedKeyObject, password, }) {
    try {
        const { key, iv, authTag, salt } = encryptedKeyObject;
        const derivedKey = await deriveKey(password, Buffer.from(salt, 'base64'));
        const stretchedKey = crypto.createHash('sha256').update(derivedKey).digest();
        const decipher = crypto.createDecipheriv('aes-256-gcm', stretchedKey, Buffer.from(iv, 'base64'));
        decipher.setAuthTag(Buffer.from(authTag, 'base64'));
        let decryptedKey = decipher.update(key, 'base64', 'utf8');
        decryptedKey += decipher.final('utf8');
        return decryptedKey;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Failed to decrypt key:', error.message);
        }
        else {
            console.error('Failed to decrypt key:', error);
        }
        throw new Error('Decryption failed. Please check your password and try again.');
    }
}
export async function generateSigningKey() {
    return crypto.randomBytes(32).toString('base64');
}
export function generateIdentityKey() {
    const guardianKeyPair = createCurve();
    const publicKey = guardianKeyPair.getPublicKey();
    const seed = guardianKeyPair.getSeed();
    return { publicKey: publicKey, seed: encode(seed) };
}
/**
 * Derives a stronger, unique node-specific key using HKDF.
 * @param {Buffer} signingKey - The encrypted signing key.
 * @param {string} nodeId - The unique node ID.
 * @returns {string} - A unique per-node derived key.
 */
export function getNodeSigningKey(signingKey, nodeId) {
    return Buffer.from(crypto.hkdfSync('sha256', signingKey, Buffer.from(nodeId), Buffer.from('node-auth'), 32)).toString('base64');
}
export async function encryptContents({ content, publicKey, identifier, password, }) {
    const encryptedKeyPairSeed = loadKey({ identifier, type: 'seed' });
    console.log('Encrypted key pair seed:', encryptedKeyPairSeed); // debug
    const keyPairSeed = await decryptKey({ encryptedKeyObject: encryptedKeyPairSeed, password });
    console.log('Decrypted key pair seed:', keyPairSeed); // debug
    const userKeyPair = fromSeed(decode(keyPairSeed));
    return encode(userKeyPair.seal(Buffer.from(content), publicKey));
}
export async function generatePasswordBundle({ user, password, }) {
    console.log('Generating password bundle for user:'); // debug
    const signingKey = await loadKey({ identifier: user.email, type: 'signing' });
    console.log('Loaded signing key:', signingKey); // debug
    const decryptedSigningKey = await decryptKey({
        encryptedKeyObject: signingKey,
        password,
    });
    console.log('Decrypted signing key:', decryptedSigningKey); // debug
    const nodes = [];
    const nodePool = user.nodePool;
    console.log('Node pool:', nodePool); // debug
    for (const n of nodePool) {
        console.log('Generating node signing key for node:', n.nodeId); // debug
        const nodeSigningKey = getNodeSigningKey(Buffer.from(decryptedSigningKey, 'base64'), n.nodeId);
        console.log(nodeSigningKey); // debug
        console.log(`Node ID: ${n.nodeId}, Node Signing Keyy: ${nodeSigningKey}`); // debug
        const encryptedContent = await encryptContents({
            content: nodeSigningKey,
            publicKey: n.publicKey,
            identifier: user.email,
            password,
        });
        console.log(`Encrypted content for node ${n.nodeId}: ${encryptedContent}`); // debug
        nodes.push({ nodeId: n.nodeId, encryptedSigningKey: encryptedContent });
    }
    return { nodes };
}
//# sourceMappingURL=key.service.js.map