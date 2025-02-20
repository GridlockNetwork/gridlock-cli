import ora from 'ora';
import chalk from 'chalk';

import { gridlock } from './gridlock.js';
import inquirer from 'inquirer';

export const createUserInquire = async (options: {
  name?: string;
  email?: string;
  password?: string;
  saveCredentials?: boolean;
}) => {
  let { name, email, password, saveCredentials = false } = options;

  console.log('Entered values:');
  if (name) console.log(` User name: ${chalk.hex('#4A90E2')(name)}`);
  if (email) console.log(` Email: ${chalk.hex('#4A90E2')(email)}`);
  if (password) console.log(` Password: ${chalk.hex('#4A90E2')('*******')}`);
  if (saveCredentials !== undefined)
    console.log(` Save credentials: ${chalk.hex('#4A90E2')(saveCredentials)}`);
  console.log('\n');

  if (!email) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'Enter your email:' },
    ]);
    email = answers.email;
  }
  if (!password) {
    const answers = await inquirer.prompt([
      { type: 'password', name: 'password', message: 'Enter your password:' },
    ]);
    password = answers.password;
  }
  if (!name) {
    const answers = await inquirer.prompt([{ type: 'input', name: 'name', message: 'User name:' }]);
    name = answers.name;
  }

  await createUser({
    name: name as string,
    email: email as string,
    password: password as string,
    saveCredentials: saveCredentials as boolean,
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
  saveCredentials,
}: {
  name: string;
  email: string;
  password: string;
  saveCredentials: boolean;
}) => {
  const spinner = ora('Creating user...').start();

  try {
    const response = await gridlock.createUser({ name, email, password, saveCredentials });
    const { user } = response;
    spinner.succeed(`➕ Created account for user: ${chalk.hex('#4A90E2').bold(user.name)}`);

    if (saveCredentials) {
      console.log(chalk.green('     Credentials saved for future use'));
    }
  } catch {
    spinner.fail('Failed to create user');
  }
};

export const startRecoveryInquire = async ({
  email,
  password,
}: {
  email?: string;
  password?: string;
}) => {
  console.log('Entered values:');
  if (email) console.log(` Email: ${chalk.hex('#4A90E2')(email)}`);
  if (password) console.log(` Password: ${chalk.hex('#4A90E2')('*******')}`);
  console.log('\n');

  if (!email) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'Enter your email:' },
    ]);
    email = answers.email;
  }
  if (!password) {
    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'password',
        message: 'Enter password to encrypt data if recovery works:',
      },
    ]);
    password = answers.password;
  }

  await startRecovery({
    email: email as string,
    password: password as string,
  });
};

export const startRecovery = async ({ email, password }: { email: string; password: string }) => {
  const spinner = ora('Starting recovery...').start();
  try {
    await gridlock.startRecovery({ email, password });
    spinner.succeed('Recovery initiated');
  } catch (error) {
    spinner.fail('Recovery failed');
    console.error(error);
  }
};

export const confirmRecoveryInquire = async ({
  email,
  password,
  code,
}: {
  email?: string;
  password?: string;
  code?: string;
}) => {
  console.log('Entered values:');
  if (email) console.log(` Email: ${chalk.hex('#4A90E2')(email)}`);
  if (password) console.log(` Password: ${chalk.hex('#4A90E2')('*******')}`);
  if (code) console.log(` Recovery Code: ${chalk.hex('#4A90E2')(code)}`);
  console.log('\n');

  if (!email) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'Enter your email:' },
    ]);
    email = answers.email;
  }
  if (!password) {
    const answers = await inquirer.prompt([
      { type: 'password', name: 'password', message: 'Enter your password:' },
    ]);
    password = answers.password;
  }
  if (!code) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'code', message: 'Enter your recovery code:' },
    ]);
    code = answers.code;
  }

  await confirmRecovery({
    email: email as string,
    password: password as string,
    recoveryCode: code as string,
  });
};

export const confirmRecovery = async ({
  email,
  password,
  recoveryCode,
}: {
  email: string;
  password: string;
  recoveryCode: string;
}) => {
  const spinner = ora('Confirming recovery...').start();
  try {
    await gridlock.confirmRecovery({
      email,
      password,
      recoveryCode,
    });
    spinner.succeed('Recovery confirmed successfully.');
  } catch (error) {
    spinner.fail('Recovery confirmation failed.');
    console.error(error);
  }
};
