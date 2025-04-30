import ora from 'ora';
import chalk from 'chalk';
import { loadUser } from './storage.service.js';
import { IUser } from 'gridlock-sdk/types';
import inquirer from 'inquirer';

const guardianTypeMap = {
  'Owner Guardian': 'owner',
  'Local Guardian': 'local',
  'Social Guardian': 'social',
  'Cloud Guardian': 'cloud',
  'Gridlock Guardian': 'gridlock',
  'Partner Guardian': 'partner',
};

export const showNetworkInquire = async ({
  email,
  verbose,
}: {
  email?: string;
  verbose?: boolean;
}) => {
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
  await showNetwork({ email, verbose });
};

export function showNetwork({ email, verbose = false }: { email: string; verbose?: boolean }) {
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
      local: '🏡',
      social: '👥',
      cloud: '🌥️',
      gridlock: '🛡️',
      partner: '🤝',
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
      if (verbose) {
        console.log(
          `       ${chalk.bold('Networking Public Key:')} ${guardian.networkingPublicKey}`
        );
        console.log(`       ${chalk.bold('Encryption Public Key:')} ${guardian.e2ePublicKey}`);
      }
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
