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

export async function login({ email, password }: UserCredentials) {
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
async function loginWithToken({
  email,
}: {
  email: string;
}): Promise<AccessAndRefreshTokens | null> {
  const accessToken = loadToken({ email, type: 'refresh' }); //todo actually fix this shit so it uses acces and not refresh lol wtf
  if (accessToken) {
    const spinner = ora('Attempting to log in with token...').start();
    const loginResponse = await gridlock.loginWithToken(accessToken);
    if (loginResponse.success) {
      spinner.succeed('Logged in with token successfully');
      return loginResponse.data;
    } else {
      spinner.fail(`Failed to log in with token`);
      console.error(`Error: ${loginResponse.error.message} (Code: ${loginResponse.error.code})`);
    }
  }
  return null;
}
async function loginWithKey({
  email,
  password,
}: UserCredentials): Promise<AccessAndRefreshTokens | null> {
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
  } else {
    spinner.fail('Failed to log in with challenge-response');
    console.error(`Error: ${loginResponse.error.message} (Code: ${loginResponse.error.code})`);
    return null;
  }
}
interface E2EEncryptionParams {
  email: string;
  password: string;
  content: string;
  target: string;
}
export async function encryptContents({
  email,
  password,
  content,
  target,
}: E2EEncryptionParams): Promise<string | null> {
  return null;
}
