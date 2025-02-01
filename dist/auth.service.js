import inquirer from 'inquirer';
export const getEmailandPassword = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'User email:' },
        { type: 'password', name: 'password', message: 'User password:' },
    ]);
    return answers;
};
// export const validateEmailandPassword = async ({
//   email,
//   password,
// }: {
//   email: string;
//   password: string;
// }) => {
//   try {
//     const user = await loadUser({ email });
//     if (!user) {
//       throw new Error('User not found');
//     }
//     const encryptedKeyObject = await loadKey({ identifier: email, type: 'public' });
//     if (!encryptedKeyObject) {
//       throw new Error('Failed to load user keys');
//     }
//     const decryptedKey = await decryptKey({ encryptedKeyObject, password });
//     if (!decryptedKey) {
//       throw new Error('Failed to decrypt private key');
//     }
//     return true;
//   } catch (error) {
//     console.error('xxxxxxxxxxxxxxxxxxxxx');
//     throw new Error('Izzzzzzzzzzzzzzzzzzzzzzzzzz');
//     // return false;
//   }
// };
// export async function decryptmessage({
//   recieverPrivKeyIdentifier,
//   password,
//   message,
//   senderPubKey,
// }: E2EEncryptionParams): Promise<string | null> {
//   const privateKey = recieverPrivKeyIdentifier;
//   const privateKeyBuffer = Buffer.from(privateKey, 'base64');
//   const kp = nacl.box.keyPair.fromSecretKey(privateKeyBuffer).secretKey;
//   const publicKey = Buffer.from(senderPubKey, 'base64');
//   const messageBuffer = Buffer.from(message, 'base64');
//   const nonce = messageBuffer.slice(0, nacl.box.nonceLength);
//   const ciphertext = messageBuffer.slice(nacl.box.nonceLength);
//   const decryptedMessage = nacl.box.open(ciphertext, nonce, publicKey, kp);
//   if (!decryptedMessage) {
//     console.error('Failed to decrypt message.');
//     return null;
//   }
//   return Buffer.from(decryptedMessage).toString('utf-8');
// }
//# sourceMappingURL=auth.service.js.map