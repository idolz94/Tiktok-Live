import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ClerkTokenSync } from "@/components/ClerkTokenSync";
import SessionExpiredDrawer from "@/components/SessionExpiredDrawer";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./tailwind.css";

export const metadata: Metadata = {
  title: "TikTok Live Web App",
  description: "Next.js web app nhận comment TikTok Live từ Python WebSocket",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
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
    <ClerkProvider>
      <html lang="vi">
        <body className="min-h-dvh bg-[#f4f7f8] text-[#273044] antialiased overflow-hidden">
          <ClerkTokenSync />
          {children}
          <SessionExpiredDrawer />
          <SpeedInsights/>
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
