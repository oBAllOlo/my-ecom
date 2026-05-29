"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Package, type LucideIcon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Card, Spinner, buttonClasses } from "@/components/ui";

function StatusShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-10 text-center">{children}</Card>
    </div>
  );
}

function StatusIcon({
  icon: Icon,
  tone,
}: {
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <span className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${tone}`}>
      <Icon className="h-7 w-7" />
    </span>
  );
}

function CheckoutCompleteContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get("orderId");
  const initialStatus = useMemo<"loading" | "error">(
    () => (orderId ? "loading" : "error"),
    [orderId]
  );
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">(
    initialStatus
  );
  const [, setPaymentStatus] = useState<string>("");
  const hasCleared = useRef(false);
  const checkCount = useRef(0);

  useEffect(() => {
    if (!orderId) return;

    if (!hasCleared.current) {
      hasCleared.current = true;
      clearCart();
      localStorage.removeItem("cart");
    }

    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(`/api/payment/check-status?orderId=${orderId}`);
        const data = await res.json();
        if (isCancelled || !data.success) return;

        setPaymentStatus(data.data.paymentStatus);

        if (data.data.paymentStatus === "paid") {
          setStatus("success");
          return;
        }
        if (data.data.paymentStatus === "failed") {
          setStatus("error");
          return;
        }

        setStatus("pending");
        checkCount.current += 1;
        if (checkCount.current < 10) {
          timeoutId = setTimeout(checkPaymentStatus, 3000);
        }
      } catch (error) {
        console.error("Error checking payment:", error);
        if (!isCancelled) setStatus("pending");
      }
    };

    timeoutId = setTimeout(checkPaymentStatus, 1000);

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [clearCart, orderId]);

  const orderCode = orderId?.slice(-8).toUpperCase();

  if (status === "loading") {
    return (
      <StatusShell>
        <Spinner className="mx-auto mb-5 h-10 w-10" />
        <p className="text-fg-muted">กำลังตรวจสอบการชำระเงิน...</p>
      </StatusShell>
    );
  }

  if (status === "error") {
    return (
      <StatusShell>
        <StatusIcon icon={XCircle} tone="bg-danger/10 text-danger" />
        <h1 className="text-2xl font-semibold text-fg">เกิดข้อผิดพลาด</h1>
        <p className="mt-2 text-sm text-fg-muted">ไม่พบข้อมูลการสั่งซื้อ</p>
        <Link href="/" className={buttonClasses({ variant: "primary", className: "mt-6 w-full" })}>
          กลับหน้าแรก
        </Link>
      </StatusShell>
    );
  }

  if (status === "pending") {
    return (
      <StatusShell>
        <Spinner className="mx-auto mb-5 h-10 w-10 text-warning" />
        <h1 className="text-2xl font-semibold text-fg">รอการชำระเงิน</h1>
        <div className="my-5 rounded-md bg-warning/10 px-4 py-3 text-sm text-warning">
          หมายเลขคำสั่งซื้อ:{" "}
          <strong className="font-mono">{orderCode}</strong>
        </div>
        <p className="mb-6 text-sm text-fg-subtle">
          หน้านี้จะอัปเดตอัตโนมัติเมื่อชำระเงินสำเร็จ
        </p>
        <Link href="/orders" className={buttonClasses({ variant: "secondary", className: "w-full" })}>
          ดูประวัติการสั่งซื้อ
        </Link>
      </StatusShell>
    );
  }

  return (
    <StatusShell>
      <StatusIcon icon={CheckCircle2} tone="bg-success/10 text-success" />
      <h1 className="text-2xl font-semibold text-fg">ชำระเงินสำเร็จ!</h1>
      <p className="mt-2 text-sm text-fg-muted">ขอบคุณสำหรับการสั่งซื้อ</p>
      <div className="my-5 rounded-md bg-brand-subtle px-4 py-3 text-sm text-fg-muted">
        หมายเลขคำสั่งซื้อ:{" "}
        <strong className="font-mono text-brand">{orderCode}</strong>
      </div>
      <p className="mb-6 text-sm text-fg-subtle">
        เรากำลังเตรียมสินค้าของคุณ ติดตามสถานะได้ที่หน้าประวัติการสั่งซื้อ
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href={`/tracking?order=${orderId}`}
          className={buttonClasses({ variant: "primary", className: "w-full" })}
        >
          <Package className="h-4 w-4" />
          ติดตามพัสดุ
        </Link>
        <Link href="/orders" className={buttonClasses({ variant: "secondary", className: "w-full" })}>
          ดูประวัติการสั่งซื้อ
        </Link>
        <Link href="/" className={buttonClasses({ variant: "ghost", className: "w-full" })}>
          กลับหน้าแรก
        </Link>
      </div>
    </StatusShell>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense
      fallback={
        <StatusShell>
          <Spinner className="mx-auto mb-5 h-10 w-10" />
          <p className="text-fg-muted">กำลังโหลด...</p>
        </StatusShell>
      }
    >
      <CheckoutCompleteContent />
    </Suspense>
  );
}
