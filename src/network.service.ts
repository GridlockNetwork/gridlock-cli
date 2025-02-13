import ora from 'ora';
import chalk from 'chalk';
import { loadUser } from './storage.service.js';
import type { IUser } from 'gridlock-sdk/dist/user/user.interfaces.js';
import inquirer from 'inquirer';

const guardianTypeMap = {
  'Owner Guardian': 'ownerGuardian',
  'Local Guardian': 'localGuardian',
  'Social Guardian': 'socialGuardian',
  'Cloud Guardian': 'cloudGuardian',
  'Gridlock Guardian': 'gridlockGuardian',
  'Partner Guardian': 'partnerGuardian',
};

export const showNetworkInquire = async ({ email }: { email?: string }) => {
  console.log(chalk.hex('#4A90E2')('Entered values:'));
  if (email) console.log(chalk.hex('#4A90E2')(` Email: ${email}`));
  console.log('\n');

  let password: string | undefined;
  if (!email) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'Enter your email:' },
    ]);
    email = answers.email as string;
  }
  await showNetwork({ email });
};

export function showNetwork({ email }: { email: string }) {
  const spinner = ora('Retrieving user guardians...').start();
  const user: IUser | null = loadUser({ email });

  if (!user) {
    spinner.fail('User not found');
    return;
  }

  const guardians = user.nodePool || [];
  const ownerGuardianNodeId = user.ownerGuardianId as unknown as string;

  spinner.succeed('User guardians retrieved successfully');
  console.log(
    chalk.bold(
      `\n🌐 Guardians for ${chalk.hex('#4A90E2').bold(user.name)} (${chalk
        .hex('#4A90E2')
        .bold(email)})`
    )
  );
  console.log('-----------------------------------');

  if (guardians.length === 0) {
    console.log('No guardians found.');
  } else {
    const emojiMap: { [key: string]: string } = {
      localGuardian: '🏡',
      socialGuardian: '👥',
      cloudGuardian: '🌥️ ',
      gridlockGuardian: '🛡️ ',
      partnerGuardian: '🤝',
    };

    guardians.forEach((guardian, index) => {
      const emoji = emojiMap[guardian.type] || '';
      ownerGuardianNodeId == guardian.nodeId
        ? console.log(`    👑 ${chalk.bold('Name:')} ${guardian.name}`)
        : console.log(`       ${chalk.bold('Name:')} ${guardian.name}`);
      console.log(
        `       ${chalk.bold('Type:')} ${emoji} ${(
          Object.keys(guardianTypeMap) as Array<keyof typeof guardianTypeMap>
        ).find((key) => guardianTypeMap[key] === guardian.type)}`
      );
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
  console.log(
    `Total Guardians: ${guardians.length} | Threshold: ${threshold} of ${guardians.length} ${thresholdCheck}`
  );
  return;
}
