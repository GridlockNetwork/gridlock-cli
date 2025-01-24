import ora from 'ora';
import { saveTokens, saveUser, saveKey } from './storage.service.js';
import { API_KEY, BASE_URL, DEBUG_MODE } from './constants';
import chalk from 'chalk';

import { gridlock } from './gridlock.js';
import { generateIdentityKey, encryptKey, decryptKey } from './key.service.js';
import type { IRegisterData } from 'gridlock-sdk/dist/types/user.type.d.ts';

/**
 * Creates a new user with the provided name, email, and password.
 *
 * @param {Object} params - The parameters for creating a user.
 * @param {string} params.name - The name of the user.
 * @param {string} params.email - The email address of the user.
 * @param {string} params.password - The password for the user's account.
 * @returns {Promise<void>} A promise that resolves when the user is created.
 */
export async function createUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const spinner = ora('Creating user...').start();

  const registerData: IRegisterData = {
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
