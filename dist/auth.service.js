import ora from 'ora';
import { loadToken, saveTokens, loadUser, loadKey } from './storage.service.js';
import { decryptKey } from './key.service.js';
import { gridlock } from './gridlock.js';
import bs58 from 'bs58';
import { fromSeed, encode, createCurve, decode, } from '@nats-io/nkeys';
import base32 from 'hi-base32';
export async function login({ email, password }) {
    let authTokens = await loginWithToken({ email });
    if (!authTokens) {
        const loginResponse = await loginWithKey({ email, password });
        authTokens = loginResponse ? loginResponse : null;
    }
    if (authTokens) {
        saveTokens({ authTokens, email });
    }
    return authTokens;
}
async function loginWithToken({ email, }) {
    const accessToken = loadToken({ email, type: 'refresh' }); //todo actually fix this shit so it uses acces and not refresh lol wtf
    if (accessToken) {
        const spinner = ora('Attempting to log in with token...').start();
        const loginResponse = await gridlock.loginWithToken(accessToken);
        if (loginResponse.success) {
            spinner.succeed('Logged in with token successfully');
            return loginResponse.data;
        }
        else {
            spinner.fail(`Failed to log in with token`);
            console.error(`Error: ${loginResponse.error.message} (Code: ${loginResponse.error.code})`);
        }
    }
    return null;
}
async function loginWithKey({ email, password, }) {
    const spinner = ora('Attempting to log in with challenge-response...').start();
    const user = loadUser({ email });
    if (!user) {
        spinner.fail('User not found.');
        console.error('User not found.');
        return null;
    }
    const { nodeId } = user.ownerGuardian;
    const privateKeyObject = loadKey({ identifier: nodeId, type: 'identity' }); //todo fix this at a later date after e2e
    if (!privateKeyObject) {
        spinner.fail('Owner guardian private key not found.');
        return null;
    }
    const privateKeyBuffer = await decryptKey({ encryptedKeyObject: privateKeyObject, password });
    const loginResponse = await gridlock.loginWithKey(user, privateKeyBuffer);
    if (loginResponse.success) {
        spinner.succeed('Logged in with challenge-response successfully');
        return loginResponse.data;
    }
    else {
        spinner.fail('Failed to log in with challenge-response');
        console.error(`Error: ${loginResponse.error.message} (Code: ${loginResponse.error.code})`);
        return null;
    }
}
export async function encryptContents({ email, password, content, target, }) {
    // const user = createUser();
    // console.log('User:\n', user);
    // const seed: Uint8Array = user.getSeed();
    // console.log('Seed:', seed);
    // const encodedSeed = encode(seed);
    // console.log('Encoded Seed:', encodedSeed);
    // const localKeyPair = createCurve();
    // const localSeed = localKeyPair.getSeed();
    // console.log('seed:', encode(localSeed));
    // // console.log('Local Key Pair Seed:', encode(localKeyPair.seed));
    // const localPublic = localKeyPair.getPublicKey();
    // console.log('Public Key:', localPublic);
    // const localPrivate = localKeyPair.getPrivateKey();
    // console.log('Private Keyyyyy:', encode(localPrivate));
    // const localPrivateBase32 = base32.encode(localPrivate);
    // console.log('Base32 Encoded Private Key:', localPrivateBase32);
    // const ca = fromCurveSeed(localSeed);
    // console.log('ca:', encode(ca.seed));
    // const cdencoded = encode(ca.getPrivateKey());
    // console.log('cdencoded:', cdencoded);
    ///the flow that works. - LOCAL
    const localKeyPair = createCurve();
    console.log('Local Key Pair:\n\n', localKeyPair);
    console.log('Seed:\n\n', localKeyPair.seed);
    console.log('Local Key Pair Seed:\n\n', localKeyPair.getSeed()); //printing base32 array?????
    // console.log('Local Key Pair Seed encoded:\n\n', encode(localKeyPair.getSeed()));
    const base58String = bs58.encode(Buffer.from(localKeyPair.seed));
    // console.log('Base58 ENCODED String__________________:\n\n', base58String);
    // const base58Array = Uint8Array.from([...base58String].map((char) => bs58.decode(char)[0]));
    // console.log('Base58 ENCODED:\n\n', base58Array);
    const base32EncodedSeed = base32.encode(localKeyPair.getSeed());
    // console.log('Base32 ENCODED:\n\n', base32EncodedSeed);
    const base32Array = base32.decode.asBytes(base32EncodedSeed);
    console.log('Base32 ENCODED Array:\n\n', base32Array);
    const localPublic = localKeyPair.getPublicKey();
    console.log('Public Key:\n\n', localPublic);
    const localPrivate = localKeyPair.getPrivateKey();
    console.log('local Private Key:\n\n', encode(localPrivate));
    // GUARDIAN
    const guardianKeyPair = createCurve();
    // const guardianPublic = guardianKeyPair.getPublicKey();
    const guardianPublic = 'XC6O2H45F63JB45N3PX5MZYIXAPVBE7ONWRPR57UDX2IJ44YWENQUMOW';
    console.log('Guardian Public Key:\n\n', guardianPublic);
    const guardianPrivate = guardianKeyPair.getPrivateKey();
    console.log('Guardian Private Key:\n\n', encode(guardianPrivate));
    //INTERMEDIARY SAVE LOCAL
    const seedfromKP = localKeyPair.getSeed();
    console.log('Seed from Key Pair seed:\n\n', seedfromKP);
    console.log('Seed from Key Pair seed (encoded):\n\n', encode(seedfromKP));
    const localKeyPair_recovered = fromSeed(seedfromKP);
    console.log('Recovered Key Pair:\n\n', localKeyPair_recovered);
    // const gp = 'XCEZPLNY3KS4UZSCMXMSDRMIGJT7Y6RY5KW5FHKENKXYI3QPIROBVY3Z';
    // const gs = 'SXAPSEDRD64XTQYEBIMWAVIGD7ASFP3FSKBBKG56G42RAT3FHWVAJFGX2A';
    // const gkp = fromCurveSeed(Uint8Array.from(gs));
    //ENCRYPT
    const encryptedMessage = localKeyPair.seal(Buffer.from(content), guardianPublic);
    const encryptedMessage_encoded = encode(encryptedMessage);
    console.log('sealing done:\n\n');
    const sendToGuardianResponse = await gridlock.sendToGuardian({
        nodeId: target,
        encryptedMessage: encryptedMessage_encoded,
        publicKey: guardianPublic,
    });
    // if (!sendToGuardianResponse.success) {
    //   console.error(`Failed to send to guardian: ${sendToGuardianResponse.error.message}`);
    //   return null;
    // }
    console.log('Message sent to guardian successfully');
    const decryptedMessage = guardianKeyPair.open(decode(encryptedMessage_encoded), localPublic);
    const decoder = new TextDecoder('utf-8');
    const readableString = decoder.decode(decryptedMessage ?? new Uint8Array());
    console.log('Human Readable Decrypted Message:\n\n', readableString);
    // const guardianPublic = 'XDN2JJSOGIAGA6IUYSX5WTXKTPEJOVHRHA2MPRSOZOX2IVATUW5HFVVC';
    // const guardianPrivate =
    //   'UEJVSURURFpEUk80MlBPQ1NOUFI2TUZGT1M1VUpGM1hYUk9HUU1aWTZUS09GWU01N1daUUJVRVI=';
    // const localPublic = 'XBJTDXMIM6SOKHYU3CSQTX4UJZR3Y35BWHFWXSAUADNEH4EQLPTWQXIL';
    // const localPrivate =
    //   'UENUNFpYSElZR1lRREdLQUlUSVk3Q0ZVN1ZBSEVNSVRRUlc0RTVKWVVPR0JCWk1HU0lZTldVTlA=';
    // const localSeed =
    //   'U1hBS1BURzQ1REEzQ0FNWklCQ05ERDRJV1Q2VUE0UlJDT0NHM1FUVkhDUllZRUhGUTJKREJXM1BRWQ==';
    // const seedfromKP = guardianKeyPair.getSeed();
    // const xxx = fromCurveSeed(seedfromKP);
    // console.log('Local Key Pair:', xxx);
    // const guardianKeyPair2 = fromPublic(guardianPublic);
    // const seed2 = guardianKeyPair2.getSeed();
    // console.log('Seed from Key Pair2:', encode(seed2));
    // // const guardianKeyPair2 = fromSeed(seedfromKP);
    // console.log('Guardian Key Pair:', guardianKeyPair);
    // console.log('Guardian Key Pair2:', guardianKeyPair2);
    // const encryptedMessage = xxx.seal(Buffer.from(content), guardianPublic);
    // console.log('sealing done:', encryptedMessage);
    // const decryptedMessage = guardianKeyPair.open(encryptedMessage, localPublic);
    // const decoder = new TextDecoder('utf-8');
    // const readableString = decoder.decode(decryptedMessage ?? new Uint8Array());
    // console.log('Human Readable Decrypted Message:', readableString);
    // console.log('Encrypted Message:', encryptedMessage);
    // console.log('encoded Encrypted Message:', encode(encryptedMessage));
    // const encodedguardianPrivate = encode(privateKey);
    // const decryptedMessage = localKeyPair.open(encryptedMessage, xxx);
    // console.log('Decrypted Message:', decryptedMessage);
    // const decryptedMessageString = encode(decryptedMessage!);
    // console.log('Decrypted Message String:', decryptedMessageString);
    return null;
    // const userPrivateKeyObject_encrypted = loadKey({ identifier: email, type: 'private' });
    // console.log('userPrivateKeyObject_encrypted:', userPrivateKeyObject_encrypted); //debug
    // const userPrivateKey = await decryptKey({
    //   encryptedKeyObject: userPrivateKeyObject_encrypted,
    //   password,
    // });
    // console.log('userPrivateKey:', userPrivateKey); //debug
    // const userPrivateKeyBuffer = Buffer.from(userPrivateKey, 'base64');
    // const targetPublicKeyObject = loadKey({ identifier: target, type: 'public' });
    // console.log('target', target); //debug
    // const guardian = loadGuardian({ nodeId: target });
    // console.log('guardian:', guardian); //debug
    // if (!guardian || !guardian.publicKey) {
    //   console.error('Target recpienct of encryption not found.');
    //   return null;
    // }
    // const targetPublicKeyBuffer = Buffer.from(guardian.publicKey, 'base64');
    // const nonce = nacl.randomBytes(nacl.box.nonceLength);
    // const encryptedMessage = nacl.box(
    //   Buffer.from(content),
    //   nonce,
    //   targetPublicKeyBuffer,
    //   userPrivateKeyBuffer
    // );
    // console.log('encryptedMessageeeeeeeeeeeeeeeee:', encryptedMessage); //debug
    // return Buffer.concat([nonce, encryptedMessage]).toString('base64');
    // console.log('userPrivateKeyObject:', userPrivateKey);
    // //
    //
    //
    // const nodePublicKeyObject = loadKey({ nodeId, type: 'public' });
    // if (!userPrivateKeyObject || !nodePublicKeyObject) {
    //   console.error('Required keys not found.');
    //   return null;
    // }
    // const userPrivateKey = Buffer.from(userPrivateKeyObject, 'base64');
    // const nodePublicKey = Buffer.from(nodePublicKeyObject, 'base64');
    // const nonce = nacl.randomBytes(nacl.box.nonceLength);
    // const encryptedMessage = nacl.box(Buffer.from(content), nonce, nodePublicKey, userPrivateKey);
    // return Buffer.from(encryptedMessage).toString('base64');
    return null;
}
// if (1 === 1) {
//   const msg = 'hello';
//   const ownerPublicKey = 'XqLZR4GBOhYkHanYW3UzldbcD8aDvDuqHkYkwV4XjVs=';
//   const ownerPrivateKey = 'zANmRq6dWaeajerUDDXYDl2jLeOoKFnjKKTghO4puE4=';
//   const guardianPublicKey = 'cT0Z8RsJrk9vREPuurwZu8N5+hlON/1DdqUznaOv1yc=';
//   const guardianPrivateKey = 'OtLWorGdh0Ft7/5C6CwBqKWP8npOgpmaC3BdSiA1WBk=';
//   const nonce = nacl.randomBytes(nacl.box.nonceLength);
//   const g_publicKeyUint8Array = Buffer.from(guardianPublicKey, 'base64');
//   const o_privateKeyUint8Array = Buffer.from(ownerPrivateKey, 'base64');
//   const encryptedMessage = nacl.box(
//     Buffer.from(msg),
//     nonce,
//     g_publicKeyUint8Array,
//     o_privateKeyUint8Array
//   );
//   console.log('Encrypted Message:', Buffer.from(encryptedMessage).toString('base64'));
//   const o_publicKeyUint8Array = Buffer.from(ownerPublicKey, 'base64');
//   const g_privateKeyUint8Array = Buffer.from(guardianPrivateKey, 'base64');
//   // Decrypt the message
//   const decryptedMessage = nacl.box.open(
//     encryptedMessage,
//     nonce,
//     o_publicKeyUint8Array,
//     g_privateKeyUint8Array
//   );
//   if (decryptedMessage) {
//     console.log('Decrypted Message:', Buffer.from(decryptedMessage).toString('utf8'));
//   } else {
//     console.error('Failed to decrypt the message');
//   }
// create a function called encryptContents that takes parameters email, content, and nodeId.
// Using the node ID pull the public key of the node. using the email, pull the private key from the signing key.
//# sourceMappingURL=auth.service.js.map