export interface Transfers {
    "@type":   string;
    operation: Operation;
}

export interface Operation {
    "@type":              string;
    id:                   string;
    type:                 string;
    status:               string;
    domain:               string;
    lastUpdatedTimestamp: number;
    dependencies:         TransferDependency[];
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
