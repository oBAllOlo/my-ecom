"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MapPin,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  PageContainer,
  Card,
  Badge,
  Button,
  Spinner,
  EmptyState,
  cn,
} from "@/components/ui";

interface Order {
  _id: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  createdAt: string;
  total: number;
  userId?: string | { _id: string };
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    images?: string[];
    customParts?: {
      base?: { name?: string; image?: string };
      switch?: { name?: string; image?: string };
      keycapBase?: { name?: string; image?: string };
      keycapAdd1?: { name?: string; image?: string };
      keycapAdd2?: { name?: string; image?: string };
      wire?: { name?: string; image?: string };
    };
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    province: string;
  };
}

const carriers: Record<string, { name: string; trackingUrl: string }> = {
  kerry: { name: "Kerry Express", trackingUrl: "https://th.kerryexpress.com/th/track/?track=" },
  flash: { name: "Flash Express", trackingUrl: "https://flashexpress.com/tracking?se=" },
  jt: { name: "J&T Express", trackingUrl: "https://www.jtexpress.co.th/tracking?billcode=" },
  thaipost: { name: "ไปรษณีย์ไทย", trackingUrl: "https://track.thailandpost.co.th/?trackNumber=" },
  scg: { name: "SCG Express", trackingUrl: "https://www.scgexpress.co.th/tracking?tracking_no=" },
  other: { name: "ขนส่งอื่นๆ", trackingUrl: "" },
};

type Tone = "warning" | "info" | "brand" | "success" | "danger";
const statusConfig: Record<
  Order["status"],
  { label: string; tone: Tone; step: number }
> = {
  pending: { label: "รอดำเนินการ", tone: "warning", step: 1 },
  processing: { label: "กำลังเตรียมสินค้า", tone: "info", step: 2 },
  shipped: { label: "จัดส่งแล้ว", tone: "brand", step: 3 },
  delivered: { label: "ได้รับสินค้าแล้ว", tone: "success", step: 4 },
  cancelled: { label: "ยกเลิก", tone: "danger", step: 0 },
};

const steps: { step: number; icon: LucideIcon; label: string }[] = [
  { step: 1, icon: Clock, label: "รอดำเนินการ" },
  { step: 2, icon: Package, label: "เตรียมสินค้า" },
  { step: 3, icon: Truck, label: "จัดส่งแล้ว" },
  { step: 4, icon: CheckCircle2, label: "สำเร็จ" },
];

const partLabels: Record<string, string> = {
  base: "เคส",
  switch: "สวิตช์",
  keycapBase: "คีย์แคปหลัก",
  keycapAdd1: "คีย์แคปเสริม 1",
  keycapAdd2: "คีย์แคปเสริม 2",
  wire: "สาย",
};

function TrackingContent() {
  const searchParams = useSearchParams();
  useAuth();
  const orderId = searchParams.get("order");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState({ type: "", text: "" });

  const fetchOrder = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        toast.error("ไม่พบคำสั่งซื้อ กรุณาตรวจสอบหมายเลขอีกครั้ง");
        setOrder(null);
      }
    } catch {
      toast.error("ไม่พบเลขพัสดุนี้ในระบบ");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder(orderId);
    else setLoading(false);
  }, [orderId]);

  const handleConfirmReceived = async () => {
    if (!order) return;
    setConfirmLoading(true);
    setConfirmMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order._id }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmMessage({ type: "success", text: "ยืนยันรับสินค้าเรียบร้อย ขอบคุณที่ใช้บริการ!" });
        setOrder({ ...order, status: "delivered" });
      } else {
        setConfirmMessage({ type: "error", text: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch {
      setConfirmMessage({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
    } finally {
      setConfirmLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(price);
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const currentStep = order ? statusConfig[order.status]?.step || 0 : 0;
  const carrierInfo = order?.carrier ? carriers[order.carrier] : null;

  return (
    <PageContainer className="max-w-2xl">
      <Link
        href="/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-fg-muted transition-colors hover:text-fg"
      >
        <ChevronLeft className="h-4 w-4" /> กลับหน้าคำสั่งซื้อ
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-fg">
        รายละเอียดคำสั่งซื้อ
      </h1>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-fg-muted">กำลังค้นหา...</p>
        </div>
      )}

      {order && !loading && (
        <Card className="overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-raised/50 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-subtle text-brand">
                <ReceiptText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-fg-subtle">หมายเลขคำสั่งซื้อ</p>
                <p className="font-mono text-base font-bold text-brand">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
            <Badge tone={statusConfig[order.status].tone}>
              {statusConfig[order.status].label}
            </Badge>
          </div>

          {/* Progress */}
          {order.status !== "cancelled" && (
            <div className="px-5 py-6">
              <div className="relative flex justify-between">
                <div className="absolute left-4 right-4 top-4 h-1 rounded bg-white/10">
                  <div
                    className="h-full rounded bg-brand transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  />
                </div>
                {steps.map(({ step, icon: Icon, label }) => {
                  const active = currentStep >= step;
                  return (
                    <div key={step} className="relative z-10 text-center">
                      <div
                        className={cn(
                          "mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full",
                          active ? "bg-brand text-white" : "border border-line-strong bg-surface text-fg-subtle"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className={cn("text-xs", active ? "text-fg" : "text-fg-subtle")}>
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tracking info */}
          {order.trackingNumber && carrierInfo && (
            <div className="px-5 pb-5">
              <div className="rounded-lg border border-line bg-brand-subtle p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mb-1 text-xs text-brand">หมายเลขพัสดุ</p>
                    <p className="break-all font-semibold tracking-wide text-fg">
                      {order.trackingNumber}
                    </p>
                    <p className="mt-2 text-sm text-fg-muted">{carrierInfo.name}</p>
                  </div>
                  {carrierInfo.trackingUrl && (
                    <a
                      href={`${carrierInfo.trackingUrl}${order.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover"
                    >
                      ติดตาม <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {order.shippedAt && (
                  <p className="mt-3 text-xs text-fg-subtle">
                    จัดส่งเมื่อ {formatDate(order.shippedAt)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="px-5 pb-5">
            <p className="mb-3 border-b border-line pb-2 text-sm font-medium text-fg-muted">
              สินค้าในคำสั่งซื้อ ({order.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)
            </p>
            <div className="flex flex-col gap-2">
              {order.items.map((item, idx) => {
                const isCustom = item.productId?.startsWith("custom-") || !!item.customParts;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-lg border p-3",
                      isCustom ? "border-brand/30 bg-brand-subtle" : "border-line bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "relative shrink-0 overflow-hidden rounded-md bg-bg-deep",
                          isCustom ? "h-20 w-20" : "h-14 w-14"
                        )}
                      >
                        {isCustom && item.images && item.images.length > 1 ? (
                          item.images.map((img, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={img}
                              alt={`${item.name} layer ${imgIdx + 1}`}
                              className="absolute inset-0 h-full w-full object-contain"
                              style={{ zIndex: imgIdx + 1 }}
                            />
                          ))
                        ) : (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-fg">{item.name}</p>
                        <p className="text-xs text-fg-subtle">x{item.quantity}</p>
                        {isCustom && item.customParts && (
                          <div className="mt-2 rounded-md bg-black/20 p-2.5 text-xs">
                            <p className="mb-1.5 font-medium text-brand">ชิ้นส่วนที่เลือก</p>
                            <div className="flex flex-col gap-1.5">
                              {(
                                Object.entries(item.customParts) as [
                                  string,
                                  { name?: string; image?: string } | undefined
                                ][]
                              ).map(([key, part]) =>
                                part?.name ? (
                                  <div key={key} className="flex items-center gap-2">
                                    {part.image && (
                                      <img
                                        src={part.image}
                                        alt={key}
                                        className="h-8 w-8 rounded bg-surface-raised object-contain"
                                      />
                                    )}
                                    <span className="text-fg-subtle">{partLabels[key] ?? key}:</span>
                                    <span className="text-fg">{part.name}</span>
                                  </div>
                                ) : null
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="whitespace-nowrap text-sm font-semibold text-fg">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex justify-between border-t border-line pt-3">
              <span className="text-fg-muted">ยอดรวม</span>
              <span className="text-lg font-bold text-fg">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Address */}
          <div className="px-5 pb-5">
            <p className="mb-1 flex items-center gap-1.5 text-sm text-fg-muted">
              <MapPin className="h-4 w-4" /> ที่อยู่จัดส่ง
            </p>
            <p className="text-fg">
              {order.shippingAddress.fullName} • {order.shippingAddress.phone}
            </p>
            <p className="text-sm text-fg-subtle">{order.shippingAddress.province}</p>
          </div>

          {/* Confirm received */}
          {order.status === "shipped" && (
            <div className="px-5 pb-5">
              {confirmMessage.text && (
                <div
                  className={cn(
                    "mb-3 rounded-md px-4 py-2.5 text-center text-sm",
                    confirmMessage.type === "success"
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  )}
                >
                  {confirmMessage.text}
                </div>
              )}
              <Button
                onClick={handleConfirmReceived}
                disabled={confirmLoading}
                className="w-full bg-success text-white hover:opacity-90"
              >
                <CheckCircle2 className="h-4 w-4" />
                {confirmLoading ? "กำลังดำเนินการ..." : "ยืนยันได้รับสินค้าแล้ว"}
              </Button>
              <p className="mt-3 text-center text-xs text-fg-subtle">
                หากไม่กดยืนยัน ระบบจะปิดคำสั่งซื้ออัตโนมัติใน 7 วัน
              </p>
            </div>
          )}

          {order.status === "delivered" && (
            <div className="px-5 pb-5">
              <div className="flex flex-col items-center gap-1 rounded-lg bg-success/10 px-4 py-5 text-center">
                <CheckCircle2 className="h-7 w-7 text-success" />
                <p className="font-semibold text-success">ได้รับสินค้าเรียบร้อยแล้ว</p>
                <p className="text-xs text-fg-subtle">ขอบคุณที่ใช้บริการ</p>
              </div>
            </div>
          )}

          <div className="bg-surface-raised/50 px-5 py-3 text-center">
            <p className="text-xs text-fg-subtle">สั่งซื้อเมื่อ {formatDate(order.createdAt)}</p>
          </div>
        </Card>
      )}

      {!orderId && !order && !loading && (
        <EmptyState
          icon={Package}
          title="ค้นหาคำสั่งซื้อของคุณ"
          description="เปิดหน้านี้จากประวัติคำสั่งซื้อเพื่อดูสถานะและติดตามพัสดุ"
        />
      )}

      {orderId && !order && !loading && (
        <EmptyState
          icon={XCircle}
          title="ไม่พบคำสั่งซื้อ"
          description="กรุณาตรวจสอบหมายเลขคำสั่งซื้ออีกครั้ง"
        />
      )}
    </PageContainer>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
