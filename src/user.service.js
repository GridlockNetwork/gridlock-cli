import ora from 'ora';
import { saveTokens, saveUser } from './storage.service.js';
import { API_KEY, BASE_URL, DEBUG_MODE } from './constants.js';
import chalk from 'chalk';

import { gridlock } from '../gridlock.js';
import { generateIdentityKey, encryptKey, decryptKey } from './key.service.js';
import { saveKey } from './storage.service.js';

export async function createUser({ name, email, password }) {
  const spinner = ora('Creating user...').start();

  const registerData = {
    name: name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '),
    email: email.toLowerCase(),
  };

  const response = await gridlock.createUser(registerData);
  if (!response.success) {
    spinner.fail(
      `Failed to create user\nError: ${response.error.message} (Code: ${response.error.code})${
        response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''
      }`
    );
    return;
  }
  const { user, authTokens } = response.data;
  const { publicKey, privateKey } = generateIdentityKey();
  const encryptedPublicKey = await encryptKey({ key: publicKey, password });
  const encryptedPrivateKey = await encryptKey({ key: privateKey, password });

  saveKey({ identifier: email, key: encryptedPublicKey, type: 'public' });
  saveKey({ identifier: email, key: encryptedPrivateKey, type: 'private' });

  saveTokens({ authTokens, email });
  saveUser({ user });
  spinner.succeed(`➕ Created account for user: ${chalk.hex('#4A90E2').bold(user.name)}`);
}
