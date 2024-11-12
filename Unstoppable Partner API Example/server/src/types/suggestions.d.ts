export interface Suggestions {
    "@type": string;
    items:   DomainSuggestion[];
    error?:  object; // Added for error handling, not part of the official API response.
}

export interface DomainSuggestion {
    "@type": SuggestionType;
    name:    string;
    price:   SuggestionPrice;
}

export enum SuggestionType {
    UnstoppabledomainsCOMPartnerV3DomainSuggestion = "unstoppabledomains.com/partner.v3.DomainSuggestion",
}

export interface SuggestionPrice {
    type:      SuggestionTypeEnum;
    listPrice: SuggestionListPrice;
    subTotal:  SuggestionListPrice;
}

export interface SuggestionListPrice {
    usdCents: number;
}

export enum SuggestionTypeEnum {
    Standard = "STANDARD",
}
