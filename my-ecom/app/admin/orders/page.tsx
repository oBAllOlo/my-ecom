"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  Wrench,
  ShoppingCart,
  X,
  MapPin,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Field,
  Input,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  EmptyState,
  Spinner,
  cn,
} from "@/components/ui";

interface Order {
  _id: string;
  userId: { _id: string; name: string; email: string };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    images?: string[];
    customParts?: Record<string, { name?: string; image?: string } | undefined>;
  }>;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    district: string;
    subDistrict: string;
    province: string;
    postalCode: string;
  };
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  createdAt: string;
}

const carriers = [
  { id: "kerry", name: "Kerry Express" },
  { id: "flash", name: "Flash Express" },
  { id: "jt", name: "J&T Express" },
  { id: "thaipost", name: "ไปรษณีย์ไทย" },
  { id: "scg", name: "SCG Express" },
  { id: "other", name: "อื่นๆ" },
];

type Tone = "warning" | "info" | "brand" | "success" | "danger";
const statusConfig: Record<Order["status"], { label: string; tone: Tone; icon: LucideIcon }> = {
  pending: { label: "รอดำเนินการ", tone: "warning", icon: Clock },
  processing: { label: "กำลังจัดเตรียม", tone: "info", icon: Package },
  shipped: { label: "จัดส่งแล้ว", tone: "brand", icon: Truck },
  delivered: { label: "ส่งสำเร็จ", tone: "success", icon: CheckCircle2 },
  cancelled: { label: "ยกเลิก", tone: "danger", icon: XCircle },
};

const partLabels: Record<string, string> = {
  base: "เคส",
  switch: "สวิตช์",
  keycapBase: "คีย์แคปหลัก",
  keycapAdd1: "คีย์แคปเสริม 1",
  keycapAdd2: "คีย์แคปเสริม 2",
  wire: "สาย",
};

function StatusBadge({ status }: { status: Order["status"] }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <Badge tone={cfg.tone}>
      <Icon className="h-3.5 w-3.5" /> {cfg.label}
    </Badge>
  );
}

export default function AdminOrders() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "custom" | "regular">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState("kerry");
  const [isShipping, setIsShipping] = useState(false);
  const [shippingMessage, setShippingMessage] = useState({ type: "", text: "" });

  const isCustomOrder = (order: Order) => order.items.some((item) => item.productId?.startsWith("custom-"));

  const filteredOrders = orders.filter((order) => {
    if (categoryFilter === "all") return true;
    if (categoryFilter === "custom") return isCustomOrder(order);
    return !isCustomOrder(order);
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleCategoryChange = (category: "all" | "custom" | "regular") => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const customOrdersCount = orders.filter(isCustomOrder).length;
  const regularOrdersCount = orders.length - customOrdersCount;

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, isLoading, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchOrders();
  }, [user]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus as Order["status"] } : o)));
        setSelectedOrder(null);
        toast.success(`อัปเดตสถานะเป็น "${statusConfig[newStatus as Order["status"]]?.label || newStatus}" สำเร็จ`);
      } else {
        toast.error(data.error || "ไม่สามารถอัปเดตสถานะได้");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const openShippingModal = (order: Order) => {
    setShippingOrder(order);
    setTrackingNumber("");
    setSelectedCarrier("kerry");
    setShippingMessage({ type: "", text: "" });
    setShowShippingModal(true);
    setSelectedOrder(null);
  };

  const handleShipOrder = async () => {
    if (!shippingOrder || !trackingNumber.trim()) {
      setShippingMessage({ type: "error", text: "กรุณากรอกหมายเลขพัสดุ" });
      return;
    }
    setIsShipping(true);
    try {
      const res = await fetch("/api/orders/ship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: shippingOrder._id, trackingNumber: trackingNumber.trim(), carrier: selectedCarrier }),
      });
      const data = await res.json();
      if (data.success) {
        setShippingMessage({ type: "success", text: "จัดส่งสำเร็จและส่งอีเมลแจ้งลูกค้าแล้ว!" });
        setOrders(
          orders.map((o) =>
            o._id === shippingOrder._id
              ? { ...o, status: "shipped" as const, trackingNumber, carrier: selectedCarrier }
              : o
          )
        );
        toast.success("จัดส่งสำเร็จและส่งอีเมลแจ้งลูกค้าแล้ว!");
        setTimeout(() => setShowShippingModal(false), 1500);
      } else {
        setShippingMessage({ type: "error", text: data.error || "เกิดข้อผิดพลาด" });
        toast.error(data.error || "ไม่สามารถจัดส่งได้");
      }
    } catch (error) {
      console.error("Error shipping order:", error);
      setShippingMessage({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsShipping(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(price);
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!user || user.role !== "admin") return null;

  const tabs: { key: "all" | "custom" | "regular"; label: string; count: number }[] = [
    { key: "all", label: "ทั้งหมด", count: orders.length },
    { key: "custom", label: "Custom Build", count: customOrdersCount },
    { key: "regular", label: "สินค้าทั่วไป", count: regularOrdersCount },
  ];

  return (
    <>
      <PageHeader title="จัดการคำสั่งซื้อ" subtitle={`${orders.length} คำสั่งซื้อทั้งหมด`} />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleCategoryChange(tab.key)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
              categoryFilter === tab.key ? "bg-brand text-white" : "bg-surface text-fg-muted hover:bg-surface-raised"
            )}
          >
            {tab.label}
            <span className={cn("rounded-full px-1.5 py-0.5 text-xs", categoryFilter === tab.key ? "bg-white/20" : "bg-white/10")}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState icon={Inbox} title="ยังไม่มีคำสั่งซื้อ" />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {paginatedOrders.map((order) => {
              const isCustom = isCustomOrder(order);
              const firstItem = order.items[0];
              return (
                <Card key={order._id} className="cursor-pointer p-4" onClick={() => setSelectedOrder(order)}>
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-fg">#{order._id.slice(-8).toUpperCase()}</span>
                      <Badge tone={isCustom ? "brand" : "info"}>
                        {isCustom ? <Wrench className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                      </Badge>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="mb-3 flex items-center gap-3 border-b border-line pb-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-bg-deep">
                      {firstItem?.images && firstItem.images.length > 1 ? (
                        firstItem.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="absolute inset-0 h-full w-full object-contain" style={{ zIndex: i + 1 }} />
                        ))
                      ) : (
                        <img src={firstItem?.image || "/placeholder.png"} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">{firstItem?.name || "ไม่ระบุ"}</p>
                      <p className="text-xs text-fg-subtle">{order.userId?.name}</p>
                    </div>
                    <span className="font-bold text-fg">{formatPrice(order.total)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-fg-subtle">{formatDate(order.createdAt)}</span>
                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                      ดูรายละเอียด
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <Table>
              <THead>
                <TR>
                  <TH>รหัสคำสั่งซื้อ</TH>
                  <TH>สินค้า</TH>
                  <TH>ลูกค้า</TH>
                  <TH>ยอดรวม</TH>
                  <TH>สถานะ</TH>
                  <TH>วันที่</TH>
                  <TH>จัดการ</TH>
                </TR>
              </THead>
              <TBody>
                {paginatedOrders.map((order) => {
                  const isCustom = isCustomOrder(order);
                  const firstItem = order.items[0];
                  return (
                    <TR key={order._id} className="hover:bg-white/[0.02]">
                      <TD>
                        <div className="flex flex-col gap-1">
                          <span className="font-mono font-semibold">#{order._id.slice(-8).toUpperCase()}</span>
                          <Badge tone={isCustom ? "brand" : "info"} className="w-fit">{isCustom ? "Custom" : "ปกติ"}</Badge>
                        </div>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-2">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-bg-deep">
                            {firstItem?.images && firstItem.images.length > 1 ? (
                              firstItem.images.map((img, i) => (
                                <img key={i} src={img} alt="" className="absolute inset-0 h-full w-full object-contain" style={{ zIndex: i + 1 }} />
                              ))
                            ) : (
                              <img src={firstItem?.image || "/placeholder.png"} alt="" className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="max-w-[140px] truncate text-sm font-medium">{firstItem?.name || "ไม่ระบุ"}</span>
                            <span className="text-xs text-fg-subtle">{order.items.length} รายการ</span>
                          </div>
                        </div>
                      </TD>
                      <TD>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.userId?.name || "ไม่ระบุ"}</span>
                          <span className="text-xs text-fg-subtle">{order.userId?.email}</span>
                        </div>
                      </TD>
                      <TD className="font-bold">{formatPrice(order.total)}</TD>
                      <TD><StatusBadge status={order.status} /></TD>
                      <TD className="text-fg-muted">{formatDate(order.createdAt)}</TD>
                      <TD>
                        <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(order)}>ดูรายละเอียด</Button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 md:flex-row">
              <p className="text-sm text-fg-subtle">
                แสดง {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} จาก {filteredOrders.length} รายการ
              </p>
              <div className="flex items-center gap-1">
                <Button variant="secondary" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
                <Button variant="secondary" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="px-3 text-sm text-fg-muted">{currentPage}/{totalPages}</span>
                <Button variant="secondary" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="secondary" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm md:p-8" onClick={() => setSelectedOrder(null)}>
          <Card className="max-h-[92vh] w-full max-w-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line p-5">
              <h2 className="font-semibold text-fg">คำสั่งซื้อ #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
              <button onClick={() => setSelectedOrder(null)} className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle hover:bg-white/5 hover:text-fg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="mb-3 text-sm font-medium text-fg-muted">รายการสินค้า</h3>
              <div className="flex flex-col gap-3">
                {selectedOrder.items.map((item, idx) => {
                  const isCustomProduct = item.productId?.startsWith("custom-");
                  return (
                    <div key={idx} className="rounded-lg border border-line bg-white/[0.02] p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("relative shrink-0 overflow-hidden rounded-md bg-bg-deep", isCustomProduct ? "h-20 w-20" : "h-14 w-14")}>
                          {isCustomProduct && item.images && item.images.length > 1 ? (
                            item.images.map((img, i) => (
                              <img key={i} src={img} alt="" className="absolute inset-0 h-full w-full object-contain" style={{ zIndex: i + 1 }} />
                            ))
                          ) : (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-fg">{item.name}</p>
                          <p className="text-xs text-fg-subtle">x{item.quantity}</p>
                          {isCustomProduct && item.customParts && (
                            <div className="mt-2 rounded-md bg-brand-subtle p-2.5 text-xs">
                              <p className="mb-1.5 font-medium text-brand">ชิ้นส่วนที่เลือก</p>
                              <div className="flex flex-col gap-1.5">
                                {Object.entries(item.customParts).map(([key, part]) =>
                                  part?.name ? (
                                    <div key={key} className="flex items-center gap-2">
                                      {part.image && <img src={part.image} alt={key} className="h-8 w-8 rounded bg-surface-raised object-contain" />}
                                      <span className="text-fg-subtle">{partLabels[key] ?? key}:</span>
                                      <span className="text-fg">{part.name}</span>
                                    </div>
                                  ) : null
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold text-fg">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-between border-t border-line pt-4">
                <span className="text-fg-muted">ยอดรวม</span>
                <span className="text-xl font-bold text-fg">{formatPrice(selectedOrder.total)}</span>
              </div>

              <h3 className="mb-2 mt-6 flex items-center gap-1.5 text-sm font-medium text-fg-muted">
                <MapPin className="h-4 w-4" /> ที่อยู่จัดส่ง
              </h3>
              <div className="rounded-lg border border-line bg-white/[0.02] p-4 text-sm text-fg-muted">
                <p className="font-semibold text-fg">{selectedOrder.shippingAddress.fullName}</p>
                <p>{selectedOrder.shippingAddress.phone}</p>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>เขต/อำเภอ: {selectedOrder.shippingAddress.district}</p>
                {selectedOrder.shippingAddress.subDistrict && <p>แขวง/ตำบล: {selectedOrder.shippingAddress.subDistrict}</p>}
                <p>{selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}</p>
              </div>

              {selectedOrder.trackingNumber && (
                <div className="mt-4 rounded-lg border border-line bg-brand-subtle p-4">
                  <p className="mb-1 text-sm text-brand">หมายเลขพัสดุ</p>
                  <p className="text-lg font-bold tracking-wider text-fg">{selectedOrder.trackingNumber}</p>
                  <p className="mt-2 text-sm text-fg-subtle">{carriers.find((c) => c.id === selectedOrder.carrier)?.name || selectedOrder.carrier}</p>
                </div>
              )}

              <h3 className="mb-3 mt-6 flex items-center gap-1.5 text-sm font-medium text-fg-muted">
                <RefreshCw className="h-4 w-4" /> อัปเดตสถานะ
              </h3>
              {selectedOrder.status === "processing" && (
                <Button variant="primary" onClick={() => openShippingModal(selectedOrder)} className="mb-3 w-full">
                  <Truck className="h-4 w-4" /> จัดส่งพัสดุ (กรอก Tracking)
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(statusConfig) as [Order["status"], (typeof statusConfig)[Order["status"]]][]).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  const active = selectedOrder.status === key;
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        key === "shipped" && selectedOrder.status === "processing"
                          ? openShippingModal(selectedOrder)
                          : handleStatusUpdate(selectedOrder._id, key)
                      }
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
                        active ? "border-brand bg-brand-subtle text-brand" : "border-line text-fg-muted hover:bg-white/5"
                      )}
                    >
                      <Icon className="h-4 w-4" /> {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Shipping modal */}
      {showShippingModal && shippingOrder && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowShippingModal(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line p-5">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-fg">
                <Truck className="h-5 w-5 text-brand" /> จัดส่งพัสดุ
              </h2>
              <button onClick={() => setShowShippingModal(false)} className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle hover:bg-white/5 hover:text-fg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <p className="mb-5 text-sm text-fg-muted">
                คำสั่งซื้อ #{shippingOrder._id.slice(-8).toUpperCase()} - {shippingOrder.shippingAddress.fullName}
              </p>
              {shippingMessage.text && (
                <div className={cn("mb-4 rounded-md px-4 py-2.5 text-sm", shippingMessage.type === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
                  {shippingMessage.text}
                </div>
              )}
              <Field label="เลือกบริษัทขนส่ง">
                <div className="grid grid-cols-2 gap-2">
                  {carriers.map((carrier) => (
                    <button
                      key={carrier.id}
                      type="button"
                      onClick={() => setSelectedCarrier(carrier.id)}
                      className={cn(
                        "rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                        selectedCarrier === carrier.id ? "border-brand bg-brand-subtle text-brand" : "border-line text-fg-muted hover:bg-white/5"
                      )}
                    >
                      {carrier.name}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="หมายเลขพัสดุ (Tracking Number)" className="mt-4">
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  placeholder="เช่น TH1234567890"
                />
              </Field>
              <Button onClick={handleShipOrder} disabled={isShipping || !trackingNumber.trim()} variant="primary" className="mt-5 w-full">
                {isShipping ? "กำลังดำเนินการ..." : "ยืนยันจัดส่งและแจ้งลูกค้า"}
              </Button>
              <p className="mt-3 text-center text-xs text-fg-subtle">ระบบจะส่งอีเมลแจ้งหมายเลขพัสดุให้ลูกค้าอัตโนมัติ</p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
