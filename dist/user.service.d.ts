export declare const createUserInquire: (options: {
    name?: string;
    email?: string;
    password?: string;
}) => Promise<void>;
export declare const recoverInquire: ({ email, password, }: {
    email?: string;
    password?: string;
}) => Promise<any>;
export declare const recover: ({ email, password, }: {
    email: string;
    password: string;
}) => Promise<any>;
