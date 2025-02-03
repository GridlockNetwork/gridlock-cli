import { program } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import GridlockSdk from 'gridlock-sdk';
import nacl from 'tweetnacl';
import { API_KEY, BASE_URL, DEBUG_MODE } from './constants.js';
import { loadGuardians } from './storage.service.js';
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
    const guardians = loadGuardians();
    spinner.succeed('Network status retrieved successfully');
    console.log(chalk.bold('\n🌐 Guardians in the Network:'));
    console.log('-----------------------------------');
    const guardianGroups = guardians.reduce((acc, guardian) => {
        acc[guardian.type] = acc[guardian.type] || [];
        acc[guardian.type].push(guardian);
        return acc;
    }, {});
    const localGuardians = guardianGroups['localGuardian'] || [];
    const socialGuardians = guardianGroups['socialGuardian'] || [];
    const cloudGuardians = guardianGroups['cloudGuardian'] || [];
    const gridlockGuardians = guardianGroups['gridlockGuardian'] || [];
    const partnerGuardians = guardianGroups['partnerGuardian'] || [];
    const printGuardians = (title, guardians) => {
        console.log(chalk.bold(`\n${title}:`));
        guardians.forEach((guardian, index) => {
            console.log(`       ${chalk.bold('Name:')} ${guardian.name}`);
            console.log(`       ${chalk.bold('Type:')} ${Object.keys(guardianTypeMap).find((key) => guardianTypeMap[key] === guardian.type)}`);
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
export async function e2eProcessing({ recieverPrivKeyIdentifier, password, message, senderPubKey, }) {
    const privateKey = recieverPrivKeyIdentifier;
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
    .command('test')
    .description('Test the encryptContents function')
    .option('-i, --email <email>', 'User email')
    .option('-p, --password <password>', 'User password')
    .option('-m, --message <message>', 'Content to decrypt')
    .option('-s, --sender <sender>', 'Public key of the target node')
    .action(async (options) => {
    if (options.message && options.email && options.password && options.sender) {
        const encrypted = await e2eProcessing({
            recieverPrivKeyIdentifier: options.email,
            password: options.password,
            message: options.message,
            senderPubKey: options.sender,
        });
        // console.log('Encrypted content:', encrypted);
    }
    else {
        console.log('Please provide content, email, password, and target public key using the respective options.');
    }
});
program
    .command('login')
    .description('Login with email and password')
    .option('-e, --email <email>', 'User email')
    .option('-p, --password <password>', 'User password')
    .action(async (options) => {
    if (options.email && options.password) {
        try {
            const response = await gridlock.login(options.email, options.password);
            console.log('Login successful:', response);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Login failed:', error.message);
            }
            else {
                console.error('Login failed:', error);
            }
        }
    }
    else {
        console.log('Please provide both email and password using the respective options.');
    }
});
program.parseAsync(process.argv);
//# sourceMappingURL=gridlock-utils.js.map