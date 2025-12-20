"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CheckoutCompletePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const orderId = searchParams.get("orderId");
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
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
      <div className="complete-page">
        <div className="complete-card">
          <div className="loading-spinner"></div>
          <p>กำลังตรวจสอบการชำระเงิน...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="complete-page">
        <div className="complete-card error">
          <div className="icon">❌</div>
          <h1>เกิดข้อผิดพลาด</h1>
          <p>ไม่พบข้อมูลการสั่งซื้อ</p>
          <Link href="/" className="btn-primary">
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="complete-page">
        <div className="complete-card">
          <div className="icon">⏳</div>
          <h1>รอการชำระเงิน</h1>
          <p className="order-id">หมายเลขคำสั่งซื้อ: <strong>{orderId?.slice(-8).toUpperCase()}</strong></p>
          <p>ระบบกำลังตรวจสอบการชำระเงิน...</p>
          <div className="loading-spinner" style={{ marginTop: "1.5rem" }}></div>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
            หน้านี้จะอัปเดตอัตโนมัติเมื่อชำระเงินสำเร็จ
          </p>
          <div className="actions" style={{ marginTop: "1.5rem" }}>
            <Link href="/orders" className="btn-secondary">
              ดูประวัติการสั่งซื้อ
            </Link>
          </div>
        </div>

        <style jsx>{`
          .complete-page {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          }
          .complete-card {
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 1.5rem;
            padding: 3rem;
            text-align: center;
            max-width: 500px;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          .icon { font-size: 4rem; margin-bottom: 1.5rem; }
          h1 { color: #f8fafc; font-size: 2rem; margin-bottom: 0.5rem; }
          p { color: #94a3b8; margin-bottom: 0.5rem; }
          .order-id {
            background: rgba(245, 158, 11, 0.1);
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1.5rem 0;
            color: #fbbf24;
          }
          .order-id strong { color: #fcd34d; font-family: monospace; }
          .btn-secondary {
            display: inline-block;
            background: transparent;
            color: #94a3b8;
            padding: 1rem 2rem;
            border: 1px solid rgba(148, 163, 184, 0.3);
            border-radius: 0.75rem;
            text-decoration: none;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(245, 158, 11, 0.2);
            border-top-color: #f59e0b;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .actions { display: flex; justify-content: center; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="complete-page">
      <div className="complete-card success">
        <div className="icon">✅</div>
        <h1>ชำระเงินสำเร็จ!</h1>
        <p>ขอบคุณสำหรับการสั่งซื้อ</p>
        <p className="order-id">หมายเลขคำสั่งซื้อ: <strong>{orderId?.slice(-8).toUpperCase()}</strong></p>
        <p className="note">เรากำลังเตรียมสินค้าของคุณ คุณสามารถติดตามสถานะได้ที่หน้าประวัติการสั่งซื้อ</p>
        <div className="actions">
          <Link href={`/tracking?order=${orderId}`} className="btn-primary">
            📦 ติดตามพัสดุ
          </Link>
          <Link href="/orders" className="btn-secondary">
            ดูประวัติการสั่งซื้อ
          </Link>
          <Link href="/" className="btn-secondary">
            กลับหน้าแรก
          </Link>
        </div>
      </div>


      <style jsx>{`
        .complete-page {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        .complete-card {
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          padding: 3rem;
          text-align: center;
          max-width: 500px;
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }

        h1 {
          color: #f8fafc;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        p {
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }

        .order-id {
          background: rgba(59, 130, 246, 0.1);
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          color: #60a5fa;
        }

        .order-id strong {
          color: #93c5fd;
          font-family: monospace;
          font-size: 0.9rem;
        }

        .note {
          font-size: 0.875rem;
          color: #64748b;
          margin-top: 1rem;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .btn-secondary {
          background: transparent;
          color: #94a3b8;
          padding: 1rem 2rem;
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 0.75rem;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(148, 163, 184, 0.1);
          color: #f8fafc;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
