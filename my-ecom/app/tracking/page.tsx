"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Order {
    _id: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    trackingNumber?: string;
    carrier?: string;
    shippedAt?: string;
    createdAt: string;
    total: number;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        image: string;
    }>;
    shippingAddress: {
        fullName: string;
        phone: string;
        province: string;
    };
}

const carriers: Record<string, { name: string; trackingUrl: string; icon: string }> = {
    kerry: { name: "Kerry Express", trackingUrl: "https://th.kerryexpress.com/th/track/?track=", icon: "🟠" },
    flash: { name: "Flash Express", trackingUrl: "https://flashexpress.com/tracking?se=", icon: "🟡" },
    jt: { name: "J&T Express", trackingUrl: "https://www.jtexpress.co.th/tracking?billcode=", icon: "🔴" },
    thaipost: { name: "ไปรษณีย์ไทย", trackingUrl: "https://track.thailandpost.co.th/?trackNumber=", icon: "🟤" },
    scg: { name: "SCG Express", trackingUrl: "https://www.scgexpress.co.th/tracking?tracking_no=", icon: "🟢" },
    other: { name: "ขนส่งอื่นๆ", trackingUrl: "", icon: "⚪" },
};

const statusConfig = {
    pending: { label: "รอดำเนินการ", color: "#fbbf24", icon: "⏳", step: 1 },
    processing: { label: "กำลังเตรียมสินค้า", color: "#60a5fa", icon: "📦", step: 2 },
    shipped: { label: "จัดส่งแล้ว", color: "#a78bfa", icon: "🚚", step: 3 },
    delivered: { label: "ได้รับสินค้าแล้ว", color: "#34d399", icon: "✅", step: 4 },
    cancelled: { label: "ยกเลิก", color: "#f87171", icon: "❌", step: 0 },
};

export default function TrackingPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order");
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchInput, setSearchInput] = useState(orderId || "");

    const fetchOrder = async (id: string) => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/orders/${id}`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.data);
            } else {
                setError("ไม่พบคำสั่งซื้อ กรุณาตรวจสอบหมายเลขอีกครั้ง");
                setOrder(null);
            }
        } catch {
            setError("เกิดข้อผิดพลาดในการค้นหา");
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) {
            fetchOrder(orderId);
        } else {
            setLoading(false);
        }
    }, [orderId]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            fetchOrder(searchInput.trim());
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const currentStep = order ? statusConfig[order.status]?.step || 0 : 0;
    const carrierInfo = order?.carrier ? carriers[order.carrier] : null;

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", padding: "2rem 1rem" }}>
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <Link href="/" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "0.9rem" }}>
                        ← กลับหน้าแรก
                    </Link>
                    <h1 style={{ color: "white", fontSize: "2rem", fontWeight: 800, marginTop: "1rem" }}>
                        📦 ติดตามพัสดุ
                    </h1>
                    <p style={{ color: "#94a3b8" }}>ค้นหาด้วยหมายเลขคำสั่งซื้อ</p>
                </div>

                {/* Search Box */}
                <form onSubmit={handleSearch} style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                            placeholder="เช่น 33AEFB4C"
                            style={{
                                flex: 1,
                                padding: "1rem",
                                borderRadius: "12px",
                                border: "1px solid rgba(139, 92, 246, 0.3)",
                                background: "rgba(30, 41, 59, 0.8)",
                                color: "white",
                                fontSize: "1rem",
                                letterSpacing: "2px",
                                outline: "none",
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: "0 1.5rem",
                                borderRadius: "12px",
                                border: "none",
                                background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                                color: "white",
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                        >
                            🔍
                        </button>
                    </div>
                </form>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
                        <p style={{ color: "#94a3b8" }}>กำลังค้นหา...</p>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div style={{
                        textAlign: "center",
                        padding: "3rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        borderRadius: "16px",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
                        <p style={{ color: "#f87171" }}>{error}</p>
                    </div>
                )}

                {/* Order Found */}
                {order && !loading && (
                    <div style={{ background: "rgba(30, 41, 59, 0.8)", borderRadius: "20px", border: "1px solid rgba(139, 92, 246, 0.3)", overflow: "hidden" }}>
                        {/* Order Header */}
                        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: 0 }}>คำสั่งซื้อ</p>
                                    <p style={{ color: "white", fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                                        #{order._id.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                                <div style={{
                                    padding: "0.5rem 1rem",
                                    borderRadius: "100px",
                                    background: `${statusConfig[order.status].color}20`,
                                    color: statusConfig[order.status].color,
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                }}>
                                    {statusConfig[order.status].icon} {statusConfig[order.status].label}
                                </div>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        {order.status !== "cancelled" && (
                            <div style={{ padding: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                                    {/* Progress Line */}
                                    <div style={{
                                        position: "absolute",
                                        top: "16px",
                                        left: "32px",
                                        right: "32px",
                                        height: "4px",
                                        background: "rgba(255,255,255,0.1)",
                                        borderRadius: "2px",
                                    }}>
                                        <div style={{
                                            width: `${((currentStep - 1) / 3) * 100}%`,
                                            height: "100%",
                                            background: "linear-gradient(90deg, #8b5cf6, #6d28d9)",
                                            borderRadius: "2px",
                                            transition: "width 0.5s ease",
                                        }} />
                                    </div>

                                    {/* Steps */}
                                    {[
                                        { step: 1, icon: "⏳", label: "รอดำเนินการ" },
                                        { step: 2, icon: "📦", label: "เตรียมสินค้า" },
                                        { step: 3, icon: "🚚", label: "จัดส่งแล้ว" },
                                        { step: 4, icon: "✅", label: "สำเร็จ" },
                                    ].map((item) => (
                                        <div key={item.step} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                                            <div style={{
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                background: currentStep >= item.step
                                                    ? "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
                                                    : "rgba(255,255,255,0.1)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                margin: "0 auto 8px",
                                                fontSize: "1rem",
                                                border: currentStep >= item.step ? "none" : "2px solid rgba(255,255,255,0.2)",
                                            }}>
                                                {item.icon}
                                            </div>
                                            <p style={{
                                                color: currentStep >= item.step ? "white" : "#64748b",
                                                fontSize: "0.7rem",
                                                margin: 0,
                                            }}>
                                                {item.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tracking Info */}
                        {order.trackingNumber && carrierInfo && (
                            <div style={{ padding: "0 1.5rem 1.5rem" }}>
                                <div style={{
                                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(109, 40, 217, 0.2))",
                                    borderRadius: "12px",
                                    padding: "1.25rem",
                                    border: "1px solid rgba(139, 92, 246, 0.3)",
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <p style={{ color: "#a78bfa", fontSize: "0.8rem", margin: "0 0 4px" }}>📦 หมายเลขพัสดุ</p>
                                            <p style={{ color: "white", fontSize: "1.25rem", fontWeight: 700, margin: 0, letterSpacing: "2px" }}>
                                                {order.trackingNumber}
                                            </p>
                                            <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "8px 0 0" }}>
                                                {carrierInfo.icon} {carrierInfo.name}
                                            </p>
                                        </div>
                                        {carrierInfo.trackingUrl && (
                                            <a
                                                href={`${carrierInfo.trackingUrl}${order.trackingNumber}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: "0.5rem 1rem",
                                                    borderRadius: "8px",
                                                    background: "#8b5cf6",
                                                    color: "white",
                                                    textDecoration: "none",
                                                    fontWeight: 600,
                                                    fontSize: "0.8rem",
                                                }}
                                            >
                                                ติดตาม →
                                            </a>
                                        )}
                                    </div>
                                    {order.shippedAt && (
                                        <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "12px 0 0" }}>
                                            📅 จัดส่งเมื่อ {formatDate(order.shippedAt)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Items */}
                        <div style={{ padding: "0 1.5rem 1.5rem" }}>
                            <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0 0 0.75rem" }}>📋 รายการสินค้า</p>
                            {order.items.map((item, idx) => (
                                <div key={idx} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "0.75rem",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "10px",
                                    marginBottom: "0.5rem",
                                }}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ color: "white", margin: 0, fontSize: "0.9rem" }}>{item.name}</p>
                                        <p style={{ color: "#64748b", margin: 0, fontSize: "0.8rem" }}>x{item.quantity}</p>
                                    </div>
                                    <p style={{ color: "#10b981", fontWeight: 600, margin: 0 }}>{formatPrice(item.price)}</p>
                                </div>
                            ))}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingTop: "1rem",
                                marginTop: "0.5rem",
                                borderTop: "1px solid rgba(255,255,255,0.1)",
                            }}>
                                <span style={{ color: "#94a3b8" }}>ยอดรวม</span>
                                <span style={{ color: "#10b981", fontSize: "1.25rem", fontWeight: 700 }}>{formatPrice(order.total)}</span>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div style={{ padding: "0 1.5rem 1.5rem" }}>
                            <p style={{ color: "#94a3b8", fontSize: "0.8rem", margin: "0 0 0.5rem" }}>📍 ที่อยู่จัดส่ง</p>
                            <p style={{ color: "white", margin: 0 }}>
                                {order.shippingAddress.fullName} • {order.shippingAddress.phone}
                            </p>
                            <p style={{ color: "#64748b", margin: 0, fontSize: "0.85rem" }}>
                                {order.shippingAddress.province}
                            </p>
                        </div>

                        {/* Order Date */}
                        <div style={{ padding: "1rem 1.5rem", background: "rgba(0,0,0,0.2)", textAlign: "center" }}>
                            <p style={{ color: "#64748b", margin: 0, fontSize: "0.8rem" }}>
                                สั่งซื้อเมื่อ {formatDate(order.createdAt)}
                            </p>
                        </div>
                    </div>
                )}

                {/* No Order ID */}
                {!orderId && !order && !loading && !error && (
                    <div style={{
                        textAlign: "center",
                        padding: "3rem",
                        background: "rgba(30, 41, 59, 0.8)",
                        borderRadius: "16px",
                        border: "1px solid rgba(139, 92, 246, 0.3)",
                    }}>
                        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</div>
                        <p style={{ color: "white", fontSize: "1.1rem", marginBottom: "0.5rem" }}>ค้นหาคำสั่งซื้อของคุณ</p>
                        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                            กรอกหมายเลขคำสั่งซื้อ 8 หลักด้านบน<br />
                            เพื่อดูสถานะและติดตามพัสดุ
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
