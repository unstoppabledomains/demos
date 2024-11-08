export interface Orders {
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
    dependencies:         OrderDependency[];
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

export interface InitialRecords {
}
