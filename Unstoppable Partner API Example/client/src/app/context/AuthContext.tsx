"use client";
import { createContext, useContext, ReactNode, useState } from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import UAuth from "@uauth/js";
import { verifyLogin } from '../api/verifyLogin';
import { Authorization } from '@/types/auth';

interface AuthContextType {
  auth: Authorization | null;
  authorizing: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const uauth = new UAuth({
    clientID: process.env.NEXT_PUBLIC_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
    scopes: process.env.NEXT_PUBLIC_SCOPES
  });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useLocalStorage<Authorization | null>('AUTH_STORAGE', null);
  const [authorizing, setAuthorizing] = useState(false);

  const login = async () => {
    try {
        setAuthorizing(true);
        const authorization = await uauth.loginWithPopup();
        const valid = await verifyLogin(authorization, process.env.NEXT_PUBLIC_CLIENT_ID!)
        if (valid) {
          authorization ? setAuth(authorization) : setAuth(null);
        }
    } catch (error) {
        setAuth(null);
        console.log("Error logging in: " + error);
    } finally {
      setAuthorizing(false);
    }
  };

  const logout = async() => {
    await uauth.logout();
    setAuth(null)
  };

  return (
    <AuthContext.Provider value={{ auth, authorizing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
