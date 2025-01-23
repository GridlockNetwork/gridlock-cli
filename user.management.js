import ora from 'ora';
import { saveTokens, saveUser } from './storage.managment.js';
import GridlockSdk from 'gridlock-sdk';
import { API_KEY, BASE_URL, DEBUG_MODE } from './constants.js';
import chalk from 'chalk';
import { gridlock } from './gridlock.js';

export async function createUser(name, email) {
    const spinner = ora('Creating user...').start();

    const registerData = {
        name: name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
        email: email.toLowerCase(),
    };

    const response = await gridlock.createUser(registerData);
    if (!response.success) {
        spinner.fail(`Failed to create user\nError: ${response.error.message} (Code: ${response.error.code})${response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''}`);
        return;
    }
    const { user, tokens } = response.data;
    saveTokens(tokens, email);
    saveUser(user);
    spinner.succeed(`➕ Created account for user: ${chalk.hex('#4A90E2').bold(user.name)}`);
}
