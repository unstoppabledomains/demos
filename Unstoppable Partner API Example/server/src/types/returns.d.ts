export interface Returns {
    items: Return[];
}

export interface Return {
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
    dependencies:         Dependency[];
    error?:               object; // Added for error handling, not part of the official API response.
}

export interface Dependency {
    "@type": string;
    id:      string;
    status:  string;
    type:    string;
}
