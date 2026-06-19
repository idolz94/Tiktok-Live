"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthScreen from "@/features/auth/components/AuthScreen";
import WelcomeScreen from "@/features/auth/components/WelcomeScreen";
import SplashLoadingScreen from "@/components/SplashLoadingScreen";
import { useAuth } from "../hooks/useAuth";

type AppScreen = "splash" | "welcome" | "auth-login" | "auth-register";

const HAS_SEEN_WELCOME_KEY = "lumi_has_seen_welcome";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, isSignedIn, logout } = useAuth();
  const [screen, setScreen] = useState<AppScreen>("splash");

  useEffect(() => {
    if (user?.canUseApp) {
      router.replace("/dashboard/live");
      return;
    }
    if (isSignedIn && isLoading) return;
    if (isSignedIn && !isLoading && !user) {
      router.replace("/dashboard/live");
      return;
    }
    if (!isLoading && !user) {
      const forceLogin = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("screen") === "login";
      if (forceLogin) {
        localStorage.setItem(HAS_SEEN_WELCOME_KEY, "true");
        setScreen("auth-login");
        return;
      }
      const hasSeenWelcome = typeof window !== "undefined" && localStorage.getItem(HAS_SEEN_WELCOME_KEY) === "true";
      const targetScreen = hasSeenWelcome ? "auth-login" : "welcome";
      const timer = setTimeout(() => setScreen(targetScreen), 1200);
      return () => clearTimeout(timer);
    }
  }, [router, user, isLoading, isSignedIn]);

  if (isLoading || user?.canUseApp || (isSignedIn && !user)) {
    return <SplashLoadingScreen />;
  }

  if (!user) {
    if (screen === "splash") return <SplashLoadingScreen />;
    if (screen === "welcome") {
      const markSeen = () => localStorage.setItem(HAS_SEEN_WELCOME_KEY, "true");
      return (
        <WelcomeScreen
          onLogin={() => { markSeen(); setScreen("auth-login"); }}
          onRegister={() => { markSeen(); setScreen("auth-register"); }}
          onTrial={() => { markSeen(); setScreen("auth-register"); }}
        />
      );
    }
    return (
      <AuthScreen
        initialMode={screen === "auth-register" ? "register" : "login"}
      />
    );
  }

  if (!user.canUseApp) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 text-slate-700">
        <div className="w-full rounded-3xl bg-white px-6 py-8 text-center shadow-sm">
          <p className="text-[32px]">⚠️</p>
          <p className="mt-3 text-base font-bold text-[#273044]">
            Shop đã hết hạn dùng thử hoặc chưa có license
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Vui lòng liên hệ quản trị viên để gia hạn license.
          </p>
          <button
            className="mt-6 w-full rounded-xl bg-slate-200 py-3 text-sm font-bold text-slate-700"
            onClick={logout}
            type="button"
          >
            Đăng xuất
          </button>
        </div>
      </main>
    );
  }

  return <SplashLoadingScreen />;
}
