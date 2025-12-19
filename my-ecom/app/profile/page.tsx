"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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
      province: "",
      postalCode: "",
    },
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });

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
    setMessage({ type: "", content: "" });

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
        setMessage({ type: "success", content: "บันทึกข้อมูลเรียบร้อยแล้ว" });
      } else {
        setMessage({ type: "error", content: data.error || "บันทึกข้อมูลไม่สำเร็จ" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", content: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner"></div>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Background */}
      <div className="admin-bg-pattern"></div>

      <main className="admin-main" style={{ paddingTop: '2rem' }}>
        {/* Welcome Section */}
        <section className="admin-welcome">
          <div className="admin-welcome-content">
            <h2 className="admin-welcome-title">
              โปรไฟล์ของฉัน 👤
            </h2>
            <p className="admin-welcome-subtitle">
              จัดการข้อมูลส่วนตัวและที่อยู่จัดส่ง
            </p>
          </div>
        </section>

        {/* User Info Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
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
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>สถานะบัญชี</p>
              <p style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700 }}>Active</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>บัญชีใช้งานปกติ</p>
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
            }}>👤</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>ประเภทบัญชี</p>
              <p style={{ color: 'white', fontSize: '1.25rem', fontWeight: 700, textTransform: 'uppercase' }}>{user.role}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>สิทธิ์การใช้งาน</p>
            </div>
          </div>
        </div>

        {/* Profile Form Section */}
        <section className="admin-quick-actions">
          <div className="admin-section-header">
            <div className="admin-section-title">
              <span>✏️</span>
              <span>ข้อมูลส่วนตัว</span>
            </div>
          </div>

          {/* Message */}
          {message.content && (
            <div style={{
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: message.type === 'success' ? '#10b981' : '#ef4444'
            }}>
              <span style={{ fontSize: '1.25rem' }}>{message.type === 'success' ? '✅' : '❌'}</span>
              <span style={{ fontWeight: 500 }}>{message.content}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="admin-actions-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {/* User Avatar Card */}
              <div className="admin-action-card" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '2rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                  position: 'relative'
                }}>
                  {user.name.charAt(0).toUpperCase()}
                  <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '24px',
                    height: '24px',
                    background: '#10b981',
                    borderRadius: '50%',
                    border: '4px solid #1e293b'
                  }}></div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{user.name}</h3>
                  <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{user.email}</p>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#a78bfa',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}>{user.role}</span>
                </div>
              </div>

              {/* Name Field */}
              <div className="admin-action-card" style={{ padding: '1.5rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              {/* Email Field */}
              <div className="admin-action-card" style={{ padding: '1.5rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                  อีเมล
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(15, 23, 42, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    color: '#64748b',
                    fontSize: '1rem',
                    cursor: 'not-allowed'
                  }}
                />
                <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>ไม่สามารถเปลี่ยนอีเมลได้</p>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="admin-section-header" style={{ marginTop: '2rem' }}>
              <div className="admin-section-title">
                <span>📦</span>
                <span>ที่อยู่จัดส่ง</span>
              </div>
            </div>

            <div className="admin-actions-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="admin-action-card" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                  ชื่อผู้รับ
                </label>
                <input
                  type="text"
                  value={formData.address.fullName}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, fullName: e.target.value } })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  placeholder="ชื่อ-นามสกุล ผู้รับ"
                />
              </div>

              <div className="admin-action-card" style={{ padding: '1.5rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  value={formData.address.phone}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, phone: e.target.value } })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  placeholder="08x-xxx-xxxx"
                />
              </div>

              <div className="admin-action-card" style={{ padding: '1.5rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                  แขวง/ตำบล
                </label>
                <input
                  type="text"
                  value={formData.address.district}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, district: e.target.value } })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div className="admin-action-card" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                  ที่อยู่ (บ้านเลขที่, ซอย, ถนน)
                </label>
                <textarea
                  value={formData.address.street}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                  placeholder="บ้านเลขที่, ซอย, ถนน"
                />
              </div>

              <div className="admin-action-card" style={{ padding: '1.5rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                  จังหวัด
                </label>
                <input
                  type="text"
                  value={formData.address.province}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, province: e.target.value } })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div className="admin-action-card" style={{ padding: '1.5rem' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                  รหัสไปรษณีย์
                </label>
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postalCode: e.target.value } })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
                }}
              >
                {saving ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
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
        <section className="admin-quick-actions" style={{ marginTop: '2rem' }}>
          <div className="admin-section-header">
            <div className="admin-section-title">
              <span>🔐</span>
              <span>ความปลอดภัย</span>
            </div>
          </div>

          <div className="admin-action-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '0.25rem' }}>เปลี่ยนรหัสผ่าน</h4>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>ปกป้องบัญชีด้วยรหัสผ่านที่รัดกุม</p>
            </div>
            <button style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 500,
              cursor: 'pointer'
            }}>
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
