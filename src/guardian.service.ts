import ora from 'ora';
import { loadGuardians, saveGuardian } from './storage.service.js';
import { gridlock } from './gridlock.js';
import type { IGuardian } from 'gridlock-sdk/dist/types/guardian.type.d.ts';
import inquirer from 'inquirer';
import { getEmailandPassword } from './auth.service.js';
import chalk from 'chalk';

export const addGuardianInquire = async (options: {
  email?: string;
  password?: string;
  guardianType?: string;
  isOwnerGuardian?: boolean;
  name?: string;
  nodeId?: string;
  publicKey?: string;
}) => {
  let { email, password, guardianType, isOwnerGuardian, name, nodeId, publicKey } = options;

  if (!email || !password) {
    const credentials = await getEmailandPassword();
    email = credentials.email;
    password = credentials.password;
  }

  if (!guardianType) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'guardianType',
        message: 'Select the type of guardian to add:',
        choices: [
          { name: 'Gridlock Guardian', value: 'gridlock' },
          { name: 'Cloud Guardian', value: 'cloud' },
        ],
      },
    ]);
    guardianType = answers.guardianType;
  }
  if (guardianType === 'gridlock') {
    addGridlockGuardian({ email: email as string, password: password as string });
  } else if (guardianType === 'cloud') {
    if (!name || !nodeId || !publicKey) {
      const answers = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Guardian name:' },
        { type: 'input', name: 'nodeId', message: 'Node ID:' },
        { type: 'input', name: 'publicKey', message: 'Guardian public key:' },
        {
          type: 'confirm',
          name: 'isOwnerGuardian',
          message: 'Is this the owner guardian?',
          default: false,
        },
      ]);
      name = answers.name;
      nodeId = answers.nodeId;
      publicKey = answers.publicKey;
      isOwnerGuardian = answers.isOwnerGuardian;
    }

    const guardianData = {
      name: name!,
      nodeId: nodeId!,
      publicKey: publicKey!,
      type: 'cloudGuardian',
      active: true,
    };

    const addGuardianParams = {
      email: email!,
      password: password!,
      guardian: guardianData,
      isOwnerGuardian: isOwnerGuardian!,
    };

    // @ts-ignore - the use of inquirer ensures that variables cannot be null
    await addCloudGuardian(addGuardianParams);
  } else {
    console.error('Invalid guardian type. Please specify "gridlock" or "cloud".');
  }
};

async function addGridlockGuardian({ email, password }: { email: string; password: string }) {
  const spinner = ora('Adding Gridlock guardian...').start();

  try {
    const guardian = await gridlock.addGridlockGuardian({ email, password });
    if (guardian) {
      spinner.succeed(
        `Added ${chalk.hex('#4A90E2').bold(guardian.name)} to user's list of guardians`
      );
    }
  } catch {
    spinner.fail(`Failed to add guardian`);
  }
}

async function addCloudGuardian({
  email,
  password,
  guardian,
  isOwnerGuardian,
}: {
  email: string;
  password: string;
  guardian: IGuardian;
  isOwnerGuardian: boolean;
}) {
  const spinner = ora('Adding guardian...').start();

  try {
    await gridlock.addGuardian({ email, password, guardian, isOwnerGuardian });
    spinner.succeed('Guardian assigned successfully');
  } catch {
    spinner.fail(`Failed to assign guardian`);
  }
}
