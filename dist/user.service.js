import ora from 'ora';
import chalk from 'chalk';
import { gridlock } from './gridlock.js';
import inquirer from 'inquirer';
import { getEmailandPassword } from './auth.service.js';
export const createUserInquire = async (options) => {
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
        name: name,
        email: email,
        password: password,
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
const createUser = async ({ name, email, password, }) => {
    const spinner = ora('Creating user...').start();
    try {
        const response = await gridlock.createUser({ name, email, password });
        const { user } = response;
        spinner.succeed(`➕ Created account for user: ${chalk.hex('#4A90E2').bold(user.name)}`);
    }
    catch {
        spinner.fail('Failed to create user');
    }
};
export const recoverInquire = async ({ email, password, }) => {
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
    return await recover({ email: email, password: password });
};
export const recover = async ({ email, password, }) => {
    const spinner = ora('Starting recovery...').start();
    try {
        const result = await gridlock.recover({ email, password });
        spinner.succeed('Recovery initiated');
        return result;
    }
    catch (error) {
        spinner.fail('Recovery failed');
        throw error;
    }
};
//# sourceMappingURL=user.service.js.map