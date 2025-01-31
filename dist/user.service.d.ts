export declare const createUserInquire: (options: {
    name?: string;
    email?: string;
    password?: string;
}) => Promise<void>;
interface CreateUserParams {
    name: string;
    email: string;
    password: string;
}
/**
 * Creates a new user with the provided name, email, and password.
 *
 * @param {Object} params - The parameters for creating a user.
 * @param {string} params.name - The name of the user.
 * @param {string} params.email - The email address of the user.
 * @param {string} params.password - The password for the user's account.
 * @returns {Promise<void>} A promise that resolves when the user is created.
 */
export declare const createUser: ({ name, email, password }: CreateUserParams) => Promise<void>;
export {};
