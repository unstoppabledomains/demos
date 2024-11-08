// contexts/CartContext.tsx
"use client";
import { DomainSuggestion } from '@/types/suggestions';
import { createContext, useContext, useState, ReactNode } from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import { Domain } from 'domain';

interface CartContextType {
  cart: DomainSuggestion[];
  addToCart: (item: DomainSuggestion) => void;
  removeFromCart: (name: String) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useLocalStorage<DomainSuggestion[]>('CART_STORAGE', []);

  const addToCart = (item: DomainSuggestion) => {
    const newCart = cart.some(cartItem => cartItem.name === item.name)
    ? cart
    : [...cart, item];
    setCart(newCart);
  };

  const removeFromCart = (name: String) => {
    setCart(cart.filter((item: DomainSuggestion) => item.name !== name));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
