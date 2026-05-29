import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

import Header from "@/components/Header";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Custom Keyboard System | ระบบเว็บแอปพลิเคชันสำหรับการปรับแต่งและสั่งซื้อคีย์บอร์ดคอมพิวเตอร์",
  description:
    "ระบบเว็บแอปพลิเคชันสำหรับการปรับแต่งและสั่งซื้อคีย์บอร์ดคอมพิวเตอร์ พร้อมฟีเจอร์ Custom Keyboard Builder",
  keywords:
    "คีย์บอร์ด, keyboard, mechanical keyboard, gaming keyboard, custom keyboard, ปรับแต่งคีย์บอร์ด",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${ibmPlexThai.variable} antialiased`}>
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
