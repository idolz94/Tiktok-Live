"use client";

import { useState } from "react";
import { DrawlerBase } from "@/components/ui/Drawler";

export function ForgotPasswordDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <DrawlerBase
      open={open}
      onOpenChange={setOpen}
      title="Quên mật khẩu?"
      description="Đừng lo! Hãy liên hệ với chúng tôi, đội ngũ Lumi Live sẽ giúp bạn khôi phục ngay."
      trigger={
        <button type="button" className="font-['Inter_Display',sans-serif] text-[14px] leading-[22px] text-[#484848]">
          Quên mật khẩu
        </button>
      }
      footer={
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              window.open("https://zalo.me/your-zalo-id", "_blank");
              setOpen(false);
            }}
            className="h-14 w-full rounded-full bg-gradient-to-r from-rose-400 to-amber-300 text-lg font-bold text-black active:scale-[0.98]"
          >
            Liên hệ ngay
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-14 w-full rounded-full border border-slate-200 bg-white text-lg font-bold text-slate-900 active:scale-[0.98]"
          >
            Bỏ qua
          </button>
        </div>
      }
    >
      <div className="text-base leading-7 text-slate-600">
        Bạn có thể liên hệ admin để được cấp lại mật khẩu hoặc kích hoạt lại tài khoản.
      </div>
    </DrawlerBase>
  );
}