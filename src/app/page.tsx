"use client";

import AuthScreen from "../screens/AuthScreen";
import DashboardScreen from "../screens/DashboardScreen";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { user, isLoading, logout } = useAuth();

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

  if (!user) return <AuthScreen />;

  if (!user.canUseApp) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-700">
        <div className="w-full max-w-sm rounded-3xl bg-white px-6 py-8 text-center shadow-sm">
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

  return <DashboardScreen user={user} logout={logout} />;
}
