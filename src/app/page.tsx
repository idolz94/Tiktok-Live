"use client";

import AuthScreen from "../screens/AuthScreen";
import DashboardScreen from "../screens/DashboardScreen";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-700">
        <div className="rounded-3xl bg-white px-6 py-5 text-center shadow-sm">
          <p className="text-base font-bold">Đang mở ứng dụng...</p>
          <p className="mt-1 text-sm text-slate-500">Vui lòng đợi vài giây</p>
        </div>
      </main>
    );
  }

  return user ? <DashboardScreen /> : <AuthScreen />;
}
