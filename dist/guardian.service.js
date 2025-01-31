import ora from 'ora';
import { loadGuardians, saveGuardian } from './storage.service.js';
import { showAvailableGuardians } from './network.service.js';
import { gridlock } from './gridlock.js';
import inquirer from 'inquirer';
export const addGuardianInquire = async (options) => {
    let { email, password, guardianType, isOwnerGuardian, name, nodeId, publicKey } = options;
    if (!email || !password) {
        const answers = await inquirer.prompt([
            { type: 'input', name: 'email', message: 'User email:' },
            { type: 'password', name: 'password', message: 'User password:' },
        ]);
        email = answers.email;
        password = answers.password;
    }
    if (!guardianType) {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'guardianType',
                message: 'Select the type of guardian to add:',
                choices: [
                    { name: 'Gridlock Guardian', value: 'gridlock' },
                    { name: 'Cloud Guardian', value: 'cloud' },
                ],
            },
        ]);
        guardianType = answers.guardianType;
    }
    if (guardianType === 'gridlock') {
        await addGridlockGuardian();
    }
    else if (guardianType === 'cloud') {
        if (!name || !nodeId || !publicKey) {
            const answers = await inquirer.prompt([
                { type: 'input', name: 'name', message: 'Guardian name:' },
                { type: 'input', name: 'nodeId', message: 'Node ID:' },
                { type: 'input', name: 'publicKey', message: 'Guardian public key:' },
                {
                    type: 'confirm',
                    name: 'isOwnerGuardian',
                    message: 'Is this the owner guardian?',
                    default: false,
                },
            ]);
            name = answers.name;
            nodeId = answers.nodeId;
            publicKey = answers.publicKey;
            isOwnerGuardian = answers.isOwnerGuardian;
        }
        const guardianData = {
            name: name,
            nodeId: nodeId,
            publicKey: publicKey,
            type: 'cloudGuardian',
            active: true,
        };
        const addGuardianParams = {
            email: email,
            password: password,
            guardian: guardianData,
            isOwnerGuardian: isOwnerGuardian,
        };
        // @ts-ignore - the use of inquirer ensures that variables cannot be null
        await addCloudGuardian(addGuardianParams);
    }
    else {
        console.error('Invalid guardian type. Please specify "gridlock" or "cloud".');
    }
};
async function addGridlockGuardian() {
    const spinner = ora('Retrieving Gridlock guardian...').start();
    const gridlockGuardians = await gridlock.getGridlockGuardians();
    if (!gridlockGuardians) {
        spinner.fail('Failed to retrieve Gridlock guardians');
        return;
    }
    const existingGuardians = loadGuardians();
    const existingGuardianIds = existingGuardians.map((g) => g.nodeId);
    const newGuardian = Array.isArray(gridlockGuardians)
        ? gridlockGuardians.find((g) => !existingGuardianIds.includes(g.nodeId))
        : null;
    if (!newGuardian) {
        spinner.fail('No new Gridlock guardian available to add');
        return;
    }
    saveGuardian({ guardian: newGuardian });
    spinner.succeed('Gridlock guardian retrieved and saved successfully');
    await showAvailableGuardians();
}
async function addCloudGuardian({ email, password, guardian, isOwnerGuardian, }) {
    const spinner = ora('Adding guardian...').start();
    try {
        const response = await gridlock.addGuardian({ email, password, guardian, isOwnerGuardian });
        spinner.succeed('Guardian assigned successfully');
    }
    catch {
        spinner.fail(`Failed to assign guardian`);
    }
}
//# sourceMappingURL=guardian.service.js.map