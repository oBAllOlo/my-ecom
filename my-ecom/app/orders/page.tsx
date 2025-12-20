"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    image: string;
  };
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?._id) {
        try {
          const res = await fetch(`/api/orders?userId=${user._id}`);
          const data = await res.json();
          if (data.success) {
            setOrders(data.data);
          } else {
            setError("ไม่สามารถโหลดข้อมูลได้");
          }
        } catch (err) {
          console.error("Error fetching orders:", err);
          setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'รอชำระเงิน', bg: '#f59e0b', bgLight: 'rgba(245, 158, 11, 0.15)' };
      case 'processing':
        return { label: 'กำลังเตรียมสินค้า', bg: '#3b82f6', bgLight: 'rgba(59, 130, 246, 0.15)' };
      case 'shipped':
        return { label: 'จัดส่งแล้ว', bg: '#8b5cf6', bgLight: 'rgba(139, 92, 246, 0.15)' };
      case 'delivered':
        return { label: 'สำเร็จ', bg: '#10b981', bgLight: 'rgba(16, 185, 129, 0.15)' };
      default:
        return { label: 'ยกเลิก', bg: '#ef4444', bgLight: 'rgba(239, 68, 68, 0.15)' };
    }
  };

  if (isLoading || loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!user) return null;

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="admin-dashboard">
      {/* Background */}
      <div className="admin-bg-pattern"></div>

      <main className="admin-main" style={{ paddingTop: '2rem' }}>
        {/* Welcome Section */}
        <section className="admin-welcome">
          <div className="admin-welcome-content">
            <h2 className="admin-welcome-title">
              ประวัติการสั่งซื้อ 📦
            </h2>
            <p className="admin-welcome-subtitle">
              ติดตามสถานะและดูประวัติการสั่งซื้อทั้งหมดของคุณ
            </p>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div style={{
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444'
          }}>
            <span style={{ fontSize: '1.25rem' }}>⚠️</span>
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>📦</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>คำสั่งซื้อทั้งหมด</p>
              <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>{orders.length}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>รายการ</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>✅</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>สำเร็จแล้ว</p>
              <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>{completedOrders}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>ได้รับสินค้าแล้ว</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>⏳</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>รอดำเนินการ</p>
              <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>{pendingOrders}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>รอชำระ/จัดส่ง</p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>💰</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>ยอดรวมทั้งหมด</p>
              <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>฿{totalSpent.toLocaleString()}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>บาท</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <section className="admin-quick-actions">
          <div className="admin-section-header">
            <div className="admin-section-title">
              <span>🛒</span>
              <span>รายการคำสั่งซื้อ</span>
            </div>
          </div>

          {orders.length === 0 ? (
            <div style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                marginBottom: '1.5rem',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.3) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}>
                📦
              </div>
              <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                ยังไม่มีคำสั่งซื้อ
              </h3>
              <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '300px' }}>
                คุณยังไม่ได้ทำการสั่งซื้อสินค้า เริ่มช้อปปิ้งสินค้าที่คุณชื่นชอบได้เลย!
              </p>
              <Link
                href="/products"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
                }}
              >
                <span>🛍️</span>
                <span>เริ่มช้อปเลย</span>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <div
                    key={order._id}
                    className="admin-action-card"
                    style={{ padding: 0, overflow: 'hidden' }}
                  >
                    {/* Order Header */}
                    <div style={{
                      padding: '1.25rem 1.5rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: 'rgba(0, 0, 0, 0.2)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                            หมายเลขคำสั่งซื้อ
                          </p>
                          <p style={{ color: 'white', fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>
                            #{order._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                            วันที่สั่งซื้อ
                          </p>
                          <p style={{ color: '#94a3b8', fontWeight: 500 }}>
                            {new Date(order.createdAt).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                            ยอดรวม
                          </p>
                          <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: '1.25rem' }}>
                            ฿{order.total.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        background: statusConfig.bgLight,
                        color: statusConfig.bg,
                        border: `1px solid ${statusConfig.bg}30`
                      }}>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {order.items.slice(0, 5).map((item, index) => (
                          <div
                            key={index}
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              background: 'rgba(15, 23, 42, 0.5)',
                              border: '1px solid rgba(255, 255, 255, 0.05)'
                            }}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ))}
                        {order.items.length > 5 && (
                          <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '10px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#a78bfa',
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>
                            +{order.items.length - 5}
                          </div>
                        )}

                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{
                            color: '#64748b',
                            fontSize: '0.875rem'
                          }}>
                            {order.items.length} รายการ
                          </span>
                          <Link
                            href={`/tracking?order=${order._id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 1rem',
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                              borderRadius: '8px',
                              color: 'white',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              textDecoration: 'none',
                            }}
                          >
                            📦 ติดตามพัสดุ
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
