"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DrawlerBase } from "@/components/ui/Drawler";
import {
  createTikTokChannelApi,
  deleteTikTokChannelApi,
  getTikTokChannelsApi,
  updateTikTokChannelApi,
  type UpdateTikTokChannelPayload,
} from "@/api/meApi";
import type { ShopTikTokChannel } from "@/types/database";
import { normalizeTikTokUsername } from "@/utils/comment";

function SettingsRow({
  label,
  onClick,
  destructive = false,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-4 text-left shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
    >
      <span
        className={`text-[14px] font-medium leading-5.5 ${destructive ? "text-[#ef4444]" : "text-[#111827]"}`}
      >
        {label}
      </span>
      <span
        className={`text-[20px] leading-none ${destructive ? "text-[#ef4444]" : "text-[#9ca3af]"}`}
      >
        ›
      </span>
    </button>
  );
}

function SocialButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => toast.info("Tính năng đang phát triển")}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-white/45 bg-white/90 text-[#111827] shadow-[0_10px_28px_rgba(0,0,0,0.14)] backdrop-blur-[10px]"
    >
      {children}
    </button>
  );
}

function ChannelBone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-[#e4e4e4] ${className}`} />;
}

function TikTokChannelsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-4 rounded-2xl bg-[#f2f2f2] p-4">
          <ChannelBone className="h-10 w-10 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <ChannelBone className="h-3.5 w-32" />
            <ChannelBone className="h-3 w-44 max-w-full" />
          </div>
          <ChannelBone className="h-8 w-14 shrink-0" />
        </div>
      ))}

      <div className="rounded-lg border border-dashed border-[#d1d1d1] px-4 py-3 opacity-60">
        <div className="flex items-center justify-center gap-2">
          <ChannelBone className="h-4 w-4" />
          <ChannelBone className="h-3.5 w-20" />
        </div>
      </div>

      <ChannelBone className="h-3 w-64 max-w-full rounded-md" />
    </div>
  );
}

export default function SettingsView({
  username,
  tiktokUsername,
  tiktokChannels = [],
  isConnected,
  status,
  onChangeTikTokUsername,
  onRefreshAuth,
  onLogout,
}: {
  username?: string;
  tiktokUsername: string;
  tiktokChannels?: ShopTikTokChannel[];
  isConnected: boolean;
  status: string;
  onChangeTikTokUsername: (username: string) => void;
  onRefreshAuth?: () => Promise<void>;
  onLogout: () => void;
}) {
  const [subScreen, setSubScreen] = useState<"main" | "tiktokChannels">("main");
  const [channels, setChannels] = useState<ShopTikTokChannel[]>(tiktokChannels);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit" | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ShopTikTokChannel | null>(null);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftIsDefault, setDraftIsDefault] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    type: "setDefault" | "delete";
    channel: ShopTikTokChannel;
  } | null>(null);

  const normalizedCurrentUsername = normalizeTikTokUsername(tiktokUsername);
  const displayTikTokUsername = normalizedCurrentUsername || normalizeTikTokUsername(channels.find((channel) => channel.isDefault)?.tiktokUsername || "");

  const defaultChannel = useMemo(() => {
    return channels.find((channel) => channel.isDefault) || null;
  }, [channels]);

  const sortedChannels = useMemo(() => {
    return [...channels].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  }, [channels]);

  const reloadChannelsAndSyncLiveUsername = async () => {
    const nextChannels = await getTikTokChannelsApi();
    setChannels(nextChannels);

    const nextDefault = nextChannels.find((channel) => channel.isDefault);
    onChangeTikTokUsername(nextDefault?.tiktokUsername || "");
    await onRefreshAuth?.();
  };

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

  const closeDrawer = () => {
    setDrawerMode(null);
    setSelectedChannel(null);
    setDraftUsername("");
    setDraftIsDefault(false);
  };

  const openAddDrawer = () => {
    setSelectedChannel(null);
    setDraftUsername("");
    setDraftIsDefault(channels.length === 0);
    setDrawerMode("add");
  };

  const openEditDrawer = (channel: ShopTikTokChannel) => {
    setSelectedChannel(channel);
    setDraftUsername(channel.tiktokUsername);
    setDraftIsDefault(channel.isDefault);
    setDrawerMode("edit");
  };

  const hasDuplicateUsername = (nextUsername: string) => {
    const normalizedNext = normalizeTikTokUsername(nextUsername);

    return channels.some((channel) => {
      if (drawerMode === "edit" && selectedChannel?.id === channel.id) return false;

      return normalizeTikTokUsername(channel.tiktokUsername) === normalizedNext;
    });
  };

  const submitChannelForm = async () => {
    const nextUsername = normalizeTikTokUsername(draftUsername);

    if (!nextUsername) {
      toast.error("Vui lòng nhập TikTok username");
      return;
    }

    if (hasDuplicateUsername(nextUsername)) {
      toast.error("Kênh TikTok này đã tồn tại");
      return;
    }

    setSavingAction("form");

    try {
      if (drawerMode === "add") {
        await createTikTokChannelApi({
          tiktokUsername: nextUsername,
          isDefault: draftIsDefault || channels.length === 0,
        });
        toast.success("Đã thêm kênh TikTok");
      } else if (drawerMode === "edit" && selectedChannel) {
        const payload: UpdateTikTokChannelPayload = {};

        if (nextUsername !== normalizeTikTokUsername(selectedChannel.tiktokUsername)) {
          payload.tiktokUsername = nextUsername;
        }

        if (!selectedChannel.isDefault && draftIsDefault) {
          payload.isDefault = true;
        }

        if (!Object.keys(payload).length) {
          closeDrawer();
          return;
        }

        await updateTikTokChannelApi(selectedChannel.id, payload);
        toast.success("Đã cập nhật kênh TikTok");
      }

      closeDrawer();
      await reloadChannelsAndSyncLiveUsername();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thao tác thất bại");
    } finally {
      setSavingAction(null);
    }
  };

  const confirmSetDefault = async () => {
    if (!confirmTarget || confirmTarget.type !== "setDefault") return;

    setSavingAction(confirmTarget.channel.id);

    try {
      await updateTikTokChannelApi(confirmTarget.channel.id, { isDefault: true });
      toast.success("Đã đặt làm kênh mặc định");
      setConfirmTarget(null);
      await reloadChannelsAndSyncLiveUsername();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đặt mặc định");
    } finally {
      setSavingAction(null);
    }
  };

  const confirmDelete = async () => {
    if (!confirmTarget || confirmTarget.type !== "delete") return;

    setSavingAction(confirmTarget.channel.id);

    try {
      await deleteTikTokChannelApi(confirmTarget.channel.id);
      toast.success("Đã xoá kênh TikTok");
      setConfirmTarget(null);
      await reloadChannelsAndSyncLiveUsername();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xoá kênh");
    } finally {
      setSavingAction(null);
    }
  };

  if (subScreen === "tiktokChannels") {
    return (
      <>
        <div className="flex h-full flex-col bg-[#f2f2f2]">
          <div className="shrink-0 bg-white px-4 pt-[calc(16px+env(safe-area-inset-top))] pb-4 shadow-sm">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSubScreen("main")}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2] text-[24px] text-[#111827]"
              >
                ‹
              </button>
              <div className="text-center">
                <h1 className="text-[18px] font-semibold leading-6 text-[#111827]">Kênh TikTok</h1>
                <p className="text-[12px] leading-4.5 text-[#787878]">
                  {channels.length} kênh · {isConnected ? "Đang LIVE" : status}
                </p>
              </div>
              <button
                type="button"
                onClick={openAddDrawer}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff6b8a] text-[24px] text-white"
              >
                +
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28 [-webkit-overflow-scrolling:touch]">
            {isLoadingChannels ? (
              <TikTokChannelsLoadingSkeleton />
            ) : sortedChannels.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe8ef] text-[24px]">
                  ♪
                </div>
                <p className="mt-4 text-[16px] font-semibold text-[#111827]">Chưa có kênh TikTok</p>
                <p className="mt-1 text-[13px] leading-5 text-[#787878]">
                  Thêm kênh TikTok để bắt đầu nhận comment LIVE.
                </p>
                <button
                  type="button"
                  onClick={openAddDrawer}
                  className="mt-5 h-11 rounded-full bg-[#ff6b8a] px-6 text-[14px] font-semibold text-white"
                >
                  Thêm kênh
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedChannels.map((channel) => {
                  const normalizedUsername = normalizeTikTokUsername(channel.tiktokUsername);
                  const isSaving = savingAction === channel.id;

                  return (
                    <div
                      key={channel.id}
                      className="rounded-3xl border border-black/5 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ffe8ef] text-[18px] font-semibold text-[#ff6b8a]">
                          {normalizedUsername.charAt(0).toUpperCase() || "L"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[16px] font-semibold leading-6 text-[#111827]">
                              {normalizedUsername}
                            </p>
                            {channel.isDefault && (
                              <span className="rounded-full bg-[#fff1cc] px-2 py-0.5 text-[11px] font-semibold text-[#b7791f]">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[12px] leading-4.5 text-[#787878]">
                            {defaultChannel?.id === channel.id ? "Đang dùng cho phiên LIVE" : "Kênh TikTok LIVE"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(channel)}
                          className="h-10 rounded-full bg-[#f2f2f2] text-[13px] font-medium text-[#111827]"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmTarget({ type: "setDefault", channel })}
                          disabled={channel.isDefault || isSaving}
                          className="h-10 rounded-full bg-[#f2f2f2] text-[13px] font-medium text-[#111827] disabled:opacity-45"
                        >
                          Mặc định
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmTarget({ type: "delete", channel })}
                          disabled={isSaving}
                          className="h-10 rounded-full bg-[#fff1f1] text-[13px] font-medium text-[#ef4444] disabled:opacity-45"
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DrawlerBase
          open={drawerMode !== null}
          onOpenChange={(open) => {
            if (!open) closeDrawer();
          }}
          height="auto"
          showHandle
          showCloseButton={false}
          title={drawerMode === "add" ? "Thêm kênh TikTok" : "Sửa kênh TikTok"}
          footer={
            <button
              type="button"
              onClick={submitChannelForm}
              disabled={savingAction === "form"}
              className="flex w-full items-center justify-center rounded-[40px] py-3.5 text-[16px] font-medium text-black disabled:opacity-60"
              style={{
                backgroundImage: "linear-gradient(138deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)",
              }}
            >
              {savingAction === "form" ? "Đang lưu..." : drawerMode === "add" ? "Thêm kênh" : "Lưu thay đổi"}
            </button>
          }
        >
          <div className="space-y-4">
            <label className="block">
              <span className="text-[14px] font-medium leading-5.5 text-[#111827]">TikTok username</span>
              <input
                value={draftUsername}
                onChange={(event) => setDraftUsername(event.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="Nhập TikTok ID"
                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f8f8f8] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#ff6b8a]"
              />
            </label>

            <button
              type="button"
              onClick={() => setDraftIsDefault((value) => !value)}
              disabled={selectedChannel?.isDefault}
              className="flex w-full items-center justify-between rounded-2xl bg-[#f8f8f8] px-4 py-3 text-left disabled:opacity-60"
            >
              <div>
                <p className="text-[14px] font-medium leading-5.5 text-[#111827]">Đặt làm kênh mặc định</p>
                <p className="mt-0.5 text-[12px] leading-4.5 text-[#787878]">
                  Kênh mặc định sẽ tự được chọn khi mở LIVE.
                </p>
              </div>
              <span className={`h-6 w-11 rounded-full p-0.5 transition ${draftIsDefault ? "bg-[#ff6b8a]" : "bg-[#d1d5db]"}`}>
                <span className={`block h-5 w-5 rounded-full bg-white transition ${draftIsDefault ? "translate-x-5" : "translate-x-0"}`} />
              </span>
            </button>
          </div>
        </DrawlerBase>

        <DrawlerBase
          open={confirmTarget !== null}
          onOpenChange={(open) => {
            if (!open) setConfirmTarget(null);
          }}
          height="auto"
          showHandle
          showCloseButton={false}
          title={confirmTarget?.type === "delete" ? "Xoá kênh TikTok?" : "Đặt kênh mặc định?"}
          footer={
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="h-12 rounded-full bg-[#f2f2f2] text-[15px] font-medium text-[#111827]"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={confirmTarget?.type === "delete" ? confirmDelete : confirmSetDefault}
                disabled={!!savingAction}
                className="h-12 rounded-full bg-[#ff6b8a] text-[15px] font-medium text-white disabled:opacity-60"
              >
                Xác nhận
              </button>
            </div>
          }
        >
          <p className="text-[14px] leading-5.5 text-[#484848]">
            {confirmTarget?.type === "delete"
              ? `Bạn có chắc muốn xoá kênh ${normalizeTikTokUsername(confirmTarget.channel.tiktokUsername)}?`
              : `Dùng ${confirmTarget ? normalizeTikTokUsername(confirmTarget.channel.tiktokUsername) : "kênh này"} làm kênh mặc định?`}
          </p>
        </DrawlerBase>
      </>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white pb-[calc(96px+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
      <section className="relative h-[400px] overflow-hidden bg-[#111827] px-4 pt-[calc(14px+env(safe-area-inset-top))] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.36),transparent_28%),linear-gradient(135deg,#ff7a9b_0%,#ffb36f_42%,#273044_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.18)_100%)] backdrop-blur-[2px]" />
        <div className="relative z-10 flex items-center justify-between">
          <button
            type="button"
            aria-label="Back"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/18 text-[24px] text-white backdrop-blur-[12px]"
            onClick={() => history.back()}
          >
            ‹
          </button>
          <h1 className="text-[24px] font-semibold leading-7 text-white">Hồ sơ</h1>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Thông báo"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-[12px]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Tuỳ chọn"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-[12px]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="1.7" fill="currentColor" />
                <circle cx="5" cy="12" r="1.7" fill="currentColor" />
                <circle cx="19" cy="12" r="1.7" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-12 flex flex-col items-center text-center">
          <div className="flex h-[98px] w-[98px] items-center justify-center rounded-full border border-white/60 bg-white/18 text-[38px] font-semibold uppercase shadow-[0_12px_32px_rgba(0,0,0,0.18)] backdrop-blur-[14px]">
            {(username?.trim()?.[0] || "L").toUpperCase()}
          </div>
          <p className="mt-5 text-[24px] font-semibold leading-7 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)]">
            {username || "User"}
          </p>
          <p className="mt-1 text-[14px] font-normal leading-5.5 text-white/90">
            @{displayTikTokUsername || "lumi"}
          </p>

          <div className="mt-7 flex items-center justify-center gap-4">
            <SocialButton label="TikTok">
              <span className="text-[20px] font-semibold">♪</span>
            </SocialButton>
            <SocialButton label="Facebook">
              <span className="text-[20px] font-bold">f</span>
            </SocialButton>
            <SocialButton label="Zalo">
              <span className="text-[13px] font-bold">Zalo</span>
            </SocialButton>
          </div>
        </div>
      </section>

      <section className="relative z-20 mt-[-34px] px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_16px_36px_rgba(15,23,42,0.10)]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#ff6b8a_0%,#ffa66d_48%,#ffc86a_100%)] text-[22px] font-bold text-white shadow-[0_8px_18px_rgba(255,107,138,0.25)]">
            L
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[18px] font-medium leading-6 text-[#111827]">Gói Lumi Live Mini</p>
            <p className="mt-1 text-[14px] leading-5.5 text-[#6b7280]">1172-2700 đơn</p>
          </div>
          <button
            type="button"
            onClick={() => toast.info("Tính năng đang phát triển")}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff6b8a_0%,#ffa66d_48%,#ffc86a_100%)] px-5 text-[14px] font-medium text-white shadow-[0_8px_18px_rgba(255,107,138,0.22)]"
          >
            Nâng cấp
          </button>
        </div>
      </section>

      <section className="mt-5 px-4">
        <div className="space-y-3">
          <SettingsRow label="Quản lý kênh Tiktok" onClick={openTikTokChannelsScreen} />
          <SettingsRow label="Quản lý kênh Facebook" onClick={() => toast.info("Tính năng đang phát triển")} />
        </div>

        <div className="my-5 h-px bg-black/10" />

        <div className="space-y-3">
          <SettingsRow label="Cài đặt chung" onClick={() => toast.info("Tính năng đang phát triển")} />
          <SettingsRow label="Cài đặt máy in" onClick={() => toast.info("Tính năng đang phát triển")} />
          <SettingsRow label="Cấu hình vận chuyển" onClick={() => toast.info("Tính năng đang phát triển")} />
        </div>

        <div className="my-5 h-px bg-black/10" />

        <div className="space-y-3">
          <SettingsRow label="Ngôn ngữ" onClick={() => toast.info("Tính năng đang phát triển")} />
          <SettingsRow label="Hỗ trợ" onClick={() => toast.info("Tính năng đang phát triển")} />
          <SettingsRow label="Đăng xuất" onClick={onLogout} destructive />
        </div>
      </section>
    </div>
  );
}
