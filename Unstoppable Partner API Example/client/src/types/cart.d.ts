import { DomainSuggestion } from "./suggestions";

export interface Cart {
    items: CartItem[];
}

export interface CartItem {
    suggestion: DomainSuggestion;
    operationId?: string;
    available?: boolean;
}