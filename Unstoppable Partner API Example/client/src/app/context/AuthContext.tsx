"use client";
import { createContext, useContext, ReactNode, useState } from 'react';
import useLocalStorage from '../utils/useLocalStorage';
import UAuth from "@uauth/js";
import { verifyLogin } from '../api/verifyLogin';
import { Authorization } from '@/types/auth';

/**
 * @typedef {Object} AuthContextType - Defines the context type for authentication.
 * @property {Authorization | null} auth - The current authentication details.
 * @property {boolean} authorizing - Indicates if authentication is in progress.
 * @property {() => void} login - Initiates the login process.
 * @property {() => void} logout - Logs the user out.
 */

interface AuthContextType {
  auth: Authorization | null;
  authorizing: boolean;
  login: () => void;
  logout: () => void;
}

/** Context to manage authentication state throughout the application */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// UAuth instance for managing user authentication
const uauth = new UAuth({
    clientID: process.env.NEXT_PUBLIC_CLIENT_ID,
    redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
    scopes: process.env.NEXT_PUBLIC_SCOPES
  });

/**
 * AuthProvider component to wrap children and provide authentication context.
 *
 * @param {Object} props - Props passed to the provider component.
 * @param {ReactNode} props.children - The components that will consume auth context.
 * @returns {JSX.Element} Context provider with authentication functionalities.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useLocalStorage<Authorization | null>('AUTH_STORAGE', null);
  const [authorizing, setAuthorizing] = useState(false);

  /**
   * Initiates the login process with Unstoppable Domains.
   * Sets auth state on successful verification.
   */
  const login = async () => {
    try {
        setAuthorizing(true);
        const authorization = await uauth.loginWithPopup();
        console.log(authorization)
        const verification = await verifyLogin(authorization, process.env.NEXT_PUBLIC_CLIENT_ID!)
        console.log(verification)
        if (verification?.valid) {
          authorization ? setAuth(authorization) : setAuth(null);
          
        }
    } catch (error) {
        setAuth(null);
        console.log("Error logging in: " + error);
    } finally {
      setAuthorizing(false);
    }
  };

  /**
   * Logs the user out and clears the auth state.
   */
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

/**
 * Custom hook to use the AuthContext.
 * Throws an error if used outside of AuthProvider.
 * @returns {AuthContextType} The auth context value.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
