"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Search,
  ShoppingCart,
  User,
  ChevronDown,
  Wrench,
  Package,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { buttonClasses } from "@/components/ui";
import { formatPrice } from "@/lib/mockData";

interface SearchSuggestion {
  _id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
}

const navLinks = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "สินค้าทั้งหมด" },
  { href: "/custom", label: "คีย์บอร์ดคัสตอม" },
];

export default function Header() {
  const router = useRouter();
  const { getCartCount, clearCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  // Clear the (localStorage-backed) cart on logout so it doesn't persist
  // across sessions / to the next user on the same browser.
  const handleLogout = () => {
    clearCart();
    logout();
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const cartCount = getCartCount();
  const searchHref = searchQuery
    ? `/products?search=${encodeURIComponent(searchQuery)}`
    : "/products";

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const desktopSearchRef = useRef<HTMLFormElement>(null);
  const mobileSearchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }
    setIsLoadingSuggestions(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (data.success) {
          setSuggestions(((data.data ?? []) as SearchSuggestion[]).slice(0, 6));
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Search suggestions error:", err);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideDesktop = desktopSearchRef.current?.contains(target);
      const insideMobile = mobileSearchRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(searchHref);
    setShowSuggestions(false);
    setIsMenuOpen(false);
  };

  const handleSuggestionClick = (id: string) => {
    router.push(`/products/${id}`);
    setShowSuggestions(false);
    setIsMenuOpen(false);
    setSearchQuery("");
  };

  const renderSuggestionsDropdown = () => {
    if (!showSuggestions || !searchQuery.trim()) return null;
    return (
      <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-lg border border-line bg-surface shadow-xl">
        {isLoadingSuggestions ? (
          <div className="px-4 py-3 text-sm text-fg-subtle">กำลังค้นหา...</div>
        ) : suggestions.length === 0 ? (
          <div className="px-4 py-3 text-sm text-fg-subtle">ไม่พบสินค้าที่ตรงกับ &quot;{searchQuery}&quot;</div>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {suggestions.map((item) => (
              <li key={item._id}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(item._id)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-bg-deep">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">{item.name}</p>
                    <p className="truncate text-xs text-fg-subtle">{item.brand}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-brand">
                    {formatPrice(item.price)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => {
            router.push(searchHref);
            setShowSuggestions(false);
            setIsMenuOpen(false);
          }}
          className="block w-full border-t border-line bg-bg-deep px-4 py-2.5 text-center text-sm font-medium text-brand transition-colors hover:bg-white/5"
        >
          ดูผลทั้งหมด &quot;{searchQuery}&quot;
        </button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-fg">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-white">
            <Keyboard className="h-5 w-5" />
          </span>
          <span className="text-lg">
            Custom<span className="text-brand">KB</span>
          </span>
        </Link>

        {/* Search - desktop */}
        <form
          ref={desktopSearchRef}
          role="search"
          onSubmit={handleSearchSubmit}
          className="relative hidden flex-1 md:block"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            placeholder="ค้นหาคีย์บอร์ด..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="w-full rounded-full border border-line bg-bg-deep py-2 pl-10 pr-4 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          {renderSuggestionsDropdown()}
        </form>

        {/* Nav - desktop */}
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/cart"
            className="relative ml-1 flex h-10 w-10 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
            aria-label="ตะกร้าสินค้า"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative ml-1">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full border border-line bg-surface-raised px-3 py-1.5 text-sm text-fg transition-colors hover:border-line-strong"
              >
                <User className="h-4 w-4 text-fg-muted" />
                <span className="max-w-24 truncate font-medium">
                  {user?.name?.split(" ")[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-fg-subtle" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-56 overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
                    <div className="border-b border-line bg-brand-subtle px-4 py-3">
                      <p className="truncate font-semibold text-fg">{user?.name}</p>
                      <p className="truncate text-xs text-fg-subtle">{user?.email}</p>
                    </div>
                    {user?.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
                      >
                        <Wrench className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
                    >
                      <User className="h-4 w-4" /> โปรไฟล์
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
                    >
                      <Package className="h-4 w-4" /> คำสั่งซื้อ
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center gap-2.5 border-t border-line px-4 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger/10"
                    >
                      <LogOut className="h-4 w-4" /> ออกจากระบบ
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link href="/login" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className={buttonClasses({ variant: "primary", size: "sm" })}>
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile actions */}
        <div className="ml-auto flex items-center gap-1 md:hidden">
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-fg-muted hover:bg-white/5"
            aria-label="ตะกร้าสินค้า"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-md text-fg hover:bg-white/5"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="เมนู"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="border-t border-line bg-bg-deep px-4 py-4 md:hidden">
          <form
            ref={mobileSearchRef}
            role="search"
            onSubmit={handleSearchSubmit}
            className="relative mb-3"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
            <input
              type="search"
              placeholder="ค้นหาคีย์บอร์ด..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="w-full rounded-full border border-line bg-surface py-2 pl-10 pr-4 text-sm text-fg placeholder:text-fg-subtle focus:border-brand focus:outline-none"
            />
            {renderSuggestionsDropdown()}
          </form>

          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-line py-3 text-sm font-medium text-fg-muted hover:text-fg"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 py-3 text-sm font-medium text-fg">
                  <User className="h-4 w-4" /> {user?.name}
                </div>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 border-t border-line py-3 text-sm text-fg-muted hover:text-fg"
                  >
                    <Wrench className="h-4 w-4" /> Admin Panel
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="border-t border-line py-3 text-sm text-fg-muted hover:text-fg"
                >
                  โปรไฟล์
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="border-t border-line py-3 text-sm text-fg-muted hover:text-fg"
                >
                  คำสั่งซื้อ
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 border-t border-line py-3 text-left text-sm text-danger"
                >
                  <LogOut className="h-4 w-4" /> ออกจากระบบ
                </button>
              </>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className={buttonClasses({ variant: "secondary" })}
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className={buttonClasses({ variant: "primary" })}
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
