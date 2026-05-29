"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ShieldCheck, Users as UsersIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  PageHeader,
  Card,
  Badge,
  Select,
  Button,
  EmptyState,
  Spinner,
} from "@/components/ui";

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
    if (!isLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, isLoading, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchUsers();
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

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!user || user.role !== "admin") return null;

  return (
    <>
      <PageHeader title="จัดการผู้ใช้" subtitle={`${users.length} ผู้ใช้ทั้งหมด`} />

      {users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="ยังไม่มีผู้ใช้" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <Card key={u._id} className="flex flex-col items-center p-6 text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
                {u.name.charAt(0).toUpperCase()}
              </div>
              {u.role === "admin" ? (
                <Badge tone="warning" className="mb-3">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                </Badge>
              ) : (
                <Badge tone="neutral" className="mb-3">User</Badge>
              )}
              <h3 className="font-semibold text-fg">{u.name}</h3>
              <p className="text-sm text-fg-muted">{u.email}</p>
              <p className="mt-1 text-xs text-fg-subtle">สมัครเมื่อ {formatDate(u.createdAt)}</p>

              <div className="mt-5 flex w-full gap-2 border-t border-line pt-4">
                <Select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  disabled={u._id === user._id}
                  className="flex-1"
                >
                  <option value="user">ผู้ใช้ทั่วไป</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </Select>
                {u._id !== user._id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(u._id)}
                    className="text-danger hover:bg-danger/10 hover:text-danger"
                    aria-label="ลบผู้ใช้"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
