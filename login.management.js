import ora from 'ora';
import { loadToken, saveTokens, loadUser, loadKey } from './storage.managment.js';
import { decryptKey } from './key.management.js';
import { gridlock } from './gridlock.js';
import { API_KEY, BASE_URL, DEBUG_MODE } from './constants.js';

export async function login(email, password) {
  let token = await loginWithToken(email);
  if (!token) {
    token = await loginWithKey(email, password);
  }

  if (token) {
    saveTokens(token, email);
  }
  return token;
}

async function loginWithToken(email) {
  const refreshToken = loadToken(email, 'refresh');
  if (refreshToken) {
    const spinner = ora('Attempting to log in with token...').start();
    const loginResponse = await gridlock.loginWithToken(refreshToken);
    if (loginResponse.success) {
      spinner.succeed('Logged in with token successfully');
      return loginResponse.data.tokens;
    } else {
      spinner.fail(`Failed to log in with token`);
      console.error(`Error: ${loginResponse.error.message} (Code: ${loginResponse.error.code})`);
    }
  }
  return null;
}

async function loginWithKey(email, password) {
  const spinner = ora('Attempting to log in with challenge-response...').start();
  const user = loadUser(email);
  if (!user) {
    spinner.fail('User not found.');
    console.error('User not found.');
    return null;
  }

  const { nodeId } = user.ownerGuardian;

  const privateKeyObject = loadKey(nodeId, 'identity');
  if (!privateKeyObject) {
    spinner.fail('Owner guardian private key not found.');
    return null;
  }

  const privateKeyBuffer = await decryptKey(privateKeyObject, password);
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
