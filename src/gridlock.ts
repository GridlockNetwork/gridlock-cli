import { program } from 'commander';
import GridlockSdk from 'gridlock-sdk';
import ora from 'ora';
import chalk from 'chalk';

import { API_KEY, BASE_URL, DEBUG_MODE } from './constants.js';
import {
  createUserInquire,
  startRecoveryInquire,
  confirmRecoveryInquire,
  saveCredentialsInquire,
  transferOwnerInquire,
} from './user.service.js';
import { addGuardianInquire } from './guardian.service.js';
import { showNetworkInquire } from './network.service.js';
import {
  createWalletInquire,
  signTransactionInquire,
  verifySignatureInquire,
} from './wallet.service.js';

export const gridlock = new GridlockSdk({
  apiKey: API_KEY,
  baseUrl: BASE_URL,
  verbose: DEBUG_MODE,
  logger: console,
});

let verbose = false;
let storedCredentials: { email: string; password: string } | null = null;

program
  .option('-v, --verbose', 'Enable verbose output')
  .addHelpText(
    'after',
    `
Additional Commands:
  run-example [options]       Run the Gridlock SDK demo example
                              Use 'gridlock run-example --help' for more information`
  )
  .hook('preAction', async (thisCommand) => {
    verbose = thisCommand.opts().verbose;
    gridlock.setVerbose(verbose);
  });
program.hook('preAction', async () => {
  const spinner = ora('Checking saved credentials...').start();

  try {
    const hasCredentials = await gridlock.hasStoredCredentials();
    if (hasCredentials) {
      storedCredentials = await gridlock.loadStoredCredentials();
      spinner.succeed(
        `Logged in as ${chalk.green(
          storedCredentials?.email ?? '...hmmm well this is awkward. Who are you?'
        )}`
      );
    } else {
      spinner.info('No saved credentials found');
    }
  } catch (error) {
    spinner.fail('Failed to load credentials');
  }

  console.log('\n');
});

program.hook('postAction', () => {
  console.log('\n\n');
});

program
  .command('show-network')
  .description('Displays the guardians associated with a specific user')
  .option('-e, --email <email>', 'User email (optional if credentials saved)')
  .action(async (options) => {
    await showNetworkInquire({
      email: options.email || storedCredentials?.email,
      verbose: verbose,
    });
  });

program
  .command('create-user')
  .description('Create a new user')
  .option('-n, --name <name>', 'User name')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'User password')
  .option('-s, --save', 'Save credentials for future use')
  .action(async (options) => {
    const result = await createUserInquire({
      name: options.name,
      email: options.email,
      password: options.password,
      saveCredentials: options.save,
    });
  });

program
  .command('add-guardian')
  .description("Add a guardian to a specific user's node pool")
  .option('-e, --email <email>', 'User email (optional if credentials saved)')
  .option('-p, --password <password>', 'User password (optional if credentials saved)')
  .option('-t, --type <type>', 'Type of guardian (cloud or gridlock)')
  .option('-o, --owner', 'Is this the owner guardian')
  .option('-n, --name <name>', 'Guardian name')
  .option('-i, --nodeId <nodeId>', 'Guardian node ID')
  .option('-ik, --networkingPublicKey <networkingPublicKey>', 'Guardian public key')
  .option('-ek, --e2ePublicKey <e2ePublicKey>', 'Guardian E2E public key')
  .action(async (options) => {
    await addGuardianInquire({
      email: options.email || storedCredentials?.email,
      password: options.password || storedCredentials?.password,
      guardianType: options.type,
      isOwnerGuardian: options.owner,
      name: options.name,
      nodeId: options.nodeId,
      networkingPublicKey: options.networkingPublicKey,
      e2ePublicKey: options.e2ePublicKey,
    });
  });

program
  .command('create-wallet')
  .description('Create a new wallet')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'Network access password')
  .option('-b, --blockchain <blockchain>', 'Blockchain to create wallet for')
  .action(async (options) => {
    await createWalletInquire({
      email: options.email || storedCredentials?.email,
      password: options.password || storedCredentials?.password,
      blockchain: options.blockchain,
    });
  });

program
  .command('sign')
  .description('Sign a transaction')
  .option('-e, --email <email>', 'User email (optional if credentials saved)')
  .option('-p, --password <password>', 'Network access password (optional if credentials saved)')
  .option('-a, --address <address>', 'Blockchain to use')
  .option('-m, --message <message>', 'Message to be signed')
  .action(async (options) => {
    await signTransactionInquire({
      email: options.email || storedCredentials?.email,
      password: options.password || storedCredentials?.password,
      address: options.address,
      message: options.message,
    });
  });

program
  .command('verify')
  .description('Verify a signature')
  .option('-e, --email <email>', 'User email (optional if credentials saved)')
  .option('-p, --password <password>', 'Network access password (optional if credentials saved)')
  .option('-m, --message <message>', 'Message to be verified')
  .option('-a, --address <address>', 'Address')
  .option('-s, --signature <signature>', 'Signature to be verified')
  .action(async (options) => {
    await verifySignatureInquire({
      email: options.email || storedCredentials?.email,
      password: options.password || storedCredentials?.password,
      message: options.message,
      address: options.address,
      signature: options.signature,
    });
  });

program
  .command('start-recovery')
  .description('Recover account using email')
  .option('-e, --email <email>', "Enter email for the account you're trying to recover")
  .option('-p, --password <password>', 'Use a new (or existing) password for the recovered account')
  .action(async (options) => {
    await startRecoveryInquire({
      email: options.email || storedCredentials?.email,
      password: options.password || storedCredentials?.password,
    });
  });

program
  .command('confirm-recovery')
  .description('Confirm recovery using the received recovery code')
  .option('-e, --email <email>', 'User email (optional if credentials saved)')
  .option('-p, --password <password>', 'User password (optional if credentials saved)')
  .option('-r, --recoveryBundle <recoveryBundle>', 'Recovery bundle received by email')
  .action(async (options) => {
    await confirmRecoveryInquire({
      email: options.email || storedCredentials?.email,
      password: options.password || storedCredentials?.password,
      recoveryBundle: options.recoveryBundle,
    });
  });

program
  .command('transfer-owner')
  .description('Transfer ownership of your account to this device')
  .option('-e, --email <email>', 'User email (optional if credentials saved)')
  .option('-p, --password <password>', 'User password (optional if credentials saved)')
  .action(async (options) => {
    await transferOwnerInquire({
      email: options.email || storedCredentials?.email,
      password: options.password || storedCredentials?.password,
    });
  });

program
  .command('save-credentials')
  .description('Login and save credentials for future use')
  .option('-e, --email <email>', 'User email')
  .option('-p, --password <password>', 'User password')
  .action(async (options) => {
    await saveCredentialsInquire({
      email: options.email,
      password: options.password,
    });
  });

program
  .command('clear-credentials')
  .description('Clear saved credentials')
  .action(async () => {
    const spinner = ora('Clearing credentials...').start();
    try {
      await gridlock.clearStoredCredentials();
      spinner.succeed('Credentials cleared successfully');
    } catch (error) {
      spinner.fail('Failed to clear credentials');
    }
  });

// ---------------- RUN PROGRAM ----------------

program.parseAsync(process.argv);
