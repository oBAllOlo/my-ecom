"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole as "user" | "admin" } : u)));
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("ต้องการลบผู้ใช้นี้หรือไม่?")) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u._id !== userId));
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
              <span className="admin-page-icon">👥</span>
              <div>
                <h1>จัดการผู้ใช้</h1>
                <p>{users.length} ผู้ใช้ทั้งหมด</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="admin-main">
        {/* Users Grid */}
        <div className="users-grid">
          {users.map((u, index) => (
            <div 
              key={u._id} 
              className="user-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="user-card-header">
                <div className="user-avatar-large">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-role-badge" data-role={u.role}>
                  {u.role === "admin" ? "👑 Admin" : "👤 User"}
                </div>
              </div>
              <div className="user-card-body">
                <h3 className="user-name">{u.name}</h3>
                <p className="user-email">{u.email}</p>
                <p className="user-date">สมัครเมื่อ {formatDate(u.createdAt)}</p>
              </div>
              <div className="user-card-actions">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  disabled={u._id === user._id}
                  className="role-select"
                >
                  <option value="user">ผู้ใช้ทั่วไป</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
                {u._id !== user._id && (
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="delete-btn"
                  >
                    🗑️ ลบ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="admin-empty-state">
            <span className="empty-icon">👥</span>
            <p>ยังไม่มีผู้ใช้</p>
          </div>
        )}
      </main>

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
        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .user-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          animation: fadeInUp 0.6s ease forwards;
          opacity: 0;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .user-card:hover {
          transform: translateY(-8px);
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 25px 50px -12px rgba(139, 92, 246, 0.3);
        }
        .user-card-header {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 100%);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          position: relative;
        }
        .user-avatar-large {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
        }
        .user-role-badge {
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .user-role-badge[data-role="admin"] {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
        }
        .user-role-badge[data-role="user"] {
          background: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }
        .user-card-body {
          padding: 1.5rem;
          text-align: center;
        }
        .user-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0 0 0.5rem 0;
        }
        .user-email {
          color: #64748b;
          font-size: 0.9rem;
          margin: 0 0 0.5rem 0;
        }
        .user-date {
          color: #475569;
          font-size: 0.8rem;
          margin: 0;
        }
        .user-card-actions {
          padding: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          gap: 0.75rem;
        }
        .role-select {
          flex: 1;
          padding: 0.75rem 1rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          color: #f8fafc;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .role-select:hover:not(:disabled) {
          border-color: rgba(139, 92, 246, 0.5);
        }
        .role-select:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .role-select option {
          background: #1e293b;
          color: #f8fafc;
        }
        .delete-btn {
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #f87171;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.5);
          transform: scale(1.05);
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
      `}</style>
    </div>
  );
}
