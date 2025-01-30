import ora from 'ora';
import { loadUser, saveWallet, loadWallet } from './storage.service.js';
import { login } from './auth.service.js';
import { gridlock } from './gridlock.js';
import { generatePasswordBundle } from './key.service.js';
export async function createWallet({ email, password, blockchain }) {
    const user = loadUser({ email });
    if (!user) {
        console.error('User not found');
        return;
    }
    const token = await login({ email, password });
    if (!token) {
        return;
    }
    const spinner = ora('Creating wallet...').start();
    const passwordBundle = await generatePasswordBundle({ user, password });
    const createWalletData = {
        user,
        blockchain,
        passwordBundle,
    };
    const response = await gridlock.createWallet(createWalletData);
    if (!response.success) {
        spinner.fail(`Failed to create wallet\nError: ${response.error.message} (Code: ${response.error.code})${response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''}`);
        return;
    }
    spinner.succeed('Wallet created successfully');
    const wallet = response.data;
    console.log(`  ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1).toLowerCase()} - ${wallet.address}`);
    saveWallet({ wallet });
}
export async function signTransaction({ email, password, address, message, }) {
    const user = loadUser({ email });
    if (!user) {
        console.error('User not found');
        return;
    }
    const spinner = ora('Signing transaction...').start();
    const token = await login({ email, password });
    if (!token) {
        return;
    }
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
    const response = await gridlock.sign(signTransactionData);
    if (!response.success) {
        spinner.fail(`Failed to sign transaction\nError: ${response.error.message} (Code: ${response.error.code})${response.raw ? `\nRaw response: ${JSON.stringify(response.raw)}` : ''}`);
        return;
    }
    spinner.succeed('Transaction signed successfully');
    const { signature } = response.data;
    console.log(`Signature: ${response.data}`);
}
//# sourceMappingURL=wallet.service.js.map