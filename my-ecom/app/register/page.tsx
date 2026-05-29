"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Check, Circle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, Field, Input, Button, cn } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordHint, setShowPasswordHint] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  const rules = [
    { label: "อย่างน้อย 6 ตัวอักษร", ok: password.length >= 6 },
    { label: "ตัวพิมพ์ใหญ่ (A-Z)", ok: /[A-Z]/.test(password) },
    { label: "ตัวพิมพ์เล็ก (a-z)", ok: /[a-z]/.test(password) },
    { label: "ตัวเลข (0-9)", ok: /[0-9]/.test(password) },
    { label: "อักขระพิเศษ (!@#$%^&*)", ok: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (!rules.every((r) => r.ok)) {
      toast.error("รหัสผ่านไม่ตรงตามเงื่อนไข");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร");
      return;
    }

    setIsLoading(true);
    const result = await register(name, email, password, phoneNumber || undefined);
    if (result.success) {
      toast.success("สมัครสมาชิกสำเร็จ! กรุณายืนยัน OTP");
      if (result.requireVerification && result.email) {
        const devOtpParam = result.devOtp
          ? `&devOtp=${encodeURIComponent(result.devOtp)}`
          : "";
        router.push(`/verify?email=${encodeURIComponent(result.email)}${devOtpParam}`);
      } else {
        router.push("/");
      }
    } else {
      toast.error(result.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-brand">
            <UserPlus className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-semibold text-fg">สมัครสมาชิก</h1>
          <p className="mt-1 text-sm text-fg-muted">
            สร้างบัญชีใหม่เพื่อเริ่มช้อปปิ้งกับเรา
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="ชื่อ-นามสกุล">
            <Input
              placeholder="ชื่อของคุณ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field label="อีเมล">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="รหัสผ่าน">
            <Input
              type="password"
              placeholder="สร้างรหัสผ่านที่ปลอดภัย"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setShowPasswordHint(true)}
              required
              minLength={6}
            />
            {showPasswordHint && (
              <div className="mt-2 rounded-md border border-line bg-bg-deep p-3">
                <p className="mb-2 text-xs font-medium text-fg-muted">เงื่อนไขรหัสผ่าน</p>
                <div className="flex flex-col gap-1.5">
                  {rules.map((rule) => (
                    <div
                      key={rule.label}
                      className={cn(
                        "flex items-center gap-2 text-xs",
                        rule.ok ? "text-success" : "text-fg-subtle"
                      )}
                    >
                      {rule.ok ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Field>
          <Field label="ยืนยันรหัสผ่าน">
            <Input
              type="password"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Field>

          <label className="flex items-start gap-2 text-sm text-fg-muted">
            <input type="checkbox" required className="mt-0.5 accent-brand" />
            <span>
              ฉันยอมรับ <span className="text-brand">เงื่อนไขการใช้งาน</span> และ{" "}
              <span className="text-brand">นโยบายความเป็นส่วนตัว</span>
            </span>
          </label>

          <Button type="submit" variant="primary" disabled={isLoading} className="mt-1 w-full">
            {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-fg-muted">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="font-medium text-brand hover:text-brand-hover">
            เข้าสู่ระบบ
          </Link>
        </p>
      </Card>
    </div>
  );
}
