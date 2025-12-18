"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    // Validate name
    if (name.trim().length < 2) {
      setError("กรุณากรอกชื่อที่ถูกต้อง");
      return;
    }

    setIsLoading(true);

    const result = await register(name, email, password);

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
          <span className="auth-icon">✨</span>
          <h1 className="auth-title">สมัครสมาชิก</h1>
          <p className="auth-subtitle">
            สร้างบัญชีใหม่เพื่อเริ่มช้อปปิ้งกับเรา
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">⚠️ {error}</div>}

          <div className="form-group">
            <label className="form-label">ชื่อ-นามสกุล</label>
            <input
              type="text"
              className="form-input"
              placeholder="ชื่อของคุณ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="อย่างน้อย 6 ตัวอักษร"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">ยืนยันรหัสผ่าน</label>
            <input
              type="password"
              className="form-input"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-terms">
            <label>
              <input type="checkbox" required />
              <span>
                ฉันยอมรับ <a href="#">เงื่อนไขการใช้งาน</a> และ{" "}
                <a href="#">นโยบายความเป็นส่วนตัว</a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isLoading}
          >
            {isLoading ? "⏳ กำลังสมัครสมาชิก..." : "🎉 สมัครสมาชิก"}
          </button>
        </form>

        <div className="auth-divider">
          <span>หรือ</span>
        </div>

        <div className="auth-social">
          <button className="social-btn google">
            <span>G</span>
            สมัครด้วย Google
          </button>
          <button className="social-btn facebook">
            <span>f</span>
            สมัครด้วย Facebook
          </button>
        </div>

        <p className="auth-footer">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="auth-link">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}
