"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "เกิดข้อผิดพลาด");
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
          {error && <div className="auth-error">⚠️ {error}</div>}

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

        <div className="auth-divider">
          <span>หรือ</span>
        </div>

        <div className="auth-social">
          <button className="social-btn google">
            <span>G</span>
            เข้าสู่ระบบด้วย Google
          </button>
          <button className="social-btn facebook">
            <span>f</span>
            เข้าสู่ระบบด้วย Facebook
          </button>
        </div>

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
