"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

export default function VerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { verifyOTP, isAuthenticated } = useAuth();
    const { showToast } = useToast();

    const email = searchParams.get("email") || "";
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only keep last digit
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
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
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        // Focus last filled input or last input
        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            showToast("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก", "error");
            return;
        }

        setIsLoading(true);
        const result = await verifyOTP(email, otpCode);

        if (result.success) {
            showToast("ยืนยันอีเมลสำเร็จ!", "success");
            router.push("/");
        } else {
            showToast(result.error || "เกิดข้อผิดพลาด", "error");
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
                showToast("📧 ส่งรหัส OTP ใหม่แล้ว!", "success");
                setCountdown(60);
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            } else {
                showToast(data.error || "ไม่สามารถส่ง OTP ได้", "error");
            }
        } catch {
            showToast("เกิดข้อผิดพลาดในการส่ง OTP", "error");
        }

        setIsResending(false);
    };

    if (!email) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-header">
                        <span className="auth-icon">⚠️</span>
                        <h1 className="auth-title">ไม่พบข้อมูล</h1>
                        <p className="auth-subtitle">
                            กรุณาสมัครสมาชิกใหม่อีกครั้ง
                        </p>
                    </div>
                    <Link href="/register" className="btn btn-primary auth-submit">
                        ไปหน้าสมัครสมาชิก
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <span className="auth-icon">📧</span>
                    <h1 className="auth-title">ยืนยันอีเมล</h1>
                    <p className="auth-subtitle">
                        เราได้ส่งรหัส OTP 6 หลักไปที่<br />
                        <strong>{email}</strong>
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>

                    <div className="otp-input-container">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="otp-input"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "⏳ กำลังตรวจสอบ..." : "✅ ยืนยัน OTP"}
                    </button>
                </form>

                <p className="auth-footer" style={{ marginTop: "24px" }}>
                    ไม่ได้รับรหัส?{" "}
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={countdown > 0 || isResending}
                        className="auth-link resend-btn"
                    >
                        {isResending
                            ? "กำลังส่ง..."
                            : countdown > 0
                                ? `ส่งใหม่ได้ใน ${countdown} วินาที`
                                : "ส่งรหัสใหม่"}
                    </button>
                </p>
            </div>
        </div>
    );
}
