export interface Domains {
    "@type": string;
    items:   Domain[];
}

export interface Domain {
    name:         string;
    "@type":      Type;
    owner:        Owner;
    availability: Availability;
    blockchain?:  string;
}

export enum Type {
    UnstoppabledomainsCOMPartnerV3Domain = "unstoppabledomains.com/partner.v3.Domain",
}

export interface Availability {
    status: Status;
    price?: Price;
}

export interface Price {
    type:      PriceType;
    listPrice: ListPrice;
    subTotal:  ListPrice;
}

export interface ListPrice {
    usdCents: number;
}

export enum PriceType {
    Standard = "STANDARD",
}

export enum Status {
    Available = "AVAILABLE",
    Disallowed = "DISALLOWED",
    Protected = "PROTECTED",
    Registered = "REGISTERED",
}

export interface Owner {
    type:     OwnerType;
    address?: string;
}

export enum OwnerType {
    External = "EXTERNAL",
    None = "NONE",
    Self = "SELF",
}
