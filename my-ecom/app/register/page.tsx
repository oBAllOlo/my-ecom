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
  const [showPasswordHint, setShowPasswordHint] = useState(false);

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

    // Validate password strength
    if (password.length < 6) {
      toast.error("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error("รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว");
      return;
    }

    if (!/[a-z]/.test(password)) {
      toast.error("รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว");
      return;
    }

    if (!/[0-9]/.test(password)) {
      toast.error("รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast.error("รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว เช่น !@#$%^&*");
      return;
    }

    // Validate name
    if (name.trim().length < 2) {
      toast.error("ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร");
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
    // ใช้ toast.id เพื่อป้องกันการแสดง toast ซ้ำ
    toast.info("🚧 ฟีเจอร์นี้กำลังพัฒนา - เร็วๆ นี้!", {
      id: "register-social-feature",
    });
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

          <div className="form-group" style={{ position: "relative" }}>
            <label className="form-label">รหัสผ่าน</label>
            <input
              type="password"
              className="form-input"
              placeholder="สร้างรหัสผ่านที่ปลอดภัย"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordHint(true)}
              onBlur={() => setShowPasswordHint(false)}
              required
              minLength={6}
            />
            {/* Password Requirements Popup */}
            {showPasswordHint && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "calc(100% + 1rem)",
                  width: "280px",
                  padding: "1rem",
                  background:
                    "linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)",
                  border: "1px solid rgba(28, 77, 141, 0.3)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
                  zIndex: 100,
                  fontSize: "0.8rem",
                }}
              >
                <p
                  style={{
                    margin: "0 0 0.75rem 0",
                    color: "#4988C4",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  📋 เงื่อนไขรหัสผ่าน:
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: password.length >= 6 ? "#4ade80" : "#94a3b8",
                    }}
                  >
                    <span>{password.length >= 6 ? "✅" : "⬜"}</span>
                    <span>อย่างน้อย 6 ตัวอักษร</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: /[A-Z]/.test(password) ? "#4ade80" : "#94a3b8",
                    }}
                  >
                    <span>{/[A-Z]/.test(password) ? "✅" : "⬜"}</span>
                    <span>ตัวพิมพ์ใหญ่ (A-Z)</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: /[a-z]/.test(password) ? "#4ade80" : "#94a3b8",
                    }}
                  >
                    <span>{/[a-z]/.test(password) ? "✅" : "⬜"}</span>
                    <span>ตัวพิมพ์เล็ก (a-z)</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: /[0-9]/.test(password) ? "#4ade80" : "#94a3b8",
                    }}
                  >
                    <span>{/[0-9]/.test(password) ? "✅" : "⬜"}</span>
                    <span>ตัวเลข (0-9)</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: /[!@#$%^&*(),.?":{}|<>]/.test(password)
                        ? "#4ade80"
                        : "#94a3b8",
                    }}
                  >
                    <span>
                      {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✅" : "⬜"}
                    </span>
                    <span>อักขระพิเศษ (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}
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
