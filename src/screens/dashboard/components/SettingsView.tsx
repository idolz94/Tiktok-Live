"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DEFAULT_WS_URL } from "../../../constants/config";
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

  const defaultChannel = useMemo(() => {
    const normalizedLiveUsername = normalizeTikTokUsername(tiktokUsername);

    return (
      channels.find((channel) => channel.isDefault) ||
      channels.find(
        (channel) => normalizeTikTokUsername(channel.tiktokUsername) === normalizedLiveUsername,
      ) ||
      null
    );
  }, [channels, tiktokUsername]);

  const displayTikTokUsername = defaultChannel?.tiktokUsername || normalizeTikTokUsername(tiktokUsername);

  const reloadChannelsAndSyncLiveUsername = async () => {
    const nextChannels = await getTikTokChannelsApi();
    setChannels(nextChannels);

    const nextDefault = nextChannels.find((channel) => channel.isDefault);
    onChangeTikTokUsername(nextDefault?.tiktokUsername || "");
    await onRefreshAuth?.();
  };

  const reloadChannels = async () => {
    setIsLoadingChannels(true);

    try {
      const nextChannels = await getTikTokChannelsApi();
      setChannels(nextChannels);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không tải được danh sách kênh TikTok");
    } finally {
      setIsLoadingChannels(false);
    }
  };

  const openAddDrawer = () => {
    setDrawerMode("add");
    setSelectedChannel(null);
    setDraftUsername("");
    setDraftIsDefault(channels.length === 0);
  };

  const openEditDrawer = (channel: ShopTikTokChannel) => {
    setDrawerMode("edit");
    setSelectedChannel(channel);
    setDraftUsername(channel.tiktokUsername);
    setDraftIsDefault(channel.isDefault);
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setSelectedChannel(null);
    setDraftUsername("");
    setDraftIsDefault(false);
  };

  const hasDuplicateUsername = (nextUsername: string) =>
    channels.some((channel) => {
      if (selectedChannel && channel.id === selectedChannel.id) return false;
      return normalizeTikTokUsername(channel.tiktokUsername) === nextUsername;
    });

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

  const setDefaultChannel = (channel: ShopTikTokChannel) => {
    if (channel.isDefault) return;
    if (isConnected) {
      setConfirmTarget({ type: "setDefault", channel });
      return;
    }
    void executeSetDefault(channel);
  };

  const executeSetDefault = async (channel: ShopTikTokChannel) => {
    setConfirmTarget(null);
    setSavingAction(`default:${channel.id}`);

    try {
      await updateTikTokChannelApi(channel.id, { isDefault: true });
      toast.success(`Đã đặt @${channel.tiktokUsername} làm kênh mặc định`);
      await reloadChannelsAndSyncLiveUsername();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đặt mặc định thất bại");
    } finally {
      setSavingAction(null);
    }
  };

  const deleteChannel = (channel: ShopTikTokChannel) => {
    setConfirmTarget({ type: "delete", channel });
  };

  const executeDelete = async (channel: ShopTikTokChannel) => {
    setConfirmTarget(null);
    setSavingAction(`delete:${channel.id}`);

    try {
      await deleteTikTokChannelApi(channel.id);
      toast.success("Đã xoá kênh TikTok");
      await reloadChannelsAndSyncLiveUsername();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Xoá kênh thất bại");
    } finally {
      setSavingAction(null);
    }
  };

  const openTikTokChannelsScreen = () => {
    setSubScreen("tiktokChannels");
    void reloadChannels();
  };

  const renderConfirmDrawer = () => {
    const channel = confirmTarget?.channel;
    const isDelete = confirmTarget?.type === "delete";
    const actionKey = channel ? `${isDelete ? "delete" : "default"}:${channel.id}` : "";
    const isLoading = savingAction === actionKey;

    return (
      <DrawlerBase
        open={confirmTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isLoading) setConfirmTarget(null);
        }}
        title={isDelete ? "Xác nhận xoá kênh" : "Đổi kênh mặc định"}
        description={
          channel
            ? isDelete
              ? channel.isDefault
                ? `@${channel.tiktokUsername} đang là kênh mặc định. Sau khi xoá, LIVE sẽ dùng kênh mặc định mới từ hệ thống.`
                : `Bạn có chắc muốn xoá @${channel.tiktokUsername}?`
              : `Đặt @${channel.tiktokUsername} làm kênh mặc định để bắt đầu LIVE?`
            : ""
        }
        height="auto"
        dismissible={!isLoading}
        contentClassName="border-t-4 border-[#f2c300]"
        footer={
          <div className="flex gap-2">
            <button
              className="min-h-[46px] flex-1 rounded-xl border border-slate-300 text-[14px] font-bold text-slate-600 disabled:opacity-60"
              onClick={() => setConfirmTarget(null)}
              type="button"
              disabled={isLoading}
            >
              Huỷ
            </button>
            <button
              className="min-h-[46px] flex-1 rounded-xl bg-[#f2c300] text-[14px] font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                if (!channel) return;
                if (isDelete) void executeDelete(channel);
                else void executeSetDefault(channel);
              }}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : isDelete ? "Xoá" : "Xác nhận"}
            </button>
          </div>
        }
      >
        <div className="rounded-2xl bg-yellow-50 p-4 text-sm font-bold leading-6 text-yellow-800">
          Thao tác này sẽ cập nhật danh sách kênh TikTok và đồng bộ lại kênh LIVE hiện tại.
        </div>
      </DrawlerBase>
    );
  };

  const renderChannelDrawer = () => {
    const isFirstChannel = channels.length === 0;
    const isCurrentDefault = Boolean(selectedChannel?.isDefault);

    return (
      <DrawlerBase
        open={drawerMode !== null}
        onOpenChange={(open) => {
          if (!open && savingAction !== "form") closeDrawer();
        }}
        title={drawerMode === "add" ? "Thêm kênh TikTok" : "Chỉnh sửa kênh TikTok"}
        description="Nhập username không bao gồm ký tự @ cũng được."
        height="auto"
        footer={
          <div className="flex gap-2">
            <button
              className="min-h-[46px] flex-1 rounded-xl border border-slate-300 text-[14px] font-bold text-slate-600 disabled:opacity-60"
              onClick={closeDrawer}
              type="button"
              disabled={savingAction === "form"}
            >
              Huỷ
            </button>
            <button
              className="min-h-[46px] flex-1 rounded-xl bg-[#f2c300] text-[14px] font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              onClick={submitChannelForm}
              type="button"
              disabled={savingAction === "form"}
            >
              {savingAction === "form" ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        }
      >
        <div>
          <label className="block text-[13px] font-extrabold text-slate-500">
            TikTok username
          </label>
          <input
            value={draftUsername}
            onChange={(event) => setDraftUsername(event.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="@username"
            className="mt-2 min-h-[46px] w-full rounded-xl border border-slate-300 bg-white px-3 text-[15px] font-extrabold text-[#273044] outline-none"
          />

          <button
            className={`mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${draftIsDefault ? "border-[#f2c300] bg-yellow-50" : "border-slate-200 bg-white"} ${isCurrentDefault ? "cursor-not-allowed opacity-80" : ""}`}
            onClick={() => {
              if (isCurrentDefault) return;
              setDraftIsDefault((value) => !value);
            }}
            type="button"
            disabled={isCurrentDefault}
          >
            <span>
              <span className="block text-[14px] font-black text-[#273044]">
                Đặt làm kênh mặc định
              </span>
              <span className="mt-0.5 block text-xs leading-[18px] text-slate-500">
                {isFirstChannel
                  ? "Kênh đầu tiên sẽ tự động là mặc định."
                  : isCurrentDefault
                    ? "Để đổi mặc định, chọn kênh khác trong danh sách."
                    : "Kênh mặc định sẽ được dùng khi bắt đầu LIVE."}
              </span>
            </span>
            <span
              className={`ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${draftIsDefault ? "bg-[#f2c300] text-white" : "bg-slate-200 text-transparent"}`}
            >
              ✓
            </span>
          </button>
        </div>
      </DrawlerBase>
    );
  };

  if (subScreen === "tiktokChannels") {
    return (
      <div className="h-full overflow-y-auto px-3 pb-[26px] pt-[26px] [-webkit-overflow-scrolling:touch]">
        <div className="flex items-center gap-2 px-0 pt-[18px] pb-3">
          <button
            className="inline-flex h-11 w-11 items-center justify-center text-[36px] leading-none text-gray-900"
            onClick={() => setSubScreen("main")}
            type="button"
            aria-label="Quay lại"
          >
            ‹
          </button>
          <h1 className="m-0 text-[20px] font-black text-[#273044]">Quản lý kênh Tiktok</h1>
        </div>

        {isLoadingChannels ? (
          <div className="mb-3 rounded-[18px] border border-gray-200 bg-white p-[14px] text-[14px] font-bold text-slate-500 shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
            Đang tải danh sách kênh...
          </div>
        ) : null}

        {!isLoadingChannels && channels.length === 0 ? (
          <div className="mb-3 rounded-[18px] border border-gray-200 bg-white p-[14px] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
            <p className="text-[15px] font-black text-[#273044]">Chưa có kênh TikTok</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">
              Thêm username để bắt đầu nhận bình luận LIVE.
            </p>
          </div>
        ) : null}

        {channels.map((channel) => {
          const normalizedUsername = normalizeTikTokUsername(channel.tiktokUsername);
          const avatarLetter = normalizedUsername ? normalizedUsername[0].toUpperCase() : "T";
          const isSettingDefault = savingAction === `default:${channel.id}`;
          const isDeleting = savingAction === `delete:${channel.id}`;

          return (
            <div
              key={channel.id}
              className="mb-3 rounded-[18px] border border-gray-200 bg-white p-[14px] shadow-[0_8px_16px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f2c300] text-[17px] font-black text-white">
                  {avatarLetter}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[15px] font-black text-[#273044]">
                      {normalizedUsername || channel.tiktokUsername}
                    </p>
                    {channel.isDefault ? (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-black text-yellow-700">
                        Mặc định
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-slate-500">
                    ID: @{normalizedUsername || channel.tiktokUsername}
                  </p>
                  <p className="mt-0.5 text-xs leading-4.5 text-slate-400">
                    {channel.isDefault ? "Kênh mặc định để bắt đầu LIVE" : "Kênh TikTok đã lưu"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 pl-14">
                {!channel.isDefault ? (
                  <button
                    className="rounded-lg bg-yellow-100 px-3 py-1.5 text-[13px] font-bold text-yellow-700 disabled:opacity-60"
                    onClick={() => setDefaultChannel(channel)}
                    type="button"
                    disabled={Boolean(savingAction)}
                  >
                    {isSettingDefault ? "Đang đặt..." : "Đặt mặc định"}
                  </button>
                ) : null}
                <button
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-[13px] font-bold text-slate-600 disabled:opacity-60"
                  onClick={() => openEditDrawer(channel)}
                  type="button"
                  disabled={Boolean(savingAction)}
                >
                  Sửa
                </button>
                <button
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-[13px] font-bold text-red-600 disabled:opacity-60"
                  onClick={() => deleteChannel(channel)}
                  type="button"
                  disabled={Boolean(savingAction)}
                >
                  {isDeleting ? "Đang xoá..." : "Xoá"}
                </button>
              </div>
            </div>
          );
        })}

        <button
          className="mb-3 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-slate-300 text-[14px] font-bold text-slate-500 active:scale-[0.98]"
          onClick={openAddDrawer}
          type="button"
          disabled={Boolean(savingAction)}
        >
          + Thêm mới
        </button>

        <p className="mt-1 px-1 text-xs leading-[18px] text-slate-500">
          Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới và dấu chấm.
        </p>

        {renderChannelDrawer()}
        {renderConfirmDrawer()}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-3 pb-[26px] pt-[26px] [-webkit-overflow-scrolling:touch]">
      <div className="px-0 pt-[18px] pb-3">
        <h1 className="m-0 text-[22px] font-black text-[#273044]">Cài đặt</h1>
        <p className="mt-1 text-sm leading-5 text-slate-500">Thông tin kết nối và tài khoản</p>
      </div>

      <div className="mb-3 rounded-[18px] border border-gray-200 bg-white p-[14px] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
        <span className="block text-[13px] font-extrabold text-slate-500">Tài khoản</span>
        <strong className="mt-1.5 block text-[15px] font-black break-words text-[#273044]">
          {username}
        </strong>
      </div>

      <button
        className="mb-3 flex w-full items-center justify-between rounded-[18px] border border-gray-200 bg-white p-[14px] shadow-[0_8px_16px_rgba(15,23,42,0.08)] text-left active:scale-[0.99]"
        onClick={openTikTokChannelsScreen}
        type="button"
      >
        <div className="min-w-0 flex-1">
          <span className="block text-[13px] font-extrabold text-slate-500">Kênh TikTok LIVE</span>
          <strong className="mt-1 block truncate text-[15px] font-black text-[#273044]">
            {displayTikTokUsername ? `${displayTikTokUsername}` : "Chưa cài đặt"}
          </strong>
          <span className="mt-1 block text-xs font-bold text-slate-400">
            {channels.length ? `${channels.length} kênh đã lưu` : "Chưa có kênh đã lưu"}
          </span>
        </div>
        <span className="ml-3 shrink-0 text-[24px] leading-none text-slate-400">›</span>
      </button>

      <div className="mb-3 rounded-[18px] border border-gray-200 bg-white p-[14px] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
        <span className="block text-[13px] font-extrabold text-slate-500">Backend SSE/API URL</span>
        <strong className="mt-1.5 block text-[15px] font-black break-words text-[#273044]">
          {DEFAULT_WS_URL}
        </strong>
      </div>

      <div className="mb-3 rounded-[18px] border border-gray-200 bg-white p-[14px] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
        <span className="block text-[13px] font-extrabold text-slate-500">Trạng thái</span>
        <strong
          className={`mt-1.5 block text-[15px] font-black break-words ${isConnected ? "text-green-600" : "text-orange-600"}`}
        >
          {status}
        </strong>
      </div>

      <button
        className="mt-1 min-h-[50px] w-full rounded-2xl bg-red-100 text-[15px] font-black text-red-600"
        onClick={onLogout}
        type="button"
      >
        Đăng xuất
      </button>
    </div>
  );
}
