import ora from 'ora';
import { gridlock } from './gridlock.js';
import { IGuardian } from 'gridlock-sdk/types';
import inquirer from 'inquirer';
import chalk from 'chalk';

export const addGuardianInquire = async (options: {
  email?: string;
  password?: string;
  nodeId?: string;
  name?: string;
  guardianType?: string;
  networkingPublicKey?: string;
  e2ePublicKey?: string;
  isOwnerGuardian?: boolean;
}) => {
  let {
    email,
    password,
    nodeId,
    name,
    guardianType,
    networkingPublicKey,
    e2ePublicKey,
    isOwnerGuardian = false,
  } = options;

  console.log('Entered values:');
  if (email) console.log(` Email: ${chalk.hex('#4A90E2')(email)}`);
  if (password) console.log(` Password: ${chalk.hex('#4A90E2')('*******')}`);
  if (nodeId) console.log(` Node ID: ${chalk.hex('#4A90E2')(nodeId)}`);
  if (name) console.log(` Name: ${chalk.hex('#4A90E2')(name)}`);
  if (guardianType) console.log(` Guardian Type: ${chalk.hex('#4A90E2')(guardianType)}`);
  if (networkingPublicKey) console.log(` Public Key: ${chalk.hex('#4A90E2')(networkingPublicKey)}`);
  if (e2ePublicKey) console.log(` E2E Public Key: ${chalk.hex('#4A90E2')(e2ePublicKey)}`);
  console.log('\n');

  if (!email) {
    const answer = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'Enter your email:' },
    ]);
    email = answer.email;
  }
  if (!password) {
    const answer = await inquirer.prompt([
      { type: 'password', name: 'password', message: 'Enter your password:' },
    ]);
    password = answer.password;
  }
  if (!guardianType) {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'guardianType',
        message: 'Select the type of guardian to add:',
        choices: [
          { name: 'Gridlock Guardian', value: 'gridlock' },
          { name: 'Cloud Guardian', value: 'cloud' },
          { name: 'Social Guardian', value: 'social' },
        ],
      },
    ]);
    guardianType = answer.guardianType;
  }
  if (guardianType === 'cloud') {
    if (!name) {
      const answer = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Guardian name:' },
      ]);
      name = answer.name as string;
    }
    if (!nodeId) {
      const answer = await inquirer.prompt([
        { type: 'input', name: 'nodeId', message: 'Node ID:' },
      ]);
      nodeId = answer.nodeId as string;
    }
    if (!networkingPublicKey) {
      const answer = await inquirer.prompt([
        { type: 'input', name: 'networkingPublicKey', message: 'Guardian public key:' },
      ]);
      networkingPublicKey = answer.networkingPublicKey as string;
    }
    if (!e2ePublicKey) {
      const answer = await inquirer.prompt([
        { type: 'input', name: 'e2ePublicKey', message: 'Guardian E2E public key:' },
      ]);
      e2ePublicKey = answer.e2ePublicKey as string;
    }
    if (isOwnerGuardian === undefined) {
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'isOwnerGuardian',
          message: 'Is this the owner guardian?',
          default: false,
        },
      ]);
    }

    const guardianData = {
      name: name!,
      nodeId: nodeId!,
      networkingPublicKey: networkingPublicKey!,
      e2ePublicKey: e2ePublicKey!,
      type: 'cloud' as 'cloud',
      active: true,
    };

    const addGuardianParams = {
      email: email!,
      password: password!,
      guardian: guardianData,
      isOwnerGuardian: isOwnerGuardian,
    };

    await addCloudGuardian(addGuardianParams);
  } else if (guardianType === 'social') {
    await addSocialGuardian({ email: email as string, password: password as string });
  } else {
    addProfessionalGuardian({
      email: email as string,
      password: password as string,
      type: guardianType as 'gridlock' | 'partner',
    });
  }
};

async function addProfessionalGuardian({
  email,
  password,
  type,
}: {
  email: string;
  password: string;
  type: 'gridlock' | 'partner';
}) {
  const spinner = ora('Adding Gridlock guardian...').start();

  try {
    const response = await gridlock.addProfessionalGuardian({ email, password, type });
    if (response?.guardian) {
      spinner.succeed(
        `Added ${chalk.hex('#4A90E2').bold(response.guardian.name)} to user's list of guardians`
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
    const response = await gridlock.addGuardian({
      email,
      password,
      guardian,
      isOwnerGuardian,
    });
    spinner.succeed('Guardian assigned successfully');
  } catch {
    spinner.fail(`Failed to assign guardian`);
  }
}

async function addSocialGuardian({ email, password }: { email: string; password: string }) {
  const spinner = ora('Adding Social guardian...').start();
  try {
    const socialGuardian = await gridlock.addSocialGuardian({ email, password });
    spinner.succeed('Social guardian added successfully');
    console.log('Scan the following QR code to complete setup:');
    const exampleContent = 'https://example.com/social-guardian?data=1234';
  } catch (error) {
    spinner.fail('Failed to add social guardian');
  }
}
