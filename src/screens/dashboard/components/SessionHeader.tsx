"use client";

export default function SessionHeader({}: {
  isConnected: boolean;
  status: string;
  tiktokUsername: string;
  currentLiveSession: unknown;
  liveDurationSeconds: number;
  liveNowText: string;
}) {
  return (
    <header className="flex justify-between bg-linear-to-b from-[#FF6B8A]/30 via-[#FFA66D]/20 to-white/0 px-3 pb-2 pt-3">
      <div className="flex h-13 w-13 items-center justify-center rounded-full bg-white shadow-[0_8px_22px_rgba(67,137,220,0.18)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[#4389dc] to-[#62b4ff] text-base font-black text-white">
          P
        </div>
      </div>
    </header>
  );
}
