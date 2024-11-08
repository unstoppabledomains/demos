export interface Returns {
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
    dependencies:         Dependency[];
}

export interface Dependency {
    "@type": string;
    id:      string;
    status:  string;
    type:    string;
}
