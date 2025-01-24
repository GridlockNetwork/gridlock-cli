import crypto from 'crypto';
import nacl from 'tweetnacl';

async function deriveKey(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 32, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function encryptKey({ key, password }) {
  const salt = crypto.randomBytes(16);
  const derivedKey = await deriveKey(password, salt);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);
  const encryptedKey = Buffer.concat([cipher.update(key), cipher.final()]);
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

export async function decryptKey({ encryptedKeyObject, password }) {
  try {
    const { key, iv, authTag, salt } = encryptedKeyObject;
    const derivedKey = await deriveKey(password, Buffer.from(salt, 'base64'));
    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    let decryptedKey = decipher.update(key, 'base64', 'utf8');
    decryptedKey += decipher.final('utf8');
    return decryptedKey;
  } catch (error) {
    console.error('Failed to decrypt key:', error.message);
    throw new Error('Decryption failed. Please check your password and try again.');
  }
}

export async function generateSigningKey() {
  const signingKey = crypto.randomBytes(32);
}

export function generateIdentityKey() {
  const keyPair = nacl.box.keyPair();
  const privateKey = Buffer.from(keyPair.secretKey);
  const publicKey = Buffer.from(keyPair.publicKey);
  return { privateKey: privateKey.toString('base64'), publicKey: publicKey.toString('base64') };
}

/**
 * Derives a stronger, unique node-specific key using HKDF.
 * @param {Buffer} signingKey - The encrypted signing key.
 * @param {string} nodeId - The unique node ID.
 * @returns {string} - A unique per-node derived key.
 */
export function nodeSigningKey(signingKey, nodeId) {
  return crypto
    .hkdfSync(
      'sha256', // Hash function
      signingKey, // Input key material
      Buffer.from(nodeId), // Salt (adds uniqueness)
      Buffer.from('node-auth'), // Info (context-specific label)
      32 // Output length (256-bit key)
    )
    .toString('hex');
}
