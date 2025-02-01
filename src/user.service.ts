import ora from 'ora';
import { saveTokens, saveUser, saveKey } from './storage.service.js';
import { API_KEY, BASE_URL, DEBUG_MODE } from './constants';
import chalk from 'chalk';

import { gridlock } from './gridlock.js';
import { generateE2EKey, encryptKey, generateSigningKey } from './key.service.js';
import type { IRegisterData } from 'gridlock-sdk/dist/types/user.type.d.ts';
import inquirer from 'inquirer';
import { getEmailandPassword } from './auth.service.js';

export const createUserInquire = async (options: {
  name?: string;
  email?: string;
  password?: string;
}) => {
  let { name, email, password } = options;
  if (!email || !password) {
    const credentials = await getEmailandPassword();
    email = credentials.email;
    password = credentials.password;
  }

  if (!name) {
    const answers = await inquirer.prompt([{ type: 'input', name: 'name', message: 'User name:' }]);
    name = answers.name;
  }
  await createUser({
    name: name as string,
    email: email as string,
    password: password as string,
  });
};

/**
 * Creates a new user with the provided name, email, and password.
 *
 * @param {Object} params - The parameters for creating a user.
 * @param {string} params.name - The name of the user.
 * @param {string} params.email - The email address of the user.
 * @param {string} params.password - The password for the user's account.
 * @returns {Promise<void>} A promise that resolves when the user is created.
 */
const createUser = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const spinner = ora('Creating user...').start();

  try {
    const response = await gridlock.createUser({ name, email, password });
    const { user } = response;
    spinner.succeed(`➕ Created account for user: ${chalk.hex('#4A90E2').bold(user.name)}`);
  } catch {
    spinner.fail('Failed to create user');
  }
};
