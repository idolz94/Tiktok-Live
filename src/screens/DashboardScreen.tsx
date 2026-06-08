"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "../hooks/useAuth";

type DashboardScreenProps = {
  user: AuthUser;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

export default function DashboardScreen({ user }: DashboardScreenProps) {
  const router = useRouter();

  useEffect(() => {
    if (user?.canUseApp) {
      router.replace("/dashboard/live");
    }
  }, [router, user?.canUseApp]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-700">
      <div className="rounded-3xl bg-white px-6 py-5 text-center shadow-sm">
        <p className="text-base font-bold">Đang chuyển sang dashboard...</p>
      </div>
    </main>
  );
}
