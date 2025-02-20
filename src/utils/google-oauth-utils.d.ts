import { OAuth2Client } from "google-auth-library";
export declare const createOAuthClient: () => OAuth2Client;
export declare const getAuthUrl: (state?: string) => string;
export declare const validateIdToken: (idToken: string) => Promise<import("google-auth-library").TokenPayload | undefined>;
export declare const getTokens: (code: string) => Promise<{
    tokens: import("google-auth-library").Credentials;
}>;
