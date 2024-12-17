// gridlock-cli.js
import { program } from 'commander';
import fs from 'fs';
import GridlockSdk, { SUPPORTED_COINS } from 'gridlock-pg-sdk';
import ora from 'ora';
import qrcode from 'qrcode-terminal';
import * as yup from 'yup';

import path from 'path';

import {
  AUTH_DATA_FILE,
  COMMANDS,
  SUPPORTED_COINS_STRING,
  WALLET_REQUIRED_ACTIONS,
} from './constants.js';
import { green, prettyLog } from './helpers.js';

const verifyOptionCoinType = (options) => {
  const coinTypes = options.coinTypes || [options.coinType];
  const lowerCaseCoinTypes = coinTypes.map((coinType) => coinType.toLowerCase());

  lowerCaseCoinTypes.forEach((coinType) => {
    if (!SUPPORTED_COINS.includes(coinType)) {
      console.error(
        `Invalid coin type: ${coinType}. Supported coin types are: ${SUPPORTED_COINS_STRING}.`
      );
      process.exit(1);
    }
  });

  return lowerCaseCoinTypes.length === 1 ? lowerCaseCoinTypes[0] : lowerCaseCoinTypes;
};

const userSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup
    .string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&#]).{8,}$/,
      'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    )
    .required('Password is required'),
});

// token + nodeId + nodePublicKey
let authData = {};

let user = null;
let userWallets = null;
let gridlock = /** @type {GridlockSdk} */ ({});
let verbose = false;

const initUser = async (action = '') => {
  if (action === COMMANDS.SHOW_SUPPORTED_COINS) return;
  if (action === COMMANDS.CREATE_USER && !fs.existsSync(AUTH_DATA_FILE)) return;

  let spinner = ora('Initializing...').start();

  if (fs.existsSync(AUTH_DATA_FILE)) {
    // Ensure the file permissions are set to 600
    fs.chmodSync(AUTH_DATA_FILE, 0o600);

    authData = JSON.parse(fs.readFileSync(AUTH_DATA_FILE));
    const { token, nodeId, nodePublicKey } = authData;
    const data = await gridlock.refreshToken(token);

    if (data) {
      authData = { token: data.token, nodeId: data.user.nodeId, nodePublicKey: data.user.nodePublicKey };
      saveUserData(authData);
      spinner.succeed('Connected');
    } else {
      spinner.fail('Authentication failed');
      process.exit(1);
    }
  } else spinner.info('No auth data found');
};

const saveUserData = (authData) => {
  const dir = path.dirname(AUTH_DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { mode: 0o700 });
  }
  fs.writeFileSync(AUTH_DATA_FILE, JSON.stringify(authData, null, 2));
  fs.chmodSync(AUTH_DATA_FILE, 0o600);
};

const initializeSdk = async (action = '') => {
  gridlock = new GridlockSdk({
    apiKey: '1234567890',
    baseUrl: 'https://3264-2600-100e-a022-dff3-6f5d-6e0b-576e-5e6f.ngrok-free.app',
    verbose: verbose || false,
  });

  await initUser(action);
};

const logout = () => {
  const spinner = ora('Deleting local data...').start();
  try {
    if (fs.existsSync(AUTH_DATA_FILE)) {
      fs.unlinkSync(AUTH_DATA_FILE);
      const dir = path.dirname(AUTH_DATA_FILE);
      fs.rmdirSync(dir);
    }
    spinner.succeed('Logged out successfully');
  } catch (error) {
    spinner.fail('Failed to logout. Try again');
  }
};

const checkUserExistence = (command) => {
  //if (!(user && authData.token) && command !== COMMANDS.CREATE_USER) {
  //  console.error('No user found. Please create a user first using the "create-user" command.');
  //  process.exit(1);
  //}
};

const withUserCheck = (command, action) => {
  return (...args) => {
    checkUserExistence(command);
    action(...args);
  };
};

const withWalletCheck = (command, action) => {
  return (options, ...args) => {
    const coinType = options.coinType;
    if (
      (!userWallets || !userWallets.find((wallet) => wallet.coinType === coinType)) &&
      command !== COMMANDS.CREATE_WALLET
    ) {
      console.error(
        `No ${coinType} wallet found. Please create a wallet first using the "create-wallet" command.`
      );
      process.exit(1);
    }
    action(...args);
  };
};

const withUserAndWalletCheck = (command, action) => {
  return withUserCheck(command, withWalletCheck(command, action));
};

const createUser = async (email, password) => {
  try {
    let data = null;
    await userSchema.validate({ email, password });
    if (user) {
      console.log('User already exists... ');
      data = { user, ...authData };
    } else {
      const spinner = ora('Creating user...').start();
      data = await gridlock.createUser({ email, password });
      console.log(data);
      if (!data) return spinner.fail('Failed to create user');
      else spinner.succeed('User created successfully');
    }

    user = data.user;
    const token = data.token;
    const nodeId = user.nodeId;
    const nodePublicKey = user.nodePool.find((node) => node.nodeId === nodeId).publicKey;

    prettyLog({ email, nodeId, nodePublicKey });

    authData = { token, nodeId, nodePublicKey };
    saveUserData(authData);
  } catch (error) {
    if (error.errors) console.error(error.errors.join('\n'));
    else console.error(error.message);
    process.exit(1);
  }
};

const createWallet = async (coinTypes) => {
  const plural = coinTypes.length > 1 ? 's' : '';

  const spinner = ora(`Creating ${coinTypes.join(' and ')} wallet${plural}...`).start();

  userWallets = await gridlock.createWallets(coinTypes);

  if (!userWallets) {
    spinner.fail(`Failed to create ${coinTypes} wallet`);
  } else {
    spinner.succeed(
      `${coinTypes
        .map((type) => type.charAt(0).toUpperCase() + type.slice(1))
        .join(' and ')} wallet${plural} created successfully!`
    );
    userWallets
      .filter((wallet) => coinTypes.find((coinType) => coinType === wallet.coinType))
      .forEach((wallet) => {
        prettyLog({ coinType: wallet.coinType, address: wallet.address });
      });
  }
};

const signMessage = async (message, coinType) => {
  const wallet = userWallets.find((wallet) => wallet.coinType === coinType);

  const spinner = ora(`Signing message using ${coinType} wallet...`).start();

  const resp = await gridlock.signMessage(message, coinType);

  if (resp && resp.signature) {
    spinner.succeed('Message signed successfully');
    prettyLog({ message, walletAddress: wallet.address, signature: resp.signature });
  } else {
    spinner.fail('Failed to sign message');
  }
};

const verifyMessage = async (coinType, message, signature) => {
  const wallet = userWallets.find((wallet) => wallet.coinType === coinType);

  // prettyLog({ message, signature, walletAddress: wallet.address });

  const spinner = ora('Verifying message...').start();

  const isValid = await gridlock.verifySignature(coinType, message, signature, wallet.address);

  if (isValid === null) return spinner.fail('Failed to verify message');
  if (!isValid) return spinner.fail('Message verified: Invalid');
  spinner.succeed(`Message verified: ${green('Valid')}`);
};

const listNetworkNodes = async () => {
  const spinner = ora('Retrieving network nodes...').start();
  const nodes = await gridlock.getNodes();
  if (!nodes) return spinner.fail('Failed to retrieve network nodes');
  spinner.succeed('Network nodes successfully retrieved');
  console.dir(nodes, { depth: null });
};

const showUserData = async () => {
  const spinner = ora('Retrieving user data...').start();
  const user = await gridlock.getUser();
  if (!user) return spinner.fail('Failed to retrieve user data');
  spinner.succeed('User data successfully retrieved');
  console.log(`Username: ${user.username}`);
  //console.dir(user, { depth: 0 });
};

const showWallets = async () => {
  if (!userWallets) return;

  if (userWallets.length === 0) return ora(`No wallets found`).info();

  userWallets.forEach((wallet) => {
    prettyLog({ coinType: wallet.coinType, address: wallet.address });
  });
};

const deleteUser = async () => {
  const spinner = ora('Deleting user...').start();
  const resp = await gridlock.deleteUser();
  if (!resp) return spinner.fail('Failed to delete user');
  spinner.succeed('User deleted successfully');
  logout();
};

const showSupportedCoins = () => {
  prettyLog(SUPPORTED_COINS, { onlyValues: true });
};

const addGuardian = async (name) => {
  const spinner = ora('Adding guardian...').start();
  const data = await gridlock.addUserGuardian({ name });

  if (!data) return spinner.fail('Failed to add guardian');

  const newNode = data.updatedUser.nodePool.find((node) => node.code === data.code);

  if (data.code && newNode) {
    const ownerName = user?.name || user?.email?.split('@')[0];
    const params = {
      mode: 'guardian',
      activationCode: data.code,
      nodePoolId: newNode._id,
      ownerId: user?._id,
      ownerName,
      ownerNodeId: user.nodeId,
    };

    const response = await gridlock.generateGuardianDeeplink(params);
    const deepLink = response?.deepLink;

    if (!deepLink) return spinner.fail('Failed to generate guardian deeplink');
    spinner.succeed('Successfully generated guardian activation link');

    qrcode.generate(deepLink, { small: true });
    console.log('Deep link: ', deepLink);
  }
};

const signTransaction = async (transaction, coinType) => {
  console.warn('WARNING: DEVELOPMENT IN PROGRESS. MIGHT NOT WORK AS EXPECTED');

  const wallet = userWallets.find((wallet) => wallet.coinType === coinType);

  const spinner = ora(`Signing transaction using ${coinType} wallet...`).start();

  const resp = await gridlock.signSerializedTx(transaction, coinType);

  if (resp && resp.signedTx) {
    spinner.succeed('Transaction signed successfully');
    prettyLog({ message, walletAddress: wallet.address, signedTransaction: resp.signedTx });
  } else {
    spinner.fail('Failed to sign transaction');
  }
};

program.option('-v, --verbose', 'Enable verbose output').hook('preAction', async (thisCommand) => {
  verbose = thisCommand.opts().verbose;
  const commandName = thisCommand.args[0];
  await initializeSdk(commandName);
});

program
  .command(COMMANDS.CREATE_USER)
  .description('Create a new user')
  .requiredOption('-e, --email <email>', 'User email')
  .requiredOption('-p, --password <password>', 'User password')
  .action((options) => createUser(options.email, options.password));

program
  .command(COMMANDS.SHOW_USER)
  .description('Show current user data')
  .action(withUserCheck(COMMANDS.SHOW_USER, showUserData));

program
  .command(COMMANDS.CREATE_WALLET)
  .description('Create new wallet')
  .requiredOption(
    '-c, --coinTypes <coinTypes...>',
    `Specify the coin type(s) (${SUPPORTED_COINS_STRING})`
  )
  .action((options) => {
    const result = verifyOptionCoinType(options);
    const coinTypes = Array.isArray(result) ? result : [result];

    withUserCheck(COMMANDS.CREATE_WALLET, () => createWallet(coinTypes))();
  });

program
  .command(COMMANDS.LIST_NODES)
  .description('List network nodes')
  .action(withUserCheck(COMMANDS.LIST_NODES, listNetworkNodes));

program
  .command(COMMANDS.SIGN_MESSAGE)
  .description('Sign a message')
  .requiredOption('-m, --message <message>', 'Message to sign')
  .requiredOption('-c, --coinType <coinType>', `Specify the coin type (${SUPPORTED_COINS_STRING})`)
  .action((options) => {
    const coinType = verifyOptionCoinType(options);
    const message = options.message;

    if (message.length === 0) {
      console.error('Message cannot be empty');
      process.exit(1);
    }

    withUserAndWalletCheck(COMMANDS.SIGN_MESSAGE, () => signMessage(message, coinType))(options);
  });

program
  .command(COMMANDS.SIGN_SERIALIZED_TX)
  .description('Sign a serialized transaction (Development in progress)')
  .requiredOption('-t, --transaction <transaction>', 'Transaction to sign')
  .requiredOption('-c, --coinType <coinType>', `Specify the coin type (${SUPPORTED_COINS_STRING})`)
  .action((options) => {
    const coinType = verifyOptionCoinType(options);
    const transaction = options.transaction;

    if (transaction.length === 0) {
      console.error('Message cannot be empty');
      process.exit(1);
    }

    withUserAndWalletCheck(COMMANDS.SIGN_SERIALIZED_TX, () =>
      signTransaction(transaction, coinType)
    )(options);
  });

program
  .command(COMMANDS.SHOW_WALLETS)
  .description('Show user wallets')
  .action(withUserCheck(COMMANDS.SHOW_WALLETS, showWallets));

program
  .command(COMMANDS.DELETE_USER)
  .description('Delete current user')
  .action(withUserCheck(COMMANDS.DELETE_USER, deleteUser));

program
  .command(COMMANDS.SHOW_SUPPORTED_COINS)
  .description('Show supported coins')
  .action(showSupportedCoins);

program
  .command(COMMANDS.VERIFY_MESSAGE)
  .description('Verify a signed message')
  .requiredOption('-m, --message <message>', 'Message to verify')
  .requiredOption('-s, --signature <signature>', 'Signature to verify')
  .requiredOption('-c, --coinType <coinType>', `Specify the coin type ${SUPPORTED_COINS_STRING}`)
  .action((options) => {
    const coinType = verifyOptionCoinType(options);

    withUserAndWalletCheck(COMMANDS.VERIFY_MESSAGE, () => {
      verifyMessage(coinType, options.message, options.signature);
    })(options);
  });

program
  .command(COMMANDS.ADD_GUARDIAN)
  .description('Add a guardian')
  .requiredOption('-n, --name <name>', "Guardian's name")
  .action((options) => {
    const name = options.name;

    if (name.length === 0) {
      console.error('Name cannot be empty');
      process.exit(1);
    }

    withUserCheck(COMMANDS.ADD_GUARDIAN, () => addGuardian(name))();
  });

program.parse(process.argv);
