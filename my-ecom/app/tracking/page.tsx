"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Order {
  _id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  createdAt: string;
  total: number;
  userId?: string | { _id: string };
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    images?: string[];
    customParts?: {
      base?: { name?: string; image?: string };
      switch?: { name?: string; image?: string };
      keycapBase?: { name?: string; image?: string };
      keycapAdd1?: { name?: string; image?: string };
      keycapAdd2?: { name?: string; image?: string };
      wire?: { name?: string; image?: string };
    };
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    province: string;
  };
}

const carriers: Record<
  string,
  { name: string; trackingUrl: string; icon: string }
> = {
  kerry: {
    name: "Kerry Express",
    trackingUrl: "https://th.kerryexpress.com/th/track/?track=",
    icon: "🟠",
  },
  flash: {
    name: "Flash Express",
    trackingUrl: "https://flashexpress.com/tracking?se=",
    icon: "🟡",
  },
  jt: {
    name: "J&T Express",
    trackingUrl: "https://www.jtexpress.co.th/tracking?billcode=",
    icon: "🔴",
  },
  thaipost: {
    name: "ไปรษณีย์ไทย",
    trackingUrl: "https://track.thailandpost.co.th/?trackNumber=",
    icon: "🟤",
  },
  scg: {
    name: "SCG Express",
    trackingUrl: "https://www.scgexpress.co.th/tracking?tracking_no=",
    icon: "🟢",
  },
  other: { name: "ขนส่งอื่นๆ", trackingUrl: "", icon: "⚪" },
};

const statusConfig = {
  pending: { label: "รอดำเนินการ", color: "#fbbf24", icon: "⏳", step: 1 },
  processing: {
    label: "กำลังเตรียมสินค้า",
    color: "#60a5fa",
    icon: "📦",
    step: 2,
  },
  shipped: { label: "จัดส่งแล้ว", color: "#4988C4", icon: "🚚", step: 3 },
  delivered: {
    label: "ได้รับสินค้าแล้ว",
    color: "#34d399",
    icon: "✅",
    step: 4,
  },
  cancelled: { label: "ยกเลิก", color: "#f87171", icon: "❌", step: 0 },
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  // const { showToast } = useToast();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(orderId || "");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState({ type: "", text: "" });

  const fetchOrder = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error("ไม่พบคำสั่งซื้อ กรุณาตรวจสอบหมายเลขอีกครั้ง");
        setOrder(null);
      }
    } catch {
      toast.error("ไม่พบเลขพัสดุนี้ในระบบ");
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

  const handleConfirmReceived = async () => {
    if (!order) return;

    setConfirmLoading(true);
    setConfirmMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          userId: user?._id,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setConfirmMessage({
          type: "success",
          text: "✅ ยืนยันรับสินค้าเรียบร้อย ขอบคุณที่ใช้บริการ!",
        });
        setOrder({ ...order, status: "delivered" });
      } else {
        setConfirmMessage({
          type: "error",
          text: data.error || "เกิดข้อผิดพลาด",
        });
      }
    } catch {
      setConfirmMessage({
        type: "error",
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      });
    } finally {
      setConfirmLoading(false);
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
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link
            href="/orders"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#4988C4",
              textDecoration: "none",
              fontSize: "0.9rem",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: "rgba(28, 77, 141, 0.1)",
              border: "1px solid rgba(28, 77, 141, 0.2)",
            }}
          >
            ← กลับหน้าคำสั่งซื้อ
          </Link>
          <h1
            style={{
              color: "white",
              fontSize: "1.75rem",
              fontWeight: 800,
              marginTop: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>📍</span>
            รายละเอียดคำสั่งซื้อ
          </h1>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <p style={{ color: "#94a3b8" }}>กำลังค้นหา...</p>
          </div>
        )}

        {/* Order Found */}
        {order && !loading && (
          <div
            style={{
              background: "rgba(30, 41, 59, 0.8)",
              borderRadius: "20px",
              border: "1px solid rgba(28, 77, 141, 0.3)",
              overflow: "hidden",
            }}
          >
            {/* Order Header */}
            <div
              style={{
                padding: "1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1.25rem",
                    background: "rgba(28, 77, 141, 0.15)",
                    borderRadius: "12px",
                    border: "1px solid rgba(28, 77, 141, 0.3)",
                  }}
                >
                  <span style={{ fontSize: "1.25rem" }}>🧾</span>
                  <div>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.7rem",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      หมายเลขคำสั่งซื้อ
                    </p>
                    <p
                      style={{
                        color: "#4988C4",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        margin: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "12px",
                    background: statusConfig[order.status].color,
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: `0 4px 12px ${
                      statusConfig[order.status].color
                    }40`,
                  }}
                >
                  {statusConfig[order.status].icon}{" "}
                  {statusConfig[order.status].label}
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            {order.status !== "cancelled" && (
              <div style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  {/* Progress Line */}
                  <div
                    style={{
                      position: "absolute",
                      top: "16px",
                      left: "32px",
                      right: "32px",
                      height: "4px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: `${((currentStep - 1) / 3) * 100}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #1C4D8D, #0F2854)",
                        borderRadius: "2px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>

                  {/* Steps */}
                  {[
                    { step: 1, icon: "⏳", label: "รอดำเนินการ" },
                    { step: 2, icon: "📦", label: "เตรียมสินค้า" },
                    { step: 3, icon: "🚚", label: "จัดส่งแล้ว" },
                    { step: 4, icon: "✅", label: "สำเร็จ" },
                  ].map((item) => (
                    <div
                      key={item.step}
                      style={{
                        textAlign: "center",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background:
                            currentStep >= item.step
                              ? "linear-gradient(135deg, #1C4D8D 0%, #0F2854 100%)"
                              : "rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 8px",
                          fontSize: "1rem",
                          border:
                            currentStep >= item.step
                              ? "none"
                              : "2px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        {item.icon}
                      </div>
                      <p
                        style={{
                          color: currentStep >= item.step ? "white" : "#64748b",
                          fontSize: "0.7rem",
                          margin: 0,
                        }}
                      >
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
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(28, 77, 141, 0.2), rgba(109, 40, 217, 0.2))",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    border: "1px solid rgba(28, 77, 141, 0.3)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: "#4988C4",
                          fontSize: "0.8rem",
                          margin: "0 0 4px",
                        }}
                      >
                        📦 หมายเลขพัสดุ
                      </p>
                      <p
                        style={{
                          color: "white",
                          fontSize: "1rem",
                          fontWeight: 700,
                          margin: 0,
                          letterSpacing: "1px",
                          wordBreak: "break-all",
                          overflowWrap: "break-word",
                        }}
                      >
                        {order.trackingNumber}
                      </p>

                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.8rem",
                          margin: "8px 0 0",
                        }}
                      >
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
                          background: "#1C4D8D",
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
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.75rem",
                        margin: "12px 0 0",
                      }}
                    >
                      📅 จัดส่งเมื่อ {formatDate(order.shippedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div style={{ padding: "1.25rem 1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem",
                  paddingBottom: "0.75rem",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span style={{ fontSize: "1rem" }}>🛒</span>
                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  สินค้าในคำสั่งซื้อ (
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                  ชิ้น)
                </span>
              </div>
              {order.items.map((item, idx) => {
                const isCustomProduct = item.productId?.startsWith("custom-") || !!item.customParts;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "1rem",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "12px",
                      marginBottom: "0.5rem",
                      border: isCustomProduct
                        ? "1px solid rgba(28, 77, 141, 0.3)"
                        : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "1rem",
                      }}
                    >
                      {/* Image - Stack for custom products */}
                      <div
                        style={{
                          position: "relative",
                          width: isCustomProduct ? "80px" : "52px",
                          height: isCustomProduct ? "80px" : "52px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          background: "#334155",
                          flexShrink: 0,
                        }}
                      >
                        {isCustomProduct &&
                        item.images &&
                        item.images.length > 1 ? (
                          <>
                            {item.images.map((img, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={img}
                                alt={`${item.name} layer ${imgIdx + 1}`}
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                  zIndex: imgIdx + 1,
                                }}
                              />
                            ))}
                          </>
                        ) : (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            color: "white",
                            margin: 0,
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          {item.name}
                        </p>
                        <p
                          style={{
                            color: "#64748b",
                            margin: 0,
                            fontSize: "0.8rem",
                          }}
                        >
                          x{item.quantity}
                        </p>

                        {/* Custom Parts Display */}
                        {isCustomProduct && item.customParts && (
                          <div
                            style={{
                              marginTop: "0.75rem",
                              padding: "0.75rem",
                              background: "rgba(28, 77, 141, 0.1)",
                              borderRadius: "8px",
                              fontSize: "0.75rem",
                            }}
                          >
                            <p
                              style={{
                                color: "#4988C4",
                                margin: "0 0 0.5rem",
                                fontWeight: 600,
                              }}
                            >
                              🛠️ ชิ้นส่วนที่เลือก:
                            </p>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.4rem",
                              }}
                            >
                              {item.customParts.base?.name && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                  }}
                                >
                                  {item.customParts.base.image && (
                                    <img
                                      src={item.customParts.base.image}
                                      alt="Base"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "4px",
                                        objectFit: "contain",
                                        background: "#334155",
                                      }}
                                    />
                                  )}
                                  <span style={{ color: "#94a3b8" }}>🖥️</span>
                                  <span style={{ color: "white" }}>
                                    {item.customParts.base.name}
                                  </span>
                                </div>
                              )}
                              {item.customParts.switch?.name && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                  }}
                                >
                                  {item.customParts.switch.image && (
                                    <img
                                      src={item.customParts.switch.image}
                                      alt="Switch"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "4px",
                                        objectFit: "contain",
                                        background: "#334155",
                                      }}
                                    />
                                  )}
                                  <span style={{ color: "#94a3b8" }}>🔘</span>
                                  <span style={{ color: "white" }}>
                                    {item.customParts.switch.name}
                                  </span>
                                </div>
                              )}
                              {item.customParts.keycapBase?.name && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                  }}
                                >
                                  {item.customParts.keycapBase.image && (
                                    <img
                                      src={item.customParts.keycapBase.image}
                                      alt="Keycap"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "4px",
                                        objectFit: "contain",
                                        background: "#334155",
                                      }}
                                    />
                                  )}
                                  <span style={{ color: "#94a3b8" }}>⌨️</span>
                                  <span style={{ color: "white" }}>
                                    {item.customParts.keycapBase.name}
                                  </span>
                                </div>
                              )}
                              {item.customParts.keycapAdd1?.name && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                  }}
                                >
                                  {item.customParts.keycapAdd1.image && (
                                    <img
                                      src={item.customParts.keycapAdd1.image}
                                      alt="Add-on 1"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "4px",
                                        objectFit: "contain",
                                        background: "#334155",
                                      }}
                                    />
                                  )}
                                  <span style={{ color: "#94a3b8" }}>🔠</span>
                                  <span style={{ color: "white" }}>
                                    {item.customParts.keycapAdd1.name}
                                  </span>
                                </div>
                              )}
                              {item.customParts.keycapAdd2?.name && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                  }}
                                >
                                  {item.customParts.keycapAdd2.image && (
                                    <img
                                      src={item.customParts.keycapAdd2.image}
                                      alt="Add-on 2"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "4px",
                                        objectFit: "contain",
                                        background: "#334155",
                                      }}
                                    />
                                  )}
                                  <span style={{ color: "#94a3b8" }}>🔣</span>
                                  <span style={{ color: "white" }}>
                                    {item.customParts.keycapAdd2.name}
                                  </span>
                                </div>
                              )}
                              {item.customParts.wire?.name && (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                  }}
                                >
                                  {item.customParts.wire.image && (
                                    <img
                                      src={item.customParts.wire.image}
                                      alt="Wire"
                                      style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "4px",
                                        objectFit: "contain",
                                        background: "#334155",
                                      }}
                                    />
                                  )}
                                  <span style={{ color: "#94a3b8" }}>🔌</span>
                                  <span style={{ color: "white" }}>
                                    {item.customParts.wire.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <p
                        style={{
                          color: "#10b981",
                          fontWeight: 600,
                          margin: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "1rem",
                  marginTop: "0.5rem",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span style={{ color: "#94a3b8" }}>ยอดรวม</span>
                <span
                  style={{
                    color: "#10b981",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                  }}
                >
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div style={{ padding: "0 1.5rem 1.5rem" }}>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.8rem",
                  margin: "0 0 0.5rem",
                }}
              >
                📍 ที่อยู่จัดส่ง
              </p>
              <p style={{ color: "white", margin: 0 }}>
                {order.shippingAddress.fullName} • {order.shippingAddress.phone}
              </p>
              <p style={{ color: "#64748b", margin: 0, fontSize: "0.85rem" }}>
                {order.shippingAddress.province}
              </p>
            </div>

            {/* Confirm Received Button - Only show for shipped orders */}
            {order.status === "shipped" && (
              <div style={{ padding: "0 1.5rem 1.5rem" }}>
                {confirmMessage.text && (
                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "10px",
                      marginBottom: "1rem",
                      background:
                        confirmMessage.type === "success"
                          ? "rgba(34, 197, 94, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                      border: `1px solid ${
                        confirmMessage.type === "success"
                          ? "rgba(34, 197, 94, 0.3)"
                          : "rgba(239, 68, 68, 0.3)"
                      }`,
                      color:
                        confirmMessage.type === "success"
                          ? "#22c55e"
                          : "#ef4444",
                      textAlign: "center",
                    }}
                  >
                    {confirmMessage.text}
                  </div>
                )}

                <button
                  onClick={handleConfirmReceived}
                  disabled={confirmLoading}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    background: confirmLoading
                      ? "rgba(34, 197, 94, 0.3)"
                      : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "1rem",
                    cursor: confirmLoading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {confirmLoading
                    ? "⏳ กำลังดำเนินการ..."
                    : "✅ ยืนยันได้รับสินค้าแล้ว"}
                </button>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.75rem",
                    textAlign: "center",
                    marginTop: "0.75rem",
                  }}
                >
                  ⏰ หากไม่กดยืนยัน ระบบจะปิดคำสั่งซื้ออัตโนมัติใน 7 วัน
                </p>
              </div>
            )}

            {/* Delivered Thank You */}
            {order.status === "delivered" && (
              <div style={{ padding: "0 1.5rem 1.5rem" }}>
                <div
                  style={{
                    padding: "1rem",
                    background: "rgba(34, 197, 94, 0.15)",
                    border: "1px solid rgba(34, 197, 94, 0.3)",
                    borderRadius: "12px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{ color: "#22c55e", margin: 0, fontSize: "1.5rem" }}
                  >
                    ✅
                  </p>
                  <p
                    style={{
                      color: "#22c55e",
                      margin: "0.5rem 0 0",
                      fontWeight: 600,
                    }}
                  >
                    ได้รับสินค้าเรียบร้อยแล้ว
                  </p>
                  <p
                    style={{
                      color: "#64748b",
                      margin: "0.25rem 0 0",
                      fontSize: "0.8rem",
                    }}
                  >
                    ขอบคุณที่ใช้บริการ! 💜
                  </p>
                </div>
              </div>
            )}

            {/* Order Date */}
            <div
              style={{
                padding: "1rem 1.5rem",
                background: "rgba(0,0,0,0.2)",
                textAlign: "center",
              }}
            >
              <p style={{ color: "#64748b", margin: 0, fontSize: "0.8rem" }}>
                สั่งซื้อเมื่อ {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        )}

        {/* No Order ID */}
        {!orderId && !order && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              background: "rgba(30, 41, 59, 0.8)",
              borderRadius: "16px",
              border: "1px solid rgba(28, 77, 141, 0.3)",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</div>
            <p
              style={{
                color: "white",
                fontSize: "1.1rem",
                marginBottom: "0.5rem",
              }}
            >
              ค้นหาคำสั่งซื้อของคุณ
            </p>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              กรอกหมายเลขคำสั่งซื้อ 8 หลักด้านบน
              <br />
              เพื่อดูสถานะและติดตามพัสดุ
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap with Suspense for Next.js 14+ static generation
export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
            padding: "2rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
            <p style={{ color: "#94a3b8" }}>กำลังโหลด...</p>
          </div>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
