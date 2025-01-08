import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import GridlockSdk from 'gridlock-pg-sdk';
import { prettyLog } from './helpers.js';
import { COMMANDS, SUPPORTED_COINS_STRING } from './constants.js';

const gridlockSdk = new GridlockSdk({
  apiKey: '1234567890',
  baseUrl: 'https://44d9-2600-100e-a022-dff3-1ad7-275a-7700-eb6c.ngrok-free.app',
  verbose: false,
});

let verbose = false;

// Add pre and post hooks to add two line feeds
program.hook('preAction', () => {
  console.log('\n\n');
});

program.hook('postAction', () => {
  console.log('\n\n');
});

const showNetwork = async () => {
    const spinner = ora('Retrieving network status...').start();
    const response = await gridlockSdk.showNetwork();

    if (!response.success) {
        spinner.fail('Failed to retrieve network status');
        console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
        return;
    }

     const guardians = response.payload

     spinner.succeed('Network status retrieved successfully');
    console.log(chalk.bold('\n🌐 Guardians in the Network:'));
    console.log('-----------------------------------');
    guardians.forEach((guardian, index) => {
        const status = guardian.active ? chalk.green('🟢 ACTIVE') : chalk.red('🔴 INACTIVE');
        console.log(`${status}`);
        console.log(`     ${guardian.name}`);
        console.log(`     Node ID: ${guardian.nodeId}`);
        console.log(`     Public Key: ${guardian.publicKey}`);
    });
    console.log('-----------------------------------');
    const threshold = 3;
    const thresholdCheck = guardians.length >= threshold ? chalk.green('✅') : chalk.red('❌');
    console.log(`Total Guardians: ${guardians.length} | Threshold: ${threshold} of ${guardians.length} ${thresholdCheck}`);
};

const addGuardian = async () => {
const answers = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Guardian name:' },
    { type: 'input', name: 'nodeId', message: 'Node ID:' },
    { type: 'input', name: 'publicKey', message: 'Guardian public key:' },
]);

  const spinner = ora('Adding guardian...').start();
  const response = await gridlockSdk.addGuardian(answers);
  if (!response.success) {
    spinner.fail('Failed to add guardian');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  spinner.succeed('Guardian added successfully');
  console.log('Updated Guardian List:');
  showNetwork();
};

const createUser = async () => {
  const answers = await inquirer.prompt([
    { type: 'input', name: 'email', message: 'User email:' },
    { type: 'password', name: 'password', message: 'Network access password:' },
  ]);

  const spinner = ora('Creating user...').start();
  const response = await gridlockSdk.createUser({ email: answers.email, password: answers.password });
  if (!response.success) {
    spinner.fail('Failed to create user');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  spinner.succeed('User created successfully');
  const { user } = response.payload;
  console.log(`Owner Guardian Node ID: ${user.nodeId}`);
};

const createWallet = async () => {
  const answers = await inquirer.prompt([
    { type: 'input', name: 'email', message: 'User email:' },
    { type: 'password', name: 'password', message: 'Network access password:' },
    { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS_STRING.split(', ') },
  ]);

  const spinner = ora('Creating wallet...').start();
  const response = await gridlockSdk.createWallets([answers.blockchain]);
  if (!response.success) {
    spinner.fail('Failed to create wallet');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  spinner.succeed('Wallet created successfully');
  const wallet = response.payload[0];
  console.log(`Wallet Address: ${wallet.address}`);
};

const signTransaction = async () => {
  const answers = await inquirer.prompt([
    { type: 'input', name: 'email', message: 'User email:' },
    { type: 'password', name: 'password', message: 'Network access password:' },
    { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS_STRING.split(', ') },
    { type: 'input', name: 'action', message: 'Action type (e.g., sign-msg):' },
    { type: 'input', name: 'message', message: 'Message to be signed:' },
  ]);

  const spinner = ora('Signing transaction...').start();
  const response = await gridlockSdk.signMessage(answers.message, answers.blockchain);
  if (!response.success) {
    spinner.fail('Failed to sign transaction');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  spinner.succeed('Transaction signed successfully');
  const { signature } = response.payload;
  console.log(`Signature: ${signature}`);
};

program.option('-v, --verbose', 'Enable verbose output').hook('preAction', async (thisCommand) => {
  verbose = thisCommand.opts().verbose;
});

program
  .command('show-network')
  .description('Displays the status of all guardians in the network')
  .action(showNetwork);

program
  .command('add-guardian')
  .description('Add a guardian')
  .action(addGuardian);

program
  .command('create-user')
  .description('Create a new user')
  .action(createUser);

program
  .command('create wallet')
  .description('Create a new wallet')
  .action(createWallet);

program
  .command('sign')
  .description('Sign a transaction')
  .action(signTransaction);

program.parse(process.argv);
