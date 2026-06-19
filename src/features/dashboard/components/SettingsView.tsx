"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getTikTokChannelsApi } from "@/api/meApi";
import type { ShopTikTokChannel } from "@/types/database";
import { normalizeTikTokUsername } from "@/utils/comment";
import { GeneralSettingsView } from "./settings/GeneralSettingsView";
import { ProductDefaultsSettingsView } from "./settings/ProductDefaultsView";
import { ShippingConfigView } from "./settings/ShippingConfigView";
import { TikTokChannelsView } from "./settings/TikTokChannelsView";
import { LicenseView, AdminView, useLicense } from "@/features/licenses";
import {
  ChevronRightIcon,
  IconTikTok,
  IconFacebook,
  IconSettings,
  IconPrinter,
  IconTruck,
  IconGlobe,
  IconSupport,
  IconLogout,
} from "./settings/SettingsIcons";

function SettingsRow({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 py-3 text-left"
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center text-black">
        {icon}
      </div>
      <span className="flex-1 text-[14px] leading-[22px] text-black">
        {label}
      </span>
      <ChevronRightIcon />
    </button>
  );
}

function SocialButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => toast.info("Tính năng đang phát triển")}
      className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-white text-[#111827]"
    >
      {children}
    </button>
  );
}

export default function SettingsView({
  userId,
  username,
  tiktokUsername,
  tiktokChannels = [],
  isConnected,
  status,
  onLogout,
}: {
  userId?: string;
  username?: string;
  tiktokUsername: string;
  tiktokChannels?: ShopTikTokChannel[];
  isConnected: boolean;
  status: string;
  onLogout: () => void;
}) {
  const [subScreen, setSubScreen] = useState<"main" | "tiktokChannels" | "generalSettings" | "productDefaults" | "shippingConfig" | "license" | "admin">("main");
  const [channels, setChannels] = useState<ShopTikTokChannel[]>(tiktokChannels);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const licenseData = useLicense();

  const adminUserId = process.env.NEXT_PUBLIC_USERADMIN;
  const isAdmin = !!adminUserId && userId === adminUserId;

  const normalizedCurrentUsername = normalizeTikTokUsername(tiktokUsername);
  const displayTikTokUsername = normalizedCurrentUsername || normalizeTikTokUsername(channels.find((c) => c.isDefault)?.tiktokUsername || "");

  const openTikTokChannelsScreen = async () => {
    setSubScreen("tiktokChannels");
    setIsLoadingChannels(true);
    try {
      const nextChannels = await getTikTokChannelsApi();
      setChannels(nextChannels);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được danh sách kênh");
    } finally {
      setIsLoadingChannels(false);
    }
  };

  if (subScreen === "tiktokChannels") {
    return (
      <TikTokChannelsView
        channels={channels}
        isLoadingChannels={isLoadingChannels}
        isConnected={isConnected}
        status={status}
        onBack={() => setSubScreen("main")}
        onChannelsChange={setChannels}
      />
    );
  }

  if (subScreen === "generalSettings") {
    return (
      <GeneralSettingsView
        onBack={() => setSubScreen("main")}
        onProductDefaults={() => setSubScreen("productDefaults")}
      />
    );
  }

  if (subScreen === "productDefaults") {
    return <ProductDefaultsSettingsView onBack={() => setSubScreen("generalSettings")} />;
  }

  if (subScreen === "shippingConfig") {
    return <ShippingConfigView onBack={() => setSubScreen("main")} />;
  }

  if (subScreen === "license") {
    return (
      <LicenseView
        license={licenseData.license}
        isLoading={licenseData.isLoading}
        error={licenseData.error}
        onBack={() => setSubScreen("main")}
        onUpgrade={() => toast.info("Tính năng đang phát triển")}
        onRefresh={licenseData.refresh}
      />
    );
  }

  if (subScreen === "admin") {
    return <AdminView onBack={() => setSubScreen("main")} />;
  }

  return (
    <div className="flex flex-col bg-white mb-14">
      {/* Header — h-[400px] fixed per Figma */}
      <section className="relative h-[400px] shrink-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 top-0 h-[320px] w-[320px] rounded-full"
            style={{
              background: "linear-gradient(135deg,#ff6b8a 0%,#ffa66d 50%,#ffc86a 100%)",
              filter: "blur(80px)",
              transform: "translateX(-50%) translateY(-10%) scale(1.8)",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[30px]" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="shrink-0" style={{ height: "env(safe-area-inset-top, 47px)" }} />

          <div className="flex items-center justify-between px-4 pb-4 pt-3">
            <h1 className="text-[24px] font-semibold leading-7 text-black">Hồ sơ</h1>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Tìm kiếm"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16.5 16.5L21 21" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Tuỳ chọn"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="1.7" fill="#111827" />
                  <circle cx="5" cy="12" r="1.7" fill="#111827" />
                  <circle cx="19" cy="12" r="1.7" fill="#111827" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 px-4 pb-4 pt-2">
            <div className="flex h-[98px] w-[98px] items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#ff6b8a_0%,#ffa66d_48%,#ffc86a_100%)] text-[38px] font-semibold uppercase text-white">
              {(channels[0]?.tiktokUsername?.[0] || tiktokUsername?.[0] || username?.[0] || "L").toUpperCase()}
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="flex w-[273px] flex-col gap-1 text-center">
                <p className="text-[18px] font-medium leading-6 text-black">
                  {username || "User"}
                </p>
                <p className="text-[14px] leading-[22px] text-black/60">
                  {displayTikTokUsername || "lumi"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <SocialButton label="TikTok">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.89a8.17 8.17 0 0 0 4.78 1.52V7a4.85 4.85 0 0 1-1.01-.31z" fill="#111827"/>
                  </svg>
                </SocialButton>
                <SocialButton label="Facebook">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#111827" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SocialButton>
                <SocialButton label="Zalo">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="4" stroke="#111827" strokeWidth="1.8"/>
                    <path d="M7 15V9l2.5 3.5L12 9v6M13 15h3M14.5 12h1.5" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </SocialButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 px-4 py-4 pb-8">
        <button
          type="button"
          onClick={() => setSubScreen("license")}
          className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-[0px_6px_8px_rgba(17,12,34,0.10)] text-left w-full"
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px]">
              <div className="absolute inset-0" style={{ background: "linear-gradient(136deg, #ff6b8a 4%, #ffa66d 63%, #ffc86a 131%)" }} />
              <svg className="relative z-10" width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              {licenseData.isLoading && !licenseData.license ? (
                <>
                  <div className="h-4 w-24 animate-pulse rounded bg-[#f2f2f2]" />
                  <div className="mt-1 h-3 w-36 animate-pulse rounded bg-[#f2f2f2]" />
                </>
              ) : (
                <>
                  <p className="text-[14px] font-medium leading-[22px] text-black">
                    Gói {licenseData.license?.plan_code === "trial" ? "Dùng thử"
                      : licenseData.license?.plan_code === "basic" ? "Basic"
                      : licenseData.license?.plan_code === "pro" ? "Pro"
                      : licenseData.license?.plan_code === "vip" ? "VIP"
                      : "Dùng thử"}
                  </p>
                  <p className="text-[13px] leading-[20px] text-[#484848]">
                    {licenseData.license?.max_orders_per_month == null
                      ? "Không giới hạn đơn"
                      : `Tối đa ${licenseData.license.max_orders_per_month} đơn/tháng`}
                  </p>
                </>
              )}
            </div>
            <ChevronRightIcon />
          </div>
          <div
            className="flex h-10 w-full items-center justify-center rounded-[40px] text-[14px] font-medium text-white"
            style={{ background: "linear-gradient(146deg, #ff6b8a 14%, #ffa66d 52%, #ffc86a 118%)" }}
          >
            {licenseData.license?.plan_code === "vip" ? "Xem gói dịch vụ" : "Nâng cấp"}
          </div>
        </button>

        <div className="flex flex-col">
          <SettingsRow
            label="Quản lý kênh Tiktok"
            icon={<IconTikTok />}
            onClick={openTikTokChannelsScreen}
          />
          <SettingsRow
            label="Quản lý kênh Facebook"
            icon={<IconFacebook />}
            onClick={() => toast.info("Tính năng đang phát triển")}
          />
        </div>

        {isAdmin && (
          <>
            <div className="h-px bg-black/8" />
            <div className="flex flex-col">
              <SettingsRow
                label="Quản lý"
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
                  </svg>
                }
                onClick={() => setSubScreen("admin")}
              />
            </div>
          </>
        )}

        <div className="h-px bg-black/8" />

        <div className="flex flex-col">
          <SettingsRow
            label="Cài đặt chung"
            icon={<IconSettings />}
            onClick={() => setSubScreen("generalSettings")}
          />
          <SettingsRow
            label="Cài đặt máy in"
            icon={<IconPrinter />}
            onClick={() => toast.info("Tính năng đang phát triển")}
          />
          <SettingsRow
            label="Cấu hình vận chuyển"
            icon={<IconTruck />}
            onClick={() => setSubScreen("shippingConfig")}
          />
        </div>

        <div className="h-px bg-black/8" />

        <div className="flex flex-col">
          <SettingsRow
            label="Ngôn ngữ"
            icon={<IconGlobe />}
            onClick={() => toast.info("Tính năng đang phát triển")}
          />
          <SettingsRow
            label="Hỗ trợ"
            icon={<IconSupport />}
            onClick={() => toast.info("Tính năng đang phát triển")}
          />
          <SettingsRow
            label="Đăng xuất"
            icon={<IconLogout />}
            onClick={onLogout}
          />
        </div>
      </div>
    </div>
  );
}
