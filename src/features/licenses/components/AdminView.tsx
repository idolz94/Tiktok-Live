"use client";

import { useState } from "react";
import { toast } from "sonner";
import { adminActivateLicenseApi } from "@/api/licensesApi";
import { ChevronLeftSmIcon } from "@/features/dashboard/components/settings/SettingsIcons";

type PlanCode = "trial" | "basic" | "pro" | "vip";

const PLAN_OPTIONS: { value: PlanCode; label: string; months: number }[] = [
  { value: "trial", label: "Dùng thử (3 ngày)", months: 1 },
  { value: "basic", label: "Basic — 199.000đ / tháng", months: 1 },
  { value: "pro", label: "Pro — 549.000đ / 3 tháng", months: 3 },
  { value: "vip", label: "VIP — 1.190.000đ / 7 tháng", months: 7 },
];

const PLAN_PRICES: Record<PlanCode, number> = {
  trial: 0,
  basic: 199000,
  pro: 549000,
  vip: 1190000,
};

export function AdminView({ onBack }: { onBack: () => void }) {
  const [username, setUsername] = useState("");
  const [planCode, setPlanCode] = useState<PlanCode>("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ shopName: string; planCode: string } | null>(null);

  const selectedPlan = PLAN_OPTIONS.find((p) => p.value === planCode)!;

  const handlePlanChange = (value: PlanCode) => {
    setPlanCode(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = username.trim();
    if (!input) {
      toast.error("Nhập email hoặc số điện thoại trước.");
      return;
    }

    setIsLoading(true);
    setLastResult(null);

    try {
      const result = await adminActivateLicenseApi({
        username: input,
        planCode,
        months: selectedPlan.months,
        price: PLAN_PRICES[planCode],
      });

      setLastResult({ shopName: result.shopName, planCode });
      setUsername("");
      toast.success(`Đã kích hoạt gói ${planCode.toUpperCase()} cho shop "${result.shopName}".`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kích hoạt thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]"
          aria-label="Quay lại"
        >
          <ChevronLeftSmIcon />
        </button>
        <p className="text-[18px] font-medium leading-6 text-black">Quản lý license</p>
        <div className="h-11 w-11" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-5">
          {/* Email / Phone */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-black" htmlFor="admin-username-input">
              Email / Số điện thoại đăng nhập
            </label>
            <input
              id="admin-username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập email hoặc số điện thoại"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="rounded-2xl border border-black/10 bg-[#f9f9f9] px-4 py-3 text-[14px] text-black outline-none placeholder:text-[#aaa]"
            />
          </div>

          {/* Plan select */}
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-medium text-black" htmlFor="admin-plan-select">
              Gói dịch vụ
            </label>
            <div className="relative rounded-2xl border border-black/10 bg-[#f9f9f9]">
              <select
                id="admin-plan-select"
                value={planCode}
                onChange={(e) => handlePlanChange(e.target.value as PlanCode)}
                className="w-full appearance-none bg-transparent px-4 py-3 text-[14px] text-black outline-none"
              >
                {PLAN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#484848]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl bg-[#fff5f7] px-4 py-3 text-[13px] text-[#484848]">
            Kích hoạt gói{" "}
            <span className="font-semibold text-black">{selectedPlan.label} </span>
            {" "}cho {" "}
            <span className="font-semibold text-black">
              {username.trim() || "(chưa nhập username)"}
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="flex h-12 w-full items-center justify-center rounded-[40px] text-[15px] font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(146deg,#ff6b8a 14%,#ffa66d 52%,#ffc86a 118%)" }}
          >
            {isLoading ? "Đang kích hoạt..." : "Kích hoạt"}
          </button>

          {/* Last result */}
          {lastResult && (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-[13px] text-green-700">
              Đã kích hoạt gói <span className="font-semibold">{lastResult.planCode.toUpperCase()}</span> cho shop{" "}
              <span className="font-semibold">"{lastResult.shopName}"</span> thành công.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
