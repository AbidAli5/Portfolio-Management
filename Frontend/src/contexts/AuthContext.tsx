import {createContext, useContext, useState, useEffect, type ReactNode} from "react";
import {type User, type LoginCredentials, type RegisterData} from "@/types/auth.types";
import * as authService from "@/services/auth.service";
import {useLocalStorage} from "@/hooks/useLocalStorage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
  // Initialize from localStorage synchronously
  const getInitialUser = (): User | null => {
    if (typeof window === "undefined") return null;
    try {
      const userStr = localStorage.getItem("user");
      const tokenStr = localStorage.getItem("token");
      if (userStr && tokenStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error("Error reading user from localStorage:", error);
    }
    return null;
  };

  const [storedUser, setStoredUser] = useLocalStorage<User | null>("user", null);
  const [token, setToken] = useLocalStorage<string | null>("token", null);
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [loading, setLoading] = useState(true);

  // Initialize and sync user state from localStorage on mount
  useEffect(() => {
    // Read directly from localStorage to ensure we have the latest values
    const initialUser = getInitialUser();
    const initialToken = localStorage.getItem("token");

    if (initialUser && initialToken) {
      setUser(initialUser);
    } else {
      setUser(null);
    }

    // Set loading to false after initialization
    setLoading(false);
  }, []); // Only run once on mount

  // Sync user state when storedUser or token changes (e.g., after login/logout)
  useEffect(() => {
    if (storedUser && token) {
      setUser(storedUser);
    } else {
      setUser(null);
    }
  }, [storedUser, token]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);

      // Extract data from response
      const authData = response.data?.data;
      if (!authData) {
        throw new Error("Invalid response from server");
      }

      const {user, token, refreshToken} = authData;

      if (!user || !token) {
        throw new Error("Missing user or token in response");
      }

      // Update state - useLocalStorage will handle saving to localStorage
      setStoredUser(user);
      setToken(token);
      setUser(user);

      // Store refresh token directly (it's not using useLocalStorage)
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Verify data was saved
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");

      if (!savedUser || !savedToken) {
        console.error("Failed to save authentication data to localStorage");
        throw new Error("Failed to save authentication data");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);

      // Extract data from response
      const authData = response.data?.data;
      if (!authData) {
        throw new Error("Invalid response from server");
      }

      const {user, token, refreshToken} = authData;

      if (!user || !token) {
        throw new Error("Missing user or token in response");
      }

      // Update state - useLocalStorage will handle saving to localStorage
      setStoredUser(user);
      setToken(token);
      setUser(user);

      // Store refresh token directly (it's not using useLocalStorage)
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Verify data was saved
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");

      if (!savedUser || !savedToken) {
        console.error("Failed to save authentication data to localStorage");
        throw new Error("Failed to save authentication data");
      }
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setStoredUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setStoredUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
