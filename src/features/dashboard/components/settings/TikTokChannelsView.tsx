"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DrawlerBase } from "@/components/ui/Drawler";
import {
  updateTikTokChannelApi,
  type UpdateTikTokChannelPayload,
} from "@/api/meApi";
import type { ShopTikTokChannel } from "@/types/database";
import { normalizeTikTokUsername } from "@/utils/comment";
import { TikTokChannelsLoadingSkeleton } from "./SettingsShared";

export function TikTokChannelsView({
  channels,
  isLoadingChannels,
  isConnected,
  status,
  onBack,
  onChannelsChange,
}: {
  channels: ShopTikTokChannel[];
  isLoadingChannels: boolean;
  isConnected: boolean;
  status: string;
  onBack: () => void;
  onChannelsChange: (channels: ShopTikTokChannel[]) => void;
}) {
  const [savingAction, setSavingAction] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ShopTikTokChannel | null>(null);
  const [draftUsername, setDraftUsername] = useState("");
  const [confirmSetDefaultTarget, setConfirmSetDefaultTarget] = useState<ShopTikTokChannel | null>(null);

  const sortedChannels = [...channels].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

  const reloadChannels = async () => {
    const { getTikTokChannelsApi } = await import("@/api/meApi");
    const next = await getTikTokChannelsApi();
    onChannelsChange(next);
    return next;
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedChannel(null);
    setDraftUsername("");
  };

  const openEditDrawer = (channel: ShopTikTokChannel) => {
    setSelectedChannel(channel);
    setDraftUsername(channel.tiktokUsername);
    setDrawerOpen(true);
  };

  const hasDuplicateUsername = (nextUsername: string) => {
    const normalized = normalizeTikTokUsername(nextUsername);
    return channels.some((c) => {
      if (selectedChannel?.id === c.id) return false;
      return normalizeTikTokUsername(c.tiktokUsername) === normalized;
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
    if (!selectedChannel) return;
    setSavingAction("form");
    try {
      const payload: UpdateTikTokChannelPayload = {};
      if (nextUsername !== normalizeTikTokUsername(selectedChannel.tiktokUsername)) {
        payload.tiktokUsername = nextUsername;
      }
      if (!Object.keys(payload).length) {
        closeDrawer();
        return;
      }
      await updateTikTokChannelApi(selectedChannel.id, payload);
      toast.success("Đã cập nhật kênh TikTok");
      closeDrawer();
      await reloadChannels();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Thao tác thất bại");
    } finally {
      setSavingAction(null);
    }
  };

  const confirmSetDefault = async () => {
    if (!confirmSetDefaultTarget) return;
    setSavingAction(confirmSetDefaultTarget.id);
    try {
      await updateTikTokChannelApi(confirmSetDefaultTarget.id, { isDefault: true });
      toast.success("Đã đặt làm kênh mặc định");
      setConfirmSetDefaultTarget(null);
      await reloadChannels();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đặt mặc định");
    } finally {
      setSavingAction(null);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col bg-[#f2f2f2]">
        <div className="shrink-0 bg-white px-4 pt-[calc(16px+env(safe-area-inset-top))] pb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2] text-[24px] text-[#111827]"
            >
              ‹
            </button>
            <div className="text-center">
              <h1 className="text-[18px] font-semibold leading-6 text-[#111827]">Kênh TikTok</h1>
              <p className="text-[12px] leading-[18px] text-[#787878]">
                {isConnected ? "Đang LIVE" : status}
              </p>
            </div>
            <div className="h-11 w-11" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28 [-webkit-overflow-scrolling:touch]">
          {isLoadingChannels ? (
            <TikTokChannelsLoadingSkeleton />
          ) : (
            <div className="space-y-3">
              {sortedChannels.map((channel) => {
                const normalizedUsername = normalizeTikTokUsername(channel.tiktokUsername);
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
                        <p className="truncate text-[16px] font-semibold leading-6 text-[#111827]">
                          {normalizedUsername}
                        </p>
                        <p className="mt-1 text-[12px] leading-[18px] text-[#787878]">
                          Kênh TikTok LIVE
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => openEditDrawer(channel)}
                        className="h-10 w-full rounded-full bg-[#f2f2f2] text-[13px] font-medium text-[#111827]"
                      >
                        Sửa tài khoản Tiktok
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
        open={drawerOpen}
        onOpenChange={(open) => { if (!open) closeDrawer(); }}
        height="auto"
        showHandle
        showCloseButton={false}
        title="Sửa kênh TikTok"
        footer={
          <button
            type="button"
            onClick={submitChannelForm}
            disabled={savingAction === "form"}
            className="flex w-full items-center justify-center rounded-[40px] py-3.5 text-[16px] font-medium text-black disabled:opacity-60"
            style={{ backgroundImage: "linear-gradient(138deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)" }}
          >
            {savingAction === "form" ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-[14px] font-medium leading-[22px] text-[#111827]">TikTok username</span>
            <div className="mt-2 flex h-12 items-center rounded-2xl border border-black/10 bg-[#f8f8f8] px-4 focus-within:border-[#ff6b8a]">
              <span className="shrink-0 text-[15px] font-medium text-[#787878]">@</span>
              <input
                value={draftUsername}
                onChange={(e) => setDraftUsername(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="username"
                className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#111827] outline-none"
              />
            </div>
          </label>
        </div>
      </DrawlerBase>

      <DrawlerBase
        open={confirmSetDefaultTarget !== null}
        onOpenChange={(open) => { if (!open) setConfirmSetDefaultTarget(null); }}
        height="auto"
        showHandle
        showCloseButton={false}
        title="Đặt kênh mặc định?"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConfirmSetDefaultTarget(null)}
              className="h-12 rounded-full bg-[#f2f2f2] text-[15px] font-medium text-[#111827]"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={confirmSetDefault}
              disabled={!!savingAction}
              className="h-12 rounded-full bg-[#ff6b8a] text-[15px] font-medium text-white disabled:opacity-60"
            >
              Xác nhận
            </button>
          </div>
        }
      >
        <p className="text-[14px] leading-[22px] text-[#484848]">
          {`Dùng ${confirmSetDefaultTarget ? normalizeTikTokUsername(confirmSetDefaultTarget.tiktokUsername) : "kênh này"} làm kênh mặc định?`}
        </p>
      </DrawlerBase>
    </>
  );
}
