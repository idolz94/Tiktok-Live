import type { UserJoinedEvent } from "@/features/tiktok-live/types";

export default function UserJoinedBanner({ event }: { event: UserJoinedEvent }) {
  const initial = event.displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex w-full items-center justify-center gap-4 py-4">
      <div className="h-px min-w-px flex-1 bg-[#d9d9d9]" />
      <div className="flex shrink-0 flex-col items-center">
        <p className="text-center text-[10px] leading-4 text-[#787878]">New</p>
        <div className="flex items-center gap-2">
          {event.joinAvatarUrl ? (
            <img
              src={event.joinAvatarUrl}
              alt=""
              className="h-4 w-4 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ffe8ee] text-[8px] font-semibold leading-none text-[#ff5f8a]">
              {initial}
            </div>
          )}
          <p className="max-w-45 truncate whitespace-nowrap text-center text-[12px] leading-4.5 text-black">
            {event.displayName} đã tham gia
          </p>
        </div>
      </div>
      <div className="h-px min-w-px flex-1 bg-[#d9d9d9]" />
    </div>
  );
}
