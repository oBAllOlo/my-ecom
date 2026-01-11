"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

function CheckoutCompleteContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [, setPaymentStatus] = useState<string>("");
  const hasCleared = useRef(false);
  const checkCount = useRef(0);

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    // Clear cart only once
    if (!hasCleared.current) {
      hasCleared.current = true;
      console.log("Clearing cart for order:", orderId);
      clearCart();
      localStorage.removeItem("cart");
    }

    // Check payment status
    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(`/api/payment/check-status?orderId=${orderId}`);
        const data = await res.json();

        if (data.success) {
          setPaymentStatus(data.data.paymentStatus);

          if (data.data.paymentStatus === "paid") {
            setStatus("success");
          } else if (data.data.paymentStatus === "failed") {
            setStatus("error");
          } else {
            // Still pending - continue checking
            setStatus("pending");
            checkCount.current += 1;

            // Check again after 3 seconds (max 10 times = 30 seconds)
            if (checkCount.current < 10) {
              setTimeout(checkPaymentStatus, 3000);
            }
          }
        }
      } catch (error) {
        console.error("Error checking payment:", error);
        setStatus("pending");
      }
    };

    // Start checking after 1 second (give time for webhook to process)
    setTimeout(checkPaymentStatus, 1000);
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps


  if (status === "loading") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-12 text-center max-w-md w-full border border-white/10">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-400">กำลังตรวจสอบการชำระเงิน...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-12 text-center max-w-md w-full border border-white/10">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-white text-3xl font-bold mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-slate-400 mb-6">ไม่พบข้อมูลการสั่งซื้อ</p>
          <Link 
            href="/" 
            className="inline-block bg-gradient-to-r from-blue-500 to-primary-500 text-white py-4 px-8 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-12 text-center max-w-md w-full border border-white/10">
          <div className="text-6xl mb-6">⏳</div>
          <h1 className="text-white text-3xl font-bold mb-2">รอการชำระเงิน</h1>
          <p className="bg-amber-500/10 text-amber-400 p-4 rounded-lg my-6">
            หมายเลขคำสั่งซื้อ: <strong className="text-amber-300 font-mono">{orderId?.slice(-8).toUpperCase()}</strong>
          </p>
          <p className="text-slate-400 mb-4">ระบบกำลังตรวจสอบการชำระเงิน...</p>
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm mb-6">หน้านี้จะอัปเดตอัตโนมัติเมื่อชำระเงินสำเร็จ</p>
          <Link 
            href="/orders" 
            className="inline-block bg-transparent text-slate-400 py-4 px-8 border border-slate-400/30 rounded-xl font-medium hover:bg-slate-400/10 hover:text-white transition-all"
          >
            ดูประวัติการสั่งซื้อ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-12 text-center max-w-md w-full border border-white/10">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-white text-3xl font-bold mb-2">ชำระเงินสำเร็จ!</h1>
        <p className="text-slate-400 mb-2">ขอบคุณสำหรับการสั่งซื้อ</p>
        <p className="bg-blue-500/10 text-blue-400 p-4 rounded-lg my-6">
          หมายเลขคำสั่งซื้อ: <strong className="text-blue-300 font-mono text-sm">{orderId?.slice(-8).toUpperCase()}</strong>
        </p>
        <p className="text-slate-500 text-sm mb-6">
          เรากำลังเตรียมสินค้าของคุณ คุณสามารถติดตามสถานะได้ที่หน้าประวัติการสั่งซื้อ
        </p>
        <div className="flex flex-col gap-4">
          <Link 
            href={`/tracking?order=${orderId}`} 
            className="bg-gradient-to-r from-blue-500 to-primary-500 text-white py-4 px-8 rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            📦 ติดตามพัสดุ
          </Link>
          <Link 
            href="/orders" 
            className="bg-transparent text-slate-400 py-4 px-8 border border-slate-400/30 rounded-xl font-medium hover:bg-slate-400/10 hover:text-white transition-all"
          >
            ดูประวัติการสั่งซื้อ
          </Link>
          <Link 
            href="/" 
            className="bg-transparent text-slate-400 py-4 px-8 border border-slate-400/30 rounded-xl font-medium hover:bg-slate-400/10 hover:text-white transition-all"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}

// Wrap with Suspense for Next.js 14+ static generation
export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-12 text-center max-w-md w-full border border-white/10">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-400">กำลังโหลด...</p>
        </div>
      </div>
    }>
      <CheckoutCompleteContent />
    </Suspense>
  );
}
