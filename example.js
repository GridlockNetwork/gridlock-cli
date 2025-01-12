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
import {
  SUPPORTED_COINS_STRING,
  API_KEY,
  BASE_URL,
  MONGO_URI,
  DB_NAME,
  DEBUG_MODE,
} from './constants.js';
import { SUPPORTED_COINS } from 'gridlock-pg-sdk';

const gridlockSdk = new GridlockSdk({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  verbose: DEBUG_MODE,
  logger: console,
});

// MongoDB configuration for initializing the 
const mongoConfig = {
  uri: MONGO_URI,
  dbName: DB_NAME,
};

let verbose = false;

// -----------------------------------
// CLI FUNCTIONS
// -----------------------------------
const guardianTypeMap = {
  'Local Guardian': 'localGuardian',
  'Gridlock Guardian': 'gridlockGuardian',
  'Cloud Guardian': 'cloudGuardian',
  'Owner Guardian': 'ownerGuardian',
};

const showNetwork = async () => {
  const spinner = ora('Retrieving network status...').start();
  const response = await gridlockSdk.showNetwork();

  if (!response.success) {
    spinner.fail('Failed to retrieve network status');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  const guardians = response.payload;

  spinner.succeed('Network status retrieved successfully');
  console.log(chalk.bold('\n🌐 Guardians in the Network:'));
  console.log('-----------------------------------');

  const localGuardians = guardians.filter(g => g.type === 'localGuardian');
  const gridlockGuardians = guardians.filter(g => g.type === 'gridlockGuardian');
  const cloudGuardians = guardians.filter(g => g.type === 'cloudGuardian');
  const ownerGuardian = guardians.find(g => g.type === 'ownerGuardian');

  const printGuardians = (title, guardians) => {
    console.log(chalk.bold(`\n${title}:\n`));
    guardians.forEach((guardian, index) => {
      console.log(`       ${chalk.bold('Name:')} ${guardian.name}`);
      console.log(`       ${chalk.bold('Type:')} ${Object.keys(guardianTypeMap).find(key => guardianTypeMap[key] === guardian.type)}`);
      console.log(`       ${chalk.bold('Node ID:')} ${guardian.nodeId}`);
      console.log(`       ${chalk.bold('Public Key:')} ${guardian.publicKey}`);
      const status = guardian.active ? chalk.green('ACTIVE') : chalk.red('INACTIVE');
      console.log(`       ${chalk.bold('Status:')} ${status}`);
      if (index < guardians.length - 1) {
        console.log('       ---');
      }
    });
  };

  ownerGuardian && printGuardians('👑 Owner Guardian', [ownerGuardian]);
  printGuardians('🏡  Local Guardians', localGuardians);
  printGuardians('🌥️  Cloud Guardians', cloudGuardians);
  printGuardians('🛡️  Gridlock Guardians', gridlockGuardians);

  console.log('-----------------------------------');
  const threshold = 3;
  const thresholdCheck = guardians.length >= threshold ? chalk.green('✅') : chalk.red('❌');
  console.log(`Total Guardians: ${guardians.length} | Threshold: ${threshold} of ${guardians.length} ${thresholdCheck}`);
  return;
};

const addGuardianLocal = async (name, isOwnerGuardian) => {
  if (!name) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Guardian name:' },
      { type: 'confirm', name: 'isOwnerGuardian', message: 'Is this the owner guardian?', default: false },
    ]);
    name = answers.name;
    isOwnerGuardian = answers.isOwnerGuardian;
  }

  if (isOwnerGuardian) {
    const networkResponse = await gridlockSdk.showNetwork();
    if (!networkResponse.success) {
      console.error(`Error: ${networkResponse.error.message} (Code: ${networkResponse.error.code})`);
      return;
    }

    const ownerGuardians = networkResponse.payload.filter(g => g.type === 'ownerGuardian');
    if (ownerGuardians.length > 0) {
      console.error('An owner guardian already exists in the database. Delete the existing owner guardian before adding a new one.');
      return;
    }
  }

  const { privateKey, publicKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });

  const guardian = {
    nodeId: uuidv4(),
    name,
    type: isOwnerGuardian ? 'ownerGuardian' : 'localGuardian',
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
  console.log(`     ${chalk.bold('Type:')} ${Object.keys(guardianTypeMap).find(key => guardianTypeMap[key] === guardian.type)}`);
  console.log(`     ${chalk.bold('Node ID:')} ${guardian.nodeId}`);
  console.log(`     ${chalk.bold('Public Key:')} ${guardian.publicKey}`);

  await showNetwork();
};

const getGridlockGuardian = async () => {
  const spinner = ora('Retrieving Gridlock guardians...').start();
  const response = await gridlockSdk.getGridlockGuardian();
  if (!response.success) {
    spinner.fail('Failed to retrieve Gridlock guardians');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return null;
  }
  const guardians = response.payload;
  spinner.succeed('Gridlock guardians retrieved successfully');
  return guardians;
};

const addGuardianGridlock = async () => {
  const spinner = ora('Retrieving Gridlock guardian...').start();
  const gridlockGuardians = await getGridlockGuardian(); //todo why is there an extra function being called?
  //todo need to figure out how to deal with something that isn't "gridlock guardian", probably ok in the new setup from krist that won't have much stuff. 
  if (!gridlockGuardians) {
    spinner.fail('Failed to retrieve Gridlock guardians');
    return;
  }

  const response = await gridlockSdk.showNetwork();
  if (!response.success) {
    spinner.fail('Failed to retrieve network status');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  const existingGuardians = response.payload;
  const existingGuardianIds = existingGuardians.map(g => g.nodeId);

  const newGuardian = gridlockGuardians.find(g => !existingGuardianIds.includes(g.nodeId));
  if (!newGuardian) {
    spinner.fail('No new Gridlock guardian available to add');
    return;
  }

  const saveResponse = await gridlockSdk.addGuardianToNetwork(newGuardian);
  if (!saveResponse.success) {
    spinner.fail('Failed to save Gridlock guardian');
    console.error(`Error: ${saveResponse.error.message} (Code: ${saveResponse.error.code})`);
    return;
  }
  spinner.succeed('Gridlock guardian retrieved and saved successfully');
  await showNetwork();
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
    type: 'cloudGuardian',
    active: true,
    publicKey,
  };

  const spinner = ora('Adding guardian...').start();
  const response = await gridlockSdk.addGuardianToNetwork(guardian);
  if (!response.success) {
    spinner.fail('Failed to add guardian');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }

  spinner.succeed('Guardian added successfully');
  await showNetwork();
};

const addGuardian = async (guardianType, name, nodeId, publicKey, isOwnerGuardian) => {
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
    await addGuardianLocal(name, isOwnerGuardian);
  } else if (guardianType === 'gridlock') {
    await addGuardianGridlock();
  } else if (guardianType === 'cloud') {
    await addGuardianCloud(name, nodeId, publicKey);
  } else {
    console.error('Invalid guardian type. Please specify "local", "gridlock", or "cloud".');
  }
};

const createUser = async (email, password) => {
  if (!email || !password) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'User email:' },
      { type: 'input', name: 'password', message: 'Network access password:' }, //keep type as input instead of password for demo purposes
    ]);
    email = answers.email;
    password = answers.password;
  }

  const spinner = ora('Creating user...').start();

  const networkResponse = await gridlockSdk.showNetwork();
  if (!networkResponse.success) {
    spinner.fail('Failed to retrieve network status');
    console.error(`Error: ${networkResponse.error.message} (Code: ${networkResponse.error.code})`);
    return;
  }

  const guardians = networkResponse.payload;

  const registerData = {
    email,
    password,
    guardians,
  };

  const response = await gridlockSdk.createUser(registerData);
  if (!response.success) {
    spinner.fail('Failed to create user');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return;
  }
  const { user } = response.payload;
  spinner.succeed(`➕ Created account for user: ${user.username}`);
};

const createWallet = async (email, password, blockchain) => {
  if (!email || !password || !blockchain) {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'User email:' },
      { type: 'password', name: 'password', message: 'Network access password:' },
      { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
    ]);
    email = answers.email;
    password = answers.password;
    blockchain = answers.blockchain;
  }
  // this is where I left off. I just realized that session management in the SDK is crazy. 
  // session and state should be managed with the CLI
  // additionally, database setup it overengineered and simply adds friction. json file storage is fine here.. 
  const spinner = ora('Creating wallet...').start();
  const response = await gridlockSdk.createWallets([blockchain]);
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
    { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
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
// -----------------------------------
// CLI INTERFACE CODE
// -----------------------------------

program.option('-v, --verbose', 'Enable verbose output').hook('preAction', async (thisCommand) => {
  verbose = thisCommand.opts().verbose;
  gridlockSdk.verbose = verbose;
});

// Add pre and post hooks to add two line feeds for readability
program.hook('preAction', () => {
  console.log('\n\n');
});

program.hook('postAction', () => {
  console.log('\n\n');
});

program
  .command('show-network')
  .description('Displays the status of all guardians in the network')
  .action(showNetwork);

program
  .command('add-guardian')
  .description('Add a guardian')
  .option('-t, --type <type>', 'Type of guardian (local, cloud, gridlock, partner)')
  .option('-n, --name <name>', 'Guardian name')
  .option('-i, --nodeId <nodeId>', 'Node ID')
  .option('-p, --publicKey <publicKey>', 'Guardian public key')
  .option('-o, --owner', 'Is this the owner guardian')
  .action(async (options) => {
    await addGuardian(options.type, options.name, options.nodeId, options.publicKey, options.owner);
  });

program
  .command('create-user')
  .description('Create a new user')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .action(async (options) => {
    await createUser(options.email, options.password);
  });

program
  .command('create-wallet')
  .description('Create a new wallet')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .option('-b, --blockchain <blockchain>', 'Blockchain to create wallet for')
  .action(async (options) => {
    await createWallet(options.email, options.password, options.blockchain);
  });

program
  .command('sign')
  .description('Sign a transaction')
  .action(signTransaction);

program
  .command('get-gridlock-guardian')
  .description('Retrieve and display the Gridlock guardian')
  .action(getGridlockGuardian);

// -----------------------------------
// RUN PROGRAM
// -----------------------------------

try {
  await gridlockSdk.initDb({ ...mongoConfig });
  await program.parseAsync(process.argv);
} finally {
  gridlockSdk.closeDb();
}


