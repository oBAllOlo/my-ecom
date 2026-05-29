"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, User, MapPin, Save, X, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  PageContainer,
  PageHeader,
  Card,
  Field,
  Input,
  Textarea,
  Button,
  Badge,
  Spinner,
} from "@/components/ui";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: {
      fullName: "",
      phone: "",
      street: "",
      district: "",
      subDistrict: "",
      province: "",
      postalCode: "",
    },
  });
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?._id) {
        try {
          const res = await fetch(`/api/users/${user._id}`);
          const data = await res.json();
          if (data.success) {
            setFormData({
              name: data.data.name || "",
              email: data.data.email || "",
              address: {
                fullName: data.data.address?.fullName || "",
                phone: data.data.address?.phone || "",
                street: data.data.address?.street || "",
                district: data.data.address?.district || "",
                subDistrict: data.data.address?.subDistrict || "",
                province: data.data.address?.province || "",
                postalCode: data.data.address?.postalCode || "",
              },
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    if (user) fetchUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, address: formData.address }),
      });
      const data = await res.json();
      if (data.success) toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
      else toast.error(data.error || "บันทึกข้อมูลไม่สำเร็จ");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setShowPasswordModal(false), 800);
      } else {
        toast.error(data.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setChangingPassword(false);
    }
  };

  const updateAddress = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));

  if (isLoading || !user) {
    return (
      <PageContainer>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="โปรไฟล์ของฉัน" subtitle="จัดการข้อมูลส่วนตัวและที่อยู่จัดส่ง" />

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-success/10 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-fg-subtle">สถานะบัญชี</p>
            <p className="font-semibold text-fg">Active</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-subtle text-brand">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs text-fg-subtle">ประเภทบัญชี</p>
            <p className="font-semibold uppercase text-fg">{user.role}</p>
          </div>
        </Card>
      </div>

      {/* Profile form */}
      <Card className="mb-6 p-6">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-fg">
          <User className="h-5 w-5 text-brand" /> ข้อมูลส่วนตัว
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex items-center gap-5 rounded-lg border border-line bg-bg-deep p-5">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-brand text-4xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-surface bg-success" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-fg">{user.name}</h3>
              <p className="mb-2 text-fg-muted">{user.email}</p>
              <Badge tone="brand" className="uppercase">{user.role}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="ชื่อ-นามสกุล">
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </Field>
            <Field label="อีเมล">
              <Input value={formData.email} disabled />
            </Field>
          </div>

          <h2 className="mb-4 mt-8 flex items-center gap-2 text-lg font-semibold text-fg">
            <MapPin className="h-5 w-5 text-brand" /> ที่อยู่จัดส่ง
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="ชื่อผู้รับ" className="sm:col-span-2">
              <Input
                value={formData.address.fullName}
                onChange={(e) => updateAddress("fullName", e.target.value)}
                placeholder="ชื่อ-นามสกุล ผู้รับ"
              />
            </Field>
            <Field label="เบอร์โทรศัพท์" className="sm:col-span-2">
              <Input
                value={formData.address.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) updateAddress("phone", value);
                }}
                maxLength={10}
                placeholder="08x-xxx-xxxx"
              />
            </Field>
            <Field label="ที่อยู่ (บ้านเลขที่, ซอย, ถนน)" className="sm:col-span-2">
              <Textarea
                value={formData.address.street}
                onChange={(e) => updateAddress("street", e.target.value)}
                rows={3}
                placeholder="บ้านเลขที่, ซอย, ถนน"
              />
            </Field>
            <Field label="เขต/อำเภอ">
              <Input value={formData.address.district} onChange={(e) => updateAddress("district", e.target.value)} />
            </Field>
            <Field label="แขวง/ตำบล">
              <Input value={formData.address.subDistrict} onChange={(e) => updateAddress("subDistrict", e.target.value)} />
            </Field>
            <Field label="จังหวัด">
              <Input value={formData.address.province} onChange={(e) => updateAddress("province", e.target.value)} />
            </Field>
            <Field label="รหัสไปรษณีย์">
              <Input value={formData.address.postalCode} onChange={(e) => updateAddress("postalCode", e.target.value)} />
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="primary" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold text-fg">
          <KeyRound className="h-5 w-5 text-brand" /> ความปลอดภัย
        </h2>
        <div className="flex items-center justify-between rounded-lg border border-line bg-bg-deep p-5">
          <div>
            <h4 className="font-semibold text-fg">เปลี่ยนรหัสผ่าน</h4>
            <p className="text-sm text-fg-subtle">ปกป้องบัญชีด้วยรหัสผ่านที่รัดกุม</p>
          </div>
          <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>
            เปลี่ยนรหัสผ่าน
          </Button>
        </div>
      </Card>

      {/* Password modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-fg">
                <KeyRound className="h-5 w-5 text-brand" /> เปลี่ยนรหัสผ่าน
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle hover:bg-white/5 hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
              <Field label="รหัสผ่านปัจจุบัน">
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </Field>
              <Field label="รหัสผ่านใหม่">
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={6}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
              </Field>
              <Field label="ยืนยันรหัสผ่านใหม่">
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </Field>
              <Button type="submit" variant="primary" disabled={changingPassword} className="mt-1 w-full">
                {changingPassword ? "กำลังเปลี่ยนรหัส..." : "เปลี่ยนรหัสผ่าน"}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
