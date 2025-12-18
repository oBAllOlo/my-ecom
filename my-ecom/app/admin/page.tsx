"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

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

        setStats({
          totalProducts: products.data?.length || 0,
          totalOrders: orders.data?.length || 0,
          totalUsers: users.data?.length || 0,
          pendingOrders: orders.data?.filter((o: { status: string }) => o.status === "pending")?.length || 0,
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

  return (
    <div className="admin-dashboard">
      {/* Animated Background */}
      <div className="admin-bg-pattern"></div>

      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <div className="admin-logo">
              <span className="admin-logo-icon">⚙️</span>
              <div>
                <h1>Admin Panel</h1>
                <p>KeyBoardTH Management</p>
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
            <Link href="/" className="admin-back-btn">
              <span>🏠</span>
              <span>กลับหน้าร้าน</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Welcome Section */}
        <section className="admin-welcome">
          <div className="admin-welcome-content">
            <h2>ยินดีต้อนรับ, {user.name}! 👋</h2>
            <p>นี่คือภาพรวมของร้านค้าในวันนี้</p>
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

        {/* Quick Actions */}
        <section className="admin-actions-section">
          <h3 className="admin-section-title">
            <span className="admin-section-icon">🚀</span>
            จัดการร้านค้า
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

        {/* Recent Activity Placeholder */}
        <section className="admin-recent-section">
          <h3 className="admin-section-title">
            <span className="admin-section-icon">📊</span>
            สรุปสถานะระบบ
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
