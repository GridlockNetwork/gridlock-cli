import ora from 'ora';
import { gridlock } from './gridlock.js';
import chalk from 'chalk';
export const createUser = async ({ name, email }) => {
    const spinner = ora('Creating user...').start();
    const registerData = {
        name: name,
        email: email.toLowerCase().trim(),
    };
    const response = await gridlock.createUser(registerData);
    if (!response.success) {
        spinner.fail(`Failed to create user\nError: ${response.error.message} (Code: ${response.error.code})${response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''}`);
        return;
    }
    const { user } = response.data;
    spinner.succeed(`➕ Created account for user: ${chalk.hex('#4A90E2').bold(user.name)}`);
};
//# sourceMappingURL=user.js.map