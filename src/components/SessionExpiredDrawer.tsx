"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DrawlerBase } from "./ui/Drawler";
import { emitAuthChanged, isPublicAuthScreen } from "@/lib/request";

export default function SessionExpiredDrawer() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      if (isPublicAuthScreen()) return;
      setOpen(true);
    };

    window.addEventListener("lumi-session-expired", handleExpired);

    return () => window.removeEventListener("lumi-session-expired", handleExpired);
  }, []);

  const handleLogin = () => {
    setOpen(false);
    emitAuthChanged("logout");
    router.replace("/?screen=login");
  };

  return (
    <DrawlerBase
      open={open}
      onOpenChange={setOpen}
      title="Phiên đăng nhập hết hạn"
      height="auto"
      dismissible={false}
      showCloseButton={false}
      footer={
        <button
          type="button"
          onClick={handleLogin}
          className="flex w-full items-center justify-center rounded-[40px] p-4 text-[16px] font-semibold text-black"
          style={{
            backgroundImage:
              "linear-gradient(138deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)",
          }}
        >
          Đăng nhập lại
        </button>
      }
    >
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#fff0f0]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              stroke="#ff4242"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-[15px] leading-6 text-[#484848]">
          Phiên đăng nhập của bạn đã hết hạn.
          <br />
          Vui lòng đăng nhập lại để tiếp tục.
        </p>
      </div>
    </DrawlerBase>
  );
}
