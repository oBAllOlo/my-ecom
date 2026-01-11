"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  // const { showToast } = useToast();
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

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
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

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/users/${user?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
      } else {
        toast.error(data.error || "บันทึกข้อมูลไม่สำเร็จ");
      }
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
          userId: user?._id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          setShowPasswordModal(false);
        }, 1000);
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative">
      <main className="p-8 max-w-4xl mx-auto">
        {/* Welcome Section */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            โปรไฟล์ของฉัน 👤
          </h2>
          <p className="text-slate-400">จัดการข้อมูลส่วนตัวและที่อยู่จัดส่ง</p>
        </section>

        {/* User Info Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6">
            <div
              className="d-flex align-items-center gap-3 py-4 px-4 rounded-4"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3 text-white fs-4"
                style={{
                  width: "48px",
                  height: "48px",
                  background: "rgba(255,255,255,0.2)",
                }}
              >
                ✅
              </div>
              <div>
                <p className="text-white-50 small mb-1">สถานะบัญชี</p>
                <p className="text-white fs-5 fw-bold mb-0">Active</p>
                <p className="text-white-50 small mb-0">บัญชีใช้งานปกติ</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div
              className="d-flex align-items-center gap-3 py-4 px-4 rounded-4"
              style={{
                background: "linear-gradient(135deg, #1C4D8D 0%, #0F2854 100%)",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3 text-white fs-4"
                style={{
                  width: "48px",
                  height: "48px",
                  background: "rgba(255,255,255,0.2)",
                }}
              >
                👤
              </div>
              <div>
                <p className="text-white-50 small mb-1">ประเภทบัญชี</p>
                <p className="text-white fs-5 fw-bold mb-0 text-uppercase">
                  {user.role}
                </p>
                <p className="text-white-50 small mb-0">สิทธิ์การใช้งาน</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form Section */}
        <section 
          className="mb-8"
          style={{
            background: "rgba(30, 41, 59, 0.5)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "1.5rem",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">✏️</span>
            <span className="text-white font-semibold text-lg">
              ข้อมูลส่วนตัว
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* User Avatar Card */}
            <div 
              className="rounded-xl p-6 mb-6 flex items-center gap-6"
              style={{
                background: "rgba(15, 23, 42, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.05)"
              }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg shadow-primary-500/40 relative">
                {user.name.charAt(0).toUpperCase()}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-800"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {user.name}
                </h3>
                <p className="text-slate-400 mb-2">{user.email}</p>
                <span className="inline-block py-1 px-3 bg-primary-500/20 text-primary-400 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="row g-3 mb-4">
              {/* Name Field */}
              <div className="col-12 col-md-6">
                <div className="h-full">
                  <label className="block text-slate-400 text-sm mb-2 font-medium">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white"
                    }}
                    className="w-full p-3 rounded-xl text-base outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder-slate-500"
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="col-12 col-md-6">
                <div className="h-full">
                  <label className="block text-slate-400 text-sm mb-2 font-medium">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "rgb(148, 163, 184)"
                    }}
                    className="w-full p-3 rounded-xl text-base outline-none cursor-not-allowed"
                  />
                  <p className="text-slate-500 text-xs mt-2">
                    ไม่สามารถเปลี่ยนอีเมลได้
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="flex items-center gap-2 mb-6 mt-8">
              <span className="text-2xl">📦</span>
              <span className="text-white font-semibold text-lg">
                ที่อยู่จัดส่ง
              </span>
            </div>

            <div className="row g-3">
              {/* 1. ชื่อผู้รับ */}
              <div className="col-12">
                <div className="mb-3">
                  <label className="block text-slate-400 text-sm mb-2 font-medium">
                    ชื่อผู้รับ
                  </label>
                  <input
                    type="text"
                    value={formData.address.fullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          fullName: e.target.value,
                        },
                      })
                    }
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white"
                    }}
                    className="w-full p-3 rounded-xl text-base outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder-slate-500"
                    placeholder="ชื่อ-นามสกุล ผู้รับ"
                  />
                </div>
              </div>

              {/* 2. เบอร์โทรศัพท์ */}
              <div className="col-12">
                <div className="mb-3">
                  <label className="block text-slate-400 text-sm mb-2 font-medium">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    value={formData.address.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setFormData({
                          ...formData,
                          address: { ...formData.address, phone: value },
                        });
                      }
                    }}
                    maxLength={10}
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white"
                    }}
                    className="w-full p-3 rounded-xl text-base outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder-slate-500"
                    placeholder="08x-xxx-xxxx"
                  />
                </div>
              </div>

              {/* 3. ที่อยู่ (บ้านเลขที่, ซอย, ถนน) */}
              <div className="col-12">
                <div className="mb-3">
                  <label className="block text-slate-400 text-sm mb-2 font-medium">
                    ที่อยู่ (บ้านเลขที่, ซอย, ถนน)
                  </label>
                  <textarea
                    value={formData.address.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          street: e.target.value,
                        },
                      })
                    }
                    rows={3}
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white"
                    }}
                    className="w-full p-3 rounded-xl text-base outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder-slate-500 resize-none"
                    placeholder="บ้านเลขที่, ซอย, ถนน"
                  />
                </div>
              </div>

              {/* 4. เขต/อำเภอ */}
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="block text-slate-400 text-sm mb-2 font-medium">
                    เขต/อำเภอ
                  </label>
                  <input
                    type="text"
                    value={formData.address.district}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          district: e.target.value,
                        },
                      })
                    }
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white"
                    }}
                    className="w-full p-3 rounded-xl text-base outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              {/* 5. แขวง/ตำบล */}
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="block text-slate-400 text-sm mb-2 font-medium">
                    แขวง/ตำบล
                  </label>
                  <input
                    type="text"
                    value={formData.address.subDistrict}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          subDistrict: e.target.value,
                        },
                      })
                    }
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white"
                    }}
                    className="w-full p-3 rounded-xl text-base outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              {/* 6. จังหวัด */}
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="block text-slate-400 text-sm mb-2 font-medium">
                    จังหวัด
                  </label>
                  <input
                    type="text"
                    value={formData.address.province}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          province: e.target.value,
                        },
                      })
                    }
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white"
                    }}
                    className="w-full p-3 rounded-xl text-base outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              {/* 7. รหัสไปรษณีย์ */}
              <div className="col-12 col-md-6">
                <div className="mb-3">
                  <label className="block text-slate-400 text-sm mb-2 font-medium">
                    รหัสไปรษณีย์
                  </label>
                  <input
                    type="text"
                    value={formData.address.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: {
                          ...formData.address,
                          postalCode: e.target.value,
                        },
                      })
                    }
                    style={{
                      background: "rgba(15, 23, 42, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white"
                    }}
                    className="w-full p-3 rounded-xl text-base outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className={`py-4 px-8 bg-gradient-to-r from-primary-500 to-primary-500 border-none rounded-xl text-white text-base font-semibold flex items-center gap-2 shadow-lg shadow-primary-500/30 transition-all ${
                  saving
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:-translate-y-0.5 hover:shadow-xl"
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>บันทึกการเปลี่ยนแปลง</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Security Section */}
        <section 
          className="mt-8"
          style={{
            background: "rgba(30, 41, 59, 0.5)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "1.5rem",
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🔐</span>
            <span className="text-white font-semibold text-lg">
              ความปลอดภัย
            </span>
          </div>

          <div 
            className="rounded-xl p-6 flex justify-between items-center"
            style={{
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.05)"
            }}
          >
            <div>
              <h4 className="text-white font-semibold mb-1">เปลี่ยนรหัสผ่าน</h4>
              <p className="text-slate-500 text-sm">
                ปกป้องบัญชีด้วยรหัสผ่านที่รัดกุม
              </p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="py-3 px-6 rounded-xl font-semibold cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "#60a5fa",
              }}
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </section>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white text-xl font-bold flex items-center gap-2">
                🔐 เปลี่ยนรหัสผ่าน
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="bg-none border-none text-slate-500 text-2xl cursor-pointer hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-slate-400 text-sm mb-2">
                  รหัสผ่านปัจจุบัน
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-base outline-none focus:border-primary-500/50 transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block text-slate-400 text-sm mb-2">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-base outline-none focus:border-primary-500/50 transition-colors placeholder:text-slate-600"
                />
              </div>

              <div className="mb-6">
                <label className="block text-slate-400 text-sm mb-2">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="w-full p-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-base outline-none focus:border-primary-500/50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className={`w-full py-4 bg-gradient-to-r from-primary-500 to-primary-500 border-none rounded-xl text-white text-base font-semibold transition-all ${
                  changingPassword
                    ? "opacity-70 cursor-not-allowed"
                    : "cursor-pointer hover:shadow-lg hover:shadow-primary-500/30"
                }`}
              >
                {changingPassword
                  ? "⏳ กำลังเปลี่ยนรหัส..."
                  : "🔒 เปลี่ยนรหัสผ่าน"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
