"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@/lib/types";

interface RegisterResult {
  success: boolean;
  error?: string;
  requireVerification?: boolean;
  email?: string;
}

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
    password: string,
    phoneNumber?: string
  ) => Promise<RegisterResult>;
  verifyOTP: (
    email: string,
    otp: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error loading user:", e);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error };
      }

      setUser(data.data);
      localStorage.setItem("currentUser", JSON.stringify(data.data));

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phoneNumber?: string
  ): Promise<RegisterResult> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phoneNumber }),
      });

      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error };
      }

      // Registration now requires verification, don't auto-login
      return {
        success: true,
        requireVerification: data.requireVerification,
        email: data.email,
      };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" };
    }
  };

  const verifyOTP = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error };
      }

      // Auto-login after verification
      setUser(data.data);
      localStorage.setItem("currentUser", JSON.stringify(data.data));

      return { success: true };
    } catch (error) {
      console.error("Verify OTP error:", error);
      return { success: false, error: "เกิดข้อผิดพลาดในการยืนยัน OTP" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    toast.success("ออกจากระบบสำเร็จ!");
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        verifyOTP,
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
