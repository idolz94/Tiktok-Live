"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DrawlerBase } from "@/components/ui/Drawler";
import {
  createTikTokChannelApi,
  deleteTikTokChannelApi,
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
  const [drawerMode, setDrawerMode] = useState<"add" | "edit" | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ShopTikTokChannel | null>(null);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftIsDefault, setDraftIsDefault] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{
    type: "setDefault" | "delete";
    channel: ShopTikTokChannel;
  } | null>(null);

  const sortedChannels = [...channels].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
  const defaultChannel = channels.find((c) => c.isDefault) ?? null;

  const reloadChannels = async () => {
    const { getTikTokChannelsApi } = await import("@/api/meApi");
    const next = await getTikTokChannelsApi();
    onChannelsChange(next);
    return next;
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
    const normalized = normalizeTikTokUsername(nextUsername);
    return channels.some((c) => {
      if (drawerMode === "edit" && selectedChannel?.id === c.id) return false;
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
      await reloadChannels();
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
      await reloadChannels();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đặt mặc định");
    } finally {
      setSavingAction(null);
    }
  };

  const doDelete = async () => {
    if (!confirmTarget || confirmTarget.type !== "delete") return;
    setSavingAction(confirmTarget.channel.id);
    try {
      await deleteTikTokChannelApi(confirmTarget.channel.id);
      toast.success("Đã xoá kênh TikTok");
      setConfirmTarget(null);
      await reloadChannels();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xoá kênh");
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
                        <p className="mt-1 text-[12px] leading-[18px] text-[#787878]">
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
        onOpenChange={(open) => { if (!open) closeDrawer(); }}
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
            style={{ backgroundImage: "linear-gradient(138deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)" }}
          >
            {savingAction === "form" ? "Đang lưu..." : drawerMode === "add" ? "Thêm kênh" : "Lưu thay đổi"}
          </button>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-[14px] font-medium leading-[22px] text-[#111827]">TikTok username</span>
            <input
              value={draftUsername}
              onChange={(e) => setDraftUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Nhập TikTok ID"
              className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f8f8f8] px-4 text-[15px] font-medium text-[#111827] outline-none focus:border-[#ff6b8a]"
            />
          </label>

          <button
            type="button"
            onClick={() => setDraftIsDefault((v) => !v)}
            disabled={selectedChannel?.isDefault}
            className="flex w-full items-center justify-between rounded-2xl bg-[#f8f8f8] px-4 py-3 text-left disabled:opacity-60"
          >
            <div>
              <p className="text-[14px] font-medium leading-[22px] text-[#111827]">Đặt làm kênh mặc định</p>
              <p className="mt-0.5 text-[12px] leading-[18px] text-[#787878]">
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
        onOpenChange={(open) => { if (!open) setConfirmTarget(null); }}
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
              onClick={confirmTarget?.type === "delete" ? doDelete : confirmSetDefault}
              disabled={!!savingAction}
              className="h-12 rounded-full bg-[#ff6b8a] text-[15px] font-medium text-white disabled:opacity-60"
            >
              Xác nhận
            </button>
          </div>
        }
      >
        <p className="text-[14px] leading-[22px] text-[#484848]">
          {confirmTarget?.type === "delete"
            ? `Bạn có chắc muốn xoá kênh ${normalizeTikTokUsername(confirmTarget.channel.tiktokUsername)}?`
            : `Dùng ${confirmTarget ? normalizeTikTokUsername(confirmTarget.channel.tiktokUsername) : "kênh này"} làm kênh mặc định?`}
        </p>
      </DrawlerBase>
    </>
  );
}
