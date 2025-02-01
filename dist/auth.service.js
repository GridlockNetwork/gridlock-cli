import inquirer from 'inquirer';
export const getEmailandPassword = async () => {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'User email:' },
        { type: 'password', name: 'password', message: 'User password:' },
    ]);
    return answers;
};
//# sourceMappingURL=auth.service.js.map