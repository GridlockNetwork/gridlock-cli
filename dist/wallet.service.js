import ora from 'ora';
import { getEmailandPassword } from './auth.service.js';
import { gridlock } from './gridlock.js';
import inquirer from 'inquirer';
import { SUPPORTED_COINS } from 'gridlock-sdk';
import chalk from 'chalk';
export const createWalletInquire = async (options) => {
    let { email, password, blockchain } = options;
    if (!email || !password || !blockchain) {
        const credentials = await getEmailandPassword();
        email = credentials.email;
        password = credentials.password;
        const answers = await inquirer.prompt([
            { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
        ]);
        blockchain = answers.blockchain;
    }
    await createWallet({
        email: email,
        password: password,
        blockchain: blockchain,
    });
};
export const signTransactionInquire = async (options) => {
    let { email, password, address, message } = options;
    if (!email || !password || !address || !message) {
        const credentials = await getEmailandPassword();
        email = credentials.email;
        password = credentials.password;
        const answers = await inquirer.prompt([
            { type: 'input', name: 'address', message: 'Select address:' },
            { type: 'input', name: 'message', message: 'Message to be signed:' },
        ]);
        address = answers.address;
        message = answers.message;
    }
    await signTransaction({
        email: email,
        password: password,
        address: address,
        message: message,
    });
};
export const verifySignatureInquire = async (options) => {
    let { email, password, message, address, blockchain, signature } = options;
    if (!email || !password || !message || !address || !blockchain || !signature) {
        const credentials = await getEmailandPassword();
        email = credentials.email;
        password = credentials.password;
        const answers = await inquirer.prompt([
            { type: 'input', name: 'message', message: 'Message to be verified:' },
            { type: 'input', name: 'address', message: 'Address:' },
            { type: 'list', name: 'blockchain', message: 'Select blockchain:', choices: SUPPORTED_COINS },
            { type: 'input', name: 'signature', message: 'Signature:' },
        ]);
        message = answers.message;
        address = answers.address;
        blockchain = answers.blockchain;
        signature = answers.signature;
    }
    await verifySignature({
        email: email,
        password: password,
        message: message,
        address: address,
        blockchain: blockchain,
        signature: signature,
    });
};
async function createWallet({ email, password, blockchain, }) {
    const spinner = ora('Creating wallet...').start();
    try {
        const wallet = await gridlock.createWallet(email, password, blockchain);
        const properChainTitle = blockchain.charAt(0).toUpperCase() + blockchain.slice(1);
        spinner.succeed(`➕ Created ${properChainTitle} wallet:\nWallet address: ${chalk
            .hex('#4A90E2')
            .bold(wallet.address)}`);
    }
    catch {
        spinner.fail(`Failed to create wallet`);
    }
}
async function signTransaction({ email, password, address, message, }) {
    const spinner = ora('Signing transaction...').start();
    try {
        const response = await gridlock.signTransaction({
            email: email,
            password: password,
            address: address,
            message: message,
        });
        const signature = response.signature;
        spinner.succeed(`Transaction signed successfully:\nSignature: ${chalk.hex('#4A90E2').bold(signature)}`);
    }
    catch {
        spinner.fail(`Failed to sign transaction`);
    }
}
async function verifySignature({ email, password, message, address, blockchain, signature, }) {
    const spinner = ora('Verifying signature...').start();
    try {
        const response = await gridlock.verifySignature({
            email,
            password,
            message,
            address,
            blockchain,
            signature,
        });
        if ((response.verified = true)) {
            spinner.succeed(`Signature verified successfully:\nResponse: ${chalk
                .hex('#4A90E2')
                .bold(response.verified)}`);
        }
        else {
            spinner.fail(`Failed to verify signature`);
        }
    }
    catch {
        spinner.fail(`Failed to verify signature`);
    }
}
//# sourceMappingURL=wallet.service.js.map