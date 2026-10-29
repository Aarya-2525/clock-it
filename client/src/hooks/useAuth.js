import { createContext, useContext } from 'react';

// { user, status: 'loading' | 'ready', loggedOut, login, register, logout }
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);
