import gridlock from './initGridlock.js';
import { config } from './initGridlock.js';
import { IGuardian } from 'gridlock-sdk/types';
import chalk from 'chalk';
import readline from 'readline';
import path from 'path';
import os from 'os';
import fs from 'fs';

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

    // Handle key press
    process.stdin.once('data', (data) => {
      // Reset stdin to normal mode
      process.stdin.setRawMode(false);
      process.stdin.pause();

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
const BLOCKCHAIN = 'solana'; // Options: 'solana', 'ethereum', etc.

// Cloud Guardian details
const CLOUD_GUARDIAN: IGuardian = {
  name: 'EXAMPLE CLOUD GUARDIAN',
  nodeId: '8e198cc0-eace-4b9b-a12c-7a6e6801078e',
  publicKey: 'UA2IGJVRR2LXXLUJTBDWRXH55IV2N5JNJQLABEH52COWVWXKYCFVEZJD',
  e2ePublicKey: 'DJeBSqPAN6J3tSy34Ora/Bdl4/B/K13pkOkZv4DNUCc=',
  type: 'cloud',
  active: true,
};

// Main function to run all steps sequentially with user interaction
async function runExample() {
  try {
    console.log(chalk.blue('='.repeat(80)));
    console.log(chalk.blue('GRIDLOCK SDK EXAMPLE USAGE'));
    console.log(chalk.blue('='.repeat(80)));
    console.log('Initializing Gridlock SDK with configuration:');
    console.log(
      `- Auto Run: ${config.autoRun ? chalk.green('Enabled') : chalk.yellow('Disabled')}`
    );
    console.log('- API Key:', config.API_KEY);
    console.log('- Base URL:', config.BASE_URL);
    console.log('- Debug Mode:', config.DEBUG_MODE ? 'Enabled' : 'Disabled');

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
    // STEP 3: ADDING A CLOUD GUARDIAN
    // **************************************************************************************
    console.log(chalk.hex('#0D47A1')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#0D47A1')('STEP 3: ADDING A CLOUD GUARDIAN'));
    console.log(chalk.hex('#0D47A1')('*'.repeat(80)));
    console.log(
      chalk.grey(
        `CLI command: gridlock add-guardian -e ${USER_EMAIL} -p ${USER_PASSWORD} -t cloud -o -n "${CLOUD_GUARDIAN.name}" -i ${CLOUD_GUARDIAN.nodeId} -ik ${CLOUD_GUARDIAN.publicKey} -ek ${CLOUD_GUARDIAN.e2ePublicKey}`
      )
    );
    console.log('Preparing Cloud Guardian data:');

    // Use the guardian data defined at the top of the file
    const guardianData = CLOUD_GUARDIAN;

    console.log('- Guardian Name:', guardianData.name);
    console.log('- Node ID:', guardianData.nodeId);
    console.log('- Type:', guardianData.type);
    console.log('- Is Owner Guardian: Yes');

    await waitForKeyPress('Press ENTER to add cloud guardian...', chalk.hex('#2196F3'));

    try {
      const response = await gridlock.addGuardian({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        guardian: guardianData,
        isOwnerGuardian: true,
      });

      console.log('\n✅ Cloud Guardian added successfully!');
      console.log('- Guardian Name:', response.guardian.name);
      console.log('- Guardian Type:', response.guardian.type);
    } catch (error) {
      console.error('❌ Error adding Cloud Guardian:', error);
      throw error;
    }

    // **************************************************************************************
    // STEP 4: ADDING A GRIDLOCK GUARDIAN
    // **************************************************************************************
    console.log(chalk.hex('#9C27B0')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#9C27B0')('STEP 4: ADDING A GRIDLOCK GUARDIAN'));
    console.log(chalk.hex('#9C27B0')('*'.repeat(80)));
    console.log(
      chalk.grey(
        `CLI command: gridlock add-guardian -e ${USER_EMAIL} -p ${USER_PASSWORD} -t gridlock`
      )
    );
    console.log('Adding a professional Gridlock Guardian:');
    console.log('- Type: gridlock');

    await waitForKeyPress('Press ENTER to add gridlock guardian...', chalk.hex('#0D47A1'));

    try {
      const response = await gridlock.addProfessionalGuardian({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        type: 'gridlock',
      });

      console.log('\n✅ Gridlock Guardian added successfully!');
      console.log('- Guardian Name:', response.guardian.name);
      console.log('- Guardian Type:', response.guardian.type);
    } catch (error) {
      console.error('❌ Error adding Gridlock Guardian:', error);
      throw error;
    }

    // **************************************************************************************
    // STEP 5: ADDING A PARTNER GUARDIAN
    // **************************************************************************************
    console.log(chalk.hex('#E91E63')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#E91E63')('STEP 5: ADDING A PARTNER GUARDIAN'));
    console.log(chalk.hex('#E91E63')('*'.repeat(80)));
    console.log(
      chalk.grey(
        `CLI command: gridlock add-guardian -e ${USER_EMAIL} -p ${USER_PASSWORD} -t partner`
      )
    );
    console.log('Adding a professional Partner Guardian:');
    console.log('- Type: partner');

    await waitForKeyPress('Press ENTER to add partner guardian...', chalk.hex('#9C27B0'));

    try {
      const partnerGuardian = await gridlock.addProfessionalGuardian({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        type: 'partner',
      });

      console.log('\n✅ Partner Guardian added successfully!');
      console.log('- Guardian Name:', partnerGuardian.guardian.name);
      console.log('- Guardian Type:', partnerGuardian.guardian.type);
    } catch (error) {
      console.error('❌ Error adding Partner Guardian:', error);
      throw error;
    }

    // **************************************************************************************
    // STEP 6: CREATING A WALLET
    // **************************************************************************************
    console.log(chalk.hex('#FF5722')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#FF5722')('STEP 6: CREATING A WALLET'));
    console.log(chalk.hex('#FF5722')('*'.repeat(80)));
    console.log(
      chalk.grey(
        `CLI command: gridlock create-wallet -e ${USER_EMAIL} -p ${USER_PASSWORD} -b ${BLOCKCHAIN}`
      )
    );
    console.log('Creating a new wallet:');
    console.log(`- Blockchain: ${BLOCKCHAIN}`);

    await waitForKeyPress('Press ENTER to create wallet...', chalk.hex('#E91E63'));

    // Declare wallet address variable outside the try block so it can be used in later steps
    let walletAddress: string | undefined;

    try {
      const wallet = await gridlock.createWallet({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        blockchain: BLOCKCHAIN,
      });

      walletAddress = wallet?.address;
      console.log('\n✅ Wallet created successfully!');
      console.log('- Wallet Address:', walletAddress);
      console.log('- Blockchain:', wallet?.blockchain);
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      throw error;
    }

    // **************************************************************************************
    // STEP 7: SIGNING A MESSAGE
    // **************************************************************************************
    console.log(chalk.hex('#FFC107')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#FFC107')('STEP 7: SIGNING A MESSAGE'));
    console.log(chalk.hex('#FFC107')('*'.repeat(80)));

    const message = 'This is a message to be signed';
    console.log(
      chalk.grey(
        `CLI command: gridlock sign -e ${USER_EMAIL} -p ${USER_PASSWORD} -a ${walletAddress} -m "${message}"`
      )
    );
    console.log('Signing the following message:');
    console.log(`"${message}"`);

    await waitForKeyPress('Press ENTER to sign message...', chalk.hex('#FF5722'));

    try {
      // Use the wallet address from step 5 instead of creating a new wallet
      if (!walletAddress) {
        throw new Error('Wallet address not available. Wallet creation may have failed.');
      }

      const signature = await gridlock.signTransaction({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        address: walletAddress,
        message,
      });

      console.log('\n✅ Message signed successfully!');
      console.log('- Signature:', signature.signature.substring(0, 20) + '...');
      console.log('- Wallet Address Used:', walletAddress);

      // **************************************************************************************
      // STEP 8: VERIFYING THE SIGNATURE
      // **************************************************************************************
      console.log(chalk.hex('#607D8B')('\n' + '*'.repeat(80)));
      console.log(chalk.hex('#607D8B')('STEP 8: VERIFYING THE SIGNATURE'));
      console.log(chalk.hex('#607D8B')('*'.repeat(80)));
      console.log(
        chalk.grey(
          `CLI command: gridlock verify -e ${USER_EMAIL} -p ${USER_PASSWORD} -m "${message}" -a ${walletAddress} -s ${signature.signature}`
        )
      );
      console.log('Verifying signature for message:');
      console.log(`"${message}"`);

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
    // STEP 9: SIMULATING NEW DEVICE
    // **************************************************************************************
    console.log(chalk.hex('#00BCD4')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#00BCD4')('STEP 9: SIMULATING NEW DEVICE'));
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
    // STEP 10: ACCOUNT RECOVERY
    // **************************************************************************************
    console.log(chalk.hex('#3F51B5')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#3F51B5')('STEP 10: ACCOUNT RECOVERY'));
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

      // Wait for user to input the verification code
      const recoveryBundle = await getUserInput(
        '\nPlease check your email and enter the verification code: '
      );

      // **************************************************************************************
      // STEP 11: CONFIRM RECOVERY
      // **************************************************************************************
      console.log(chalk.hex('#673AB7')('\n' + '*'.repeat(80)));
      console.log(chalk.hex('#673AB7')('STEP 11: CONFIRM RECOVERY'));
      console.log(chalk.hex('#673AB7')('*'.repeat(80)));
      console.log(
        chalk.grey(
          `CLI command: gridlock confirm-recovery -e ${USER_EMAIL} -p ${RECOVERY_PASSWORD} -r ${recoveryBundle}`
        )
      );
      console.log('Confirming recovery with verification code...');

      // Confirm recovery with the code
      console.log('\nConfirming recovery with provided code...');

      await gridlock.confirmRecovery({
        email: USER_EMAIL,
        password: RECOVERY_PASSWORD,
        recoveryBundle,
      });

      console.log('\n✅ Recovery confirmed successfully!');
      console.log('- Account has been recovered with the new password');
      console.log('- You can now access your wallet and guardians with the new credentials');

      // Wait for remote file system operations to complete
      console.log('\nWaiting for remote operations to complete...');
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // **************************************************************************************
      // STEP 12: TRANSFER OWNERSHIP
      // **************************************************************************************
      console.log(chalk.hex('#8BC34A')('\n' + '*'.repeat(80)));
      console.log(chalk.hex('#8BC34A')('STEP 12: TRANSFER OWNERSHIP'));
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
      // STEP 13: POST RECOVERY SIGNING
      // **************************************************************************************
      console.log(chalk.hex('#CDDC39')('\n' + '*'.repeat(80)));
      console.log(chalk.hex('#CDDC39')('STEP 13: POST RECOVERY SIGNING'));
      console.log(chalk.hex('#CDDC39')('*'.repeat(80)));

      const recoveryTestMessage = 'This message confirms successful account recovery';
      console.log(
        chalk.grey(
          `CLI command: gridlock sign -e ${USER_EMAIL} -p ${RECOVERY_PASSWORD} -a ${walletAddress} -m "${recoveryTestMessage}"`
        )
      );
      console.log('Confirming successful recovery by signing a message with new credentials:');
      console.log(`- Test Message: "${recoveryTestMessage}"`);
      console.log(`- Using Email: ${USER_EMAIL}`);
      console.log(`- Using New Password: ${RECOVERY_PASSWORD}`);

      await waitForKeyPress(
        'Press ENTER to verify recovery by signing a message...',
        chalk.hex('#8BC34A')
      );

      // Check if wallet address is available
      if (!walletAddress) {
        throw new Error('Wallet address not available. Cannot verify recovery success.');
      }

      console.log('\nSigning message with recovered account...');

      // Sign message with new credentials
      const recoverySignature = await gridlock.signTransaction({
        email: USER_EMAIL,
        password: RECOVERY_PASSWORD,
        address: walletAddress,
        message: recoveryTestMessage,
      });

      console.log('\n✅ Message signed successfully with new credentials!');
      console.log('- Signature:', recoverySignature.signature.substring(0, 20) + '...');
      console.log('- Wallet Address Used:', walletAddress);

      // **************************************************************************************
      // STEP 14: POST RECOVERY VERIFICATION
      // **************************************************************************************
      console.log(chalk.hex('#795548')('\n' + '*'.repeat(80)));
      console.log(chalk.hex('#795548')('STEP 14: POST RECOVERY VERIFICATION'));
      console.log(chalk.hex('#795548')('*'.repeat(80)));
      console.log(
        chalk.grey(
          `CLI command: gridlock verify -e ${USER_EMAIL} -p ${RECOVERY_PASSWORD} -m "${recoveryTestMessage}" -a ${walletAddress} -s ${recoverySignature.signature}`
        )
      );
      console.log('Verifying signature with recovered account...');

      const isRecoveryVerified = await gridlock.verifySignature({
        email: USER_EMAIL,
        password: RECOVERY_PASSWORD,
        message: recoveryTestMessage,
        address: walletAddress,
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
