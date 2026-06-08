import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import SessionExpiredDrawer from "@/components/SessionExpiredDrawer";
import "./tailwind.css";

export const metadata: Metadata = {
  title: "TikTok Live Web App",
  description: "Next.js web app nhận comment TikTok Live từ Python WebSocket",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#f4f7f8] text-[#273044] antialiased overflow-hidden">
        {children}
        <SessionExpiredDrawer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
