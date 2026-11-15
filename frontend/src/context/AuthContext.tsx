import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<void>;
  register: (username: string, email: string, password?: string, displayName?: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  switchDemoUser: (username: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initialize user session
    const user = api.getCurrentMockUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const login = async (username: string, _password?: string) => {
    setIsLoading(true);
    try {
      const user = api.switchMockUser(username);
      api.setToken(`mock_jwt_token_${user.id}`);
      setCurrentUser({ ...user });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, _password?: string, displayName?: string) => {
    setIsLoading(true);
    try {
      const newUser: User = {
        id: `u_${Date.now()}`,
        username: username.toLowerCase().trim(),
        displayName: displayName || username,
        email,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        isPrivate: false,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      // Register in api mock store
      (api as any).users[newUser.username] = newUser;
      api.switchMockUser(newUser.username);
      api.setToken(`mock_jwt_token_${newUser.id}`);
      setCurrentUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.setToken(null);
    setCurrentUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = await api.updateProfile(data);
    setCurrentUser({ ...updated });
  };

  const switchDemoUser = (username: string) => {
    const user = api.switchMockUser(username);
    setCurrentUser({ ...user });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
