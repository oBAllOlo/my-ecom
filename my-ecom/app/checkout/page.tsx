"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, CheckCircle2, Truck, ChevronLeft, FlaskConical } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { toast } from "sonner";
import { formatPrice } from "@/lib/mockData";
import {
  PageContainer,
  PageHeader,
  Card,
  Field,
  Input,
  Button,
  EmptyState,
  Spinner,
  buttonClasses,
} from "@/components/ui";

type PaymentMethodType = "card";

// earthchie/jquery.Thailand.js flat dataset row.
// NOTE field naming: district = แขวง/ตำบล (tambon), amphoe = เขต/อำเภอ
interface AddressRow {
  district: string;
  amphoe: string;
  province: string;
  zipcode: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal, clearCart } = useCart();
  const { authorized, user } = useRequireAuth();

  const paymentMethod: PaymentMethodType = "card";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [addressRows, setAddressRows] = useState<AddressRow[]>([]);

  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    street: "",
    district: "", // เขต/อำเภอ (= amphoe)
    subDistrict: "", // แขวง/ตำบล (= district)
    province: "",
    postalCode: "",
  });

  const [shippingSettings, setShippingSettings] = useState({
    shippingCost: 50,
    freeShippingThreshold: 1500,
  });

  const subtotal = getCartTotal();
  const shipping =
    subtotal >= shippingSettings.freeShippingThreshold ? 0 : shippingSettings.shippingCost;
  const amountForFreeShipping =
    subtotal >= shippingSettings.freeShippingThreshold
      ? 0
      : shippingSettings.freeShippingThreshold - subtotal;
  const total = subtotal + shipping;

  // Derive cascading options from the flat dataset (sorted Thai)
  const thSort = (a: string, b: string) => a.localeCompare(b, "th");
  const provinceOptions = useMemo(
    () => [...new Set(addressRows.map((r) => r.province))].sort(thSort),
    [addressRows]
  );
  const amphoeOptions = useMemo(
    () =>
      shippingForm.province
        ? [
            ...new Set(
              addressRows
                .filter((r) => r.province === shippingForm.province)
                .map((r) => r.amphoe)
            ),
          ].sort(thSort)
        : [],
    [addressRows, shippingForm.province]
  );
  const tambonOptions = useMemo(
    () =>
      shippingForm.province && shippingForm.district
        ? [
            ...new Set(
              addressRows
                .filter(
                  (r) =>
                    r.province === shippingForm.province &&
                    r.amphoe === shippingForm.district
                )
                .map((r) => r.district)
            ),
          ].sort(thSort)
        : [],
    [addressRows, shippingForm.province, shippingForm.district]
  );

  useEffect(() => {
    if (!authorized) return;
    const fetchShippingSettings = async () => {
      try {
        const res = await fetch("/api/settings/shipping");
        const data = await res.json();
        if (data.success) setShippingSettings(data.data);
      } catch (error) {
        console.error("Error fetching shipping settings:", error);
      }
    };
    fetchShippingSettings();
  }, [authorized]);

  useEffect(() => {
    if (!authorized) return;
    const fetchAddressData = async () => {
      try {
        // Single flat dataset (earthchie/jquery.Thailand.js) — province/amphoe/district/zipcode
        const res = await fetch(
          "https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json"
        );
        setAddressRows(await res.json());
      } catch (error) {
        console.error("Error fetching address data:", error);
      }
    };
    fetchAddressData();
  }, [authorized]);

  useEffect(() => {
    if (user) {
      setShippingForm((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
      }));

      const fetchSavedAddress = async () => {
        try {
          const res = await fetch("/api/users/address");
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
          }
        } catch (error) {
          console.error("Error fetching saved address:", error);
        }
      };
      fetchSavedAddress();
    }
  }, [user]);

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
      if (data.success) return data.data._id;
      throw new Error(data.error);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error(error instanceof Error ? error.message : "ไม่สามารถสร้างคำสั่งซื้อได้");
      return null;
    }
  };

  // DEMO MODE: charge is simulated server-side; order is marked paid immediately.
  const handleCardPayment = async (newOrderId: string) => {
    const chargeRes = await fetch("/api/payment/create-charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total, orderId: newOrderId }),
    });
    const chargeData = await chargeRes.json();
    if (!chargeData.success || !chargeData.data?.paid) {
      throw new Error(chargeData.error || "Payment failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนสั่งซื้อ");
      router.push("/login");
      return;
    }

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
      const newOrderId = await createOrder();
      if (!newOrderId) {
        setIsSubmitting(false);
        return;
      }
      await handleCardPayment(newOrderId);
      setOrderComplete(true);
      clearCart();
      toast.success("สั่งซื้อสำเร็จ!");
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "การชำระเงินล้มเหลว");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <PageContainer>
        <PageHeader title="ชำระเงิน" />
        <EmptyState
          icon={ShoppingCart}
          title="ตะกร้าว่างเปล่า"
          description="กรุณาเพิ่มสินค้าก่อนทำการชำระเงิน"
          action={
            <Link href="/products" className={buttonClasses({ variant: "primary" })}>
              เลือกซื้อสินค้า
            </Link>
          }
        />
      </PageContainer>
    );
  }

  if (orderComplete) {
    return (
      <PageContainer>
        <EmptyState
          icon={CheckCircle2}
          title="สั่งซื้อสำเร็จ!"
          description="ขอบคุณสำหรับการสั่งซื้อ เราจะดำเนินการจัดส่งโดยเร็วที่สุด"
          action={
            <Link href="/" className={buttonClasses({ variant: "primary" })}>
              กลับหน้าแรก
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const customPartLabels: Record<string, string> = {
    base: "เคส",
    switch: "สวิตช์",
    keycapBase: "คีย์แคปหลัก",
    keycapAdd1: "คีย์แคปเสริม 1",
    keycapAdd2: "คีย์แคปเสริม 2",
    wire: "สาย",
  };

  return (
    <PageContainer>
      <PageHeader title="ชำระเงิน" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* Shipping form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="mb-5 text-lg font-semibold text-fg">ข้อมูลการจัดส่ง</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="ชื่อ-นามสกุล" required className="sm:col-span-2">
                <Input
                  placeholder="กรอกชื่อ-นามสกุล"
                  value={shippingForm.fullName}
                  onChange={(e) => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                  required
                />
              </Field>
              <Field label="เบอร์โทรศัพท์" required>
                <Input
                  type="tel"
                  placeholder="0xxxxxxxxx"
                  value={shippingForm.phone}
                  onChange={(e) =>
                    setShippingForm({
                      ...shippingForm,
                      phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  maxLength={10}
                  required
                />
              </Field>
              <Field label="อีเมล" required>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={shippingForm.email}
                  onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                  required
                />
              </Field>
              <Field label="ที่อยู่" required className="sm:col-span-2">
                <Input
                  placeholder="บ้านเลขที่ ถนน ซอย"
                  value={shippingForm.street}
                  onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                  required
                />
              </Field>
              <Field label="จังหวัด" required>
                <Input
                  list="province-list"
                  placeholder="พิมพ์หรือเลือกจังหวัด"
                  value={shippingForm.province}
                  onChange={(e) =>
                    setShippingForm({
                      ...shippingForm,
                      province: e.target.value,
                      district: "",
                      subDistrict: "",
                      postalCode: "",
                    })
                  }
                  required
                />
                <datalist id="province-list">
                  {provinceOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Field>
              <Field label="เขต/อำเภอ" required>
                <Input
                  list="district-list"
                  placeholder="พิมพ์หรือเลือกเขต/อำเภอ"
                  value={shippingForm.district}
                  disabled={!shippingForm.province}
                  onChange={(e) =>
                    setShippingForm({
                      ...shippingForm,
                      district: e.target.value,
                      subDistrict: "",
                      postalCode: "",
                    })
                  }
                  required
                />
                <datalist id="district-list">
                  {amphoeOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Field>
              <Field label="แขวง/ตำบล" required>
                <Input
                  list="subdistrict-list"
                  placeholder="พิมพ์หรือเลือกแขวง/ตำบล"
                  value={shippingForm.subDistrict}
                  disabled={!shippingForm.district}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const match = addressRows.find(
                      (r) =>
                        r.province === shippingForm.province &&
                        r.amphoe === shippingForm.district &&
                        r.district === inputValue
                    );
                    setShippingForm({
                      ...shippingForm,
                      subDistrict: inputValue,
                      postalCode: match ? String(match.zipcode) : shippingForm.postalCode,
                    });
                  }}
                  required
                />
                <datalist id="subdistrict-list">
                  {tambonOptions.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Field>
              <Field label="รหัสไปรษณีย์" required>
                <Input
                  placeholder="10xxx"
                  value={shippingForm.postalCode}
                  onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                  maxLength={5}
                  required
                />
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-fg">วิธีการชำระเงิน</h2>
            <div className="flex items-start gap-2.5 rounded-md bg-success/10 px-4 py-3 text-sm leading-relaxed text-fg-muted">
              <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>
                โหมดสาธิต: ระบบจะจำลองการชำระเงินให้สำเร็จทันที โดยไม่มีการตัดเงินจริง
                เมื่อกด &quot;ยืนยันการชำระเงิน&quot;
              </span>
            </div>
          </Card>
        </form>

        {/* Order summary */}
        <Card className="p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-lg font-semibold text-fg">สรุปคำสั่งซื้อ</h2>

          <div className="flex flex-col gap-4 border-b border-line pb-4">
            {items.map((item) => (
              <div key={item.product._id} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-bg-deep">
                  {item.product.category === "custom" &&
                  item.product.images &&
                  item.product.images.length > 1 ? (
                    item.product.images.map((img, index) => (
                      <Image
                        key={index}
                        src={img}
                        alt={`${item.product.name} layer ${index + 1}`}
                        fill
                        style={{ objectFit: "contain", zIndex: index + 1 }}
                      />
                    ))
                  ) : (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={56}
                      height={56}
                      style={{ objectFit: "cover" }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">{item.product.name}</p>
                  <p className="text-xs text-fg-subtle">จำนวน: {item.quantity}</p>
                  {item.product.customParts && (
                    <div className="mt-1.5 rounded-md bg-brand-subtle p-2 text-xs text-fg-muted">
                      <p className="mb-1 font-medium text-brand">ชิ้นส่วนที่เลือก</p>
                      <div className="flex flex-col gap-0.5">
                        {(
                          Object.entries(item.product.customParts) as [
                            string,
                            { name?: string } | undefined
                          ][]
                        ).map(([key, part]) =>
                          part?.name ? (
                            <span key={key}>
                              {customPartLabels[key] ?? key}: {part.name}
                            </span>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-fg">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 py-4 text-sm">
            <div className="flex justify-between text-fg-muted">
              <span>ราคาสินค้า</span>
              <span className="text-fg">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-fg-muted">
              <span>ค่าจัดส่ง</span>
              <span className={shipping === 0 ? "text-success" : "text-fg"}>
                {shipping === 0 ? "ฟรี!" : formatPrice(shipping)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="font-semibold text-fg">ยอดรวมทั้งสิ้น</span>
            <span className="text-xl font-bold text-fg">{formatPrice(total)}</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-5 w-full"
          >
            {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการชำระเงิน"}
          </Button>

          {amountForFreeShipping > 0 && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-brand-subtle px-3 py-2.5 text-xs text-fg-muted">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>
                สั่งซื้อเพิ่มอีก{" "}
                <strong className="text-warning">{amountForFreeShipping.toLocaleString()} บาท</strong>{" "}
                เพื่อรับส่งฟรี!
              </span>
            </div>
          )}

          <Link
            href="/cart"
            className="mt-4 flex items-center justify-center gap-1 text-sm text-brand hover:text-brand-hover"
          >
            <ChevronLeft className="h-4 w-4" />
            กลับไปตะกร้าสินค้า
          </Link>
        </Card>
      </div>
    </PageContainer>
  );
}
