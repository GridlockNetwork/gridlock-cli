import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import GridlockSdk from 'gridlock-pg-sdk';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateKeyPairSync } from 'crypto';


// Initialize Gridlock SDK with required configuration
// -----------------------------------
const gridlockSdk = new GridlockSdk({
  apiKey: '1234567890', // Replace with your actual API key
  baseUrl: 'https://5074-2600-100e-a020-5c3-5d3d-c879-f9b8-7888.ngrok-free.app', // Replace with your actual base URL
  verbose: false, // Set to true for continuous verbose logging
  logger: console,
});

// MongoDB configuration for initializing the SDK
const mongoConfig = {
  uri: 'mongodb://root:example@172.18.0.1:27017/', // Ensure the connection string includes the database name
  dbName: 'gridlock', // Database name
};
// -----------------------------------


let verbose = false;

// Add pre and post hooks to add two line feeds
program.hook('preAction', () => {
  console.log('\n\n');
});

program.hook('postAction', () => {
  console.log('\n\n');
});

const showNetwork = async () => {
  console.log('Retrieving network status...'); //todo remove
  const spinner = ora('Retrieving network status...').start();
  const response = await gridlockSdk.showNetwork();
  console.log('response: ', response); // todo remove

  if (!response.success) {
    spinner.fail('Failed to retrieve network status');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  const guardians = response.payload;

  spinner.succeed('Network status retrieved successfully');
  console.log(chalk.bold('\n🌐 Guardians in the Network:'));
  console.log('-----------------------------------');

  const localGuardians = guardians.filter(g => g.type === 'Local Guardian');
  const gridlockGuardians = guardians.filter(g => g.type === 'Gridlock Guardian');
  const independentGuardians = guardians.filter(g => g.type !== 'Local Guardian' && g.type !== 'Gridlock Guardian');

  const printGuardians = (title, guardians) => {
    console.log(chalk.bold(`\n${title}:`));
    guardians.forEach((guardian, index) => {
      console.log(`       ${chalk.bold('Name:')} ${guardian.name}`);
      console.log(`       ${chalk.bold('Type:')} ${guardian.type}`);
      console.log(`       ${chalk.bold('Node ID:')} ${guardian.nodeId}`);
      console.log(`       ${chalk.bold('Public Key:')} ${guardian.publicKey}`);
      const status = guardian.active ? chalk.green('ACTIVE') : chalk.red('INACTIVE');
      console.log(`       ${chalk.bold('Status:')} ${status}`);
      if (index < guardians.length - 1) {
        console.log('       ---');
      }
    });
  };

  printGuardians('🏡  Local Guardians', localGuardians);
  printGuardians('🌥️  Cloud Guardians', independentGuardians);
  printGuardians('🛡️  Gridlock Guardians', gridlockGuardians);

  console.log('-----------------------------------');
  const threshold = 3;
  const thresholdCheck = guardians.length >= threshold ? chalk.green('✅') : chalk.red('❌');
  console.log(`Total Guardians: ${guardians.length} | Threshold: ${threshold} of ${guardians.length} ${thresholdCheck}`);
  return;
};

const addGuardianLocal = async (name) => {
  if (!name) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Guardian name:' },
    ]);
    name = answers.name;
  }

  const { privateKey, publicKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });

  const guardian = {
    nodeId: uuidv4(),
    name,
    type: 'Local Guardian',
    model: 'sdk',
    active: true,
    publicKey: publicKey.toString('base64'),
    privateKey: privateKey.toString('base64'), // Add privateKey to the guardian object
  };

  const spinner = ora('Adding local guardian...').start();
  const response = await gridlockSdk.addGuardianToNetwork(guardian);
  if (!response.success) {
    spinner.fail('Failed to add local guardian');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  spinner.succeed('Local guardian added successfully');
  console.log(chalk.bold('\n➕ New Local Guardian:'));
  console.log(`     ${chalk.bold('Name:')} ${guardian.name}`);
  console.log(`     ${chalk.bold('Type:')} ${guardian.type}`);
  console.log(`     ${chalk.bold('Node ID:')} ${guardian.nodeId}`);
  console.log(`     ${chalk.bold('Public Key:')} ${guardian.publicKey}`);
  console.log(`     ${chalk.bold('---')}`);
};

const addGuardianGridlock = async () => {
  const spinner = ora('Retrieving Gridlock guardian...').start();
  const response = await gridlockSdk.getGridlockGuardian();
  if (!response.success) {
    spinner.fail('Failed to retrieve Gridlock guardian');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  const guardian = response.payload;

  const saveResponse = await gridlockSdk.addGuardianToNetwork(guardian);
  if (!saveResponse.success) {
    spinner.fail('Failed to save Gridlock guardian');
    console.error(`Error: ${saveResponse.error.message} (Code: ${saveResponse.error.code})`);
    return;
  }
  spinner.succeed('Gridlock guardian retrieved and saved successfully');
};

const addGuardianCloud = async (name, nodeId, publicKey) => {
  if (!name || !nodeId || !publicKey) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Guardian name:' },
      { type: 'input', name: 'nodeId', message: 'Node ID:' },
      { type: 'input', name: 'publicKey', message: 'Guardian public key:' },
    ]);
    name = answers.name;
    nodeId = answers.nodeId;
    publicKey = answers.publicKey;
  }

  const guardian = {
    nodeId,
    name,
    type: 'Cloud Guardian',
    active: true,
    publicKey,
  };

  const spinner = ora('Adding guardian...').start();
  const response = await gridlockSdk.addGuardianToNetwork(guardian);
  console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk');
  if (!response.success) {
    spinner.fail('Failed to add guardian');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  spinner.succeed('Guardian added successfully');
  console.log('Updated Guardian List:');
  showNetwork();
};

const addGuardian = async (guardianType, name, nodeId, publicKey) => {
  console.log('Adding guardian...');
  if (!guardianType) {
    console.log('no parameters given');
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'guardianType',
        message: 'Select the type of guardian to add:',
        choices: [
          { name: 'Local Guardian', value: 'local' },
          { name: 'Gridlock Guardian', value: 'gridlock' },
          { name: 'Cloud Guardian', value: 'cloud' },
        ],
      },
    ]);
    guardianType = answers.guardianType;
    console.log('Selected guardian type: ', guardianType);
  }

  if (guardianType === 'local') {
    await addGuardianLocal(name);
  } else if (guardianType === 'gridlock') {
    await addGuardianGridlock();
  } else if (guardianType === 'cloud') {
    await addGuardianCloud(name, nodeId, publicKey);
  } else {
    console.error('Invalid guardian type. Please specify "local", "gridlock", or "cloud".');
  }
};

program
  .command('add-guardian')
  .description('Add a guardian')
  .option('-t, --type <type>', 'Type of guardian (local, cloud, gridlock, partner)')
  .option('-n, --name <name>', 'Guardian name')
  .option('-i, --nodeId <nodeId>', 'Node ID')
  .option('-p, --publicKey <publicKey>', 'Guardian public key')
  .action(async (options) => {
    await addGuardian(options.type, options.name, options.nodeId, options.publicKey);
  });

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

const getGridlockGuardian = async () => {
  const spinner = ora('Retrieving Gridlock guardian...').start();
  const response = await gridlockSdk.getGridlockGuardian();
  console.log(response);
  if (!response.success) {
    spinner.fail('Failed to retrieve Gridlock guardian');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }
  console.log(`     ${chalk.bold('Name:')} ${response.payload}`);
  console.log(`     ${chalk.bold('Name:')} ${response.payload.name}`);
  spinner.succeed('Gridlock guardian retrieved successfully');
  console.log(chalk.bold('\n🛡️  Gridlock Guardian:'));
  console.log(`     ${chalk.bold('Name:')} ${response.payload.name}`);
  console.log(`     ${chalk.bold('Node ID:')} ${response.payload.nodeId}`);
  console.log(`     ${chalk.bold('Public Key:')} ${response.payload.publicKey}`);
};

program.option('-v, --verbose', 'Enable verbose output').hook('preAction', async (thisCommand) => {
  verbose = thisCommand.opts().verbose;
  gridlockSdk.verbose = verbose;
});

program
  .command('show-network')
  .description('Displays the status of all guardians in the network')
  .action(showNetwork);

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

program
  .command('get-gridlock-guardian')
  .description('Retrieve and display the Gridlock guardian')
  .action(getGridlockGuardian);

await gridlockSdk.initDb({ ...mongoConfig });
program.parse(process.argv);
gridlockSdk.closeDb();


