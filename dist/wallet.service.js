import ora from 'ora';
import { loadUser, saveWallet, loadWallet } from './storage.service.js';
import { gridlock } from './gridlock.js';
import inquirer from 'inquirer';
import { SUPPORTED_COINS } from 'gridlock-sdk';
export const createWalletInquire = async (options) => {
    let { email, password, blockchain } = options;
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
    await createWallet({
        email: email,
        password: password,
        blockchain: blockchain,
    });
};
export const signTransactionInquire = async (options) => {
    let { email, password, address, message } = options;
    if (!email || !password || !address || !message) {
        const answers = await inquirer.prompt([
            { type: 'input', name: 'email', message: 'User email:' },
            { type: 'password', name: 'password', message: 'Network access password:' },
            { type: 'list', name: 'address', message: 'Select address:' },
            { type: 'input', name: 'message', message: 'Message to be signed:' },
        ]);
        email = answers.email;
        password = answers.password;
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
export async function createWallet({ email, password, blockchain }) {
    const spinner = ora('Creating wallet...').start();
    try {
        const response = await gridlock.createWallet(email, password, blockchain);
        if (response.ok) {
            const wallet = response.data;
            console.log(`  ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1).toLowerCase()} - ${wallet.address}`);
            saveWallet({ wallet });
            spinner.succeed('Wallet created successfully');
        }
        else {
            throw new Error('Unexpected response format');
        }
    }
    catch {
        spinner.fail(`Failed to create wallet`);
    }
}
export async function signTransaction({ email, password, address, message, }) {
    const user = loadUser({ email });
    if (!user) {
        console.error('User not found');
        return;
    }
    const spinner = ora('Signing transaction...').start();
    // const token = await login({ email, password });
    // if (!token) {
    //   return;
    // }
    const wallet = loadWallet({ address });
    if (!wallet) {
        console.error('Wallet not found');
        return;
    }
    console.log(message);
    const signTransactionData = {
        user,
        wallet,
        message,
    };
    try {
        const response = await gridlock.sign(signTransactionData);
        spinner.succeed('Transaction signed successfully');
        const { signature } = response.data;
        console.log(`Signature: ${signature}`);
    }
    catch {
        spinner.fail(`Failed to sign transaction`);
    }
}
//# sourceMappingURL=wallet.service.js.map