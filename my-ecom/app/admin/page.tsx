"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  Clock,
  Users,
  Wallet,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  ClipboardList,
  AlertTriangle,
  FolderTree,
  Wrench,
  Truck,
  ChevronRight,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  PageHeader,
  Card,
  Badge,
  Button,
  Field,
  Input,
  Spinner,
  cn,
} from "@/components/ui";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  totalRevenue: number;
}
interface Order {
  _id: string;
  userId: { name: string; email: string } | string;
  items: Array<{ name: string; quantity: number; price: number; image?: string; images?: string[] }>;
  total: number;
  status: string;
  createdAt: string;
}
interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}
interface ChartData {
  name: string;
  revenue: number;
  orders: number;
}
type TimeRange = "day" | "week" | "month" | "year";

function ShippingSettingsSection() {
  const [shippingCost, setShippingCost] = useState(50);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1500);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/shipping");
        const data = await res.json();
        if (data.success) {
          setShippingCost(data.data.shippingCost);
          setFreeShippingThreshold(data.data.freeShippingThreshold);
        }
      } catch (error) {
        console.error("Error fetching shipping settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingCost, freeShippingThreshold }),
      });
      const data = await res.json();
      if (data.success) setMessage({ type: "success", text: "บันทึกการตั้งค่าเรียบร้อยแล้ว" });
      else setMessage({ type: "error", text: data.error || "เกิดข้อผิดพลาด" });
    } catch {
      setMessage({ type: "error", text: "ไม่สามารถบันทึกได้" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <Card className="mb-6 p-6">
      <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-fg">
        <Truck className="h-5 w-5 text-brand" /> ตั้งค่าค่าจัดส่ง
      </h3>
      {isLoading ? (
        <div className="flex justify-center py-4"><Spinner className="h-6 w-6" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="ค่าจัดส่งปกติ (บาท)">
              <Input type="number" min="0" value={shippingCost || ""} onChange={(e) => setShippingCost(parseInt(e.target.value) || 0)} />
              <span className="text-xs text-fg-subtle">ตั้งเป็น 0 เพื่อส่งฟรีทุกออเดอร์</span>
            </Field>
            <Field label="ยอดขั้นต่ำสำหรับส่งฟรี (บาท)">
              <Input type="number" min="0" value={freeShippingThreshold || ""} onChange={(e) => setFreeShippingThreshold(parseInt(e.target.value) || 0)} />
              <span className="text-xs text-fg-subtle">ลูกค้าสั่งซื้อถึงยอดนี้จะได้ส่งฟรี</span>
            </Field>
          </div>
          <div className="mt-4 rounded-md bg-brand-subtle px-4 py-3 text-sm text-fg-muted">
            ค่าจัดส่ง: <strong className="text-success">{shippingCost.toLocaleString()} บาท</strong> | ส่งฟรีเมื่อสั่งขั้นต่ำ:{" "}
            <strong className="text-warning">{freeShippingThreshold.toLocaleString()} บาท</strong>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
            </Button>
            {message && (
              <span className={cn("text-sm", message.type === "success" ? "text-success" : "text-danger")}>{message.text}</span>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

const statusMeta: Record<string, { label: string; tone: "warning" | "info" | "brand" | "success" | "danger" }> = {
  pending: { label: "รอชำระ", tone: "warning" },
  processing: { label: "กำลังจัด", tone: "info" },
  shipped: { label: "จัดส่งแล้ว", tone: "brand" },
  delivered: { label: "สำเร็จ", tone: "success" },
  cancelled: { label: "ยกเลิก", tone: "danger" },
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/orders?scope=all"),
          fetch("/api/users"),
        ]);
        const products = await productsRes.json();
        const orders = await ordersRes.json();
        const users = await usersRes.json();
        const fetchedOrders: Order[] = orders.data || [];
        const allProducts: Product[] = products.data || [];

        setAllOrders(fetchedOrders);
        const totalRevenue = fetchedOrders.reduce((sum: number, order: Order) => sum + order.total, 0);
        const sortedOrders = [...fetchedOrders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentOrders(sortedOrders.slice(0, 5));
        setLowStockProducts(allProducts.filter((p) => p.stock < 10).slice(0, 5));

        const statusCounts = {
          pending: fetchedOrders.filter((o) => o.status === "pending").length,
          processing: fetchedOrders.filter((o) => o.status === "processing").length,
          shipped: fetchedOrders.filter((o) => o.status === "shipped").length,
          delivered: fetchedOrders.filter((o) => o.status === "delivered").length,
          cancelled: fetchedOrders.filter((o) => o.status === "cancelled").length,
        };
        setStatusData([
          { name: "รอชำระเงิน", value: statusCounts.pending, color: "#f59e0b" },
          { name: "กำลังจัดส่ง", value: statusCounts.processing, color: "#0ea5e9" },
          { name: "จัดส่งแล้ว", value: statusCounts.shipped, color: "#6366f1" },
          { name: "สำเร็จ", value: statusCounts.delivered, color: "#10b981" },
          { name: "ยกเลิก", value: statusCounts.cancelled, color: "#f43f5e" },
        ]);
        setStats({
          totalProducts: allProducts.length || 0,
          totalOrders: fetchedOrders.length || 0,
          totalUsers: users.data?.length || 0,
          pendingOrders: statusCounts.pending,
          totalRevenue,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "admin") fetchStats();
  }, [user]);

  const chartData = useMemo(() => {
    const data: ChartData[] = [];
    const now = new Date();
    const buildRange = (count: number, stepBack: (d: Date, i: number) => void, label: (d: Date) => string, span: "hour" | "day" | "month") => {
      for (let i = count - 1; i >= 0; i--) {
        const start = new Date(now);
        stepBack(start, i);
        const end = new Date(start);
        if (span === "hour") end.setHours(start.getHours() + 1);
        else if (span === "day") end.setDate(start.getDate() + 1);
        else end.setMonth(start.getMonth() + 1);
        const ords = allOrders.filter((o) => {
          const d = new Date(o.createdAt);
          return d >= start && d < end;
        });
        data.push({ name: label(start), revenue: ords.reduce((s, o) => s + o.total, 0), orders: ords.length });
      }
    };
    if (timeRange === "day")
      buildRange(24, (d, i) => d.setHours(now.getHours() - i, 0, 0, 0), (d) => `${d.getHours().toString().padStart(2, "0")}:00`, "hour");
    else if (timeRange === "week")
      buildRange(7, (d, i) => { d.setDate(now.getDate() - i); d.setHours(0, 0, 0, 0); }, (d) => d.toLocaleDateString("th-TH", { weekday: "long" }), "day");
    else if (timeRange === "month")
      buildRange(30, (d, i) => { d.setDate(now.getDate() - i); d.setHours(0, 0, 0, 0); }, (d) => `${d.getDate()}/${d.getMonth() + 1}`, "day");
    else
      buildRange(12, (d, i) => { d.setMonth(now.getMonth() - i); d.setDate(1); d.setHours(0, 0, 0, 0); }, (d) => d.toLocaleDateString("th-TH", { month: "short" }), "month");
    return data;
  }, [allOrders, timeRange]);

  const filteredStats = useMemo(() => ({
    totalRevenue: chartData.reduce((sum, d) => sum + d.revenue, 0),
    totalOrders: chartData.reduce((sum, d) => sum + d.orders, 0),
  }), [chartData]);

  if (isLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }
  if (!user || user.role !== "admin") return null;

  const statCards: { title: string; value: number; icon: LucideIcon; tone: string; link: string; description: string }[] = [
    { title: "สินค้าทั้งหมด", value: stats.totalProducts, icon: Package, tone: "bg-brand-subtle text-brand", link: "/admin/products", description: "รายการสินค้าในระบบ" },
    { title: "คำสั่งซื้อทั้งหมด", value: stats.totalOrders, icon: ShoppingCart, tone: "bg-success/10 text-success", link: "/admin/orders", description: "ออเดอร์ที่ได้รับ" },
    { title: "รอดำเนินการ", value: stats.pendingOrders, icon: Clock, tone: "bg-warning/10 text-warning", link: "/admin/orders", description: "ต้องจัดการ" },
    { title: "ผู้ใช้ทั้งหมด", value: stats.totalUsers, icon: Users, tone: "bg-info/10 text-info", link: "/admin/users", description: "สมาชิกในระบบ" },
  ];

  const quickActions: { title: string; description: string; icon: LucideIcon; link: string }[] = [
    { title: "จัดการสินค้า", description: "เพิ่ม แก้ไข ลบสินค้า", icon: Package, link: "/admin/products" },
    { title: "จัดการหมวดหมู่", description: "เพิ่ม แก้ไข ลบหมวดหมู่", icon: FolderTree, link: "/admin/categories" },
    { title: "จัดการคำสั่งซื้อ", description: "ดูและอัปเดตสถานะ", icon: ShoppingCart, link: "/admin/orders" },
    { title: "จัดการผู้ใช้", description: "ดูและแก้ไขผู้ใช้", icon: Users, link: "/admin/users" },
    { title: "จัดการชิ้นส่วน Custom", description: "สต็อกคีย์บอร์ด Custom", icon: Wrench, link: "/admin/custom-parts" },
  ];

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: "day", label: "วันนี้" },
    { value: "week", label: "7 วัน" },
    { value: "month", label: "30 วัน" },
    { value: "year", label: "12 เดือน" },
  ];

  const formatOrderDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-lg">
          <p className="mb-1 font-semibold text-brand">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm text-fg-muted">
              {entry.dataKey === "revenue" ? "รายได้: " : "ออเดอร์: "}
              <span className="font-semibold text-fg">
                {entry.dataKey === "revenue" ? `${entry.value.toLocaleString()} บาท` : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <PageHeader title={`ยินดีต้อนรับ, ${user.name}`} subtitle="ภาพรวมของร้านค้าในวันนี้" />

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.link}>
              <Card className="flex items-center gap-3 p-4 transition-colors hover:border-line-strong">
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-md", card.tone)}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-fg">{card.value}</p>
                  <p className="truncate text-xs text-fg-subtle">{card.title}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Revenue card */}
      <Card className="mb-6 flex items-center justify-between p-6">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-fg-muted">
            <Wallet className="h-4 w-4" /> รายได้รวมทั้งหมด
          </p>
          <p className="mt-1 text-3xl font-bold text-fg">{stats.totalRevenue.toLocaleString()} บาท</p>
          <p className="mt-1 text-sm text-fg-subtle">จากคำสั่งซื้อทั้งหมด {stats.totalOrders} รายการ</p>
        </div>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <TrendingUp className="h-7 w-7" />
        </span>
      </Card>

      {/* Time range */}
      <Card className="mb-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-fg">
              <TrendingUp className="h-5 w-5 text-brand" /> สรุปยอดขาย
            </h3>
            <p className="mt-1 text-sm text-fg-subtle">
              รายได้ {filteredStats.totalRevenue.toLocaleString()} บาท | {filteredStats.totalOrders} ออเดอร์
            </p>
          </div>
          <div className="flex gap-1.5">
            {timeRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  timeRange === option.value ? "bg-brand text-white" : "bg-surface-raised text-fg-muted hover:text-fg"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg">
            <Wallet className="h-4 w-4 text-brand" /> กราฟรายได้
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval="preserveStartEnd" angle={-45} textAnchor="end" height={50} tick={{ fill: "#64748b" }} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : `${value}`)} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg">
            <PieIcon className="h-4 w-4 text-brand" /> สถานะออเดอร์
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData.filter((d) => d.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.filter((d) => d.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {statusData.filter((d) => d.value > 0).map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                <span className="text-xs text-fg-muted">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mb-6 p-5">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-fg">
          <BarChart3 className="h-4 w-4 text-brand" /> จำนวนออเดอร์
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval="preserveStartEnd" angle={-45} textAnchor="end" height={50} tick={{ fill: "#64748b" }} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent orders + low stock */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-fg">
              <ClipboardList className="h-4 w-4 text-brand" /> ออเดอร์ล่าสุด
            </h3>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-hover">
              ดูทั้งหมด <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-fg-subtle">ยังไม่มีคำสั่งซื้อ</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentOrders.map((order) => {
                const meta = statusMeta[order.status] || statusMeta.pending;
                const firstItem = order.items?.[0];
                return (
                  <Link
                    key={order._id}
                    href="/admin/orders"
                    className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.02] p-3 transition-colors hover:border-line-strong"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-bg-deep">
                      {firstItem?.images && firstItem.images.length > 1 ? (
                        firstItem.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="absolute inset-0 h-full w-full object-contain" style={{ zIndex: i + 1 }} />
                        ))
                      ) : (
                        <img src={firstItem?.image || "/placeholder.png"} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-fg">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-fg-subtle">{formatOrderDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-fg">{order.total.toLocaleString()} บาท</p>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-fg">
              <AlertTriangle className="h-4 w-4 text-warning" /> สินค้าใกล้หมด
            </h3>
            <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-brand hover:text-brand-hover">
              จัดการ <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-success">
              <CheckCircle2 className="h-7 w-7" />
              <p className="text-sm">สินค้าทั้งหมดมี Stock เพียงพอ</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {lowStockProducts.map((product) => (
                <Link
                  key={product._id}
                  href="/admin/products"
                  className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.02] p-3 transition-colors hover:border-line-strong"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-bg-deep">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-fg">{product.name}</p>
                    <p className="text-xs text-fg-subtle">{product.price.toLocaleString()} บาท</p>
                  </div>
                  <Badge tone={product.stock <= 3 ? "danger" : "warning"}>เหลือ {product.stock}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick actions */}
      <h3 className="mb-4 text-lg font-semibold text-fg">จัดการร้านค้า</h3>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} href={action.link}>
              <Card className="flex items-center gap-3 p-4 transition-colors hover:border-line-strong">
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-subtle text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-semibold text-fg">{action.title}</h4>
                  <p className="text-xs text-fg-subtle">{action.description}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <ShippingSettingsSection />

      {/* System status */}
      <Card className="p-5">
        <h3 className="mb-4 font-semibold text-fg">สรุปสถานะระบบ</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Database", value: "Connected" },
            { label: "API Server", value: "Running" },
            { label: "Authentication", value: "Active" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-lg border border-line bg-white/[0.02] p-4">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              <div>
                <p className="text-xs text-fg-subtle">{s.label}</p>
                <p className="text-sm font-medium text-fg">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
