import { program } from 'commander';
import inquirer from 'inquirer';
import GridlockSdk from 'gridlock-sdk';

import { API_KEY, BASE_URL, DEBUG_MODE } from './src/constants.js';
import { SUPPORTED_COINS } from 'gridlock-sdk';
import { showNetwork, showAvailableGuardians } from './src/network.service.js';
import { addGridlockGuardian, addCloudGuardian } from './src/guardian.service.js';
import { login, encryptContents } from './src/auth.service.js';
import { createWallet, signTransaction } from './src/wallet.service.js';
import { createUser } from './src/user.service.js';

export const gridlock = new GridlockSdk({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  verbose: DEBUG_MODE,
  logger: console,
});

let verbose = false;

const addGuardianInquire = async ({
  email,
  password,
  guardianType,
  isOwnerGuardian,
  name,
  nodeId,
  publicKey,
}) => {
  console.log('Adding guardian...');
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
    await addGridlockGuardian();
  } else if (guardianType === 'cloud') {
    if (!email || !password || !name || !nodeId || !publicKey) {
      const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'User email:' },
        { type: 'password', name: 'password', message: 'User password:' },
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
      email = answers.email;
      password = answers.password;
      name = answers.name;
      nodeId = answers.nodeId;
      publicKey = answers.publicKey;
      isOwnerGuardian = answers.isOwnerGuardian;
    }
    await addCloudGuardian({ email, password, name, nodeId, publicKey, isOwnerGuardian });
  } else {
    console.error('Invalid guardian type. Please specify "gridlock" or "cloud".');
  }
};

const showNetworkInquire = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Please enter the user email:',
    },
  ]);
  await showNetwork(answers.email);
};

const createUserInquire = async ({ name, email, password }) => {
  const answers = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'User name:' },
    { type: 'input', name: 'email', message: 'User email:' },
    { type: 'password', name: 'password', message: 'User password:' },
  ]);
  await createUser({ name: answers.name, email: answers.email, password: answers.password });
};

const createWalletInquire = async ({ email, password, blockchain }) => {
  const answers = await inquirer.prompt([
    { type: 'input', name: 'email', message: 'User email:' },
    { type: 'password', name: 'password', message: 'Network access password:' },
    { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
  ]);
  await createWallet({
    email: answers.email,
    password: answers.password,
    blockchain: answers.blockchain,
  });
};

const signTransactionInquire = async ({ email, password, blockchain, message }) => {
  const answers = await inquirer.prompt([
    { type: 'input', name: 'email', message: 'User email:' },
    { type: 'password', name: 'password', message: 'Network access password:' },
    { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
    { type: 'input', name: 'message', message: 'Message to be signed:' },
  ]);
  await signTransaction({
    email: answers.email,
    password: answers.password,
    blockchain: answers.blockchain,
    message: answers.message,
  });
};

program.option('-v, --verbose', 'Enable verbose output').hook('preAction', async (thisCommand) => {
  verbose = thisCommand.opts().verbose;
  gridlock.verbose = verbose;
});
program.hook('preAction', () => {
  console.log('\n\n');
});

program.hook('postAction', () => {
  console.log('\n\n');
});

program
  .command('show-available-guardians')
  .description('Displays the status of all guardians in the network')
  .action(showAvailableGuardians);

program
  .command('show-network')
  .description('Displays the guardians associated with a specific user')
  .option('-e, --email <email>', 'User email')
  .action(async (options) => {
    if (options.email) {
      await showNetwork({ email: options.email });
    } else {
      await showNetworkInquire();
    }
  });

program
  .command('register-guardian')
  .description("Register a new guardian that's available for user node pool creation.")
  .option('-t, --type <type>', 'Type of guardian (cloud or gridlock)')
  .option('-n, --name <name>', 'Guardian name')
  .option('-o, --owner', 'Is this the owner guardian')
  .option('-p, --password <password>', 'Password for encrypting the identity key')
  .option('-i, --nodeId <nodeId>', 'Node ID')
  .option('-k, --publicKey <publicKey>', 'Guardian public key')
  .option('-s, --seed <seed>', 'Seed (if owner guardian)')
  .action(async (options) => {
    await registerGuardian({
      type: options.type,
      name: options.name,
      nodeId: options.nodeId,
      publicKey: options.publicKey,
      owner: options.owner,
      password: options.password,
      seed: options.seed,
    });
  });

program
  .command('create-user')
  .description('Create a new user')
  .option('-n, --name <name>', 'User name')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'User password')
  .action(async (options) => {
    if (options.name && options.email && options.password) {
      await createUser({ name: options.name, email: options.email, password: options.password });
    } else {
      await createUserInquire({});
    }
  });

program
  .command('create-wallet')
  .description('Create a new wallet')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .option('-b, --blockchain <blockchain>', 'Blockchain to create wallet for')
  .action(async (options) => {
    if (options.email && options.password && options.blockchain) {
      await createWallet({
        email: options.email,
        password: options.password,
        blockchain: options.blockchain,
      });
    } else {
      await createWalletInquire({});
    }
  });

program
  .command('sign')
  .description('Sign a transaction')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .option('-b, --blockchain <blockchain>', 'Blockchain to use')
  .option('-m, --message <message>', 'Message to be signed')
  .action(async (options) => {
    if (options.email && options.password && options.blockchain && options.message) {
      await signTransaction({
        email: options.email,
        password: options.password,
        blockchain: options.blockchain,
        message: options.message,
      });
    } else {
      await signTransactionInquire({});
    }
  });

program
  .command('add-guardian')
  .description("Add a guardian to a specific user's node pool")
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'User password')
  .option('-t, --type <type>', 'Type of guardian (cloud or gridlock)')
  .option('-o, --owner', 'Is this the owner guardian')
  .option('-n, --name <name>', 'Guardian name')
  .option('-i, --nodeId <nodeId>', 'Guardian node ID')
  .option('-k, --publicKey <publicKey>', 'Guardian public key')
  .action(async (options) => {
    await addGuardianInquire({
      email: options.email,
      password: options.password,
      guardianType: options.type,
      isOwnerGuardian: options.owner,
      name: options.name,
      nodeId: options.nodeId,
      publicKey: options.publicKey,
    });
  });

program
  .command('login')
  .description('Login to the system')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .action(async (options) => {
    const token = await login({ email: options.email, password: options.password });
    if (token) {
      console.log('Login successful');
    } else {
      console.log('Login failed');
    }
  });

program
  .command('test')
  .description('Test the encryptContents function')
  .option('-c, --content <content>', 'Content to encrypt')
  .action(async (options) => {
    if (options.content) {
      const encrypted = await encryptContents({ content: options.content });
      console.log('Encrypted content:', encrypted);
    } else {
      console.log('Please provide content to encrypt using the --content option.');
    }
  });

// ---------------- RUN PROGRAM ----------------

await program.parseAsync(process.argv);
