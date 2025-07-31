'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: { email: string; name: string; password: string; super_key: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ✅ SECURE: Store auth state in memory only
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // ✅ SECURE: Keep access token in sessionStorage (cleared when browser closes)
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  const router = useRouter();

  // Helper functions for token storage
  const storeToken = (token: string) => {
    setAccessToken(token);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('access_token', token);
    }
  };

  const getStoredToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('access_token');
    }
    return null;
  };

  const removeToken = () => {
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('access_token');
    }
  };

  // ✅ SECURE: API request helper 
  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Add access token to headers if available
    const token = accessToken || getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData uploads
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${apiUrl}${url}`, {
      ...options,
      headers: headers as Record<string, string>,
    });

    // ✅ SECURE: Handle 401 by logging out user
    if (response.status === 401 && !url.includes('/logout') && !url.includes('/login')) {
      await logout();
      return new Response(JSON.stringify({ error: 'Session expired' }), { status: 401 });
    }

    return response;
  };

  // ✅ SECURE: Initialize API service with our secure apiRequest
  useEffect(() => {
    apiService.setAuthApiRequest(apiRequest);
  }, [accessToken]); // Re-initialize when token changes

  // ✅ SECURE: Verify access token
  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.valid && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
          storeToken(token);
          return true;
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }

    // Token is invalid
    removeToken();
    setUser(null);
    setIsAuthenticated(false);
    return false;
  };

  // ✅ SECURE: Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        // ✅ SECURE: Store access token
        storeToken(data.access_token);
        setUser(data.user);
        setIsAuthenticated(true);
        
        // console.log('Login successful, redirecting to homepage...');
        
        // Use a small delay to ensure state updates are processed
        setTimeout(() => {
          router.push('/');
        }, 100);
        
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SECURE: Logout function
  const logout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = accessToken || getStoredToken();
      if (token) {
        await fetch(`${apiUrl}/api/auth/logout`, { 
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ✅ SECURE: Clear all auth state
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
      // console.log('User logged out, redirecting to login page');
      router.push('/login');
    }
  };

  // ✅ SECURE: Register function
  const register = async (data: { email: string; name: string; password: string; super_key: string }) => {
    try {
      setIsLoading(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Raw env var:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Final apiUrl:', apiUrl);
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.access_token) {
        storeToken(result.access_token);
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder functions
  const updateProfile = async (updates: { name?: string }) => {
    // Implementation would go here
    return { success: false, error: 'Not implemented' };
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    // Implementation would go here
    return { success: false, error: 'Not implemented' };
  };

  // ✅ RESTORE SESSION: Check for existing token on app start
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        const storedToken = getStoredToken();
        if (storedToken) {
          // console.log('Found stored token, verifying...');
          const isValid = await verifyToken(storedToken);
          if (isValid) {
            // console.log('Token is valid, user logged in');
          } else {
            // console.log('Stored token is invalid, clearing...');
          }
        } else {
          // console.log('No stored token found - user needs to login');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const contextValue = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
} 