"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

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
        setUsers(
          users.map((u) =>
            u._id === userId ? { ...u, role: newRole as "user" | "admin" } : u
          )
        );
        toast.success(`เปลี่ยนบทบาทเป็น ${newRole === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"} สำเร็จ`);
      } else {
        toast.error(data.error || "ไม่สามารถเปลี่ยนบทบาทได้");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("ต้องการลบผู้ใช้นี้หรือไม่?")) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u._id !== userId));
        toast.success("ลบผู้ใช้สำเร็จ");
      } else {
        toast.error(data.error || "ไม่สามารถลบผู้ใช้ได้");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
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
      <div className="admin-loading flex items-center justify-center min-h-screen bg-slate-900">
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
    <div className="admin-dashboard min-h-screen bg-slate-900 relative">
      {/* Admin Header */}
      <header className="admin-header bg-slate-800/50 border-b border-white/5 px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <Link
            href="/admin"
            className="text-violet-400 no-underline font-medium py-2 px-3 md:px-4 bg-violet-500/10 rounded-lg hover:bg-violet-500/20 transition-all text-sm md:text-base"
          >
            ← กลับ
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-2xl md:text-4xl">👥</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-50 m-0">
                จัดการผู้ใช้
              </h1>
              <p className="text-xs md:text-sm text-slate-500 m-0">
                {users.length} ผู้ใช้ทั้งหมด
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8">
        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 md:gap-6">
          {users.map((u, index) => (
            <div
              key={u._id}
              className="bg-slate-800/50 border border-violet-500/20 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/20 animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-gradient-to-br from-violet-500/30 to-indigo-500/20 p-8 flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-4xl font-extrabold text-white shadow-lg shadow-violet-500/40">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`py-2 px-4 rounded-full text-sm font-semibold ${
                    u.role === "admin"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  {u.role === "admin" ? "👑 Admin" : "👤 User"}
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-slate-50 mb-2">
                  {u.name}
                </h3>
                <p className="text-slate-500 text-sm mb-2">{u.email}</p>
                <p className="text-slate-600 text-xs">
                  สมัครเมื่อ {formatDate(u.createdAt)}
                </p>
              </div>
              <div className="p-6 border-t border-white/5 flex gap-3">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  disabled={u._id === user._id}
                  className="flex-1 py-3 px-4 bg-violet-500/10 border border-violet-500/30 rounded-xl text-slate-50 font-medium cursor-pointer transition-all hover:border-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="user" className="bg-slate-800">
                    ผู้ใช้ทั่วไป
                  </option>
                  <option value="admin" className="bg-slate-800">
                    ผู้ดูแลระบบ
                  </option>
                </select>
                {u._id !== user._id && (
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="py-3 px-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-semibold cursor-pointer transition-all hover:bg-red-500/20 hover:border-red-500/50 hover:scale-105"
                  >
                    🗑️ ลบ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <span className="text-6xl block mb-4">👥</span>
            <p>ยังไม่มีผู้ใช้</p>
          </div>
        )}
      </main>
    </div>
  );
}
