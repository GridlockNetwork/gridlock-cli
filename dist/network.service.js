import ora from 'ora';
import chalk from 'chalk';
import { loadUser } from './storage.service.js';
import { getEmailandPassword } from './auth.service.js';
const guardianTypeMap = {
    'Owner Guardian': 'ownerGuardian',
    'Local Guardian': 'localGuardian',
    'Social Guardian': 'socialGuardian',
    'Cloud Guardian': 'cloudGuardian',
    'Gridlock Guardian': 'gridlockGuardian',
    'Partner Guardian': 'partnerGuardian',
};
export const showNetworkInquire = async ({ email }) => {
    let password;
    if (!email) {
        const credentials = await getEmailandPassword();
        email = credentials.email;
        password = credentials.password;
    }
    await showNetwork({ email: email, password: password });
};
export function showNetwork({ email, password }) {
    const spinner = ora('Retrieving user guardians...').start();
    const user = loadUser({ email });
    if (!user) {
        spinner.fail('User not found');
        return;
    }
    const guardians = user.nodePool || [];
    const ownerGuardianNodeId = user.ownerGuardian;
    spinner.succeed('User guardians retrieved successfully');
    console.log(chalk.bold(`\n🌐 Guardians for ${chalk.hex('#4A90E2').bold(user.name)} (${chalk
        .hex('#4A90E2')
        .bold(email)})`));
    console.log('-----------------------------------');
    if (guardians.length === 0) {
        console.log('No guardians found.');
    }
    else {
        const emojiMap = {
            localGuardian: '🏡',
            socialGuardian: '👥',
            cloudGuardian: '🌥️ ',
            gridlockGuardian: '🛡️ ',
            partnerGuardian: '🤝',
        };
        guardians.forEach((guardian, index) => {
            const emoji = emojiMap[guardian.type] || '';
            const crown = ownerGuardianNodeId
                ? console.log(`    👑 ${chalk.bold('Name:')} ${guardian.name}`)
                : console.log(`       ${chalk.bold('Name:')} ${guardian.name}`);
            console.log(`       ${chalk.bold('Type:')} ${emoji} ${Object.keys(guardianTypeMap).find((key) => guardianTypeMap[key] === guardian.type)}`);
            console.log(`       ${chalk.bold('Node ID:')} ${guardian.nodeId}`);
            console.log(`       ${chalk.bold('Public Key:')} ${guardian.publicKey}`);
            const status = guardian.active ? chalk.green('ACTIVE') : chalk.red('INACTIVE');
            console.log(`       ${chalk.bold('Status:')} ${status}`);
            if (index < guardians.length - 1) {
                console.log('       ---');
            }
        });
    }
    console.log('-----------------------------------');
    const threshold = 3;
    const thresholdCheck = guardians.length >= threshold ? chalk.green('✅') : chalk.red('❌');
    console.log(`Total Guardians: ${guardians.length} | Threshold: ${threshold} of ${guardians.length} ${thresholdCheck}`);
    return;
}
//# sourceMappingURL=network.service.js.map