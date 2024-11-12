export interface Transfers {
    items: Transfer[];
}

export interface Transfer {
    "@type":   string;
    operation: Operation;
    error?:    object; // Added for error handling, not part of the official API response.
}

export interface Operation {
    "@type":              string;
    id:                   string;
    type:                 string;
    status:               string;
    domain:               string;
    lastUpdatedTimestamp: number;
    dependencies:         TransferDependency[];
    error?:               object; // Added for error handling, not part of the official API response.
}

export interface TransferDependency {
    "@type":    string;
    id:         string;
    status:     string;
    type:       string;
    parameters: TransferParameters;
}

export interface TransferParameters {
    fromAddress:  string;
    toAddress:    string;
    resetRecords: boolean;
}
