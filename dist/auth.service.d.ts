interface E2EEncryptionParams {
    recieverPrivKeyIdentifier: string;
    password: string;
    message: string;
    senderPubKey: string;
}
export declare function decryptmessage({ recieverPrivKeyIdentifier, password, message, senderPubKey, }: E2EEncryptionParams): Promise<string | null>;
export {};
