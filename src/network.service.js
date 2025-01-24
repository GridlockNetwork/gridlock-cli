import ora from 'ora';
import chalk from 'chalk';
import { loadUser, loadGuardians } from './storage.service.js';

const guardianTypeMap = {
  'Owner Guardian': 'ownerGuardian',
  'Local Guardian': 'localGuardian',
  'Social Guardian': 'socialGuardian',
  'Cloud Guardian': 'cloudGuardian',
  'Gridlock Guardian': 'gridlockGuardian',
  'Partner Guardian': 'partnerGuardian',
};

export function showNetwork({ email }) {
  const spinner = ora('Retrieving user guardians...').start();
  const user = loadUser(email);

  if (!user) {
    spinner.fail('User not found');
    return;
  }

  const guardians = user.nodePool || [];

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
    const emojiMap = {
      localGuardian: '🏡',
      socialGuardian: '👥',
      cloudGuardian: '🌥️ ',
      gridlockGuardian: '🛡️ ',
      partnerGuardian: '🤝',
    };

    const ownerGuardianNodeId = user.ownerGuardian.nodeId;

    guardians.forEach((guardian, index) => {
      const emoji = emojiMap[guardian.type] || '';
      const isOwnerGuardian = guardian.nodeId === ownerGuardianNodeId;
      const crown = isOwnerGuardian ? '👑' : '';
      console.log(`       ${chalk.bold('Name:')} ${guardian.name} ${crown}`);
      console.log(
        `       ${chalk.bold('Type:')} ${emoji} ${Object.keys(guardianTypeMap).find(
          (key) => guardianTypeMap[key] === guardian.type
        )}`
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

export function showAvailableGuardians() {
  const spinner = ora('Retrieving network status...').start();
  const guardians = loadGuardians();

  spinner.succeed('Network status retrieved successfully');
  console.log(chalk.bold('\n🌐 Guardians in the Network:'));
  console.log('-----------------------------------');

  const guardianGroups = guardians.reduce((acc, guardian) => {
    acc[guardian.type] = acc[guardian.type] || [];
    acc[guardian.type].push(guardian);
    return acc;
  }, {});

  const localGuardians = guardianGroups['localGuardian'] || [];
  const socialGuardians = guardianGroups['socialGuardian'] || [];
  const cloudGuardians = guardianGroups['cloudGuardian'] || [];
  const gridlockGuardians = guardianGroups['gridlockGuardian'] || [];
  const partnerGuardians = guardianGroups['partnerGuardian'] || [];

  const printGuardians = (title, guardians) => {
    console.log(chalk.bold(`\n${title}:`));
    guardians.forEach((guardian, index) => {
      console.log(`       ${chalk.bold('Name:')} ${guardian.name}`);
      console.log(
        `       ${chalk.bold('Type:')} ${Object.keys(guardianTypeMap).find(
          (key) => guardianTypeMap[key] === guardian.type
        )}`
      );
      console.log(`       ${chalk.bold('Node ID:')} ${guardian.nodeId}`);
      console.log(`       ${chalk.bold('Public Key:')} ${guardian.publicKey}`);
      const status = guardian.active ? chalk.green('ACTIVE') : chalk.red('INACTIVE');
      console.log(`       ${chalk.bold('Status:')} ${status}`);
      if (index < guardians.length - 1) {
        console.log('       ---');
      }
    });
  };

  printGuardians('🏡 Local Guardians', localGuardians);
  printGuardians('👥 Social Guardians', socialGuardians);
  printGuardians('🌥️  Cloud Guardians', cloudGuardians);
  printGuardians('🛡️  Gridlock Guardians', gridlockGuardians);
  printGuardians('🤝 Partner Guardians', partnerGuardians);

  console.log('-----------------------------------');
  return;
}
