import ora from 'ora';
import { saveTokens, saveUser, saveKey } from './storage.service.js';
import { API_KEY, BASE_URL, DEBUG_MODE } from './constants';
import chalk from 'chalk';

import { gridlock } from './gridlock.js';
import { generateE2EKey, encryptKey, generateSigningKey } from './key.service.js';
import type { IRegisterData } from 'gridlock-sdk/dist/types/user.type.d.ts';
import inquirer from 'inquirer';

export const createUserInquire = async (options: {
  name?: string;
  email?: string;
  password?: string;
}) => {
  let { name, email, password } = options;
  if (!name || !email || !password) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'User name:' },
      { type: 'input', name: 'email', message: 'User email:' },
      { type: 'password', name: 'password', message: 'User password:' },
    ]);
    name = answers.name;
    email = answers.email;
    password = answers.password;
  }
  await createUser({
    name: name as string,
    email: email as string,
    password: password as string,
  });
};

// ...existing code...

interface CreateUserParams {
  name: string;
  email: string;
  password: string;
}

/**
 * Creates a new user with the provided name, email, and password.
 *
 * @param {Object} params - The parameters for creating a user.
 * @param {string} params.name - The name of the user.
 * @param {string} params.email - The email address of the user.
 * @param {string} params.password - The password for the user's account.
 * @returns {Promise<void>} A promise that resolves when the user is created.
 */
export const createUser = async ({ name, email, password }: CreateUserParams) => {
  const spinner = ora('Creating user...').start();
  const registerData = {
    name: name,
    email: email.toLowerCase().trim(),
  };

  try {
    const response = await gridlock.createUser(registerData, password);
    const { user } = response;
    spinner.succeed(`➕ Created account for user: ${chalk.hex('#4A90E2').bold(user.name)}`);
  } catch {
    spinner.fail('Failed to create user');
  }
};
