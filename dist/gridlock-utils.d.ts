import GridlockSdk from 'gridlock-sdk';
export declare const gridlock: GridlockSdk;
export declare function allGuardians(): void;
export declare function e2eProcessing({ privateKey, message, senderPubKey, }: {
    privateKey: string;
    message: string;
    senderPubKey: string;
}): Promise<string | null>;
