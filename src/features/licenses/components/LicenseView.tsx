"use client";

import { ShopLicense } from "@/types/database";
import { ChevronLeftSmIcon } from "@/features/dashboard/components/settings/SettingsIcons";

const PLAN_LABELS: Record<string, string> = {
  trial: "Dùng thử",
  basic: "Basic",
  pro: "Pro",
  vip: "VIP",
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  trial: "3 ngày · tối đa 200 đơn/tháng",
  basic: "1 tháng · tối đa 500 đơn/tháng",
  pro: "3 tháng · tối đa 1.500 đơn/tháng",
  vip: "7 tháng · không giới hạn đơn",
};

const PLAN_PRICES: Record<string, string> = {
  trial: "Miễn phí",
  basic: "199.000đ / tháng",
  pro: "549.000đ / 3 tháng",
  vip: "1.190.000đ / 7 tháng",
};

type PlanCode = "trial" | "basic" | "pro" | "vip";

const UPGRADE_PLANS: PlanCode[] = ["basic", "pro", "vip"];

function daysRemaining(license: ShopLicense): number | null {
  const end = license.trial_ends_at || license.expired_at;
  if (!end) return null;
  const ms = new Date(end).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function LicenseStatusBadge({ license }: { license: ShopLicense }) {
  const days = daysRemaining(license);
  const isActive = ["trial", "trialing", "active"].includes(license.status);

  if (!isActive) {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[12px] font-medium text-red-600">
        Hết hạn
      </span>
    );
  }

  if (days !== null && days <= 3) {
    return (
      <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[12px] font-medium text-orange-600">
        Còn {days} ngày
      </span>
    );
  }

  if (days !== null) {
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[12px] font-medium text-green-600">
        Còn {days} ngày
      </span>
    );
  }

  return (
    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[12px] font-medium text-green-600">
      Đang hoạt động
    </span>
  );
}

function OrderUsageBar({ used, max }: { used: number; max: number | null }) {
  if (max === null) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#484848]">Đơn hàng tháng này</span>
          <span className="text-[13px] font-medium text-black">{used} / không giới hạn</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f2f2f2]">
          <div className="h-full w-0 rounded-full" style={{ background: "linear-gradient(90deg,#ff6b8a,#ffc86a)" }} />
        </div>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((used / max) * 100));
  const isNearLimit = pct >= 80;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[#484848]">Đơn hàng tháng này</span>
        <span className={`text-[13px] font-medium ${isNearLimit ? "text-orange-600" : "text-black"}`}>
          {used} / {max}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f2f2f2]">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: isNearLimit
              ? "linear-gradient(90deg,#ff6b8a,#f97316)"
              : "linear-gradient(90deg,#ff6b8a,#ffc86a)",
          }}
        />
      </div>
    </div>
  );
}

function PlanCard({
  code,
  current,
  onUpgrade,
}: {
  code: PlanCode;
  current: boolean;
  onUpgrade: (code: PlanCode) => void;
}) {
  const isVip = code === "vip";

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl p-4 ${
        current
          ? "border border-[#ff6b8a]/40 bg-[#fff5f7]"
          : "border border-black/8 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-black">{PLAN_LABELS[code]}</span>
            {current && (
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                style={{ background: "linear-gradient(90deg,#ff6b8a,#ffc86a)" }}
              >
                Hiện tại
              </span>
            )}
            {isVip && !current && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-700">
                Đề xuất
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[12px] text-[#484848]">{PLAN_DESCRIPTIONS[code]}</p>
        </div>
        <span className="shrink-0 text-[13px] font-medium text-black">{PLAN_PRICES[code]}</span>
      </div>

      {!current && (
        <button
          type="button"
          onClick={() => onUpgrade(code)}
          className="flex h-9 w-full items-center justify-center rounded-[40px] text-[13px] font-medium text-white"
          style={{ background: "linear-gradient(146deg,#ff6b8a 14%,#ffa66d 52%,#ffc86a 118%)" }}
        >
          Nâng cấp lên {PLAN_LABELS[code]}
        </button>
      )}
    </div>
  );
}

export function LicenseView({
  license,
  ordersUsedThisMonth = 0,
  isLoading,
  error,
  onBack,
  onUpgrade,
  onRefresh,
}: {
  license: ShopLicense | null;
  ordersUsedThisMonth?: number;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onUpgrade: (planCode: PlanCode) => void;
  onRefresh: () => void;
}) {
  const planCode = (license?.plan_code ?? "trial") as PlanCode;
  const planLabel = PLAN_LABELS[planCode] ?? planCode;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex size-11 items-center justify-center rounded-full bg-[#f2f2f2]"
          aria-label="Quay lại"
        >
          <ChevronLeftSmIcon />
        </button>
        <p className="text-[18px] leading-6 font-medium text-black">Gói dịch vụ</p>
        <button
          type="button"
          onClick={onRefresh}
          className="flex size-11 items-center justify-center rounded-full bg-[#f2f2f2]"
          aria-label="Làm mới"
          disabled={isLoading}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className={isLoading ? "animate-spin" : ""}
          >
            <path
              d="M1 4v6h6M23 20v-6h-6"
              stroke="#111827"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"
              stroke="#111827"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        {isLoading && !license ? (
          <div className="flex flex-col gap-3 px-4 py-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#f2f2f2]" />
            ))}
          </div>
        ) : error && !license ? (
          <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
            <p className="text-[14px] text-[#484848]">{error}</p>
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-[40px] px-6 py-2 text-[14px] font-medium text-white"
              style={{ background: "linear-gradient(146deg,#ff6b8a 14%,#ffa66d 52%,#ffc86a 118%)" }}
            >
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* Current plan card */}
            <div className="px-4 pb-4">
              <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-[0px_6px_8px_rgba(17,12,34,0.10)]">
                <div className="flex items-center gap-4">
                  <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px]">
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(136deg, #ff6b8a 4%, #ffa66d 63%, #ffc86a 131%)" }}
                    />
                    <svg className="relative z-10" width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-black">Gói {planLabel}</p>
                      {license && <LicenseStatusBadge license={license} />}
                    </div>
                    <p className="text-[13px] text-[#484848]">
                      {PLAN_DESCRIPTIONS[planCode] ?? ""}
                    </p>
                  </div>
                </div>

                {license && (
                  <OrderUsageBar
                    used={ordersUsedThisMonth}
                    max={license.max_orders_per_month}
                  />
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-2 bg-[#f2f2f2]" />

            {/* Upgrade plans */}
            <div className="flex flex-col gap-3 px-4 py-5">
              <p className="text-[16px] leading-6 font-medium text-black">Các gói dịch vụ</p>
              {UPGRADE_PLANS.map((code) => (
                <PlanCard
                  key={code}
                  code={code}
                  current={planCode === code}
                  onUpgrade={onUpgrade}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
