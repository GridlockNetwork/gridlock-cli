// test.ts
import { execSync } from 'child_process';
import chalk from 'chalk';
let walletAddress;
let signature;
let result;
function runCommand(command) {
    try {
        // Capture output as a string.
        const output = execSync(command, { encoding: 'utf-8' });
        return output.trim();
    }
    catch (error) {
        console.error(`Error executing command: ${command}`);
        console.error(error);
        process.exit(1);
    }
}
const email = '1@1.com';
const password = 'password';
const userName = 'Bertram Gilfoyle';
// Create user (assumes create-user is non-interactive when all options are provided)
console.log(runCommand(`node dist/gridlock.js create-user -n "${userName}" -e ${email} -p ${password}`));
console.log(chalk.hex('#800080')('User created'));
// Add guardians (assumed to be non-interactive when all options are provided)
console.log(runCommand(`node dist/gridlock.js add-guardian -e ${email} -p ${password} -t cloud -n ownerGuardian -i f08f4833-3ce1-4e0b-9de2-96cd969df434 -k s6VTHsJ5uqnFjrFVqerBjgGPcw5zZ2cVdKwj9XEyLUU -o true`));
console.log(chalk.hex('#800080')('Created first guardian'));
console.log(runCommand(`node dist/gridlock.js add-guardian -e ${email} -p ${password} -t cloud -n guardian1 -i 40ffd6a1-8191-4bc5-a1ba-ec300c8da1c6 -k 7l9XVjtAax40b7gfbBohR5IgU7D2Polnta/YI0FfplE= -o false`));
console.log(chalk.hex('#800080')('Created second guardian'));
console.log(runCommand(`node dist/gridlock.js add-guardian -e 1@1.com -p password -t gridlock`));
console.log(chalk.hex('#800080')('Created third guardian'));
// Create wallet (non-interactive mode: all required options supplied)
const walletOutput = runCommand(`node dist/gridlock.js create-wallet -e ${email} -p ${password} -b solana`);
walletAddress = walletOutput.split('\n').slice(-1)[0] || '';
console.log(chalk.hex('#800080')(`Wallet Address: ${walletAddress}`));
const message = 'hello';
const signatureOutput = runCommand(`node dist/gridlock.js sign -e ${email} -p ${password} -a ${walletAddress} -m ${message}`);
signature = signatureOutput.split('\n').slice(-1)[0] || '';
console.log(chalk.hex('#800080')(`Signature: ${signature}`));
const verifyResult = runCommand(`node dist/gridlock.js verify -e ${email} -p ${password} -a ${walletAddress} -m ${message} -b solana -s ${signature}`);
result = verifyResult.split('\n').slice(-1)[0] || '';
console.log(chalk.hex('#800080')(`Verify Result: ${result}`));
//# sourceMappingURL=test.js.map