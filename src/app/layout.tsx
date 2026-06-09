import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import SessionExpiredDrawer from "@/components/SessionExpiredDrawer";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./tailwind.css";

export const metadata: Metadata = {
  title: "TikTok Live Web App",
  description: "Next.js web app nhận comment TikTok Live từ Python WebSocket",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffd3dc",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#f4f7f8] text-[#273044] antialiased overflow-hidden">
        {children}
        <SessionExpiredDrawer />
        <SpeedInsights/>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
