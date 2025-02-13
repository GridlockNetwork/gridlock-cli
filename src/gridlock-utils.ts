import { program } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import GridlockSdk from 'gridlock-sdk';
import nacl from 'tweetnacl';
import { API_KEY, BASE_URL, DEBUG_MODE } from './constants.js';
import { loadGuardians } from './storage.service.js';
import type { IGuardian } from 'gridlock-sdk/dist/guardian/guardian.interfaces.js';
import inquirer from 'inquirer';

const guardianTypeMap = {
  'Owner Guardian': 'ownerGuardian',
  'Local Guardian': 'localGuardian',
  'Social Guardian': 'socialGuardian',
  'Cloud Guardian': 'cloudGuardian',
  'Gridlock Guardian': 'gridlockGuardian',
  'Partner Guardian': 'partnerGuardian',
};

export const gridlock = new GridlockSdk({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  verbose: DEBUG_MODE,
  logger: console,
});

let verbose = false;

program.option('-v, --verbose', 'Enable verbose output').hook('preAction', async (thisCommand) => {
  verbose = thisCommand.opts().verbose;
  gridlock.setVerbose(verbose);
});
program.hook('preAction', () => {
  console.log('\n\n');
});

program.hook('postAction', () => {
  console.log('\n\n');
});

export function allGuardians() {
  const spinner = ora('Retrieving network status...').start();
  const guardians: IGuardian[] = loadGuardians();

  spinner.succeed('Network status retrieved successfully');
  console.log(chalk.bold('\n🌐 Guardians in the Network:'));
  console.log('-----------------------------------');

  const guardianGroups = guardians.reduce(
    (acc: { [key: string]: IGuardian[] }, guardian: IGuardian) => {
      acc[guardian.type] = acc[guardian.type] || [];
      acc[guardian.type].push(guardian);
      return acc;
    },
    {}
  );

  const localGuardians = guardianGroups['localGuardian'] || [];
  const socialGuardians = guardianGroups['socialGuardian'] || [];
  const cloudGuardians = guardianGroups['cloudGuardian'] || [];
  const gridlockGuardians = guardianGroups['gridlockGuardian'] || [];
  const partnerGuardians = guardianGroups['partnerGuardian'] || [];

  const printGuardians = (title: string, guardians: IGuardian[]) => {
    console.log(chalk.bold(`\n${title}:`));
    guardians.forEach((guardian, index) => {
      console.log(`       ${chalk.bold('Name:')} ${guardian.name}`);
      console.log(
        `       ${chalk.bold('Type:')} ${(
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
  };

  printGuardians('🏡 Local Guardians', localGuardians);
  printGuardians('👥 Social Guardians', socialGuardians);
  printGuardians('🌥️  Cloud Guardians', cloudGuardians);
  printGuardians('🛡️  Gridlock Guardians', gridlockGuardians);
  printGuardians('🤝 Partner Guardians', partnerGuardians);

  console.log('-----------------------------------');
  return;
}

export async function e2eProcessing({
  privateKey,
  message,
  senderPubKey,
}: {
  privateKey: string;
  message: string;
  senderPubKey: string;
}): Promise<string | null> {
  const privateKeyBuffer = Buffer.from(privateKey, 'base64');
  const kp = nacl.box.keyPair.fromSecretKey(privateKeyBuffer).secretKey;
  const publicKey = Buffer.from(senderPubKey, 'base64');
  const messageBuffer = Buffer.from(message, 'base64');
  const nonce = messageBuffer.slice(0, nacl.box.nonceLength);
  const ciphertext = messageBuffer.slice(nacl.box.nonceLength);
  const decryptedMessage = nacl.box.open(ciphertext, nonce, publicKey, kp);

  if (!decryptedMessage) {
    console.error('Failed to decrypt message.');
    return null;
  }

  return Buffer.from(decryptedMessage).toString('utf-8');
}

program
  .command('show-available-guardians')
  .description('Displays the status of all guardians in the network')
  .action(allGuardians);

program
  .command('e2e-receive')
  .description('Test the encryptContents function')
  .option('-p, --privateKey <privateKey>', 'privateKey')
  .option('-m, --message <message>', 'Content to decrypt')
  .option('-s, --sender <sender>', 'Public key of the target node')
  .action(async (options) => {
    let { privateKey, message, sender } = options;

    console.log('Entered values:');
    if (privateKey) console.log(` Private Key: ${chalk.hex('#4A90E2')('*******')}`);
    if (message) console.log(` Message: ${chalk.hex('#4A90E2')(message)}`);
    if (sender) console.log(` Sender Public Key: ${chalk.hex('#4A90E2')(sender)}`);
    console.log('\n');

    if (!privateKey) {
      const answers = await inquirer.prompt([
        { type: 'password', name: 'privateKey', message: 'Enter private key:' },
      ]);
      privateKey = answers.privateKey;
    }
    if (!message) {
      const answers = await inquirer.prompt([
        { type: 'input', name: 'message', message: 'Enter message to decrypt:' },
      ]);
      message = answers.message;
    }
    if (!sender) {
      const answers = await inquirer.prompt([
        { type: 'input', name: 'sender', message: 'Enter sender public key:' },
      ]);
      sender = answers.sender;
    }

    const encrypted = await e2eProcessing({
      privateKey,
      message,
      senderPubKey: sender,
    });
    console.log('Encrypted content:', encrypted);
  });

program
  .command('e2e-send')
  .description("Encrypt content with the user's private key and target's public key")
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'User password')
  .option('-t, --target <target>', 'Target public key')
  .option('-m, --message <message>', 'Content to encrypt')
  .action(async (options) => {
    let { email, password, target, message } = options;

    console.log('Entered values:');
    if (email) console.log(` Email: ${chalk.hex('#4A90E2')(email)}`);
    if (password) console.log(` Password: ${chalk.hex('#4A90E2')('*******')}`);
    if (target) console.log(` Target Public Key: ${chalk.hex('#4A90E2')(target)}`);
    if (message) console.log(` Message: ${chalk.hex('#4A90E2')(message)}`);
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
    if (!target) {
      const answers = await inquirer.prompt([
        { type: 'input', name: 'target', message: 'Enter target public key:' },
      ]);
      target = answers.target;
    }
    if (!message) {
      const answers = await inquirer.prompt([
        { type: 'input', name: 'message', message: 'Enter message to encrypt:' },
      ]);
      message = answers.message;
    }

    try {
      const encryptedContent = await gridlock.encryptContents({
        content: message,
        publicKey: target,
        identifier: email,
        password,
      });
      console.log('Encrypted content:', encryptedContent);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Encryption failed:', error.message);
      } else {
        console.error('Encryption failed:', error);
      }
    }
  });

program
  .command('login')
  .description('Login with email and password')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'User password')
  .action(async (options) => {
    let { email, password } = options;

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
        { type: 'password', name: 'password', message: 'Enter your password:' },
      ]);
      password = answers.password;
    }

    try {
      const response = await gridlock.login(email, password);
      console.log('Login successful');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Login failed:', error.message);
      } else {
        console.error('Login failed:', error);
      }
    }
  });

program.parseAsync(process.argv);
