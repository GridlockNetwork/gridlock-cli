import ora from 'ora';
import { loadToken, saveTokens, loadUser, loadKey } from './storage.service.js';
import { decryptKey } from './key.service.js';
import { gridlock } from './gridlock.js';
import { API_KEY, BASE_URL, DEBUG_MODE } from './constants.js';
import type { AccessAndRefreshTokens } from 'gridlock-sdk/dist/types/auth.type.d.ts';
import nacl from 'tweetnacl';
import { loadGuardian } from './storage.service.js';
import { get } from 'http';

interface UserCredentials {
  email: string;
  password: string;
}

interface E2EEncryptionParams {
  recieverPrivKeyIdentifier: string;
  password: string;
  message: string;
  senderPubKey: string;
}
export async function decryptmessage({
  recieverPrivKeyIdentifier,
  password,
  message,
  senderPubKey,
}: E2EEncryptionParams): Promise<string | null> {
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
