"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, Field, Input, PasswordInput, Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const wasAuthenticatedOnMount = useRef(isAuthenticated);
  const hasJustLoggedIn = useRef(false);

  useEffect(() => {
    if (hasJustLoggedIn.current) return;
    if (isAuthenticated && wasAuthenticatedOnMount.current) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    if (result.success) {
      hasJustLoggedIn.current = true;
      toast.success("เข้าสู่ระบบสำเร็จ!");
      router.push("/");
    } else {
      toast.error(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-brand">
            <LogIn className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-semibold text-fg">เข้าสู่ระบบ</h1>
          <p className="mt-1 text-sm text-fg-muted">
            ยินดีต้อนรับกลับมา กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <PasswordInput
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <Button type="submit" variant="primary" disabled={isLoading} className="mt-2 w-full">
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>

        {/* Demo accounts (run POST /api/seed to create them) */}
        <div className="mt-6 rounded-lg border border-line bg-bg-deep p-3">
          <p className="mb-2 text-center text-xs font-medium text-fg-subtle">
            บัญชีทดสอบ (โหมดสาธิต) — คลิกเพื่อกรอกอัตโนมัติ
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@keyboardth.com");
                setPassword("Admin123!");
              }}
              className="flex items-center gap-2 rounded-md bg-surface-raised px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
            >
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span className="font-medium text-fg">Admin</span>
              <span className="ml-auto font-mono text-xs text-fg-subtle">
                admin@keyboardth.com · Admin123!
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("user@keyboardth.com");
                setPassword("User1234!");
              }}
              className="flex items-center gap-2 rounded-md bg-surface-raised px-3 py-2 text-left text-sm transition-colors hover:bg-white/5"
            >
              <User className="h-4 w-4 text-fg-muted" />
              <span className="font-medium text-fg">User</span>
              <span className="ml-auto font-mono text-xs text-fg-subtle">
                user@keyboardth.com · User1234!
              </span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-fg-muted">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-medium text-brand hover:text-brand-hover">
            สมัครสมาชิก
          </Link>
        </p>
      </Card>
    </div>
  );
}
