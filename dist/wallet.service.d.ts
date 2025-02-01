export declare const createWalletInquire: (options: {
    email?: string;
    password?: string;
    blockchain?: string;
}) => Promise<void>;
export declare const signTransactionInquire: (options: {
    email?: string;
    password?: string;
    address?: string;
    message?: string;
}) => Promise<void>;
export declare const verifySignatureInquire: (options: {
    email?: string;
    password?: string;
    message?: string;
    address?: string;
    blockchain?: string;
    signature?: string;
}) => Promise<void>;
