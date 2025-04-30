import gridlock from './initGridlock.js';
import { config } from './initGridlock.js';
import { IGuardian } from 'gridlock-sdk/types';
import chalk from 'chalk';
import readline from 'readline';
import path from 'path';
import os from 'os';
import fs from 'fs';

// **************************************************************************************
// CONFIGURATION: Update these values with your own settings
// **************************************************************************************

// User details
const USER_EMAIL = 'gilfoyle@piedpiper.com';
const USER_PASSWORD = 'password123';
const USER_NAME = 'Bertram Gilfoyle';

// Recovery settings
const RECOVERY_PASSWORD = 'my_new_password123';

// Blockchain settings
const BLOCKCHAINS = ['solana'];

// Cloud Guardian details - Add up to 5 cloud guardians
const CLOUD_GUARDIANS = [
  {
    name: 'Phyllis',
    nodeId: '831fbff7-40fb-42aa-81f7-51d05c4baf6d',
    networkingPublicKey: 'UDVXEQ4IDDB3LGP3IYXXPO2LNS6NUGRB6P77UAJKEKIU3AJFGP4CO6SO',
    e2ePublicKey: '5oIgrRLqZ+Qh/EDM9Bix8pLTyxBc7AW8YeWmLiXtJzM=',
  },
  {
    name: 'Gertrude',
    nodeId: 'df8957b9-e71d-4c82-9665-f1bbb0fa0faf',
    networkingPublicKey: 'UBSYF7NQR3L235X73VNVKDNTU3OXANPIUA6LUAD3YSPOO6MWILXKLDIN',
    e2ePublicKey: '8H30i7+E5xyFcYrCdcDVn7Oq1qjjrz16Cf8K2o/4DVc=',
  },
  {
    name: 'Wilbur',
    nodeId: 'af99da83-a89c-4acb-9419-31ec906b316f',
    networkingPublicKey: 'UAMLRKP5SMKLGUFJZQKXCCHQE7AWD42N7UEYGJIE7KX4D7CVMHVIVGKI',
    e2ePublicKey: 'ndq5On5nnkRHJWpCPSNgtVPsEq4iPJT3yCaB1e+gp2w=',
  },
];

// Process command line arguments
// Check if --help or -h flag is provided
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(chalk.green('Gridlock SDK Example Usage'));
  console.log(chalk.cyan('='.repeat(40)));
  console.log('Options:');
  console.log('  --interactive, -i  Run the example in interactive mode (pause between steps)');
  console.log('  --help, -h         Show this help information');
  console.log('\nExample:');
  console.log('  gridlock run-example             # Run in automatic mode (default)');
  console.log('  gridlock run-example --interactive  # Run in interactive mode');
  console.log('\nError Handling:');
  console.log('  Automatic Mode: Any error will stop execution');
  console.log('  Interactive Mode: You can choose to continue after errors');
  process.exit(0);
}

// Check if --interactive or -i flag is provided to enable interactive mode
if (process.argv.includes('--interactive') || process.argv.includes('-i')) {
  config.autoRun = false;
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to wait for user to press ENTER to continue
const waitForKeyPress = async (
  message: string = 'Press ENTER to continue to the next step...',
  color: (text: string) => string = chalk.yellow
): Promise<void> => {
  // If autoRun is enabled, don't wait for keypress
  if (config.autoRun) {
    return;
  }

  return new Promise((resolve) => {
    // Update the message to include exit instructions
    console.log('\n' + color(message + ' (Press ESC to exit)'));

    // Configure raw mode to get raw key presses
    process.stdin.setRawMode(true);
    process.stdin.resume();

    // Handle SIGINT (Ctrl+C)
    const handleSigInt = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      rl.close();
      process.exit(0);
    };
    process.on('SIGINT', handleSigInt);

    // Handle key press
    process.stdin.once('data', (data) => {
      // Reset stdin to normal mode
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.removeListener('SIGINT', handleSigInt);

      // Check if ESC key was pressed (ESC has character code 27)
      if (data[0] === 27) {
        rl.close();
        process.exit(0);
      }

      // For any other key, resolve the promise
      resolve();
    });
  });
};

// Function to get user input
const getUserInput = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    // Ensure stdin is in normal mode and paused
    process.stdin.setRawMode(false);
    process.stdin.pause();

    // Create a new readline interface for this specific input
    const inputRl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    inputRl.question(prompt, (answer) => {
      inputRl.close();
      resolve(answer);
    });
  });
};

// Main function to run all steps sequentially with user interaction
async function runExample() {
  try {
    // Pause to let the user read configuration and begin when ready
    await waitForKeyPress('Press ENTER to begin...', chalk.blue);

    // **************************************************************************************
    // STEP 1: INITIALIZE SDK
    // **************************************************************************************
    console.log(chalk.hex('#4CAF50')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#4CAF50')('STEP 1: INITIALIZE SDK'));
    console.log(chalk.hex('#4CAF50')('*'.repeat(80)));
    console.log('SDK initialized with the following configuration:');
    console.log(
      `- Auto Run: ${config.autoRun ? chalk.green('Enabled') : chalk.yellow('Disabled')}`
    );
    console.log('- API Key:', config.API_KEY);
    console.log('- Base URL:', config.BASE_URL);
    console.log('- Debug Mode:', config.DEBUG_MODE ? 'Enabled' : 'Disabled');

    // **************************************************************************************
    // STEP 2: CREATING A NEW USER
    // **************************************************************************************
    console.log(chalk.hex('#2196F3')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#2196F3')('STEP 2: CREATING A NEW USER'));
    console.log(chalk.hex('#2196F3')('*'.repeat(80)));
    console.log(
      chalk.grey(
        `CLI command: gridlock create-user -n "${USER_NAME}" -e ${USER_EMAIL} -p ${USER_PASSWORD}`
      )
    );
    console.log('Creating user with the following details:');
    console.log(`- Name: ${USER_NAME}`);
    console.log(`- Email: ${USER_EMAIL}`);
    console.log(`- Password: ${USER_PASSWORD}`);

    await waitForKeyPress('Press ENTER to create user...', chalk.hex('#4CAF50'));

    try {
      const { user, authTokens } = await gridlock.createUser({
        name: USER_NAME,
        email: USER_EMAIL,
        password: USER_PASSWORD,
        saveCredentials: false,
      });

      console.log('\n✅ User created successfully!');
      console.log('- Name:', user.name);
      console.log('- Email:', user.email);
      console.log('- Auth Tokens Received:', authTokens ? 'Yes' : 'No');
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }

    // **************************************************************************************
    // STEP 3: ADDING CLOUD GUARDIANS
    // **************************************************************************************
    console.log(chalk.hex('#0D47A1')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#0D47A1')('STEP 3: ADDING CLOUD GUARDIANS'));
    console.log(chalk.hex('#0D47A1')('*'.repeat(80)));

    for (let i = 0; i < CLOUD_GUARDIANS.length; i++) {
      const guardian = CLOUD_GUARDIANS[i];
      const isOwnerGuardian = i === 0; // Only first guardian is owner

      console.log(
        chalk.grey(
          `CLI command: gridlock add-guardian -e ${USER_EMAIL} -p ${USER_PASSWORD} -t cloud ${
            isOwnerGuardian ? '-o' : ''
          } -n "${guardian.name}" -i ${guardian.nodeId} -ik ${guardian.networkingPublicKey} -ek ${
            guardian.e2ePublicKey
          }`
        )
      );
      console.log('Preparing Cloud Guardian data:');
      console.log('- Guardian Name:', guardian.name);
      console.log('- Node ID:', guardian.nodeId);
      console.log('- Is Owner Guardian:', isOwnerGuardian ? 'Yes' : 'No');

      await waitForKeyPress('Press ENTER to add cloud guardian...', chalk.hex('#2196F3'));

      try {
        const response = await gridlock.addGuardian({
          email: USER_EMAIL,
          password: USER_PASSWORD,
          guardian: {
            ...guardian,
            type: 'cloud',
            active: true,
          },
          isOwnerGuardian,
        });

        console.log('\n✅ Cloud Guardian added successfully!');
        console.log('- Guardian Name:', response.guardian.name);
        console.log('- Guardian Type:', response.guardian.type);
        console.log('- Is Owner Guardian:', isOwnerGuardian ? 'Yes' : 'No');
      } catch (error) {
        console.error('❌ Error adding Cloud Guardian:', error);
        throw error;
      }
    }

    // **************************************************************************************
    // STEP 4: SHOWING NETWORK
    // **************************************************************************************
    console.log(chalk.hex('#607D8B')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#607D8B')('STEP 4: SHOWING NETWORK'));
    console.log(chalk.hex('#607D8B')('*'.repeat(80)));
    console.log(
      chalk.grey(`CLI command: gridlock show-network -e ${USER_EMAIL} -p ${USER_PASSWORD}`)
    );
    console.log('Showing network details:');

    await waitForKeyPress('Press ENTER to show network...', chalk.hex('#607D8B'));

    try {
      // Emulate the showNetwork function's output style
      console.log(
        chalk.bold(
          `\n🌐 Guardians for ${chalk.hex('#4A90E2').bold(USER_NAME)} (${chalk
            .hex('#4A90E2')
            .bold(USER_EMAIL)})`
        )
      );
      console.log('-----------------------------------');

      // Map of emojis for different guardian types
      const emojiMap: { [key: string]: string } = {
        local: '🏡',
        social: '👥',
        cloud: '🌥️',
        gridlock: '🛡️',
        partner: '🤝',
      };

      // Display cloud guardians
      for (let i = 0; i < CLOUD_GUARDIANS.length; i++) {
        const guardian = CLOUD_GUARDIANS[i];
        const isOwnerGuardian = i === 0;
        const emoji = emojiMap['cloud'];

        if (isOwnerGuardian) {
          console.log(`    👑 ${chalk.bold('Name:')} ${guardian.name}`);
        } else {
          console.log(`       ${chalk.bold('Name:')} ${guardian.name}`);
        }
        console.log(`       ${chalk.bold('Type:')} ${emoji} Cloud Guardian`);
        console.log(`       ${chalk.bold('Node ID:')} ${guardian.nodeId}`);
        console.log(`       ${chalk.bold('Status:')} ${chalk.green('ACTIVE')}`);

        if (i < CLOUD_GUARDIANS.length - 1 || i === CLOUD_GUARDIANS.length - 1) {
          console.log('       ---');
        }
      }

      // Calculate total guardians and show threshold information
      const totalGuardians = CLOUD_GUARDIANS.length;
      const threshold = 3;
      const thresholdCheck = totalGuardians >= threshold ? chalk.green('✅') : chalk.red('❌');
      console.log(
        `Total Guardians: ${totalGuardians} | Threshold: ${threshold} of ${totalGuardians} ${thresholdCheck}`
      );
    } catch (error) {
      console.error('❌ Error showing network:', error);
      throw error;
    }

    // **************************************************************************************
    // STEP 5: CREATING WALLETS
    // **************************************************************************************
    console.log(chalk.hex('#FF5722')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#FF5722')('STEP 5: CREATING WALLETS'));
    console.log(chalk.hex('#FF5722')('*'.repeat(80)));

    // Create both Solana and Ethereum wallets
    const walletAddresses: { [key: string]: string } = {};

    for (const blockchain of BLOCKCHAINS) {
      console.log(
        chalk.grey(
          `CLI command: gridlock create-wallet -e ${USER_EMAIL} -p ${USER_PASSWORD} -b ${blockchain}`
        )
      );
      console.log(`Creating ${blockchain} wallet:`);

      await waitForKeyPress(`Press ENTER to create ${blockchain} wallet...`, chalk.hex('#0D47A1'));

      try {
        const wallet = await gridlock.createWallet({
          email: USER_EMAIL,
          password: USER_PASSWORD,
          blockchain,
        });

        if (wallet?.address) {
          walletAddresses[blockchain] = wallet.address;
        }

        console.log(`\n✅ ${blockchain} wallet created successfully!`);
        console.log('- Wallet Address:', wallet?.address);
        console.log('- Blockchain:', wallet?.blockchain);
      } catch (error) {
        console.error(`❌ Error creating ${blockchain} wallet:`, error);
        throw error;
      }
    }

    // **************************************************************************************
    // STEP 6: SIGNING A MESSAGE
    // **************************************************************************************
    console.log(chalk.hex('#FFC107')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#FFC107')('STEP 6: SIGNING A MESSAGE'));
    console.log(chalk.hex('#FFC107')('*'.repeat(80)));

    const message = 'This is a message to be signed';
    let signature: { signature: string } | undefined;

    // Get the first available wallet address
    const availableBlockchain = BLOCKCHAINS.find((blockchain) => walletAddresses[blockchain]);
    if (!availableBlockchain) {
      throw new Error('No wallet addresses available. Wallet creation may have failed.');
    }
    const walletAddress = walletAddresses[availableBlockchain];

    console.log(
      chalk.grey(
        `CLI command: gridlock sign -e ${USER_EMAIL} -p ${USER_PASSWORD} -a ${walletAddress} -m "${message}"`
      )
    );
    console.log('Signing the following message:');
    console.log(`"${message}"`);
    console.log(`Using ${availableBlockchain} wallet: ${walletAddress}`);

    await waitForKeyPress('Press ENTER to sign message...', chalk.hex('#FF5722'));

    try {
      signature = await gridlock.signTransaction({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        address: walletAddress,
        message,
      });

      if (!signature) {
        throw new Error('Failed to generate signature');
      }

      console.log('\n✅ Message signed successfully!');
      console.log('- Signature:', signature.signature.substring(0, 20) + '...');
      console.log('- Wallet Address Used:', walletAddress);
      console.log('- Blockchain Used:', availableBlockchain);

      // **************************************************************************************
      // STEP 7: VERIFYING THE SIGNATURE
      // **************************************************************************************
      console.log(chalk.hex('#607D8B')('\n' + '*'.repeat(80)));
      console.log(chalk.hex('#607D8B')('STEP 7: VERIFYING THE SIGNATURE'));
      console.log(chalk.hex('#607D8B')('*'.repeat(80)));
      console.log(
        chalk.grey(
          `CLI command: gridlock verify -e ${USER_EMAIL} -p ${USER_PASSWORD} -m "${message}" -a ${walletAddress} -s ${signature.signature}`
        )
      );
      console.log('Verifying signature for message:');
      console.log(`"${message}"`);
      console.log(`Using ${availableBlockchain} wallet: ${walletAddress}`);

      await waitForKeyPress('Press ENTER to verify signature...', chalk.hex('#607D8B'));

      const isVerified = await gridlock.verifySignature({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        message,
        address: walletAddress,
        signature: signature.signature,
      });

      console.log('\n✅ Signature verification result:', isVerified ? 'VALID ✓' : 'INVALID ✗');
    } catch (error) {
      console.error('❌ Error during signing or verification:', error);
      throw error;
    }

    // **************************************************************************************
    // STEP 8: SIMULATING NEW DEVICE
    // **************************************************************************************
    console.log(chalk.hex('#00BCD4')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#00BCD4')('STEP 8: SIMULATING NEW DEVICE'));
    console.log(chalk.hex('#00BCD4')('*'.repeat(80)));
    console.log(chalk.grey('CLI command: find ~/.gridlock-cli -type f -delete'));
    console.log('Simulating a new device by removing all local data:');
    console.log('- Removing stored user data');
    console.log('- Removing stored guardian data');
    console.log('- Removing stored authentication data');

    await waitForKeyPress('Press ENTER to remove local data...', chalk.hex('#607D8B'));

    try {
      const gridlockDir = path.join(os.homedir(), '.gridlock-cli');
      if (fs.existsSync(gridlockDir)) {
        // Recursively find and delete all files while preserving directories
        function deleteFilesRecursively(dir: string) {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const filePath = path.join(dir, file);
            if (fs.lstatSync(filePath).isDirectory()) {
              deleteFilesRecursively(filePath);
            } else {
              fs.unlinkSync(filePath);
            }
          }
        }

        deleteFilesRecursively(gridlockDir);
        console.log('\n✅ Local data removed successfully!');
      } else {
        console.log('\nℹ️ No local data found to remove.');
      }
    } catch (error) {
      console.error('❌ Error removing local data:', error);
      throw error;
    }

    // **************************************************************************************
    // STEP 9: ACCOUNT RECOVERY
    // **************************************************************************************
    console.log(chalk.hex('#3F51B5')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#3F51B5')('STEP 9: ACCOUNT RECOVERY'));
    console.log(chalk.hex('#3F51B5')('*'.repeat(80)));
    console.log(
      chalk.grey(`CLI command: gridlock start-recovery -e ${USER_EMAIL} -p ${RECOVERY_PASSWORD}`)
    );
    console.log('Demonstrating account recovery process:');
    console.log(`- Email: ${USER_EMAIL}`);
    console.log(`- New Password: ${RECOVERY_PASSWORD}`);

    await waitForKeyPress('Press ENTER to start recovery process...', chalk.hex('#00BCD4'));

    try {
      console.log('\nInitiating account recovery...');

      await gridlock.startRecovery({
        email: USER_EMAIL,
        password: RECOVERY_PASSWORD,
      });

      console.log('\n✅ Recovery initiated successfully!');
      console.log(`- A verification code has been sent to ${USER_EMAIL}`);

      // **************************************************************************************
      // STEP 10: CONFIRM RECOVERY
      // **************************************************************************************
      console.log(chalk.hex('#673AB7')('\n' + '*'.repeat(80)));
      console.log(chalk.hex('#673AB7')('STEP 10: CONFIRM RECOVERY'));
      console.log(chalk.hex('#673AB7')('*'.repeat(80)));
      console.log(
        chalk.grey(
          `CLI command: gridlock confirm-recovery -e ${USER_EMAIL} -p ${RECOVERY_PASSWORD} -r <recovery-code>`
        )
      );
      console.log('Confirming recovery with verification codes from each cloud guardian...');

      // Array to track which guardians have been confirmed
      const confirmedGuardians: string[] = [];

      // Loop through each cloud guardian to get verification codes
      for (let i = 0; i < CLOUD_GUARDIANS.length; i++) {
        const guardian = CLOUD_GUARDIANS[i];

        // Show which guardians are left to confirm
        console.log('\nRemaining guardians to confirm:');
        CLOUD_GUARDIANS.forEach((g, index) => {
          if (!confirmedGuardians.includes(g.name)) {
            console.log(`- ${g.name} ${g.name === guardian.name ? '(current)' : ''}`);
          }
        });

        console.log(`\nRequesting verification code for guardian: ${guardian.name}`);

        // Wait for user to input the verification code for this guardian
        const recoveryBundle = await getUserInput(
          `\nPlease enter the verification code received from ${guardian.name}: `
        );

        // Confirm recovery with the code
        console.log(`\nConfirming recovery with code from ${guardian.name}...`);

        try {
          await gridlock.confirmRecovery({
            email: USER_EMAIL,
            password: RECOVERY_PASSWORD,
            recoveryBundle,
          });

          console.log(`\n✅ Recovery code from ${guardian.name} confirmed successfully!`);
          confirmedGuardians.push(guardian.name);

          // If we've confirmed enough guardians, we can break the loop
          if (confirmedGuardians.length >= Math.ceil(CLOUD_GUARDIANS.length / 2) + 1) {
            console.log('\n✅ Sufficient number of guardians confirmed! Recovery proceeding...');
            break;
          }
        } catch (error) {
          console.error(`❌ Error confirming recovery code from ${guardian.name}:`, error);
          console.log('Please try again with another guardian or correct code.');
          // Skip adding to confirmedGuardians, will retry or try another guardian
        }
      }

      console.log('\n✅ Recovery confirmed successfully!');
      console.log('- Account has been recovered with the new password');
      console.log('- You can now access your wallet and guardians with the new credentials');

      // Wait for remote file system operations to complete
      console.log('\nWaiting for remote operations to complete...');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // **************************************************************************************
      // STEP 11: TRANSFER OWNERSHIP
      // **************************************************************************************
      console.log(chalk.hex('#8BC34A')('\n' + '*'.repeat(80)));
      console.log(chalk.hex('#8BC34A')('STEP 11: TRANSFER OWNERSHIP'));
      console.log(chalk.hex('#8BC34A')('*'.repeat(80)));
      console.log(
        chalk.grey(`CLI command: gridlock transfer-owner -e ${USER_EMAIL} -p ${RECOVERY_PASSWORD}`)
      );
      console.log('Transferring ownership to this device...');

      await waitForKeyPress('Press ENTER to transfer ownership...', chalk.hex('#673AB7'));

      try {
        await gridlock.transferOwner({
          email: USER_EMAIL,
          password: RECOVERY_PASSWORD,
        });

        console.log('\n✅ Ownership transferred successfully!');
        console.log('- This device is now the owner of the account');
        console.log('- Recovery process is complete');
      } catch (error) {
        console.error('❌ Error transferring ownership:', error);
        throw error;
      }

      // **************************************************************************************
      // STEP 12: POST RECOVERY SIGNING
      // **************************************************************************************
      console.log(chalk.hex('#CDDC39')('\n' + '*'.repeat(80)));
      console.log(chalk.hex('#CDDC39')('STEP 12: POST RECOVERY SIGNING'));
      console.log(chalk.hex('#CDDC39')('*'.repeat(80)));

      const recoveryTestMessage = 'This message confirms successful account recovery';

      // Get the first available wallet address for recovery steps
      const recoveryBlockchain = BLOCKCHAINS.find((blockchain) => walletAddresses[blockchain]);
      if (!recoveryBlockchain) {
        throw new Error('No wallet addresses available. Cannot verify recovery success.');
      }
      const recoveryWalletAddress = walletAddresses[recoveryBlockchain];

      console.log(
        chalk.grey(
          `CLI command: gridlock sign -e ${USER_EMAIL} -p ${RECOVERY_PASSWORD} -a ${recoveryWalletAddress} -m "${recoveryTestMessage}"`
        )
      );
      console.log('Confirming successful recovery by signing a message with new credentials:');
      console.log(`- Test Message: "${recoveryTestMessage}"`);
      console.log(`- Using Email: ${USER_EMAIL}`);
      console.log(`- Using New Password: ${RECOVERY_PASSWORD}`);
      console.log(`- Using ${recoveryBlockchain} wallet: ${recoveryWalletAddress}`);

      await waitForKeyPress(
        'Press ENTER to verify recovery by signing a message...',
        chalk.hex('#8BC34A')
      );

      console.log('\nSigning message with recovered account...');

      // Sign message with new credentials
      const recoverySignature = await gridlock.signTransaction({
        email: USER_EMAIL,
        password: RECOVERY_PASSWORD,
        address: recoveryWalletAddress,
        message: recoveryTestMessage,
      });

      console.log('\n✅ Message signed successfully with new credentials!');
      console.log('- Signature:', recoverySignature.signature.substring(0, 20) + '...');
      console.log('- Wallet Address Used:', recoveryWalletAddress);
      console.log('- Blockchain Used:', recoveryBlockchain);

      // **************************************************************************************
      // STEP 13: POST RECOVERY VERIFICATION
      // **************************************************************************************
      console.log(chalk.hex('#795548')('\n' + '*'.repeat(80)));
      console.log(chalk.hex('#795548')('STEP 13: POST RECOVERY VERIFICATION'));
      console.log(chalk.hex('#795548')('*'.repeat(80)));

      console.log(
        chalk.grey(
          `CLI command: gridlock verify -e ${USER_EMAIL} -p ${RECOVERY_PASSWORD} -m "${recoveryTestMessage}" -a ${recoveryWalletAddress} -s ${recoverySignature.signature}`
        )
      );
      console.log('Verifying signature with recovered account...');
      console.log(`Using ${recoveryBlockchain} wallet: ${recoveryWalletAddress}`);

      const isRecoveryVerified = await gridlock.verifySignature({
        email: USER_EMAIL,
        password: RECOVERY_PASSWORD,
        message: recoveryTestMessage,
        address: recoveryWalletAddress,
        signature: recoverySignature.signature,
      });

      console.log(
        '\n✅ Recovery verification result:',
        isRecoveryVerified ? 'VALID ✓' : 'INVALID ✗'
      );

      if (isRecoveryVerified) {
        console.log('\n🎉 ACCOUNT RECOVERY SUCCESSFUL! 🎉');
        console.log('- Your account has been fully recovered with the new password');
        console.log('- You have full access to your wallet and can sign transactions');

        console.log(chalk.hex('#4CAF50')('\n' + '*'.repeat(80)));
        console.log(chalk.hex('#4CAF50')('Example Completed'));
        console.log(chalk.hex('#4CAF50')('*'.repeat(80)));
      } else {
        console.log('\n⚠️ Recovery verification failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('❌ Error during recovery process:', error);
      console.log('\nRecovery example could not be completed due to an error.');
    }
  } catch (error) {
    console.error('\n❌ Example terminated due to an error:', error);
  } finally {
    // Close readline interface after all steps are complete
    rl.close();
    // Need to explicitly exit as stdin is kept open by the keypress listener
    process.exit(0);
  }
}

// Script initialization
console.log('Starting Gridlock SDK example...');
if (config.autoRun) {
  console.log(chalk.blue('[AUTO] Running in automatic mode - no user input required'));
  runExample();
} else {
  console.log(chalk.yellow('[INTERACTIVE] This example will proceed step by step with your input'));

  runExample();
}
