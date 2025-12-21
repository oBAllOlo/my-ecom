"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface OrderItem {
  productId: string | {
    _id: string;
    name: string;
    image: string;
  };
  name: string;
  price: number;
  image: string;
  images?: string[];
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
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "custom" | "regular">("all");

  // Helper function to check if order contains custom products
  const isCustomOrder = (order: Order) => {
    return order.items.some(item => {
      const productId = typeof item.productId === 'string' ? item.productId : item.productId?._id;
      return productId?.startsWith("custom-");
    });
  };

  // Filter orders based on category
  const filteredOrders = orders.filter(order => {
    if (categoryFilter === "all") return true;
    if (categoryFilter === "custom") return isCustomOrder(order);
    return !isCustomOrder(order);
  });

  const customOrdersCount = orders.filter(isCustomOrder).length;
  const regularOrdersCount = orders.length - customOrdersCount;

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
            showToast("ไม่สามารถโหลดข้อมูลได้", "error");
          }
        } catch (err) {
          console.error("Error fetching orders:", err);
          showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ", "error");
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, showToast]);

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
        <section style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>📦</span>
            <div>
              <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                ประวัติการสั่งซื้อ
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
                ติดตามสถานะและดูประวัติการสั่งซื้อทั้งหมดของคุณ
              </p>
            </div>
          </div>
        </section>




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
        <section style={{ width: '100%' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', fontSize: '1.1rem', fontWeight: 600 }}>
              <span>🛒</span>
              <span>รายการคำสั่งซื้อ</span>
            </div>
            
            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCategoryFilter("all")}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: categoryFilter === "all" 
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' 
                    : 'rgba(255,255,255,0.1)',
                  color: categoryFilter === "all" ? 'white' : '#94a3b8',
                  boxShadow: categoryFilter === "all" ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
                }}
              >
                📦 ทั้งหมด
                <span style={{ 
                  background: categoryFilter === "all" ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '20px',
                  fontSize: '0.75rem'
                }}>{orders.length}</span>
              </button>
              <button
                onClick={() => setCategoryFilter("custom")}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: categoryFilter === "custom" 
                    ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)' 
                    : 'rgba(255,255,255,0.1)',
                  color: categoryFilter === "custom" ? 'white' : '#94a3b8',
                  boxShadow: categoryFilter === "custom" ? '0 4px 12px rgba(168, 85, 247, 0.3)' : 'none'
                }}
              >
                🛠️ Custom
                <span style={{ 
                  background: categoryFilter === "custom" ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '20px',
                  fontSize: '0.75rem'
                }}>{customOrdersCount}</span>
              </button>
              <button
                onClick={() => setCategoryFilter("regular")}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: categoryFilter === "regular" 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                    : 'rgba(255,255,255,0.1)',
                  color: categoryFilter === "regular" ? 'white' : '#94a3b8',
                  boxShadow: categoryFilter === "regular" ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              >
                🛒 สินค้าทั่วไป
                <span style={{ 
                  background: categoryFilter === "regular" ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)', 
                  padding: '0.15rem 0.5rem', 
                  borderRadius: '20px',
                  fontSize: '0.75rem'
                }}>{regularOrdersCount}</span>
              </button>
            </div>
          </div>


          {filteredOrders.length === 0 ? (
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
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const isCustom = isCustomOrder(order);
                return (
                  <div
                    key={order._id}
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      background: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '12px',
                      border: isCustom ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                      width: '100%'
                    }}
                  >
                    {/* Order Row - Flexbox Layout */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      padding: '1rem 1.5rem',
                      background: 'rgba(0, 0, 0, 0.2)',
                    }}>
                      {/* Order ID */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(139, 92, 246, 0.15)',
                        borderRadius: '8px',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        minWidth: '130px'
                      }}>
                        <span style={{ fontSize: '0.9rem' }}>🧾</span>
                        <span style={{ color: '#a78bfa', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </div>

                      {/* Date */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        minWidth: '120px'
                      }}>
                        <span>📅</span>
                        <span>
                          {new Date(order.createdAt).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Price */}
                      <div style={{
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '8px',
                        minWidth: '90px',
                        textAlign: 'center'
                      }}>
                        <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.95rem' }}>
                          ฿{order.total.toLocaleString()}
                        </span>
                      </div>

                      {/* Status */}
                      <span style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: statusConfig.bg,
                        color: 'white',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        whiteSpace: 'nowrap',
                        minWidth: '140px'
                      }}>
                        {order.status === 'pending' && '⏳'}
                        {order.status === 'processing' && '📦'}
                        {order.status === 'shipped' && '🚚'}
                        {order.status === 'delivered' && '✅'}
                        {order.status === 'cancelled' && '❌'}
                        {statusConfig.label}
                      </span>

                      {/* Product Images + Count */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
                        {order.items.slice(0, 2).map((item, index) => {
                          const itemProductId = typeof item.productId === 'string' ? item.productId : item.productId?._id;
                          const isCustomItem = itemProductId?.startsWith("custom-");
                          return (
                          <div
                            key={index}
                            style={{
                              position: 'relative',
                              width: '150px',
                              height: '150px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              background: 'rgba(15, 23, 42, 0.5)',
                              border: isCustomItem ? '2px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                              flexShrink: 0
                            }}
                          >
                            {isCustomItem && item.images && item.images.length > 1 ? (
                              <>
                                {item.images.map((img, imgIdx) => (
                                  <img
                                    key={imgIdx}
                                    src={img}
                                    alt={`${item.name} layer ${imgIdx + 1}`}
                                    style={{
                                      position: 'absolute',
                                      inset: '8px',
                                      width: 'calc(100% - 16px)',
                                      height: 'calc(100% - 16px)',
                                      objectFit: 'contain',
                                      zIndex: imgIdx + 1
                                    }}
                                  />
                                ))}
                              </>
                            ) : (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block'
                                }}
                              />
                            )}
                          </div>
                          );
                        })}
                        {order.items.length > 2 && (
                          <span style={{
                            color: '#64748b',
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '4px'
                          }}>
                            +{order.items.length - 2}
                          </span>
                        )}
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={`/tracking?order=${order._id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.6rem 1rem',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          whiteSpace: 'nowrap',
                          minWidth: '120px'
                        }}
                      >
                        📍 ดูรายละเอียด
                      </Link>
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

