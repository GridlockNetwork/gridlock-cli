import ora from 'ora';
import { loadGuardians, saveGuardian, saveUser } from './storage.service.js';
import { login } from './auth.service.js';
import { showAvailableGuardians } from './network.service.js';
import { gridlock } from '../gridlock.js';

export async function getGridlockGuardian() {
  const spinner = ora('Retrieving Gridlock guardians...').start();
  const response = await gridlock.getGridlockGuardian();
  if (!response.success) {
    spinner.fail('Failed to retrieve Gridlock guardians');
    console.error(`Error: ${response.error.message} (Code: ${response.error.code})`);
    return null;
  }
  const guardians = response.data;
  spinner.succeed('Gridlock guardians retrieved successfully');
  return guardians;
}

export async function addGridlockGuardian() {
  const spinner = ora('Retrieving Gridlock guardian...').start();
  const gridlockGuardians = await getGridlockGuardian();
  if (!gridlockGuardians) {
    spinner.fail('Failed to retrieve Gridlock guardians');
    return;
  }

  const existingGuardians = loadGuardians();
  const existingGuardianIds = existingGuardians.map((g) => g.nodeId);

  const newGuardian = gridlockGuardians.find((g) => !existingGuardianIds.includes(g.nodeId));
  if (!newGuardian) {
    spinner.fail('No new Gridlock guardian available to add');
    return;
  }

  saveGuardian({ guardian: newGuardian });
  spinner.succeed('Gridlock guardian retrieved and saved successfully');
  await showAvailableGuardians();
}

export async function addCloudGuardian({
  email,
  password,
  name,
  nodeId,
  publicKey,
  isOwnerGuardian,
}) {
  const spinner = ora('Adding guardian...').start();

  const guardian = {
    name,
    type: 'cloudGuardian',
    nodeId,
    publicKey,
    active: true,
  };

  saveGuardian({ guardian });

  const authTokens = await login({ email, password });
  if (!authTokens) {
    spinner.fail('Login failed.');
    return;
  }

  const response = await gridlock.addGuardian(guardian, !!isOwnerGuardian);
  if (response.success) {
    saveUser({ user: response.data });
    spinner.succeed('Guardian assigned successfully');
  } else {
    spinner.fail('Failed to assign guardian.');
    console.error('Failed to assign guardian:', response.error);
  }
}
