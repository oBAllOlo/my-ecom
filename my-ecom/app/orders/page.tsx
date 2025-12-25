"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    productId:
      | string
      | {
          _id: string;
          name: string;
          image: string;
        };
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
    province: string;
    postalCode: string;
  };
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  createdAt: string;
}

const carriers = [
  { id: "kerry", name: "Kerry Express", icon: "🟠" },
  { id: "flash", name: "Flash Express", icon: "🟡" },
  { id: "jt", name: "J&T Express", icon: "🔴" },
  { id: "thaipost", name: "ไปรษณีย์ไทย", icon: "🟤" },
  { id: "scg", name: "SCG Express", icon: "🟢" },
  { id: "other", name: "อื่นๆ", icon: "⚪" },
];

const statusConfig: Record<
  string,
  { label: string; bgClass: string; textClass: string; icon: string }
> = {
  pending: {
    label: "รอดำเนินการ",
    bgClass: "bg-amber-500/20",
    textClass: "text-amber-400",
    icon: "⏳",
  },
  processing: {
    label: "กำลังจัดส่ง",
    bgClass: "bg-blue-500/20",
    textClass: "text-blue-400",
    icon: "📦",
  },
  shipped: {
    label: "จัดส่งแล้ว",
    bgClass: "bg-violet-500/20",
    textClass: "text-violet-400",
    icon: "🚚",
  },
  delivered: {
    label: "ส่งสำเร็จ",
    bgClass: "bg-emerald-500/20",
    textClass: "text-emerald-400",
    icon: "✅",
  },
  cancelled: {
    label: "ยกเลิก",
    bgClass: "bg-red-500/20",
    textClass: "text-red-400",
    icon: "❌",
  },
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "custom" | "regular"
  >("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Helper function to check if order contains custom products
  const isCustomOrder = (order: Order) => {
    return order.items.some((item) => {
      const productId =
        typeof item.productId === "string"
          ? item.productId
          : item.productId?._id;
      return productId?.startsWith("custom-");
    });
  };

  // Filter orders based on category, status, and search
  const filteredOrders = orders.filter((order) => {
    // Category filter
    let categoryMatch = true;
    if (categoryFilter === "custom") categoryMatch = isCustomOrder(order);
    else if (categoryFilter === "regular")
      categoryMatch = !isCustomOrder(order);

    // Status filter
    let statusMatch = true;
    if (statusFilter !== "all") {
      statusMatch = order.status === statusFilter;
    }

    // Search filter
    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const orderIdMatch = order._id.toLowerCase().includes(query);
      const productNameMatch = order.items.some((item) =>
        item.name.toLowerCase().includes(query)
      );
      searchMatch = orderIdMatch || productNameMatch;
    }

    return categoryMatch && statusMatch && searchMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filter changes
  const handleCategoryChange = (category: "all" | "custom" | "regular") => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const customOrdersCount = orders.filter(isCustomOrder).length;
  const regularOrdersCount = orders.length - customOrdersCount;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user?._id) {
        try {
          const res = await fetch(`/api/orders?userId=${user._id}`);
          const data = await res.json();
          if (data.success) {
            setOrders(data.data);
          } else {
            toast.error("โหลดข้อมูลล้มเหลว");
          }
        } catch (err) {
          console.error("Error fetching orders:", err);
          toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-white/5 px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="text-violet-400 no-underline font-medium py-2 px-3 md:px-4 bg-violet-500/10 rounded-lg hover:bg-violet-500/20 transition-all text-sm md:text-base"
          >
            ← กลับ
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            <span className="text-2xl md:text-4xl">🛒</span>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-50 m-0">
                ประวัติการสั่งซื้อ
              </h1>
              <p className="text-xs md:text-sm text-slate-500 m-0">
                {orders.length} คำสั่งซื้อทั้งหมด
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 flex items-center gap-3 shadow-lg shadow-blue-500/20">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-base">
              📦
            </div>
            <div>
              <p className="text-white text-lg font-bold m-0 leading-tight">
                {orders.length}
              </p>
              <p className="text-blue-100 text-xs m-0">คำสั่งซื้อ</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-3 flex items-center gap-3 shadow-lg shadow-emerald-500/20">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-base">
              ✅
            </div>
            <div>
              <p className="text-white text-lg font-bold m-0 leading-tight">
                {orders.filter((o) => o.status === "delivered").length}
              </p>
              <p className="text-emerald-100 text-xs m-0">สำเร็จ</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-3 flex items-center gap-3 shadow-lg shadow-amber-500/20">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-base">
              ⏳
            </div>
            <div>
              <p className="text-white text-lg font-bold m-0 leading-tight">
                {
                  orders.filter(
                    (o) => o.status === "pending" || o.status === "processing"
                  ).length
                }
              </p>
              <p className="text-amber-100 text-xs m-0">รอดำเนินการ</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-3 flex items-center gap-3 shadow-lg shadow-violet-500/20">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-base">
              💰
            </div>
            <div>
              <p className="text-white text-base md:text-lg font-bold m-0 leading-tight break-all">
                {new Intl.NumberFormat("th-TH", {
                  style: "currency",
                  currency: "THB",
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(orders.reduce((sum, order) => sum + order.total, 0))}
              </p>
              <p className="text-purple-100 text-xs m-0">ยอดรวม</p>
            </div>
          </div>
        </div>
        {/* Category Filter Tabs */}
        <div className="flex gap-2 md:gap-3 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-3 md:px-5 py-2 md:py-2.5 rounded-xl font-semibold transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap text-sm md:text-base ${
              categoryFilter === "all"
                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}
          >
            📦 ทั้งหมด
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                categoryFilter === "all" ? "bg-white/20" : "bg-slate-600"
              }`}
            >
              {orders.length}
            </span>
          </button>
          <button
            onClick={() => handleCategoryChange("custom")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              categoryFilter === "custom"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}
          >
            🛠️ Custom Build
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                categoryFilter === "custom" ? "bg-white/20" : "bg-slate-600"
              }`}
            >
              {customOrdersCount}
            </span>
          </button>
          <button
            onClick={() => handleCategoryChange("regular")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              categoryFilter === "regular"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
            }`}
          >
            🛒 สินค้าทั่วไป
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                categoryFilter === "regular" ? "bg-white/20" : "bg-slate-600"
              }`}
            >
              {regularOrdersCount}
            </span>
          </button>
        </div>

        {/* Status Filter Dropdown & Search */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
            className="text-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-slate-200">📋 สถานะทั้งหมด</option>
            <option value="pending" className="bg-slate-900 text-slate-200">⏳ รอดำเนินการ</option>
            <option value="processing" className="bg-slate-900 text-slate-200">📦 กำลังจัดเตรียม</option>
            <option value="shipped" className="bg-slate-900 text-slate-200">🚚 จัดส่งแล้ว</option>
            <option value="delivered" className="bg-slate-900 text-slate-200">✅ ส่งสำเร็จ</option>
            <option value="cancelled" className="bg-slate-900 text-slate-200">❌ ยกเลิก</option>
          </select>

          <input
            type="text"
            placeholder="🔍 ค้นหารหัสคำสั่งซื้อ หรือชื่อสินค้า..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
            className="flex-1 text-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-violet-500 transition-all placeholder:text-slate-500"
          />
        </div>
        {/* Orders - Mobile Cards (visible on mobile) */}
        <div className="lg:hidden flex flex-col gap-3 mb-4">
          {paginatedOrders.map((order) => {
            const status = statusConfig[order.status];
            const isCustom = isCustomOrder(order);
            const firstItem = order.items[0];
            const orderIdFormatted = order._id.slice(-8).toUpperCase();

            // Handle displaying first item's image and name
            // For custom orders, items might be complex, simplified for display

            return (
              <div
                key={order._id}
                style={{
                  background: "rgba(15, 23, 42, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
                className="bg-transparent rounded-xl p-4"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-mono text-slate-50 font-semibold text-sm">
                      #{orderIdFormatted}
                    </span>
                    {isCustom ? (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                        🛠️
                      </span>
                    ) : (
                      <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        🛒
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 py-1 px-2 rounded-full text-xs font-semibold ${status.bgClass} ${status.textClass}`}
                  >
                    {status.icon} {status.label}
                  </span>
                </div>
                {/* Product preview */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                  <div className="relative w-14 h-14 flex-shrink-0">
                    {/* Check if first item is custom with multiple images */}
                    {firstItem?.images && firstItem.images.length > 1 ? (
                      <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-700">
                        {firstItem.images.map((img: string, imgIdx: number) => (
                          <img
                            key={imgIdx}
                            src={img}
                            alt={`${firstItem?.name} layer ${imgIdx + 1}`}
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ zIndex: imgIdx + 1 }}
                          />
                        ))}
                      </div>
                    ) : (
                      <img
                        src={firstItem?.image || "/placeholder.png"}
                        alt={firstItem?.name || "Product"}
                        className="w-full h-full rounded-lg object-cover bg-slate-700"
                      />
                    )}
                    {order.items.length > 1 && (
                      <span className="absolute -top-1 -right-1 bg-violet-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold z-10">
                        +{order.items.length - 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-50 text-sm font-medium m-0 truncate">
                      {firstItem?.name || "ไม่ระบุ"}
                    </p>
                    <p className="text-slate-500 text-xs m-0">
                      {order.items.length} รายการ
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-slate-50 font-medium text-sm m-0">
                      ยอดรวม
                    </p>
                  </div>
                  <span className="text-emerald-400 font-bold">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-slate-500 text-xs">
                    {formatDate(order.createdAt)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOrder(order);
                    }}
                    className="py-2 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold text-sm border-none cursor-pointer"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            );
          })}
          {orders.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <span className="text-6xl block mb-4">📭</span>
              <p>ยังไม่มีคำสั่งซื้อ</p>
            </div>
          )}
        </div>

        {/* Orders Table - Desktop only */}
        <div 
          className="hidden lg:block rounded-2xl overflow-hidden"
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">
                    รหัสคำสั่งซื้อ
                  </th>
                  <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">
                    สินค้า
                  </th>
                  <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">
                    ยอดรวม
                  </th>
                  <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">
                    สถานะ
                  </th>
                  <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">
                    วันที่
                  </th>
                  <th className="text-left p-4 bg-violet-500/10 text-violet-400 font-semibold text-sm uppercase tracking-wide">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => {
                  const status = statusConfig[order.status];
                  const isCustom = isCustomOrder(order);
                  const firstItem = order.items[0];

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-violet-500/5 transition-colors"
                    >
                      <td className="p-4 border-b border-white/5">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-slate-50 font-semibold">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          {isCustom ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 w-fit">
                              🛠️ Custom
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 w-fit">
                              🛒 ปกติ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            {/* Check if first item is custom with multiple images */}
                            {firstItem?.images &&
                            firstItem.images.length > 1 ? (
                              <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-700">
                                {firstItem.images.map(
                                  (img: string, imgIdx: number) => (
                                    <img
                                      key={imgIdx}
                                      src={img}
                                      alt={`${firstItem?.name} layer ${
                                        imgIdx + 1
                                      }`}
                                      className="absolute inset-0 w-full h-full object-contain"
                                      style={{ zIndex: imgIdx + 1 }}
                                    />
                                  )
                                )}
                              </div>
                            ) : (
                              <img
                                src={firstItem?.image || "/placeholder.png"}
                                alt={firstItem?.name || "Product"}
                                className="w-full h-full rounded-lg object-cover bg-slate-700"
                              />
                            )}
                            {order.items.length > 1 && (
                              <span className="absolute -top-1 -right-1 bg-violet-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold z-10">
                                +{order.items.length - 1}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-50 text-sm font-medium truncate max-w-[150px]">
                              {firstItem?.name || "ไม่ระบุ"}
                            </span>
                            <span className="text-slate-500 text-xs">
                              {order.items.length} รายการ
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border-b border-white/5">
                        <span className="text-emerald-400 font-bold text-lg">
                          {formatPrice(order.total)}
                        </span>
                      </td>
                      <td className="p-4 border-b border-white/5">
                        <span
                          className={`inline-flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold ${status.bgClass} ${status.textClass}`}
                        >
                          {status.icon} {status.label}
                        </span>
                      </td>
                      <td className="p-4 border-b border-white/5">
                        <span className="text-slate-400 text-sm">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="p-4 border-b border-white/5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="py-2 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold border-none cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <span className="text-6xl block mb-4">📭</span>
              <p>ยังไม่มีคำสั่งซื้อ</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div 
            className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 rounded-xl p-4"
            style={{
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <div className="text-slate-400 text-xs md:text-sm text-center md:text-left">
              แสดง {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}{" "}
              จาก {filteredOrders.length} รายการ
            </div>
            <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-center">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-2 md:px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  currentPage === 1
                    ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                    : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                }`}
              >
                ⏮️
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-2 md:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  currentPage === 1
                    ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                    : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                }`}
              >
                <span className="hidden md:inline">← ก่อนหน้า</span>
                <span className="md:hidden">←</span>
              </button>

              {/* Page numbers - show only on md+ */}
              <div className="hidden md:flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                        currentPage === pageNum
                          ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Mobile page indicator */}
              <span className="md:hidden text-slate-400 text-sm px-2">
                {currentPage}/{totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-2 md:px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  currentPage === totalPages
                    ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                    : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                }`}
              >
                <span className="hidden md:inline">ถัดไป →</span>
                <span className="md:hidden">→</span>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-2 md:px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  currentPage === totalPages
                    ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                    : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                }`}
              >
                ⏭️
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-2 md:p-8"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-violet-500/30 rounded-2xl md:rounded-3xl max-w-xl w-full max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10">
              <h2 className="text-base md:text-xl text-slate-50 m-0">
                คำสั่งซื้อ #{selectedOrder._id.slice(-8).toUpperCase()}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-none border-none text-slate-500 text-xl md:text-2xl cursor-pointer hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 md:p-6">
              {/* Order Items */}
              <div className="mb-8">
                <h3 className="text-slate-50 text-sm md:text-base mb-3 md:mb-4">
                  📦 รายการสินค้า
                </h3>
                <div className="flex flex-col gap-3">
                  {selectedOrder.items.map((item, idx) => {
                    const productId =
                      typeof item.productId === "string"
                        ? item.productId
                        : item.productId?._id;
                    const isCustomProduct = productId?.startsWith("custom-");

                    return (
                      <div key={idx} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-start gap-4">
                          {/* Image - Stack for custom products */}
                          <div
                            className={`relative flex-shrink-0 bg-slate-700 rounded-xl overflow-hidden ${
                              isCustomProduct ? "w-24 h-24" : "w-16 h-16"
                            }`}
                          >
                            {isCustomProduct &&
                            item.images &&
                            item.images.length > 1 ? (
                              <>
                                {item.images.map((img, imgIdx) => (
                                  <img
                                    key={imgIdx}
                                    src={img}
                                    alt={`${item.name} layer ${imgIdx + 1}`}
                                    className="absolute inset-0 w-full h-full object-contain"
                                    style={{ zIndex: imgIdx + 1 }}
                                  />
                                ))}
                              </>
                            ) : (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-50 m-0 font-semibold">
                              {item.name}
                            </p>
                            <p className="text-slate-500 text-sm m-0">
                              x{item.quantity}
                            </p>

                            {/* Custom Product Details */}
                            {isCustomProduct && (
                              <div className="mt-2 text-xs space-y-1">
                                <p className="m-0 text-purple-400 font-medium">
                                  🛠️ ชิ้นส่วนที่เลือก:
                                </p>
                                {item.customParts ? (
                                  <div className="bg-purple-500/10 rounded-lg p-3 mt-2 space-y-2">
                                    {item.customParts.base?.name && (
                                      <div className="flex items-center gap-2">
                                        {item.customParts.base.image && (
                                          <img
                                            src={item.customParts.base.image}
                                            alt="Base"
                                            className="w-16 h-16 rounded object-contain bg-slate-700"
                                          />
                                        )}
                                        <span className="text-slate-300">
                                          🖥️ Base:
                                        </span>
                                        <span className="text-white">
                                          {item.customParts.base.name}
                                        </span>
                                      </div>
                                    )}
                                    {item.customParts.switch?.name && (
                                      <div className="flex items-center gap-2">
                                        {item.customParts.switch.image && (
                                          <img
                                            src={item.customParts.switch.image}
                                            alt="Switch"
                                            className="w-16 h-16 rounded object-contain bg-slate-700"
                                          />
                                        )}
                                        <span className="text-slate-300">
                                          🔘 Switch:
                                        </span>
                                        <span className="text-white">
                                          {item.customParts.switch.name}
                                        </span>
                                      </div>
                                    )}
                                    {item.customParts.keycapBase?.name && (
                                      <div className="flex items-center gap-2">
                                        {item.customParts.keycapBase.image && (
                                          <img
                                            src={
                                              item.customParts.keycapBase.image
                                            }
                                            alt="Keycap"
                                            className="w-16 h-16 rounded object-contain bg-slate-700"
                                          />
                                        )}
                                        <span className="text-slate-300">
                                          ⌨️ Keycap:
                                        </span>
                                        <span className="text-white">
                                          {item.customParts.keycapBase.name}
                                        </span>
                                      </div>
                                    )}
                                    {item.customParts.keycapAdd1?.name && (
                                      <div className="flex items-center gap-2">
                                        {item.customParts.keycapAdd1.image && (
                                          <img
                                            src={
                                              item.customParts.keycapAdd1.image
                                            }
                                            alt="Add-on 1"
                                            className="w-16 h-16 rounded object-contain bg-slate-700"
                                          />
                                        )}
                                        <span className="text-slate-300">
                                          🎨 Add-on 1:
                                        </span>
                                        <span className="text-white">
                                          {item.customParts.keycapAdd1.name}
                                        </span>
                                      </div>
                                    )}
                                    {item.customParts.keycapAdd2?.name && (
                                      <div className="flex items-center gap-2">
                                        {item.customParts.keycapAdd2.image && (
                                          <img
                                            src={
                                              item.customParts.keycapAdd2.image
                                            }
                                            alt="Add-on 2"
                                            className="w-16 h-16 rounded object-contain bg-slate-700"
                                          />
                                        )}
                                        <span className="text-slate-300">
                                          🎨 Add-on 2:
                                        </span>
                                        <span className="text-white">
                                          {item.customParts.keycapAdd2.name}
                                        </span>
                                      </div>
                                    )}
                                    {item.customParts.wire?.name && (
                                      <div className="flex items-center gap-2">
                                        {item.customParts.wire.image && (
                                          <img
                                            src={item.customParts.wire.image}
                                            alt="Wire"
                                            className="w-16 h-16 rounded object-contain bg-slate-700"
                                          />
                                        )}
                                        <span className="text-slate-300">
                                          🔌 Wire:
                                        </span>
                                        <span className="text-white">
                                          {item.customParts.wire.name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="m-0 text-slate-500 italic">
                                    ไม่พบข้อมูลชิ้นส่วน
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-emerald-400 font-semibold m-0 ml-auto">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between pt-3 md:pt-4 mt-3 md:mt-4 border-t border-white/10 text-slate-400">
                  <span className="text-sm md:text-base">ยอดรวม</span>
                  <span className="text-lg md:text-2xl font-extrabold text-emerald-400">
                    {formatPrice(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-8">
                <h3 className="text-slate-50 text-sm md:text-base mb-3 md:mb-4">
                  📍 ที่อยู่จัดส่ง
                </h3>
                <div className="bg-white/5 p-4 rounded-xl text-slate-400">
                  <p className="text-slate-50 font-semibold mb-2">
                    {selectedOrder.shippingAddress.fullName}
                  </p>
                  <p>{selectedOrder.shippingAddress.phone}</p>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>
                    {selectedOrder.shippingAddress.district},{" "}
                    {selectedOrder.shippingAddress.province}{" "}
                    {selectedOrder.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              {/* Tracking Info if available */}
              {selectedOrder.trackingNumber && (
                <div className="bg-violet-500/15 border border-violet-500/30 rounded-xl p-4">
                  <p className="text-violet-400 m-0 mb-1 text-sm">
                    📦 หมายเลขพัสดุ
                  </p>
                  <p className="text-white m-0 text-lg font-bold tracking-wider">
                    {selectedOrder.trackingNumber}
                  </p>
                  <p className="text-slate-500 mt-2 mb-0 text-sm">
                    🏢{" "}
                    {carriers.find((c) => c.id === selectedOrder.carrier)
                      ?.name || selectedOrder.carrier}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
