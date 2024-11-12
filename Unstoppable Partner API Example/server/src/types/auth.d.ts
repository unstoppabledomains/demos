export interface Verify { 
    valid: boolean; 
    error: string; 
    details: any; 
}

export interface Authorization {
    accessToken: string;
    expiresAt: number;
    idToken: IdToken;
    scope: string;
    resource?: string;
}

export interface AddressClaim {
    formatted: string;
    street_address: string;
    locality: string;
    region: string;
    postal_code: string;
    country: string;
}

export declare type WalletType = 'web3' | 'walletconnect' | 'coinbase-wallet';

export interface WalletClaims {
    wallet_address: string;
    wallet_type_hint: WalletType;
    eip4361_message: string;
    eip4361_signature: string;
}

export interface EmailClaims {
    email: string;
    email_verified: boolean;
}

export interface PhoneClaims {
    phone_number: string;
    phone_number_verified: boolean;
}

export interface AddressClaims {
    address: AddressClaim;
}

export interface ProfileClaims {
    name: string;
    given_name: string;
    family_name: string;
    middle_name: string;
    nickname: string;
    preferred_username: string;
    profile: string;
    picture: string;
    website: string;
    gender: string;
    birthdate: string;
    zoneinfo: string;
    locale: string;
    updated_at: string;
}

export interface HumanityCheckClaims {
    humanity_check_id: string;
}

export interface UserInfo extends Partial<WalletClaims>, Partial<EmailClaims>, Partial<AddressClaims>, Partial<PhoneClaims>, Partial<ProfileClaims>, Partial<HumanityCheckClaims> {
    sub: string;
    upgrade?: UpgradeInfo;
}

export interface JWTClaims {
    iss: string;
    aud: string;
    exp: number;
    nbf: number;
    iat: number;
    jti: string;
    azp: string;
    nonce: string;
    auth_time: string;
    at_hash: string;
    c_hash: string;
    acr: string;
    sub_jwk: string;
    cnf: string;
    sid: string;
    org_id: string;
}

export interface IdToken extends UserInfo, Partial<JWTClaims> {
    __raw: string;
    [key: string]: any;
}