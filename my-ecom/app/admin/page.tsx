"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface Order {
  _id: string;
  userId: { name: string; email: string } | string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
    images?: string[];
  }>;
  total: number;
  status: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

interface ChartData {
  name: string;
  revenue: number;
  orders: number;
}

type TimeRange = "day" | "week" | "month" | "year";

// Shipping Settings Section Component
function ShippingSettingsSection() {
  const [shippingCost, setShippingCost] = useState(50);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1500);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/shipping");
        const data = await res.json();
        if (data.success) {
          setShippingCost(data.data.shippingCost);
          setFreeShippingThreshold(data.data.freeShippingThreshold);
        }
      } catch (error) {
        console.error("Error fetching shipping settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingCost, freeShippingThreshold }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: "✅ บันทึกการตั้งค่าเรียบร้อยแล้ว",
        });
      } else {
        setMessage({ type: "error", text: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch {
      setMessage({ type: "error", text: "ไม่สามารถบันทึกได้" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <section
        style={{
          background: "rgba(30, 41, 59, 0.5)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <p style={{ color: "#64748b", textAlign: "center" }}>กำลังโหลด...</p>
      </section>
    );
  }

  return (
    <section
      style={{
        background: "rgba(30, 41, 59, 0.5)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "1.5rem",
        marginBottom: "2rem",
      }}
    >
      <h3
        style={{
          color: "white",
          fontSize: "1.125rem",
          fontWeight: 600,
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span>🚚</span> ตั้งค่าค่าจัดส่ง
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Shipping Cost */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            style={{
              display: "block",
              color: "#94a3b8",
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
              minHeight: "2.5rem",
            }}
          >
            ค่าจัดส่งปกติ (บาท)
          </label>
          <input
            type="number"
            min="0"
            value={shippingCost || ""}
            onChange={(e) => setShippingCost(parseInt(e.target.value) || 0)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              background: "rgba(15, 23, 42, 0.5)",
              color: "white",
              fontSize: "1rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <p
            style={{
              color: "#64748b",
              fontSize: "0.75rem",
              marginTop: "0.25rem",
              minHeight: "1rem",
            }}
          >
            ตั้งเป็น 0 เพื่อส่งฟรีทุกออเดอร์
          </p>
        </div>

        {/* Free Shipping Threshold */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label
            style={{
              display: "block",
              color: "#94a3b8",
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
              minHeight: "2.5rem",
            }}
          >
            ยอดขั้นต่ำสำหรับส่งฟรี (บาท)
          </label>
          <input
            type="number"
            min="0"
            value={freeShippingThreshold || ""}
            onChange={(e) =>
              setFreeShippingThreshold(parseInt(e.target.value) || 0)
            }
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              background: "rgba(15, 23, 42, 0.5)",
              color: "white",
              fontSize: "1rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <p
            style={{
              color: "#64748b",
              fontSize: "0.75rem",
              marginTop: "0.25rem",
              minHeight: "1rem",
            }}
          >
            ลูกค้าสั่งซื้อถึงยอดนี้จะได้ส่งฟรี
          </p>
        </div>
      </div>

      {/* Preview */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          borderRadius: "10px",
          background: "rgba(139, 92, 246, 0.1)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
        }}
      >
        <p
          style={{
            color: "#a78bfa",
            fontSize: "0.875rem",
            marginBottom: "0.5rem",
          }}
        >
          👀 ตัวอย่างการแสดงผล:
        </p>
        <p style={{ color: "white", fontSize: "0.9rem" }}>
          ค่าจัดส่ง:{" "}
          <strong style={{ color: "#10b981" }}>
            ฿{shippingCost.toLocaleString()}
          </strong>
          {" | "}
          ส่งฟรีเมื่อสั่งขั้นต่ำ:{" "}
          <strong style={{ color: "#f59e0b" }}>
            ฿{freeShippingThreshold.toLocaleString()}
          </strong>
        </p>
      </div>

      {/* Save Button & Message */}
      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: "0.75rem 2rem",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
            color: "white",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.7 : 1,
            boxShadow: "0 4px 16px rgba(139, 92, 246, 0.3)",
          }}
        >
          {isSaving ? "⏳ กำลังบันทึก..." : "💾 บันทึกการตั้งค่า"}
        </button>
        {message && (
          <span
            style={{
              color: message.type === "success" ? "#10b981" : "#ef4444",
              fontSize: "0.875rem",
            }}
          >
            {message.text}
          </span>
        )}
      </div>
    </section>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [statusData, setStatusData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/orders"),
          fetch("/api/users"),
        ]);

        const products = await productsRes.json();
        const orders = await ordersRes.json();
        const users = await usersRes.json();

        const fetchedOrders: Order[] = orders.data || [];
        const allProducts: Product[] = products.data || [];

        setAllOrders(fetchedOrders);

        // Calculate total revenue
        const totalRevenue = fetchedOrders.reduce(
          (sum: number, order: Order) => sum + order.total,
          0
        );

        // Get recent orders (last 5)
        const sortedOrders = [...fetchedOrders].sort(
          (a: Order, b: Order) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentOrders(sortedOrders.slice(0, 5));

        // Get low stock products (stock < 10)
        const lowStock = allProducts.filter((p: Product) => p.stock < 10);
        setLowStockProducts(lowStock.slice(0, 5));

        // Order status distribution
        const statusCounts = {
          pending: fetchedOrders.filter((o: Order) => o.status === "pending")
            .length,
          processing: fetchedOrders.filter(
            (o: Order) => o.status === "processing"
          ).length,
          shipped: fetchedOrders.filter((o: Order) => o.status === "shipped")
            .length,
          delivered: fetchedOrders.filter(
            (o: Order) => o.status === "delivered"
          ).length,
          cancelled: fetchedOrders.filter(
            (o: Order) => o.status === "cancelled"
          ).length,
        };
        setStatusData([
          { name: "รอชำระ", value: statusCounts.pending, color: "#f59e0b" },
          {
            name: "กำลังจัด",
            value: statusCounts.processing,
            color: "#3b82f6",
          },
          { name: "จัดส่งแล้ว", value: statusCounts.shipped, color: "#8b5cf6" },
          { name: "สำเร็จ", value: statusCounts.delivered, color: "#10b981" },
          { name: "ยกเลิก", value: statusCounts.cancelled, color: "#ef4444" },
        ]);

        setStats({
          totalProducts: allProducts.length || 0,
          totalOrders: fetchedOrders.length || 0,
          totalUsers: users.data?.length || 0,
          pendingOrders: statusCounts.pending,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchStats();
    }
  }, [user]);

  // Generate chart data based on time range
  const chartData = useMemo(() => {
    const data: ChartData[] = [];
    const now = new Date();

    switch (timeRange) {
      case "day": {
        // Last 24 hours, group by hour
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now);
          hour.setHours(now.getHours() - i, 0, 0, 0);
          const hourEnd = new Date(hour);
          hourEnd.setHours(hour.getHours() + 1);

          const hourOrders = allOrders.filter((o: Order) => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= hour && orderDate < hourEnd;
          });
          const hourRevenue = hourOrders.reduce(
            (sum: number, o: Order) => sum + o.total,
            0
          );

          data.push({
            name: `${hour.getHours().toString().padStart(2, "0")}:00`,
            revenue: hourRevenue,
            orders: hourOrders.length,
          });
        }
        break;
      }
      case "week": {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(date.getDate() + 1);

          const dayOrders = allOrders.filter((o: Order) => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= date && orderDate < nextDate;
          });
          const dayRevenue = dayOrders.reduce(
            (sum: number, o: Order) => sum + o.total,
            0
          );

          data.push({
            name: date.toLocaleDateString("th-TH", { weekday: "long" }),
            revenue: dayRevenue,
            orders: dayOrders.length,
          });
        }
        break;
      }
      case "month": {
        // Last 30 days, group by day
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(date.getDate() + 1);

          const dayOrders = allOrders.filter((o: Order) => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= date && orderDate < nextDate;
          });
          const dayRevenue = dayOrders.reduce(
            (sum: number, o: Order) => sum + o.total,
            0
          );

          data.push({
            name: `${date.getDate()}/${date.getMonth() + 1}`,
            revenue: dayRevenue,
            orders: dayOrders.length,
          });
        }
        break;
      }
      case "year": {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const month = new Date(now);
          month.setMonth(now.getMonth() - i);
          month.setDate(1);
          month.setHours(0, 0, 0, 0);
          const nextMonth = new Date(month);
          nextMonth.setMonth(month.getMonth() + 1);

          const monthOrders = allOrders.filter((o: Order) => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= month && orderDate < nextMonth;
          });
          const monthRevenue = monthOrders.reduce(
            (sum: number, o: Order) => sum + o.total,
            0
          );

          data.push({
            name: month.toLocaleDateString("th-TH", { month: "short" }),
            revenue: monthRevenue,
            orders: monthOrders.length,
          });
        }
        break;
      }
    }

    return data;
  }, [allOrders, timeRange]);

  // Calculate filtered stats for selected time range - MUST be before conditional returns
  const filteredStats = useMemo(() => {
    const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);
    return { totalRevenue, totalOrders };
  }, [chartData]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; bg: string; color: string }
    > = {
      pending: {
        label: "รอชำระ",
        bg: "rgba(245, 158, 11, 0.2)",
        color: "#f59e0b",
      },
      processing: {
        label: "กำลังจัด",
        bg: "rgba(59, 130, 246, 0.2)",
        color: "#3b82f6",
      },
      shipped: {
        label: "จัดส่งแล้ว",
        bg: "rgba(139, 92, 246, 0.2)",
        color: "#8b5cf6",
      },
      delivered: {
        label: "สำเร็จ",
        bg: "rgba(16, 185, 129, 0.2)",
        color: "#10b981",
      },
      cancelled: {
        label: "ยกเลิก",
        bg: "rgba(239, 68, 68, 0.2)",
        color: "#ef4444",
      },
    };
    return statusConfig[status] || statusConfig.pending;
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

  const statCards = [
    {
      title: "สินค้าทั้งหมด",
      value: stats.totalProducts,
      icon: "📦",
      gradient: "admin-stat-blue",
      link: "/admin/products",
      description: "รายการสินค้าในระบบ",
    },
    {
      title: "คำสั่งซื้อทั้งหมด",
      value: stats.totalOrders,
      icon: "🛒",
      gradient: "admin-stat-green",
      link: "/admin/orders",
      description: "ออเดอร์ที่ได้รับ",
    },
    {
      title: "รอดำเนินการ",
      value: stats.pendingOrders,
      icon: "⏳",
      gradient: "admin-stat-orange",
      link: "/admin/orders?status=pending",
      description: "ต้องจัดการ",
    },
    {
      title: "ผู้ใช้ทั้งหมด",
      value: stats.totalUsers,
      icon: "👥",
      gradient: "admin-stat-purple",
      link: "/admin/users",
      description: "สมาชิกในระบบ",
    },
  ];

  const quickActions = [
    {
      title: "จัดการสินค้า",
      description: "เพิ่ม แก้ไข ลบสินค้า",
      icon: "📦",
      link: "/admin/products",
      color: "admin-action-blue",
    },
    {
      title: "จัดการหมวดหมู่",
      description: "เพิ่ม แก้ไข ลบหมวดหมู่",
      icon: "🏷️",
      link: "/admin/categories",
      color: "admin-action-orange",
    },
    {
      title: "จัดการคำสั่งซื้อ",
      description: "ดูและอัปเดตสถานะ",
      icon: "🛒",
      link: "/admin/orders",
      color: "admin-action-green",
    },
    {
      title: "จัดการผู้ใช้",
      description: "ดูและแก้ไขผู้ใช้",
      icon: "👥",
      link: "/admin/users",
      color: "admin-action-purple",
    },
    {
      title: "จัดการชิ้นส่วน Custom",
      description: "สต็อกคีย์บอร์ด Custom",
      icon: "🔧",
      link: "/admin/custom-parts",
      color: "admin-action-cyan",
    },
  ];

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: "day", label: "วันนี้" },
    { value: "week", label: "7 วัน" },
    { value: "month", label: "30 วัน" },
    { value: "year", label: "12 เดือน" },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          <p style={{ color: "#a78bfa", fontWeight: 600, marginBottom: "8px" }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              {entry.dataKey === "revenue" ? "💰 รายได้: " : "📦 ออเดอร์: "}
              <span style={{ color: "white", fontWeight: 600 }}>
                {entry.dataKey === "revenue"
                  ? `฿${entry.value.toLocaleString()}`
                  : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // filteredStats is now defined before conditional returns (at the top with other hooks)

  return (
    <div className="admin-dashboard">
      {/* Animated Background */}
      <div className="admin-bg-pattern"></div>

      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <span style={{ fontSize: "2rem" }}>⚙️</span>
              <div>
                <h1
                  style={{
                    color: "white",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Admin Panel
                </h1>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.75rem",
                    margin: "0.1rem 0 0",
                  }}
                >
                  Custom Keyboard System
                </p>
              </div>
            </div>
          </div>
          <div className="admin-header-right">
            <div className="admin-datetime">
              <span className="admin-time">{formatTime(currentTime)}</span>
              <span className="admin-date">{formatDate(currentTime)}</span>
            </div>
            <div className="admin-user-info">
              <div className="admin-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="admin-user-details">
                <span className="admin-user-name">{user.name}</span>
                <span className="admin-user-role">Administrator</span>
              </div>
            </div>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "rgba(139, 92, 246, 0.2)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                borderRadius: "10px",
                color: "#a78bfa",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              <span>🏠</span>
              <span>กลับหน้าร้าน</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Welcome Section */}
        <section style={{ marginBottom: "2rem" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <span style={{ fontSize: "2rem" }}>👋</span>
            <div>
              <h2
                style={{
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                ยินดีต้อนรับ, {user.name}!
              </h2>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                  margin: "0.25rem 0 0",
                }}
              >
                นี่คือภาพรวมของร้านค้าในวันนี้
              </p>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="admin-stats-section">
          <div className="admin-stats-grid">
            {statCards.map((card, index) => (
              <Link
                key={card.title}
                href={card.link}
                className={`admin-stat-card ${card.gradient}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="admin-stat-icon">{card.icon}</div>
                <div className="admin-stat-info">
                  <span className="admin-stat-title">{card.title}</span>
                  <span className="admin-stat-value">{card.value}</span>
                  <span className="admin-stat-desc">{card.description}</span>
                </div>
                <div className="admin-stat-arrow">→</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Revenue Card */}
        <section style={{ marginBottom: "2rem" }}>
          <div
            className="admin-revenue-card"
            style={{
              background:
                "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
              borderRadius: "20px",
              padding: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 8px 32px rgba(16, 185, 129, 0.3)",
            }}
          >
            <div>
              <p
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem",
                }}
              >
                💰 รายได้รวมทั้งหมด
              </p>
              <p
                style={{ color: "white", fontSize: "2.5rem", fontWeight: 700 }}
              >
                ฿{stats.totalRevenue.toLocaleString()}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.875rem",
                  marginTop: "0.5rem",
                }}
              >
                จากคำสั่งซื้อทั้งหมด {stats.totalOrders} รายการ
              </p>
            </div>
            <div style={{ fontSize: "4rem" }}>📊</div>
          </div>
        </section>

        {/* Time Range Selector */}
        <section
          style={{
            background: "rgba(30, 41, 59, 0.5)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
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
            <div>
              <h3
                style={{
                  color: "white",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>📈</span> สรุปยอดขาย
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.875rem",
                  marginTop: "0.25rem",
                }}
              >
                รายได้ ฿{filteredStats.totalRevenue.toLocaleString()} |{" "}
                {filteredStats.totalOrders} ออเดอร์
              </p>
            </div>
            <div
              className="admin-time-buttons"
              style={{ display: "flex", gap: "0.5rem" }}
            >
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  style={{
                    padding: "0.625rem 1.25rem",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background:
                      timeRange === option.value
                        ? "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                        : "rgba(255, 255, 255, 0.05)",
                    color: timeRange === option.value ? "white" : "#94a3b8",
                    boxShadow:
                      timeRange === option.value
                        ? "0 4px 16px rgba(139, 92, 246, 0.3)"
                        : "none",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <div className="admin-charts-grid" style={{ marginBottom: "2rem" }}>
          {/* Revenue Chart */}
          <section
            style={{
              background: "rgba(30, 41, 59, 0.5)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                color: "white",
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>💰</span> กราฟรายได้
            </h3>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={9}
                    interval="preserveStartEnd"
                    angle={-45}
                    textAnchor="end"
                    height={50}
                    tick={{ fill: "#64748b" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `฿${(value / 1000).toFixed(0)}k`
                        : `฿${value}`
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Order Status Pie Chart */}
          <section
            style={{
              background: "rgba(30, 41, 59, 0.5)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                color: "white",
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>🎯</span> สถานะออเดอร์
            </h3>
            <div style={{ height: "200px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData
                      .filter((d) => d.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              {statusData
                .filter((d) => d.value > 0)
                .map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: item.color,
                      }}
                    ></div>
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
            </div>
          </section>
        </div>

        {/* Orders Bar Chart */}
        <section
          style={{
            background: "rgba(30, 41, 59, 0.5)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          <h3
            style={{
              color: "white",
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>📊</span> จำนวนออเดอร์
          </h3>
          <div style={{ height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={9}
                  interval="preserveStartEnd"
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  tick={{ fill: "#64748b" }}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Two Column Layout for Recent Orders and Low Stock */}
        <div className="admin-two-column" style={{ marginBottom: "2rem" }}>
          {/* Recent Orders */}
          <section
            style={{
              background: "rgba(30, 41, 59, 0.5)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  color: "white",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>📋</span> ออเดอร์ล่าสุด
              </h3>
              <Link
                href="/admin/orders"
                style={{
                  color: "#8b5cf6",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                ดูทั้งหมด →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p
                style={{
                  color: "#64748b",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                ยังไม่มีคำสั่งซื้อ
              </p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {recentOrders.map((order) => {
                  const statusBadge = getStatusBadge(order.status);
                  return (
                    <Link
                      href={`/admin/orders?id=${order._id}`}
                      key={order._id}
                      style={{
                        background: "rgba(15, 23, 42, 0.5)",
                        borderRadius: "12px",
                        padding: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        textDecoration: "none",
                        transition: "all 0.2s",
                        border: "1px solid transparent",
                      }}
                      className="hover:border-violet-500/30 hover:bg-slate-800/80"
                    >
                      {/* Product Image */}
                      <div
                        style={{
                          position: "relative",
                          flexShrink: 0,
                          width: "48px",
                          height: "48px",
                        }}
                      >
                        {/* Check if first item has multiple images (custom product) */}
                        {order.items?.[0]?.images &&
                        order.items[0].images.length > 1 ? (
                          <div
                            style={{
                              position: "relative",
                              width: "100%",
                              height: "100%",
                              borderRadius: "8px",
                              overflow: "hidden",
                              background: "#334155",
                            }}
                          >
                            {order.items[0].images.map((img, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={img}
                                alt={`${order.items?.[0]?.name} layer ${
                                  imgIdx + 1
                                }`}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                  zIndex: imgIdx + 1,
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <img
                            src={order.items?.[0]?.image || "/placeholder.png"}
                            alt={order.items?.[0]?.name || "Product"}
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "8px",
                              objectFit: "cover",
                              background: "#334155",
                            }}
                          />
                        )}
                        {order.items?.length > 1 && (
                          <span
                            style={{
                              position: "absolute",
                              top: "-4px",
                              right: "-4px",
                              background: "#8b5cf6",
                              color: "white",
                              fontSize: "10px",
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              zIndex: 10,
                            }}
                          >
                            +{order.items.length - 1}
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            margin: 0,
                          }}
                        >
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "0.75rem",
                            margin: "0.25rem 0 0",
                          }}
                        >
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            color: "#a78bfa",
                            fontWeight: 700,
                            margin: 0,
                          }}
                        >
                          ฿{order.total.toLocaleString()}
                        </p>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "6px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            marginTop: "0.25rem",
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Low Stock Alert */}
          <section
            style={{
              background: "rgba(30, 41, 59, 0.5)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  color: "white",
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span>⚠️</span> สินค้าใกล้หมด
              </h3>
              <Link
                href="/admin/products"
                style={{
                  color: "#8b5cf6",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                จัดการ →
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <div
                style={{
                  color: "#10b981",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                <span style={{ fontSize: "2rem" }}>✅</span>
                <p style={{ marginTop: "0.5rem" }}>
                  สินค้าทั้งหมดมี Stock เพียงพอ
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {lowStockProducts.map((product) => (
                  <Link
                    href={`/admin/products`} // Ideally specific product edit link if available
                    key={product._id}
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      borderRadius: "12px",
                      padding: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      textDecoration: "none",
                      transition: "all 0.2s",
                      border: "1px solid transparent",
                    }}
                    className="hover:border-violet-500/30 hover:bg-slate-800/80"
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        background: "#1e293b",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: "white",
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          // Removed whiteSpace: nowrap to allow wrapping on mobile
                          lineHeight: "1.4",
                        }}
                      >
                        {product.name}
                      </p>
                      <p style={{ color: "#64748b", fontSize: "0.75rem" }}>
                        ฿{product.price.toLocaleString()}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "6px",
                        background:
                          product.stock <= 3
                            ? "rgba(239, 68, 68, 0.2)"
                            : "rgba(245, 158, 11, 0.2)",
                        color: product.stock <= 3 ? "#ef4444" : "#f59e0b",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      เหลือ {product.stock}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Quick Actions */}
        <section className="admin-actions-section">
          <h3
            style={{
              color: "white",
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>🚀</span> จัดการร้านค้า
          </h3>
          <div className="admin-actions-grid">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                href={action.link}
                className={`admin-action-card ${action.color}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="admin-action-icon">{action.icon}</div>
                <div className="admin-action-content">
                  <h4>{action.title}</h4>
                  <p>{action.description}</p>
                </div>
                <div className="admin-action-hover">
                  <span>เปิด</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Shipping Settings */}
        <ShippingSettingsSection />

        {/* System Status */}
        <section className="admin-recent-section">
          <h3
            style={{
              color: "white",
              fontSize: "1.125rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>🔧</span> สรุปสถานะระบบ
          </h3>
          <div className="admin-system-status">
            <div className="admin-status-card">
              <div className="admin-status-indicator online"></div>
              <div className="admin-status-info">
                <span className="admin-status-label">Database</span>
                <span className="admin-status-value">Connected</span>
              </div>
            </div>
            <div className="admin-status-card">
              <div className="admin-status-indicator online"></div>
              <div className="admin-status-info">
                <span className="admin-status-label">API Server</span>
                <span className="admin-status-value">Running</span>
              </div>
            </div>
            <div className="admin-status-card">
              <div className="admin-status-indicator online"></div>
              <div className="admin-status-info">
                <span className="admin-status-label">Authentication</span>
                <span className="admin-status-value">Active</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
