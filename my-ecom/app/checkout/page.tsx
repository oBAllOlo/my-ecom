"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { formatPrice } from "@/lib/mockData";

declare global {
  interface Window {
    Omise: {
      setPublicKey: (key: string) => void;
      createToken: (
        type: string,
        data: Record<string, string>,
        callback: (
          statusCode: number,
          response: { id?: string; message?: string }
        ) => void
      ) => void;
    };
    OmiseCard: {
      configure: (config: Record<string, unknown>) => void;
      open: (config: Record<string, unknown>) => void;
    };
  }
}

type PaymentMethodType = "card";

interface CardFormData {
  number: string;
  name: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

interface Province {
  id: number;
  name_th: string;
}

interface District {
  id: number;
  name_th: string;
  province_id: number;
}

interface SubDistrict {
  id: number;
  name_th: string;
  district_id: number;
  zip_code: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  // const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("card");
  const [selectedBank, setSelectedBank] = useState("scb");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [omiseLoaded, setOmiseLoaded] = useState(false);

  // Thai address data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [subDistricts, setSubDistricts] = useState<SubDistrict[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [filteredSubDistricts, setFilteredSubDistricts] = useState<
    SubDistrict[]
  >([]);

  const [cardForm, setCardForm] = useState<CardFormData>({
    number: "",
    name: "",
    expMonth: "",
    expYear: "",
    cvv: "",
  });

  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    street: "",
    district: "",
    districtId: 0,
    subDistrict: "",
    province: "",
    provinceId: 0,
    postalCode: "",
  });

  // Shipping settings from API
  const [shippingSettings, setShippingSettings] = useState({
    shippingCost: 50,
    freeShippingThreshold: 1500,
  });

  const subtotal = getCartTotal();
  const shipping =
    subtotal >= shippingSettings.freeShippingThreshold
      ? 0
      : shippingSettings.shippingCost;
  const amountForFreeShipping =
    subtotal >= shippingSettings.freeShippingThreshold
      ? 0
      : shippingSettings.freeShippingThreshold - subtotal;
  const total = subtotal + shipping;

  // Fetch shipping settings from API
  useEffect(() => {
    const fetchShippingSettings = async () => {
      try {
        const res = await fetch("/api/settings/shipping");
        const data = await res.json();
        if (data.success) {
          setShippingSettings(data.data);
        }
      } catch (error) {
        console.error("Error fetching shipping settings:", error);
      }
    };
    fetchShippingSettings();
  }, []);

  // Fetch Thai address data
  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const [provRes, distRes, subDistRes] = await Promise.all([
          fetch(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/province.json"
          ),
          fetch(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/district.json"
          ),
          fetch(
            "https://raw.githubusercontent.com/kongvut/thai-province-data/refs/heads/master/api/latest/sub_district.json"
          ),
        ]);
        const provData = await provRes.json();
        const distData = await distRes.json();
        const subDistData = await subDistRes.json();
        setProvinces(provData);
        setDistricts(distData);
        setSubDistricts(subDistData);
      } catch (error) {
        console.error("Error fetching address data:", error);
      }
    };
    fetchAddressData();
  }, []);

  // Filter districts when province changes
  useEffect(() => {
    if (shippingForm.provinceId > 0) {
      const filtered = districts.filter(
        (d) => d.province_id === shippingForm.provinceId
      );
      setFilteredDistricts(filtered);
    } else {
      setFilteredDistricts([]);
    }
    // Reset subdistricts when province changes
    setFilteredSubDistricts([]);
  }, [shippingForm.provinceId, districts]);

  // Filter subdistricts when district changes
  useEffect(() => {
    if (shippingForm.districtId > 0) {
      const filtered = subDistricts.filter(
        (s) => s.district_id === shippingForm.districtId
      );
      setFilteredSubDistricts(filtered);
    } else {
      setFilteredSubDistricts([]);
    }
  }, [shippingForm.districtId, subDistricts]);

  // Pre-fill form with user data and fetch saved address
  useEffect(() => {
    if (user) {
      // First set basic user info
      setShippingForm((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
      }));

      // Fetch saved address from API
      const fetchSavedAddress = async () => {
        try {
          const res = await fetch(`/api/users/address?userId=${user._id}`);
          const data = await res.json();

          if (data.success && data.data.address) {
            const addr = data.data.address;
            setShippingForm((prev) => ({
              ...prev,
              phone: addr.phone || prev.phone,
              street: addr.street || prev.street,
              district: addr.district || prev.district,
              subDistrict: addr.subDistrict || prev.subDistrict,
              province: addr.province || prev.province,
              postalCode: addr.postalCode || prev.postalCode,
            }));

            // Find province ID to load districts
            const matchedProvince = provinces.find(
              (p) => p.name_th === addr.province
            );
            if (matchedProvince) {
              setShippingForm((prev) => ({
                ...prev,
                provinceId: matchedProvince.id,
              }));

              // Also find district ID to load sub-districts
              // Need to wait for districts to be loaded first
              setTimeout(() => {
                const matchedDistrict = districts.find(
                  (d) => d.name_th === addr.district && d.province_id === matchedProvince.id
                );
                if (matchedDistrict) {
                  setShippingForm((prev) => ({
                    ...prev,
                    districtId: matchedDistrict.id,
                  }));
                }
              }, 100);
            }
          }
        } catch (error) {
          console.error("Error fetching saved address:", error);
        }
      };

      fetchSavedAddress();
    }
  }, [user, provinces]);

  // Initialize Omise when script loads
  useEffect(() => {
    if (omiseLoaded && window.Omise) {
      window.Omise.setPublicKey(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY || "");
    }
  }, [omiseLoaded]);

  // Create order first
  const createOrder = async (): Promise<string | null> => {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนสั่งซื้อ");
      return null;
    }

    try {
      const shippingAddress = {
        fullName: shippingForm.fullName,
        phone: shippingForm.phone,
        street: shippingForm.street,
        district: shippingForm.district,
        subDistrict: shippingForm.subDistrict,
        province: shippingForm.province,
        postalCode: shippingForm.postalCode,
      };

      const orderData = {
        userId: user._id,
        items: items.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          description: item.product.description || "",
          price: item.product.price,
          image: item.product.image,
          images: item.product.images || [],
          customParts: item.product.customParts || null,
          quantity: item.quantity,
        })),
        total,
        shippingAddress,
        paymentMethod,
        paymentStatus: "pending",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (data.success) {
        // Save shipping address to user profile (auto-save for future orders)
        try {
          await fetch(`/api/users/${user._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: shippingAddress }),
          });
        } catch (err) {
          console.error("Failed to save address to profile:", err);
          // Don't block order, just log the error
        }

        return data.data._id;
      }
      throw new Error(data.error);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("สลิปต้องมีขนาดไม่เกิน 5MB");
      return null;
    }
  };

  // Handle Credit Card Payment
  const handleCardPayment = async (newOrderId: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!window.Omise) {
        reject(new Error("Omise not loaded"));
        return;
      }

      const expMonth = cardForm.expMonth.padStart(2, "0");
      const expYear =
        cardForm.expYear.length === 2
          ? "20" + cardForm.expYear
          : cardForm.expYear;

      window.Omise.createToken(
        "card",
        {
          name: cardForm.name,
          number: cardForm.number.replace(/\s/g, ""),
          expiration_month: expMonth,
          expiration_year: expYear,
          security_code: cardForm.cvv,
        },
        async (statusCode, response) => {
          if (statusCode !== 200 || !response.id) {
            reject(new Error(response.message || "Token creation failed"));
            return;
          }

          try {
            const chargeRes = await fetch("/api/payment/create-charge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: response.id,
                amount: total,
                orderId: newOrderId,
              }),
            });

            const chargeData = await chargeRes.json();
            if (chargeData.success && chargeData.data.paid) {
              resolve();
            } else {
              reject(new Error(chargeData.error || "Payment failed"));
            }
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนสั่งซื้อ");
      router.push("/login");
      return;
    }

    // Validate required shipping fields
    const requiredFields = [
      { key: "fullName", label: "ชื่อ-นามสกุล" },
      { key: "phone", label: "เบอร์โทรศัพท์" },
      { key: "street", label: "ที่อยู่" },
      { key: "district", label: "เขต/อำเภอ" },
      { key: "province", label: "จังหวัด" },
      { key: "postalCode", label: "รหัสไปรษณีย์" },
    ];

    for (const field of requiredFields) {
      const value = shippingForm[field.key as keyof typeof shippingForm];
      if (typeof value === "string" && !value.trim()) {
        toast.error(`กรุณากรอก${field.label}`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Create order first
      const newOrderId = await createOrder();
      if (!newOrderId) {
        setIsSubmitting(false);
        return;
      }

      // Process payment based on method
      switch (paymentMethod) {
        case "card":
          await handleCardPayment(newOrderId);
          setOrderComplete(true);
          clearCart();
          toast.success("สั่งซื้อสำเร็จ!");
          break;




      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error instanceof Error ? error.message : "การชำระเงินล้มเหลว"
      );
    } finally {
      setIsSubmitting(false);
    }
  };



  if (items.length === 0 && !orderComplete) {
    return (
      <div className="checkout-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h3 className="cart-empty-title">ตะกร้าว่างเปล่า</h3>
          <p className="cart-empty-text">กรุณาเพิ่มสินค้าก่อนทำการชำระเงิน</p>
          <Link href="/products" className="btn btn-primary">
            🛍️ เลือกซื้อสินค้า
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="checkout-page">
        <div
          className="cart-empty"
          style={{ background: "rgba(34, 197, 94, 0.1)" }}
        >
          <div className="cart-empty-icon">🎉</div>
          <h3 className="cart-empty-title" style={{ color: "#22c55e" }}>
            สั่งซื้อสำเร็จ!
          </h3>
          <p className="cart-empty-text">
            ขอบคุณสำหรับการสั่งซื้อ เราจะดำเนินการจัดส่งโดยเร็วที่สุด
          </p>
          <Link href="/" className="btn btn-primary">
            🏠 กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }



  return (
    <>
      <Script
        src="https://cdn.omise.co/omise.js"
        onLoad={() => setOmiseLoaded(true)}
      />

      <div className="checkout-page">
        <h1 className="checkout-title">💳 ชำระเงิน</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            {/* Shipping Information */}
            <div className="form-section">
              <h2 className="form-section-title">📦 ข้อมูลการจัดส่ง</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    ชื่อ-นามสกุล <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="กรอกชื่อ-นามสกุล"
                    value={shippingForm.fullName}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        fullName: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    เบอร์โทรศัพท์ <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="0xxxxxxxxx"
                    value={shippingForm.phone}
                    onChange={(e) => {
                      // Allow only digits, max 10
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setShippingForm({ ...shippingForm, phone: value });
                    }}
                    maxLength={10}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    อีเมล <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="email@example.com"
                    value={shippingForm.email}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">
                    ที่อยู่ <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="บ้านเลขที่ ถนน ซอย"
                    value={shippingForm.street}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        street: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    จังหวัด <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="พิมพ์หรือเลือกจังหวัด"
                    list="province-list"
                    value={shippingForm.province}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const selectedProvince = provinces.find(
                        (p) => p.name_th === inputValue
                      );
                      setShippingForm({
                        ...shippingForm,
                        province: inputValue,
                        provinceId: selectedProvince?.id || 0,
                        district: "",
                        districtId: 0,
                        subDistrict: "",
                        postalCode: "",
                      });
                    }}
                    required
                  />
                  <datalist id="province-list">
                    {provinces.map((p) => (
                      <option key={p.id} value={p.name_th} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    เขต/อำเภอ <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="พิมพ์หรือเลือกเขต/อำเภอ"
                    list="district-list"
                    value={shippingForm.district}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const selectedDistrict = filteredDistricts.find(
                        (d) => d.name_th === inputValue
                      );
                      setShippingForm({
                        ...shippingForm,
                        district: inputValue,
                        districtId: selectedDistrict?.id || 0,
                        subDistrict: "",
                        postalCode: "",
                      });
                    }}
                    required
                    disabled={shippingForm.provinceId === 0}
                  />
                  <datalist id="district-list">
                    {filteredDistricts.map((d) => (
                      <option key={d.id} value={d.name_th} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    แขวง/ตำบล <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="พิมพ์หรือเลือกแขวง/ตำบล"
                    list="subdistrict-list"
                    value={shippingForm.subDistrict}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const selectedSubDistrict = filteredSubDistricts.find(
                        (s) => s.name_th === inputValue
                      );
                      setShippingForm({
                        ...shippingForm,
                        subDistrict: inputValue,
                        postalCode:
                          selectedSubDistrict?.zip_code?.toString() ||
                          shippingForm.postalCode,
                      });
                    }}
                    required
                    disabled={shippingForm.districtId === 0}
                  />
                  <datalist id="subdistrict-list">
                    {filteredSubDistricts.map((s) => (
                      <option key={s.id} value={s.name_th} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    รหัสไปรษณีย์ <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="10xxx"
                    value={shippingForm.postalCode}
                    onChange={(e) =>
                      setShippingForm({
                        ...shippingForm,
                        postalCode: e.target.value,
                      })
                    }
                    required
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h2 className="form-section-title">💰 วิธีการชำระเงิน</h2>
              <div className="payment-options">
                <label
                  className={`payment-option ${
                    paymentMethod === "card" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <span className="payment-icon">💳</span>
                  <span className="payment-label">บัตรเครดิต/เดบิต</span>
                </label>


              </div>
            </div>

            {/* Credit Card Form */}
            {paymentMethod === "card" && (
              <div className="form-section">
                <h2 className="form-section-title">💳 ข้อมูลบัตร</h2>

                {/* Test Cards Quick Fill */}
                <div style={{ marginBottom: "1rem" }}>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "0.75rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    🧪 บัตรทดสอบ Omise (Sandbox Mode):
                  </p>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {[
                      {
                        label: "✅ Visa (สำเร็จ)",
                        number: "4242424242424242",
                        type: "success",
                      },
                      {
                        label: "✅ Mastercard",
                        number: "5555555555554444",
                        type: "success",
                      },
                      {
                        label: "✅ JCB",
                        number: "3530111333300000",
                        type: "success",
                      },
                      {
                        label: "❌ ยอดไม่พอ",
                        number: "4111111111140011",
                        type: "fail",
                      },
                      {
                        label: "❌ บัตรหาย/ถูกขโมย",
                        number: "4111111111130012",
                        type: "fail",
                      },
                      {
                        label: "❌ ประมวลผลล้มเหลว",
                        number: "4111111111120013",
                        type: "fail",
                      },
                      {
                        label: "❌ ปฏิเสธการชำระ",
                        number: "4111111111110014",
                        type: "fail",
                      },
                    ].map((card) => (
                      <button
                        key={card.number}
                        type="button"
                        onClick={() =>
                          setCardForm({
                            number: card.number,
                            name: "TEST USER",
                            expMonth: "12",
                            expYear: "30",
                            cvv: "123",
                          })
                        }
                        style={{
                          padding: "0.4rem 0.75rem",
                          fontSize: "0.7rem",
                          borderRadius: "6px",
                          border: "none",
                          cursor: "pointer",
                          background:
                            card.type === "success"
                              ? "rgba(34, 197, 94, 0.2)"
                              : "rgba(239, 68, 68, 0.2)",
                          color:
                            card.type === "success" ? "#22c55e" : "#ef4444",
                          transition: "all 0.2s",
                        }}
                      >
                        {card.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">หมายเลขบัตร</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="4242 4242 4242 4242"
                      value={cardForm.number}
                      onChange={(e) =>
                        setCardForm({ ...cardForm, number: e.target.value })
                      }
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">ชื่อบนบัตร</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="NAME ON CARD"
                      value={cardForm.name}
                      onChange={(e) =>
                        setCardForm({ ...cardForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">เดือนหมดอายุ</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="MM"
                      value={cardForm.expMonth}
                      onChange={(e) =>
                        setCardForm({ ...cardForm, expMonth: e.target.value })
                      }
                      maxLength={2}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ปีหมดอายุ</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="YY"
                      value={cardForm.expYear}
                      onChange={(e) =>
                        setCardForm({ ...cardForm, expYear: e.target.value })
                      }
                      maxLength={4}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="xxx"
                      value={cardForm.cvv}
                      onChange={(e) =>
                        setCardForm({ ...cardForm, cvv: e.target.value })
                      }
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  🔒 ข้อมูลบัตรถูกเข้ารหัสผ่าน Omise อย่างปลอดภัย
                </p>
              </div>
            )}


          </form>

          {/* Order Summary */}
          <div className="order-summary">
            <h2 className="order-summary-title">📋 สรุปคำสั่งซื้อ</h2>

            <div className="order-items">
              {items.map((item) => (
                <div key={item.product._id} className="order-item">
                  <div
                    className="order-item-image"
                    style={{
                      position: "relative",
                      width: "60px",
                      height: "60px",
                      overflow: "hidden",
                      borderRadius: "8px",
                      backgroundColor: "#1e293b",
                    }}
                  >
                    {item.product.category === "custom" &&
                    item.product.images &&
                    item.product.images.length > 1 ? (
                      <>
                        {item.product.images.map((img, index) => (
                          <Image
                            key={index}
                            src={img}
                            alt={`${item.product.name} layer ${index + 1}`}
                            fill
                            style={{ objectFit: "contain", zIndex: index + 1 }}
                          />
                        ))}
                      </>
                    ) : (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={60}
                        height={60}
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div className="order-item-info">
                    <p className="order-item-name">{item.product.name}</p>
                    <p className="order-item-qty">จำนวน: {item.quantity}</p>

                    {/* Custom Parts Breakdown */}
                    {item.product.customParts && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          fontSize: "0.75rem",
                          background: "rgba(28, 77, 141, 0.1)",
                          borderRadius: "6px",
                          padding: "0.5rem",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 0.25rem",
                            color: "var(--primary-light)",
                            fontWeight: 600,
                          }}
                        >
                          🛠️ ชิ้นส่วนที่เลือก:
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.25rem",
                            color: "#cbd5e1",
                          }}
                        >
                          {item.product.customParts.base && (
                            <span>🖥️ {item.product.customParts.base.name}</span>
                          )}
                          {item.product.customParts.switch && (
                            <span>🔘 {item.product.customParts.switch.name}</span>
                          )}
                          {item.product.customParts.keycapBase && (
                            <span>⌨️ {item.product.customParts.keycapBase.name}</span>
                          )}
                          {item.product.customParts.keycapAdd1 && (
                            <span>🔠 {item.product.customParts.keycapAdd1.name}</span>
                          )}
                          {item.product.customParts.keycapAdd2 && (
                            <span>🔣 {item.product.customParts.keycapAdd2.name}</span>
                          )}
                          {item.product.customParts.wire && (
                            <span>🔌 {item.product.customParts.wire.name}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="order-item-price">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="cart-summary-row">
              <span>ราคาสินค้า</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="cart-summary-row">
              <span>ค่าจัดส่ง</span>
              <span style={{ color: shipping === 0 ? "#22c55e" : "var(--text-secondary)" }}>
                {shipping === 0 ? "ฟรี!" : formatPrice(shipping)}
              </span>
            </div>

            <div className="cart-summary-total">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="total-price">{formatPrice(total)}</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary place-order-button"
              onClick={handleSubmit}
              disabled={isSubmitting || !omiseLoaded}
            >
              {isSubmitting ? "⏳ กำลังดำเนินการ..." : !omiseLoaded ? "⏳ กำลังโหลดระบบชำระเงิน..." : "✓ ยืนยันการชำระเงิน"}
            </button>

            <div className="cart-summary-note">
              🔒 ชำระเงินผ่าน Omise อย่างปลอดภัย
            </div>

            {/* Free Shipping Progress */}
            {amountForFreeShipping > 0 && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, rgba(28, 77, 141, 0.15) 0%, rgba(109, 40, 217, 0.15) 100%)",
                  border: "1px solid rgba(28, 77, 141, 0.3)",
                  textAlign: "center",
                }}
              >
                <span style={{ color: "var(--primary-light)", fontSize: "0.85rem" }}>
                  🚛 สั่งซื้อเพิ่มอีก{" "}
                  <strong style={{ color: "#f59e0b" }}>
                    ฿{amountForFreeShipping.toLocaleString()}
                  </strong>{" "}
                  เพื่อรับส่งฟรี!
                </span>
              </div>
            )}

            <Link
              href="/cart"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "1rem",
                color: "var(--primary-light)",
                textDecoration: "none",
              }}
            >
              ← กลับไปตะกร้าสินค้า
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
