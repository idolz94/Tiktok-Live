"use client";

import { toast } from "sonner";
import { ChevronRightIcon } from "./SettingsIcons";

export function SettingsRow({
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
      <div className="flex size-6 shrink-0 items-center justify-center text-black">
        {icon}
      </div>
      <span className="flex-1 text-[14px] leading-[22px] text-black">{label}</span>
      <ChevronRightIcon />
    </button>
  );
}

export function SocialButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => toast.info("Tính năng đang phát triển")}
      className="flex size-12 items-center justify-center rounded-[12px] bg-white text-[#111827]"
    >
      {children}
    </button>
  );
}

export function ChannelBone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-[#e4e4e4] ${className}`} />;
}

export function TikTokChannelsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="flex items-center gap-4 rounded-2xl bg-[#f2f2f2] p-4">
          <ChannelBone className="size-10 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <ChannelBone className="h-3.5 w-32" />
            <ChannelBone className="h-3 w-44 max-w-full" />
          </div>
          <ChannelBone className="h-8 w-14 shrink-0" />
        </div>
      ))}

      <div className="rounded-lg border border-dashed border-[#d1d1d1] px-4 py-3 opacity-60">
        <div className="flex items-center justify-center gap-2">
          <ChannelBone className="size-4" />
          <ChannelBone className="h-3.5 w-20" />
        </div>
      </div>

      <ChannelBone className="h-3 w-64 max-w-full rounded-md" />
    </div>
  );
}
