"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  // const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    // Validate name
    if (name.trim().length < 2) {
      toast.error("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setIsLoading(true);

    const result = await register(
      name,
      email,
      password,
      phoneNumber || undefined
    );

    if (result.success) {
      toast.success(
        "สมัครสมาชิกสำเร็จ! กรุณายืนยัน OTP ที่ส่งไปยังอีเมลของคุณ"
      );
      if (result.requireVerification && result.email) {
        router.push(`/verify?email=${encodeURIComponent(result.email)}`);
      } else {
        router.push("/");
      }
    } else {
      toast.error(result.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }

    setIsLoading(false);
  };

  const handleSocialClick = () => {
    toast.info("🚧 ฟีเจอร์นี้กำลังพัฒนา - เร็วๆ นี้!");
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
