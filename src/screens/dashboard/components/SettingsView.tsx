"use client";

import { useEffect, useState } from "react";
import { DEFAULT_WS_URL } from "../../../constants/config";
import { normalizeTikTokUsername } from "@/utils/comment";

export default function SettingsView({
  username,
  tiktokUsername,
  isConnected,
  status,
  onChangeTikTokUsername,
  onLogout,
}: {
  username?: string;
  tiktokUsername: string;
  isConnected: boolean;
  status: string;
  onChangeTikTokUsername: (username: string) => void;
  onLogout: () => void;
}) {
  const [inputUsername, setInputUsername] = useState(() => tiktokUsername);
  

  const submitTikTokUsername = () => {
    const nextUsername = normalizeTikTokUsername(inputUsername);
    if (!nextUsername) return;
    onChangeTikTokUsername(nextUsername);
  };

  return (
    <div className="overflow-auto px-3 pb-[26px] [-webkit-overflow-scrolling:touch]">
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

      <div className="mb-3 rounded-[18px] border border-gray-200 bg-white p-[14px] shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
        <span className="block text-[13px] font-extrabold text-slate-500">
          TikTok LIVE username của app này
        </span>

        <div className="mt-2.5 flex items-center">
          <input
            value={inputUsername}
            onChange={(event) => setInputUsername(event.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="@username"
            className="min-h-[46px] min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-[15px] font-extrabold text-[#273044] outline-none"
          />

          <button
            className="ml-2 min-h-[46px] rounded-xl bg-[#f2c300] px-[14px] text-[13px] font-black text-white"
            onClick={submitTikTokUsername}
            type="button"
          >
            Start live
          </button>
        </div>

        <p className="mt-2 text-xs leading-[18px] text-slate-500">
          Mỗi web app có thể nhập username riêng. Backend sẽ start Python collector cho username này và gửi comment realtime qua SSE.
        </p>
      </div>

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
