"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  // const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      toast.info("🚧 ฟีเจอร์นี้กำลังพัฒนา - เร็วๆ นี้!");
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success("เข้าสู่ระบบสำเร็จ!");
      router.push("/");
    } else {
      toast.error(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-icon">👤</span>
          <h1 className="auth-title">เข้าสู่ระบบ</h1>
          <p className="auth-subtitle">
            ยินดีต้อนรับกลับมา! กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">อีเมล</label>
            <input
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">รหัสผ่าน</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>จดจำฉัน</span>
            </label>
            <a href="#" className="forgot-password">
              ลืมรหัสผ่าน?
            </a>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isLoading}
          >
            {isLoading ? "⏳ กำลังเข้าสู่ระบบ..." : "🔐 เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="auth-footer">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="auth-link">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}
