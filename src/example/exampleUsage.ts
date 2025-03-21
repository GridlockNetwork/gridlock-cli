import gridlock from './initGridlock.js';
import { config } from './initGridlock.js';
import { IGuardian } from 'gridlock-sdk/types';
import chalk from 'chalk';
import readline from 'readline';

// Process command line arguments
// Check if --help or -h flag is provided
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(chalk.green('Gridlock SDK Example Usage'));
  console.log(chalk.cyan('='.repeat(40)));
  console.log('Options:');
  console.log('  --interactive, -i  Run the example in interactive mode (pause between steps)');
  console.log('  --help, -h         Show this help information');
  console.log('\nExample:');
  console.log('  node dist/example/exampleUsage.js             # Run in automatic mode (default)');
  console.log('  node dist/example/exampleUsage.js --interactive  # Run in interactive mode');
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

// Function to wait for user to press any key to continue
const waitForKeyPress = async (
  message: string = 'Press any key to continue to the next step...'
): Promise<void> => {
  // If autoRun is enabled, don't wait for keypress
  if (config.autoRun) {
    console.log('\n' + chalk.blue('[AUTO] Proceeding to next step automatically...'));
    return;
  }

  return new Promise((resolve) => {
    console.log('\n' + chalk.yellow(message));
    process.stdin.once('data', () => {
      resolve();
    });
  });
};

// Function to get user input
const getUserInput = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
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

    // **************************************************************************************
    // STEP 1: CREATING A NEW USER
    // **************************************************************************************
    console.log(chalk.green('\n' + '*'.repeat(80)));
    console.log(chalk.green('STEP 1: CREATING A NEW USER'));
    console.log(chalk.green('*'.repeat(80)));
    console.log('Creating user with the following details:');
    console.log(`- Name: ${USER_NAME}`);
    console.log(`- Email: ${USER_EMAIL}`);
    console.log(`- Password: ${USER_PASSWORD}`);

    await waitForKeyPress('Press any key to create user...');

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
      if (await shouldContinueAfterError()) {
        console.log('Continuing to next step despite error...');
      } else {
        throw error;
      }
    }

    // **************************************************************************************
    // STEP 2: ADDING A CLOUD GUARDIAN
    // **************************************************************************************
    await waitForKeyPress();

    console.log(chalk.cyan('\n' + '*'.repeat(80)));
    console.log(chalk.cyan('STEP 2: ADDING A CLOUD GUARDIAN'));
    console.log(chalk.cyan('*'.repeat(80)));
    console.log('Preparing Cloud Guardian data:');

    // Use the guardian data defined at the top of the file
    const guardianData = CLOUD_GUARDIAN;

    console.log('- Guardian Name:', guardianData.name);
    console.log('- Node ID:', guardianData.nodeId);
    console.log('- Type:', guardianData.type);
    console.log('- Is Owner Guardian: Yes');

    await waitForKeyPress('Press any key to add cloud guardian...');

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
      if (await shouldContinueAfterError()) {
        console.log('Continuing to next step despite error...');
      } else {
        throw error;
      }
    }

    // **************************************************************************************
    // STEP 3: ADDING A GRIDLOCK GUARDIAN
    // **************************************************************************************
    await waitForKeyPress();

    console.log(chalk.magenta('\n' + '*'.repeat(80)));
    console.log(chalk.magenta('STEP 3: ADDING A GRIDLOCK GUARDIAN'));
    console.log(chalk.magenta('*'.repeat(80)));
    console.log('Adding a professional Gridlock Guardian:');
    console.log('- Type: gridlock');

    await waitForKeyPress('Press any key to add gridlock guardian...');

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
      if (await shouldContinueAfterError()) {
        console.log('Continuing to next step despite error...');
      } else {
        throw error;
      }
    }

    // **************************************************************************************
    // STEP 4: ADDING A PARTNER GUARDIAN
    // **************************************************************************************
    await waitForKeyPress();

    console.log(chalk.yellow('\n' + '*'.repeat(80)));
    console.log(chalk.yellow('STEP 4: ADDING A PARTNER GUARDIAN'));
    console.log(chalk.yellow('*'.repeat(80)));
    console.log('Adding a professional Partner Guardian:');
    console.log('- Type: partner');

    await waitForKeyPress('Press any key to add partner guardian...');

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
      if (await shouldContinueAfterError()) {
        console.log('Continuing to next step despite error...');
      } else {
        throw error;
      }
    }

    // **************************************************************************************
    // STEP 5: CREATING A WALLET
    // **************************************************************************************
    await waitForKeyPress();

    console.log(chalk.red('\n' + '*'.repeat(80)));
    console.log(chalk.red('STEP 5: CREATING A WALLET'));
    console.log(chalk.red('*'.repeat(80)));
    console.log('Creating a new wallet:');
    console.log(`- Blockchain: ${BLOCKCHAIN}`);

    await waitForKeyPress('Press any key to create wallet...');

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
      if (await shouldContinueAfterError()) {
        console.log('Continuing to next step despite error...');
      } else {
        throw error;
      }
    }

    // **************************************************************************************
    // STEP 6: SIGNING A MESSAGE
    // **************************************************************************************
    await waitForKeyPress();

    console.log(chalk.blue('\n' + '*'.repeat(80)));
    console.log(chalk.blue('STEP 6: SIGNING A MESSAGE'));
    console.log(chalk.blue('*'.repeat(80)));

    const message = 'This is a message to be signed';
    console.log('Signing the following message:');
    console.log(`"${message}"`);

    await waitForKeyPress('Press any key to sign message...');

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
      // STEP 7: VERIFYING THE SIGNATURE
      // **************************************************************************************
      await waitForKeyPress();

      console.log(chalk.green('\n' + '*'.repeat(80)));
      console.log(chalk.green('STEP 7: VERIFYING THE SIGNATURE'));
      console.log(chalk.green('*'.repeat(80)));
      console.log('Verifying signature for message:');
      console.log(`"${message}"`);

      await waitForKeyPress('Press any key to verify signature...');

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
      if (await shouldContinueAfterError()) {
        console.log('Continuing to next step despite error...');
      } else {
        throw error;
      }
    }

    // **************************************************************************************
    // STEP 8: ACCOUNT RECOVERY
    // **************************************************************************************
    await waitForKeyPress();

    console.log(chalk.hex('#FF8C00')('\n' + '*'.repeat(80)));
    console.log(chalk.hex('#FF8C00')('STEP 8: ACCOUNT RECOVERY'));
    console.log(chalk.hex('#FF8C00')('*'.repeat(80)));
    console.log('Demonstrating account recovery process:');
    console.log(`- Email: ${USER_EMAIL}`);
    console.log(`- New Password: ${RECOVERY_PASSWORD}`);

    await waitForKeyPress('Press any key to start recovery process...');

    try {
      console.log('\nInitiating account recovery...');

      await gridlock.startRecovery({
        email: USER_EMAIL,
        password: RECOVERY_PASSWORD,
      });

      console.log('\n✅ Recovery initiated successfully!');
      console.log(`- A verification code has been sent to ${USER_EMAIL}`);

      // Wait for user to input the verification code
      const encryptedRecoveryEmail = await getUserInput(
        '\nPlease check your email and enter the verification code: '
      );

      // Confirm recovery with the code
      console.log('\nConfirming recovery with provided code...');

      await gridlock.confirmRecovery({
        email: USER_EMAIL,
        password: RECOVERY_PASSWORD,
        encryptedRecoveryEmail,
      });

      console.log('\n✅ Recovery confirmed successfully!');
      console.log('- Account has been recovered with the new password');
      console.log('- You can now access your wallet and guardians with the new credentials');

      // **************************************************************************************
      // STEP 9: VERIFY RECOVERY SUCCESS
      // **************************************************************************************
      await waitForKeyPress();

      // Only proceed to Step 9 if Step 8 was successful
      console.log(chalk.hex('#9932CC')('\n' + '*'.repeat(80)));
      console.log(chalk.hex('#9932CC')('STEP 9: VERIFY RECOVERY SUCCESS'));
      console.log(chalk.hex('#9932CC')('*'.repeat(80)));
      console.log(
        'Confirming successful recovery by signing and verifying a message with new credentials:'
      );

      const recoveryTestMessage = 'This message confirms successful account recovery';
      console.log(`- Test Message: "${recoveryTestMessage}"`);
      console.log(`- Using Email: ${USER_EMAIL}`);
      console.log(`- Using New Password: ${RECOVERY_PASSWORD}`); //this is an example program, so we're showing the password here

      await waitForKeyPress('Press any key to verify recovery by signing a message...');

      // Check if wallet address is available
      if (!walletAddress) {
        throw new Error('Wallet address not available. Cannot verify recovery success.');
      }

      console.log('\nSigning message with recovered account...');
      await new Promise((resolve) => setTimeout(resolve, 3000)); //delay to ensure fs operations are complete on signing node

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

      // Verify signature with new credentials
      console.log('\nVerifying signature with recovered account...');

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
      } else {
        console.log('\n⚠️ Recovery verification failed. Please check your credentials.');
      }

      console.log('\nStep 9 (Verify Recovery Success) completed.');
    } catch (error) {
      console.error('❌ Error during recovery process:', error);
      console.log('\nRecovery example could not be completed due to an error.');
    }

    console.log('\n' + '='.repeat(80));
    console.log('EXAMPLE COMPLETED');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('\n❌ Example terminated due to an error:', error);
  } finally {
    // Close readline interface after all steps are complete
    rl.close();
    // Need to explicitly exit as stdin is kept open by the keypress listener
    process.exit(0);
  }
}

// Function to ask if user wants to continue after an error
async function shouldContinueAfterError(): Promise<boolean> {
  // Even in auto mode, do not continue after errors
  if (config.autoRun) {
    console.log(chalk.red('[AUTO] Error detected - stopping execution.'));
    console.log(
      chalk.yellow('To run despite errors, use interactive mode with --interactive flag.')
    );
    return false;
  }

  const answer = await getUserInput(
    'Would you like to continue to the next step despite the error? (y/n): '
  );
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

// Script initialization
console.log('Starting Gridlock SDK example...');
if (config.autoRun) {
  console.log(chalk.blue('[AUTO] Running in automatic mode - no user input required'));
} else {
  console.log(chalk.yellow('[INTERACTIVE] This example will proceed step by step with your input'));
}
runExample();
