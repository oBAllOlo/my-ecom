import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

import Header from "@/components/Header";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KeyBoardTH - ร้านคีย์บอร์ดคุณภาพ | Mechanical & Gaming Keyboards",
  description:
    "ร้านจำหน่ายคีย์บอร์ด Mechanical และ Gaming จากแบรนด์ชั้นนำทั่วโลก พร้อมบริการหลังการขาย ส่งฟรีทั่วประเทศ",
  keywords:
    "คีย์บอร์ด, keyboard, mechanical keyboard, gaming keyboard, Keychron, Razer, Ducky",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <CartProvider>
            <div className="page-container">
              <Header />
              <main className="main-content">{children}</main>
            </div>
          </CartProvider>
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
