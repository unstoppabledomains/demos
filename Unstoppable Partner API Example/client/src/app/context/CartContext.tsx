"use client";
import { DomainSuggestion } from '@/types/suggestions';
import { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import { CartItem } from '@/types/cart';

/**
 * @typedef {Object} CartContextType - Defines the context type for the cart.
 * @property {CartItem[]} cart - Array of items in the cart.
 * @property {(item: DomainSuggestion) => void} addToCart - Function to add a domain suggestion to the cart.
 * @property {(name: string) => void} removeFromCart - Function to remove a domain by name from the cart.
 * @property {(name: string, operationId: string) => void} updateCartItemOperation - Updates the operation ID of a cart item.
 * @property {(name: string, availability: boolean) => void} updateCartItemAvailability - Updates availability status of a cart item.
 * @property {() => void} clearCart - Clears all items from the cart.
 */

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: DomainSuggestion) => void;
  removeFromCart: (name: string) => void;
  updateCartItemOperation: (name: string, operationId: string) => void;
  updateCartItemAvailability: (name: string, availability: boolean) => void;
  clearCart: () => void;
}

/** Context to manage cart state throughout the application */
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CartProvider component to wrap children and provide cart context.
 *
 * @param {Object} props - Props passed to the provider component.
 * @param {ReactNode} props.children - The components that will consume cart context.
 * @returns {JSX.Element} Context provider with cart functionalities.
 */
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useLocalStorage<CartItem[]>('CART_STORAGE', []);

  /**
   * Adds a new item to the cart if it doesn't already exist.
   * @param {DomainSuggestion} item - The domain suggestion to add.
   */
  const addToCart = (item: DomainSuggestion) => {
    const newItem = { suggestion: item, available: true, operationId: '' };
    const newCart = cart.some(cartItem => cartItem.suggestion.name === newItem.suggestion.name)
    ? cart
    : [...cart, newItem];
    setCart(newCart);
  };

  /**
   * Removes an item from the cart by its domain name.
   * @param {string} name - The name of the domain to remove.
   */
  const removeFromCart = (name: string) => {
    setCart(cart.filter((item: CartItem) => item.suggestion.name !== name));
  };

  /**
   * Updates the operation ID for a specific cart item.
   * @param {string} name - Name of the cart item to update.
   * @param {string} operationId - The new operation ID to set.
   */
  const updateCartItemOperation = (name: string, operationId: string) => {
    const updatedCart = cart.map((item) => 
      item.suggestion.name === name ? { ...item, operationId } : item
    );
    setCart(updatedCart);
  };

  /**
   * Updates the availability status of a specific cart item.
   * @param {string} name - Name of the cart item to update.
   * @param {boolean} available - Availability status to set.
   */
  const updateCartItemAvailability = (name: string, available: boolean) => {
    const updatedCart = cart.map((item) => 
      item.suggestion.name === name ? { ...item, available } : item
    );
    setCart(updatedCart);
  };

  /** Clears all items from the cart. */
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateCartItemOperation, updateCartItemAvailability, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

/**
 * Custom hook to use the CartContext.
 * Throws an error if used outside of CartProvider.
 * @returns {CartContextType} The cart context value.
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
