"use client";

import { DrawlerBase } from "../../../components/ui/Drawler";
import { Carrier } from "../constants";
import { EyeIcon, InfoIcon } from "./icons";
import { GradientButton } from "./shared";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrier: Carrier | null;
  linkAccount: string;
  linkPassword: string;
  showPassword: boolean;
  linkIsDefault: boolean;
  onChangeAccount: (value: string) => void;
  onChangePassword: (value: string) => void;
  onToggleShowPassword: () => void;
  onToggleDefault: () => void;
};

export function LinkCarrierDrawer({
  open,
  onOpenChange,
  carrier,
  linkAccount,
  linkPassword,
  showPassword,
  linkIsDefault,
  onChangeAccount,
  onChangePassword,
  onToggleShowPassword,
  onToggleDefault,
}: Props) {
  return (
    <DrawlerBase
      open={open}
      onOpenChange={onOpenChange}
      title={carrier?.name ?? "Liên kết"}
      height="auto"
      footer={
        <div className="px-4 pb-2 pt-1">
          <GradientButton
            label="Kết nối"
            disabled={!linkAccount || !linkPassword}
            onClick={() => onOpenChange(false)}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-5 px-4 pb-4">
        <div className="flex items-start gap-2 rounded-xl bg-[#e9f2ff] p-3">
          <span className="mt-0.5 shrink-0 text-[#468adf]">
            <InfoIcon />
          </span>
          <p className="text-[13px] leading-5 text-[#468adf]">
            Nhập thông tin tài khoản {carrier?.name ?? "đơn vị vận chuyển"} để liên kết và tạo vận
            đơn tự động.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#484848]">Tài khoản</label>
          <div className="flex h-12 items-center rounded-xl border border-black/10 px-4">
            <input
              type="tel"
              inputMode="tel"
              value={linkAccount}
              onChange={(e) => onChangeAccount(e.target.value)}
              placeholder="Số điện thoại"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[14px] text-[#484848]">Mật khẩu</label>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-black/10 px-4">
            <input
              type={showPassword ? "text" : "password"}
              value={linkPassword}
              onChange={(e) => onChangePassword(e.target.value)}
              placeholder="••••••••"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
            />
            <button type="button" onClick={onToggleShowPassword} className="text-[#787878]">
              <EyeIcon />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[14px] text-[#484848]">Đặt làm mặc định</span>
          <button
            type="button"
            role="switch"
            aria-checked={linkIsDefault}
            onClick={onToggleDefault}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              linkIsDefault ? "bg-[#ff6b8a]" : "bg-[#d1d1d1]"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                linkIsDefault ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </DrawlerBase>
  );
}
