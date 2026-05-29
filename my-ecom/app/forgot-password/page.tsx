"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, Field, Input, PasswordInput, Button } from "@/components/ui";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const requestOtp = async () => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.json();
  };

  const applyDevOtp = (data: { devOtp?: string }, isResend = false) => {
    if (data.devOtp && /^\d{6}$/.test(data.devOtp)) {
      setOtp(data.devOtp.split(""));
      toast.info(`โหมดสาธิต: รหัส OTP${isResend ? "ใหม่" : ""}คือ ${data.devOtp}`, {
        id: "demo-otp",
      });
    } else {
      toast.success(isResend ? "ส่งรหัส OTP ใหม่แล้ว!" : "ส่งรหัส OTP ไปที่อีเมลแล้ว");
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const data = await requestOtp();
    if (data.success) {
      setStep(2);
      setCountdown(60);
      applyDevOtp(data);
    } else {
      toast.error(data.error || "เกิดข้อผิดพลาด");
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    const data = await requestOtp();
    if (data.success) {
      setCountdown(60);
      applyDevOtp(data, true);
    } else {
      toast.error(data.error || "ไม่สามารถส่ง OTP ได้");
    }
    setIsResending(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("กรุณากรอกรหัส OTP ให้ครบถ้วน");
      return;
    }
    if (password.length < 6) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setIsLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otpCode, newPassword: password }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("รีเซ็ตรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
      router.push("/login");
    } else {
      toast.error(data.error || "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    setIsLoading(false);
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i];
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-brand">
            <KeyRound className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-semibold text-fg">
            {step === 1 ? "ลืมรหัสผ่าน" : "ตั้งรหัสผ่านใหม่"}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {step === 1 ? (
              "กรอกอีเมลของคุณ เราจะส่งรหัส OTP ไปให้เพื่อรีเซ็ตรหัสผ่าน"
            ) : (
              <>
                กรอกรหัส OTP 6 หลักที่ส่งไปที่
                <br />
                <strong className="text-fg">{email}</strong> พร้อมตั้งรหัสผ่านใหม่
              </>
            )}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequest} className="flex flex-col gap-4">
            <Field label="อีเมล">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" variant="primary" disabled={isLoading} className="mt-1 w-full">
              {isLoading ? "กำลังส่งรหัส..." : "ส่งรหัส OTP"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  autoFocus={index === 0}
                  className="h-12 w-11 rounded-md border border-line bg-bg-deep text-center text-lg font-semibold text-fg focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              ))}
            </div>

            <Field label="รหัสผ่านใหม่">
              <PasswordInput
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </Field>
            <Field label="ยืนยันรหัสผ่านใหม่">
              <PasswordInput
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Field>

            <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
              {isLoading ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
            </Button>

            <p className="text-center text-sm text-fg-muted">
              ไม่ได้รับรหัส?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                className="font-medium text-brand hover:text-brand-hover disabled:text-fg-subtle"
              >
                {isResending
                  ? "กำลังส่ง..."
                  : countdown > 0
                  ? `ส่งใหม่ได้ใน ${countdown} วินาที`
                  : "ส่งรหัสใหม่"}
              </button>
            </p>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </Card>
    </div>
  );
}
