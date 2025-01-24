interface CreateWalletParams {
    email: string;
    password: string;
    blockchain: string;
}
interface SignTransactionParams {
    email: string;
    password: string;
    blockchain: string;
    message: string;
}
export declare function createWallet({ email, password, blockchain }: CreateWalletParams): Promise<void>;
export declare function signTransaction({ email, password, blockchain, message, }: SignTransactionParams): Promise<void>;
export {};
