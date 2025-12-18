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
  createdAt: string;
}

const statusConfig = {
  pending: { label: "รอดำเนินการ", color: "status-pending", icon: "⏳" },
  processing: { label: "กำลังจัดส่ง", color: "status-processing", icon: "📦" },
  shipped: { label: "จัดส่งแล้ว", color: "status-shipped", icon: "🚚" },
  delivered: { label: "ส่งสำเร็จ", color: "status-delivered", icon: "✅" },
  cancelled: { label: "ยกเลิก", color: "status-cancelled", icon: "❌" },
};

export default function AdminOrders() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-bg-pattern"></div>

      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <Link href="/admin" className="admin-back-link">
              ← กลับ
            </Link>
            <div className="admin-page-title">
              <span className="admin-page-icon">🛒</span>
              <div>
                <h1>จัดการคำสั่งซื้อ</h1>
                <p>{orders.length} คำสั่งซื้อทั้งหมด</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Orders Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>รหัสคำสั่งซื้อ</th>
                <th>ลูกค้า</th>
                <th>ยอดรวม</th>
                <th>สถานะ</th>
                <th>วันที่</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span className="order-id">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">{order.userId?.name || "ไม่ระบุ"}</span>
                      <span className="customer-email">{order.userId?.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className="order-total">{formatPrice(order.total)}</span>
                  </td>
                  <td>
                    <span className={`order-status ${statusConfig[order.status].color}`}>
                      {statusConfig[order.status].icon} {statusConfig[order.status].label}
                    </span>
                  </td>
                  <td>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="admin-btn admin-btn-primary"
                    >
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="admin-empty-state">
              <span className="empty-icon">📭</span>
              <p>ยังไม่มีคำสั่งซื้อ</p>
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>คำสั่งซื้อ #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
              <button onClick={() => setSelectedOrder(null)} className="admin-modal-close">
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              {/* Order Items */}
              <div className="modal-section">
                <h3>📦 รายการสินค้า</h3>
                <div className="order-items-list">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <img src={item.image} alt={item.name} className="order-item-image" />
                      <div className="order-item-info">
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-qty">x{item.quantity}</p>
                      </div>
                      <p className="order-item-price">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="order-total-row">
                  <span>ยอดรวม</span>
                  <span className="order-grand-total">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="modal-section">
                <h3>📍 ที่อยู่จัดส่ง</h3>
                <div className="shipping-address">
                  <p className="address-name">{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>
                    {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.province}{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              {/* Update Status */}
              <div className="modal-section">
                <h3>🔄 อัปเดตสถานะ</h3>
                <div className="status-buttons">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusUpdate(selectedOrder._id, key)}
                      className={`status-btn ${config.color} ${selectedOrder.status === key ? "active" : ""}`}
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

      <style jsx>{`
        .admin-back-link {
          color: #a78bfa;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 1rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .admin-back-link:hover {
          background: rgba(139, 92, 246, 0.2);
        }
        .admin-page-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .admin-page-icon {
          font-size: 2.5rem;
        }
        .admin-page-title h1 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #f8fafc;
          margin: 0;
        }
        .admin-page-title p {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }
        .admin-table-container {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 20px;
          overflow: hidden;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-table th {
          text-align: left;
          padding: 1rem 1.5rem;
          background: rgba(139, 92, 246, 0.1);
          color: #a78bfa;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .admin-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .admin-table tr:hover td {
          background: rgba(139, 92, 246, 0.05);
        }
        .order-id {
          font-family: monospace;
          color: #f8fafc;
          font-weight: 600;
        }
        .customer-info {
          display: flex;
          flex-direction: column;
        }
        .customer-name {
          color: #f8fafc;
          font-weight: 500;
        }
        .customer-email {
          color: #64748b;
          font-size: 0.85rem;
        }
        .order-total {
          color: #10b981;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .order-status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .status-pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .status-processing { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        .status-shipped { background: rgba(139, 92, 246, 0.2); color: #a78bfa; }
        .status-delivered { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .status-cancelled { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .order-date {
          color: #94a3b8;
          font-size: 0.9rem;
        }
        .admin-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .admin-btn-primary {
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          color: white;
        }
        .admin-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
        }
        .admin-empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #64748b;
        }
        .empty-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }
        .admin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }
        .admin-modal {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 24px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .admin-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .admin-modal-header h2 {
          font-size: 1.25rem;
          color: #f8fafc;
          margin: 0;
        }
        .admin-modal-close {
          background: none;
          border: none;
          color: #64748b;
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.3s ease;
        }
        .admin-modal-close:hover {
          color: #f8fafc;
        }
        .admin-modal-body {
          padding: 1.5rem;
        }
        .modal-section {
          margin-bottom: 2rem;
        }
        .modal-section h3 {
          color: #f8fafc;
          font-size: 1rem;
          margin-bottom: 1rem;
        }
        .order-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .order-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }
        .order-item-image {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
        }
        .order-item-info {
          flex: 1;
        }
        .order-item-name {
          color: #f8fafc;
          margin: 0;
        }
        .order-item-qty {
          color: #64748b;
          font-size: 0.85rem;
          margin: 0;
        }
        .order-item-price {
          color: #10b981;
          font-weight: 600;
          margin: 0;
        }
        .order-total-row {
          display: flex;
          justify-content: space-between;
          padding-top: 1rem;
          margin-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }
        .order-grand-total {
          font-size: 1.5rem;
          font-weight: 800;
          color: #10b981;
        }
        .shipping-address {
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 12px;
          color: #94a3b8;
        }
        .address-name {
          color: #f8fafc;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .status-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .status-btn {
          padding: 0.75rem 1rem;
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .status-btn.active {
          border-color: white;
          transform: scale(1.02);
        }
        .status-btn:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}
