"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, Button, Spinner } from "@/components/ui";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOTP, isAuthenticated } = useAuth();

  const email = searchParams.get("email") || "";
  const devOtp = searchParams.get("devOtp") || "";
  // DEMO MODE: email is mocked, so prefill the OTP passed from registration.
  const [otp, setOtp] = useState<string[]>(() =>
    /^\d{6}$/.test(devOtp) ? devOtp.split("") : ["", "", "", "", "", ""]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (/^\d{6}$/.test(devOtp)) {
      toast.info(`โหมดสาธิต: กรอกรหัส OTP ให้อัตโนมัติแล้ว (${devOtp})`);
    }
  }, [devOtp]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("กรุณากรอกรหัส OTP ให้ครบถ้วน");
      return;
    }
    setIsLoading(true);
    const result = await verifyOTP(email, otpCode);
    if (result.success) {
      toast.success("ยืนยันอีเมลเรียบร้อย");
      router.push("/");
    } else {
      toast.error(result.error || "เกิดข้อผิดพลาดในการยืนยัน OTP");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setCountdown(60);
        if (data.devOtp && /^\d{6}$/.test(data.devOtp)) {
          setOtp(data.devOtp.split(""));
          toast.info(`โหมดสาธิต: รหัส OTP ใหม่คือ ${data.devOtp}`);
        } else {
          toast.success("ส่งรหัส OTP ใหม่แล้ว!");
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }
      } else {
        toast.error(data.error || "ไม่สามารถส่ง OTP ได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการส่ง OTP");
    }
    setIsResending(false);
  };

  if (!email) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-xl font-semibold text-fg">ไม่พบข้อมูล</h1>
          <p className="mt-1 text-sm text-fg-muted">กรุณาสมัครสมาชิกใหม่อีกครั้ง</p>
          <Link href="/register" className="mt-6 inline-block">
            <Button variant="primary">ไปหน้าสมัครสมาชิก</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-brand">
            <MailCheck className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-semibold text-fg">ยืนยันอีเมล</h1>
          <p className="mt-1 text-sm text-fg-muted">
            เราได้ส่งรหัส OTP 6 หลักไปที่
            <br />
            <strong className="text-fg">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

          <Button type="submit" variant="primary" disabled={isLoading} className="w-full">
            {isLoading ? "กำลังตรวจสอบ..." : "ยืนยัน OTP"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-fg-muted">
          ไม่ได้รับรหัส?{" "}
          <button
            type="button"
            onClick={handleResendOTP}
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
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
