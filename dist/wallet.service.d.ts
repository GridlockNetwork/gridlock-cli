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
interface CreateWalletParams {
    email: string;
    password: string;
    blockchain: string;
}
interface signTransactionParams {
    email: string;
    password: string;
    address: string;
    message: string;
}
export declare function createWallet({ email, password, blockchain }: CreateWalletParams): Promise<void>;
export declare function signTransaction({ email, password, address, message, }: signTransactionParams): Promise<void>;
export {};
