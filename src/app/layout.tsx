import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import SessionExpiredDrawer from "@/components/SessionExpiredDrawer";
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./tailwind.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

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
    <html lang="vi" className={plusJakartaSans.variable}>
      <body className="min-h-dvh bg-[#f4f7f8] text-[#273044] antialiased overflow-hidden font-(family-name:--font-plus-jakarta-sans)">
        {children}
        <SessionExpiredDrawer />
        <SpeedInsights/>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
