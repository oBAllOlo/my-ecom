"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    district: string;
    province: string;
    postalCode: string;
  };
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  createdAt: string;
}

const carriers = [
  { id: "kerry", name: "Kerry Express", icon: "🟠" },
  { id: "flash", name: "Flash Express", icon: "🟡" },
  { id: "jt", name: "J&T Express", icon: "🔴" },
  { id: "thaipost", name: "ไปรษณีย์ไทย", icon: "🟤" },
  { id: "scg", name: "SCG Express", icon: "🟢" },
  { id: "other", name: "อื่นๆ", icon: "⚪" },
];

const statusConfig: Record<string, { label: string; bgClass: string; textClass: string; icon: string }> = {
  pending: { label: "รอดำเนินการ", bgClass: "bg-amber-500/20", textClass: "text-amber-400", icon: "⏳" },
  processing: { label: "กำลังจัดส่ง", bgClass: "bg-blue-500/20", textClass: "text-blue-400", icon: "📦" },
  shipped: { label: "จัดส่งแล้ว", bgClass: "bg-violet-500/20", textClass: "text-violet-400", icon: "🚚" },
  delivered: { label: "ส่งสำเร็จ", bgClass: "bg-emerald-500/20", textClass: "text-emerald-400", icon: "✅" },
  cancelled: { label: "ยกเลิก", bgClass: "bg-red-500/20", textClass: "text-red-400", icon: "❌" },
};

export default function AdminOrders() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Shipping modal state
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState("kerry");
  const [isShipping, setIsShipping] = useState(false);
  const [shippingMessage, setShippingMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchOrders();
    }
  }, [user]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus as Order["status"] } : o)));
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const openShippingModal = (order: Order) => {
    setShippingOrder(order);
    setTrackingNumber("");
    setSelectedCarrier("kerry");
    setShippingMessage({ type: "", text: "" });
    setShowShippingModal(true);
    setSelectedOrder(null);
  };

  const handleShipOrder = async () => {
    if (!shippingOrder || !trackingNumber.trim()) {
      setShippingMessage({ type: "error", text: "กรุณากรอกหมายเลขพัสดุ" });
      return;
    }

    setIsShipping(true);
    try {
      const res = await fetch("/api/orders/ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: shippingOrder._id,
          trackingNumber: trackingNumber.trim(),
          carrier: selectedCarrier,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setShippingMessage({ type: "success", text: "📧 จัดส่งสำเร็จและส่งอีเมลแจ้งลูกค้าแล้ว!" });
        setOrders(orders.map((o) =>
          o._id === shippingOrder._id
            ? { ...o, status: "shipped" as const, trackingNumber, carrier: selectedCarrier }
            : o
        ));
        setTimeout(() => {
          setShowShippingModal(false);
        }, 2000);
      } else {
        setShippingMessage({ type: "error", text: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (error) {
      console.error("Error shipping order:", error);
      setShippingMessage({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setIsShipping(false);
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Admin Header */}
      <header className="bg-slate-800/50 border-b border-white/5 px-8 py-6">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-violet-400 no-underline font-medium py-2 px-4 bg-violet-500/10 rounded-lg hover:bg-violet-500/20 transition-all">
            ← กลับ
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-4xl">🛒</span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-50 m-0">จัดการคำสั่งซื้อ</h1>
              <p className="text-sm text-slate-500 m-0">{orders.length} คำสั่งซื้อทั้งหมด</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        {/* Orders Table */}
        <div className="bg-slate-800/50 border border-violet-500/20 rounded-2xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">รหัสคำสั่งซื้อ</th>
                <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">ลูกค้า</th>
                <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">ยอดรวม</th>
                <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">สถานะ</th>
                <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">วันที่</th>
                <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const status = statusConfig[order.status];
                return (
                  <tr key={order._id} className="hover:bg-violet-500/5 transition-colors">
                    <td className="p-4 border-b border-white/5">
                      <span className="font-mono text-slate-50 font-semibold">#{order._id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="p-4 border-b border-white/5">
                      <div className="flex flex-col">
                        <span className="text-slate-50 font-medium">{order.userId?.name || "ไม่ระบุ"}</span>
                        <span className="text-slate-500 text-sm">{order.userId?.email}</span>
                      </div>
                    </td>
                    <td className="p-4 border-b border-white/5">
                      <span className="text-emerald-400 font-bold text-lg">{formatPrice(order.total)}</span>
                    </td>
                    <td className="p-4 border-b border-white/5">
                      <span className={`inline-flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold ${status.bgClass} ${status.textClass}`}>
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td className="p-4 border-b border-white/5">
                      <span className="text-slate-400 text-sm">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="p-4 border-b border-white/5">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="py-2 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold border-none cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <span className="text-6xl block mb-4">📭</span>
              <p>ยังไม่มีคำสั่งซื้อ</p>
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-8" onClick={() => setSelectedOrder(null)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-violet-500/30 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl text-slate-50 m-0">คำสั่งซื้อ #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
              <button onClick={() => setSelectedOrder(null)} className="bg-none border-none text-slate-500 text-2xl cursor-pointer hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6">
              {/* Order Items */}
              <div className="mb-8">
                <h3 className="text-slate-50 text-base mb-4">📦 รายการสินค้า</h3>
                <div className="flex flex-col gap-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-slate-50 m-0">{item.name}</p>
                        <p className="text-slate-500 text-sm m-0">x{item.quantity}</p>
                      </div>
                      <p className="text-emerald-400 font-semibold m-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-4 mt-4 border-t border-white/10 text-slate-400">
                  <span>ยอดรวม</span>
                  <span className="text-2xl font-extrabold text-emerald-400">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-8">
                <h3 className="text-slate-50 text-base mb-4">📍 ที่อยู่จัดส่ง</h3>
                <div className="bg-white/5 p-4 rounded-xl text-slate-400">
                  <p className="text-slate-50 font-semibold mb-2">{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}</p>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <h3 className="text-slate-50 text-base mb-4">🔄 อัปเดตสถานะ</h3>

                {/* Show shipping button for processing orders */}
                {selectedOrder.status === "processing" && (
                  <button
                    onClick={() => openShippingModal(selectedOrder)}
                    className="w-full p-4 mb-4 bg-gradient-to-r from-violet-500 to-purple-600 border-none rounded-xl text-white font-bold text-base cursor-pointer flex items-center justify-center gap-2"
                  >
                    🚚 จัดส่งพัสดุ (กรอก Tracking)
                  </button>
                )}

                {/* Show tracking info if shipped */}
                {selectedOrder.trackingNumber && (
                  <div className="bg-violet-500/15 border border-violet-500/30 rounded-xl p-4 mb-4">
                    <p className="text-violet-400 m-0 mb-1 text-sm">📦 หมายเลขพัสดุ</p>
                    <p className="text-white m-0 text-lg font-bold tracking-wider">{selectedOrder.trackingNumber}</p>
                    <p className="text-slate-500 mt-2 mb-0 text-sm">🏢 {carriers.find(c => c.id === selectedOrder.carrier)?.name || selectedOrder.carrier}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => key === "shipped" && selectedOrder.status === "processing"
                        ? openShippingModal(selectedOrder)
                        : handleStatusUpdate(selectedOrder._id, key)
                      }
                      className={`py-3 px-4 rounded-xl font-semibold cursor-pointer transition-all ${config.bgClass} ${config.textClass} ${selectedOrder.status === key ? "ring-2 ring-white scale-[1.02]" : ""} hover:scale-[1.02]`}
                    >
                      {config.icon} {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showShippingModal && shippingOrder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-8" onClick={() => setShowShippingModal(false)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-violet-500/30 rounded-3xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-xl text-slate-50 m-0">🚚 จัดส่งพัสดุ</h2>
              <button onClick={() => setShowShippingModal(false)} className="bg-none border-none text-slate-500 text-2xl cursor-pointer hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6">
              <p className="text-slate-400 mb-6">
                คำสั่งซื้อ #{shippingOrder._id.slice(-8).toUpperCase()} - {shippingOrder.shippingAddress.fullName}
              </p>

              {shippingMessage.text && (
                <div className={`py-3 px-4 rounded-xl mb-4 ${shippingMessage.type === "success" ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400" : "bg-red-500/15 border border-red-500/30 text-red-400"}`}>
                  {shippingMessage.text}
                </div>
              )}

              {/* Carrier Selection */}
              <div className="mb-6">
                <label className="block text-slate-400 text-sm mb-2">🏢 เลือกบริษัทขนส่ง</label>
                <div className="grid grid-cols-2 gap-2">
                  {carriers.map((carrier) => (
                    <button
                      key={carrier.id}
                      type="button"
                      onClick={() => setSelectedCarrier(carrier.id)}
                      className={`py-3 px-4 rounded-xl text-left flex items-center gap-2 cursor-pointer transition-all ${selectedCarrier === carrier.id ? "border-2 border-violet-500 bg-violet-500/20 text-violet-400" : "border border-white/10 bg-white/5 text-slate-400"}`}
                    >
                      <span>{carrier.icon}</span>
                      <span className="text-sm">{carrier.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tracking Number Input */}
              <div className="mb-6">
                <label className="block text-slate-400 text-sm mb-2">📦 หมายเลขพัสดุ (Tracking Number)</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  placeholder="เช่น TH1234567890"
                  className="w-full py-3 px-4 bg-slate-900/50 border border-white/10 rounded-xl text-white text-base tracking-wide outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleShipOrder}
                disabled={isShipping || !trackingNumber.trim()}
                className={`w-full p-4 border-none rounded-xl text-white font-bold text-base transition-all ${isShipping || !trackingNumber.trim() ? "bg-violet-500/30 cursor-not-allowed opacity-60" : "bg-gradient-to-r from-violet-500 to-purple-600 cursor-pointer hover:shadow-lg hover:shadow-violet-500/30"}`}
              >
                {isShipping ? "⏳ กำลังดำเนินการ..." : "✅ ยืนยันจัดส่งและแจ้งลูกค้า"}
              </button>

              <p className="text-slate-500 text-xs text-center mt-4">
                📧 ระบบจะส่งอีเมลแจ้งหมายเลขพัสดุให้ลูกค้าอัตโนมัติ
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
