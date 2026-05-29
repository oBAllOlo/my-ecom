"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Wrench,
  ShoppingCart,
  Wallet,
  Search,
  X,
  MapPin,
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
  PageContainer,
  PageHeader,
  Card,
  Badge,
  Button,
  Select,
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
    productId: string | { _id: string; name: string; image: string };
    name: string;
    description?: string;
    price: number;
    quantity: number;
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
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    district: string;
    subDistrict?: string;
    province: string;
    postalCode: string;
  };
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  createdAt: string;
}

const carrierNames: Record<string, string> = {
  kerry: "Kerry Express",
  flash: "Flash Express",
  jt: "J&T Express",
  thaipost: "ไปรษณีย์ไทย",
  scg: "SCG Express",
  other: "อื่นๆ",
};

type Tone = "warning" | "info" | "brand" | "success" | "danger";
const statusConfig: Record<
  Order["status"],
  { label: string; tone: Tone; icon: LucideIcon }
> = {
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

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "custom" | "regular">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const isCustomOrder = (order: Order) =>
    order.items.some((item) => {
      const productId = typeof item.productId === "string" ? item.productId : item.productId?._id;
      return productId?.startsWith("custom-") || !!item.customParts;
    });

  const filteredOrders = orders.filter((order) => {
    let categoryMatch = true;
    if (categoryFilter === "custom") categoryMatch = isCustomOrder(order);
    else if (categoryFilter === "regular") categoryMatch = !isCustomOrder(order);

    let statusMatch = true;
    if (statusFilter !== "all") statusMatch = order.status === statusFilter;

    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      searchMatch =
        order._id.toLowerCase().includes(query) ||
        order.items.some((item) => item.name.toLowerCase().includes(query));
    }
    return categoryMatch && statusMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (category: "all" | "custom" | "regular") => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const customOrdersCount = orders.filter(isCustomOrder).length;
  const regularOrdersCount = orders.length - customOrdersCount;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?._id) {
        try {
          const res = await fetch("/api/orders");
          const data = await res.json();
          if (data.success) setOrders(data.data);
          else toast.error("โหลดข้อมูลล้มเหลว");
        } catch (err) {
          console.error("Error fetching orders:", err);
          toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
          setLoading(false);
        }
      }
    };
    if (user) fetchOrders();
  }, [user]);

  const formatPrice = (price: number) =>
    `${new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(price)} บาท`;
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading || loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      </PageContainer>
    );
  }
  if (!user) return null;

  const tabs: { key: "all" | "custom" | "regular"; label: string; count: number }[] = [
    { key: "all", label: "ทั้งหมด", count: orders.length },
    { key: "custom", label: "Custom Build", count: customOrdersCount },
    { key: "regular", label: "สินค้าทั่วไป", count: regularOrdersCount },
  ];

  const stats = [
    { icon: Package, tone: "brand" as const, value: orders.length, label: "คำสั่งซื้อ" },
    {
      icon: CheckCircle2,
      tone: "success" as const,
      value: orders.filter((o) => o.status === "delivered").length,
      label: "สำเร็จ",
    },
    {
      icon: Clock,
      tone: "warning" as const,
      value: orders.filter((o) => o.status === "pending" || o.status === "processing").length,
      label: "รอดำเนินการ",
    },
    {
      icon: Wallet,
      tone: "info" as const,
      value: formatPrice(orders.reduce((sum, o) => sum + o.total, 0)),
      label: "ยอดรวม",
    },
  ];
  const toneBg: Record<string, string> = {
    brand: "bg-brand-subtle text-brand",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
  };

  return (
    <PageContainer>
      <PageHeader title="ประวัติการสั่งซื้อ" subtitle={`${orders.length} คำสั่งซื้อทั้งหมด`} />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="flex items-center gap-3 p-4">
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-md", toneBg[s.tone])}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-fg">{s.value}</p>
                <p className="text-xs text-fg-subtle">{s.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleCategoryChange(tab.key)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
              categoryFilter === tab.key
                ? "bg-brand text-white"
                : "bg-surface text-fg-muted hover:bg-surface-raised"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                categoryFilter === tab.key ? "bg-white/20" : "bg-white/10"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="md:w-56"
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="processing">กำลังจัดเตรียม</option>
          <option value="shipped">จัดส่งแล้ว</option>
          <option value="delivered">ส่งสำเร็จ</option>
          <option value="cancelled">ยกเลิก</option>
        </Select>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <Input
            placeholder="ค้นหารหัสคำสั่งซื้อ หรือชื่อสินค้า..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState icon={Inbox} title="ยังไม่มีคำสั่งซื้อ" description="คำสั่งซื้อของคุณจะแสดงที่นี่" />
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
                      <span className="font-mono text-sm font-semibold text-fg">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <Badge tone={isCustom ? "brand" : "info"}>
                        {isCustom ? <Wrench className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                      </Badge>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="mb-3 flex items-center gap-3 border-b border-line pb-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-bg-deep">
                      {firstItem?.images && firstItem.images.length > 1 ? (
                        firstItem.images.map((img, imgIdx) => (
                          <img key={imgIdx} src={img} alt="" className="absolute inset-0 h-full w-full object-contain" style={{ zIndex: imgIdx + 1 }} />
                        ))
                      ) : (
                        <img src={firstItem?.image || "/placeholder.png"} alt={firstItem?.name || ""} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">{firstItem?.name || "ไม่ระบุ"}</p>
                      <p className="text-xs text-fg-subtle">{order.items.length} รายการ</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-fg-subtle">{formatDate(order.createdAt)}</span>
                    <span className="font-bold text-fg">{formatPrice(order.total)}</span>
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
                          <Badge tone={isCustom ? "brand" : "info"} className="w-fit">
                            {isCustom ? "Custom" : "ปกติ"}
                          </Badge>
                        </div>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-2">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-bg-deep">
                            {firstItem?.images && firstItem.images.length > 1 ? (
                              firstItem.images.map((img, imgIdx) => (
                                <img key={imgIdx} src={img} alt="" className="absolute inset-0 h-full w-full object-contain" style={{ zIndex: imgIdx + 1 }} />
                              ))
                            ) : (
                              <img src={firstItem?.image || "/placeholder.png"} alt={firstItem?.name || ""} className="h-full w-full object-cover" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="max-w-[160px] truncate text-sm font-medium">{firstItem?.name || "ไม่ระบุ"}</span>
                            <span className="text-xs text-fg-subtle">{order.items.length} รายการ</span>
                          </div>
                        </div>
                      </TD>
                      <TD className="font-bold">{formatPrice(order.total)}</TD>
                      <TD><StatusBadge status={order.status} /></TD>
                      <TD className="text-fg-muted">{formatDate(order.createdAt)}</TD>
                      <TD>
                        <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(order)}>
                          ดูรายละเอียด
                        </Button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 md:flex-row">
              <p className="text-sm text-fg-subtle">
                แสดง {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} จาก {filteredOrders.length} รายการ
              </p>
              <div className="flex items-center gap-1">
                <Button variant="secondary" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm text-fg-muted">{currentPage}/{totalPages}</span>
                <Button variant="secondary" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm md:p-8"
          onClick={() => setSelectedOrder(null)}
        >
          <Card
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line p-5">
              <h2 className="font-semibold text-fg">
                คำสั่งซื้อ #{selectedOrder._id.slice(-8).toUpperCase()}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-fg-subtle hover:bg-white/5 hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <h3 className="mb-3 text-sm font-medium text-fg-muted">รายการสินค้า</h3>
              <div className="flex flex-col gap-3">
                {selectedOrder.items.map((item, idx) => {
                  const productId = typeof item.productId === "string" ? item.productId : item.productId?._id;
                  const isCustomProduct = productId?.startsWith("custom-") || !!item.customParts;
                  return (
                    <div key={idx} className="rounded-lg border border-line bg-white/[0.02] p-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("relative shrink-0 overflow-hidden rounded-md bg-bg-deep", isCustomProduct ? "h-20 w-20" : "h-14 w-14")}>
                          {isCustomProduct && item.images && item.images.length > 1 ? (
                            item.images.map((img, imgIdx) => (
                              <img key={imgIdx} src={img} alt="" className="absolute inset-0 h-full w-full object-contain" style={{ zIndex: imgIdx + 1 }} />
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
                                {(
                                  Object.entries(item.customParts) as [string, { name?: string; image?: string } | undefined][]
                                ).map(([key, part]) =>
                                  part?.name ? (
                                    <div key={key} className="flex items-center gap-2">
                                      {part.image && (
                                        <img src={part.image} alt={key} className="h-8 w-8 rounded bg-surface-raised object-contain" />
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
                          {formatPrice(item.price * item.quantity)}
                        </p>
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
                {selectedOrder.shippingAddress.subDistrict && (
                  <p>แขวง/ตำบล: {selectedOrder.shippingAddress.subDistrict}</p>
                )}
                <p>
                  {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}
                </p>
              </div>

              {selectedOrder.trackingNumber && (
                <div className="mt-4 rounded-lg border border-line bg-brand-subtle p-4">
                  <p className="mb-1 text-sm text-brand">หมายเลขพัสดุ</p>
                  <p className="text-lg font-bold tracking-wider text-fg">{selectedOrder.trackingNumber}</p>
                  <p className="mt-2 text-sm text-fg-subtle">
                    {carrierNames[selectedOrder.carrier || "other"] || selectedOrder.carrier}
                  </p>
                </div>
              )}

              {selectedOrder.status === "shipped" ? (
                <Button
                  variant="primary"
                  onClick={() => router.push(`/tracking?order=${selectedOrder._id}`)}
                  className="mt-4 w-full bg-success hover:opacity-90"
                >
                  <CheckCircle2 className="h-4 w-4" /> ยืนยันรับสินค้า / ติดตามพัสดุ
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/tracking?order=${selectedOrder._id}`)}
                  className="mt-4 w-full"
                >
                  <Truck className="h-4 w-4" /> ติดตามพัสดุ
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
