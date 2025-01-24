import ora from 'ora';
import { loadToken, saveTokens, loadUser, loadKey } from './storage.service.js';
import { decryptKey } from './key.service.js';
import { gridlock } from './gridlock.js';
export async function login({ email, password }) {
    console.log('Logging in...'); //debug
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
async function loginWithToken({ email }) {
    const accessToken = loadToken({ email, type: 'refresh' });
    if (accessToken) {
        const spinner = ora('Attempting to log in with token...').start();
        const loginResponse = await gridlock.loginWithToken(accessToken);
        if (loginResponse.success) {
            spinner.succeed('Logged in with token successfully');
            return { authTokens: loginResponse.data.authTokens };
        }
        else {
            spinner.fail(`Failed to log in with token`);
            console.error(`Error: ${loginResponse.error.message} (Code: ${loginResponse.error.code})`);
        }
    }
    return null;
}
async function loginWithKey({ email, password }) {
    const spinner = ora('Attempting to log in with challenge-response...').start();
    const user = loadUser({ email });
    if (!user) {
        spinner.fail('User not found.');
        console.error('User not found.');
        return null;
    }
    const { nodeId } = user.ownerGuardian;
    const privateKeyObject = loadKey({ nodeId, type: 'identity' });
    if (!privateKeyObject) {
        spinner.fail('Owner guardian private key not found.');
        return null;
    }
    const privateKeyBuffer = await decryptKey({ encryptedKeyObject: privateKeyObject, password });
    const loginResponse = await gridlock.loginWithKey(user, privateKeyBuffer);
    if (loginResponse.success) {
        spinner.succeed('Logged in with challenge-response successfully');
        return { authTokens: loginResponse.data.authTokens };
    }
    else {
        spinner.fail('Failed to log in with challenge-response');
        console.error(`Error: ${loginResponse.error.message} (Code: ${loginResponse.error.code})`);
        return null;
    }
}
// export function encryptContents(contents) {
//   return contents;
// }
// if (1 === 1) {
//     const msg = "hello";
//     const ownerPublicKey = 'XqLZR4GBOhYkHanYW3UzldbcD8aDvDuqHkYkwV4XjVs=';
//     const ownerPrivateKey = 'zANmRq6dWaeajerUDDXYDl2jLeOoKFnjKKTghO4puE4=';
//     const guardianPublicKey = 'cT0Z8RsJrk9vREPuurwZu8N5+hlON/1DdqUznaOv1yc=';
//     const guardianPrivateKey = 'OtLWorGdh0Ft7/5C6CwBqKWP8npOgpmaC3BdSiA1WBk=';
//     const nonce = nacl.randomBytes(nacl.box.nonceLength);
//     const g_publicKeyUint8Array = Buffer.from(guardianPublicKey, 'base64');
//     const o_privateKeyUint8Array = Buffer.from(ownerPrivateKey, 'base64');
//     const encryptedMessage = nacl.box(Buffer.from(msg), nonce, g_publicKeyUint8Array, o_privateKeyUint8Array);
//     console.log('Encrypted Message:', Buffer.from(encryptedMessage).toString('base64'));
//     const o_publicKeyUint8Array = Buffer.from(ownerPublicKey, 'base64');
//     const g_privateKeyUint8Array = Buffer.from(guardianPrivateKey, 'base64');
//     // Decrypt the message
//     const decryptedMessage = nacl.box.open(encryptedMessage, nonce, o_publicKeyUint8Array, g_privateKeyUint8Array);
//     if (decryptedMessage) {
//       console.log('Decrypted Message:', Buffer.from(decryptedMessage).toString('utf8'));
//     } else {
//       console.error('Failed to decrypt the message');
//     }
// create a function called encryptContents that takes parameters email, content, and nodeId.
// Using the node ID pull the public key of the node. using the email, pull the private key from the signing key.
//# sourceMappingURL=auth.service.js.map