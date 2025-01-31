import nacl from 'tweetnacl';
export async function decryptmessage({ recieverPrivKeyIdentifier, password, message, senderPubKey, }) {
    const privateKey = recieverPrivKeyIdentifier;
    const privateKeyBuffer = Buffer.from(privateKey, 'base64');
    const kp = nacl.box.keyPair.fromSecretKey(privateKeyBuffer).secretKey;
    const publicKey = Buffer.from(senderPubKey, 'base64');
    const messageBuffer = Buffer.from(message, 'base64');
    const nonce = messageBuffer.slice(0, nacl.box.nonceLength);
    const ciphertext = messageBuffer.slice(nacl.box.nonceLength);
    const decryptedMessage = nacl.box.open(ciphertext, nonce, publicKey, kp);
    if (!decryptedMessage) {
        console.error('Failed to decrypt message.');
        return null;
    }
    return Buffer.from(decryptedMessage).toString('utf-8');
}
//# sourceMappingURL=auth.service.js.map