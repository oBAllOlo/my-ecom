"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Wrench,
  ClipboardList,
  Users,
  ArrowLeft,
  Keyboard,
} from "lucide-react";
import { cn } from "@/components/ui";

const nav = [
  { href: "/admin", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/admin/products", label: "สินค้า", icon: Package },
  { href: "/admin/categories", label: "หมวดหมู่", icon: FolderTree },
  { href: "/admin/custom-parts", label: "ชิ้นส่วนคัสตอม", icon: Wrench },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: ClipboardList },
  { href: "/admin/users", label: "ผู้ใช้", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-bg">
      {/* Topbar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-surface/85 px-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-2 font-bold text-fg">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
            <Keyboard className="h-4 w-4" />
          </span>
          <span>Admin Panel</span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" /> กลับหน้าร้าน
        </Link>
      </header>

      <div className="mx-auto flex max-w-screen-2xl">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-60 shrink-0 border-r border-line p-3 lg:block">
          <nav className="sticky top-20 flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-brand-subtle text-brand" : "text-fg-muted hover:bg-white/5 hover:text-fg"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Mobile nav */}
          <nav className="flex gap-2 overflow-x-auto border-b border-line p-3 lg:hidden">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    active ? "bg-brand-subtle text-brand" : "text-fg-muted hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
