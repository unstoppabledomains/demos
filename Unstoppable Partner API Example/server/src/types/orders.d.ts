export interface Orders {
    items: Order[];
}

export interface Order {
    "@type":   string;
    operation: Operation;
    error?:     object; // Added for error handling, not part of the official API response.
    payment?:   boolean; // Added for checkout logic, not part of the official API response.
    walletAddress?: string; // Added for checkout logic, not part of the official API response.
}

export interface Operation {
    "@type":              string;
    id:                   string;
    type:                 string;
    status:               string;
    domain:               string;
    lastUpdatedTimestamp: number;
    dependencies:         OrderDependency[];
    error?:               object; // Added for error handling, not part of the official API response.
}

export interface OrderDependency {
    "@type":    string;
    id:         string;
    status:     string;
    type:       string;
    parameters: Parameters;
}

export interface Parameters {
    toAddress:      string;
    initialRecords: InitialRecords;
}

export type InitialRecords = object;
