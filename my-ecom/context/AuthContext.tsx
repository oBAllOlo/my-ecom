"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users storage (simulating database)
interface StoredUser extends User {
  password: string;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error loading user:", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Get stored users from localStorage
  const getStoredUsers = (): StoredUser[] => {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
  };

  // Save users to localStorage
  const saveUsers = (users: StoredUser[]) => {
    localStorage.setItem("users", JSON.stringify(users));
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = getStoredUsers();
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!foundUser) {
      return { success: false, error: "ไม่พบบัญชีผู้ใช้นี้" };
    }

    if (foundUser.password !== password) {
      return { success: false, error: "รหัสผ่านไม่ถูกต้อง" };
    }

    // Remove password before storing in state
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = getStoredUsers();

    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" };
    }

    // Validate password
    if (password.length < 6) {
      return { success: false, error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
    }

    // Create new user
    const newUser: StoredUser = {
      _id: Date.now().toString(),
      name,
      email,
      password,
    };

    // Save to "database"
    users.push(newUser);
    saveUsers(users);

    // Auto login after register
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
