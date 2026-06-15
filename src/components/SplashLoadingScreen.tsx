"use client";

function CameraIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <path
        d="M21 26.25C21 23.7647 23.0147 21.75 25.5 21.75H33.75L37.5 17.25H46.5L50.25 21.75H52.5C54.9853 21.75 57 23.7647 57 26.25V47.25C57 49.7353 54.9853 51.75 52.5 51.75H25.5C23.0147 51.75 21 49.7353 21 47.25V26.25Z"
        fill="white"
        fillOpacity="0.94"
      />
      <circle cx="39" cy="36.75" r="9" fill="#FF6B8A" fillOpacity="0.88" />
      <circle cx="39" cy="36.75" r="4.5" fill="white" />
      <path
        d="M18 31.5H12.75C10.6789 31.5 9 33.1789 9 35.25V42.75C9 44.8211 10.6789 46.5 12.75 46.5H18V31.5Z"
        fill="white"
        fillOpacity="0.94"
      />
      <path
        d="M15 24.75C15 22.2647 17.0147 20.25 19.5 20.25H24V27H19.5C17.0147 27 15 24.9853 15 22.5V24.75Z"
        fill="white"
        fillOpacity="0.72"
      />
      <circle cx="27" cy="18" r="2.25" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

function StatusBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex h-[47px] items-center justify-between px-[27px] pt-[13px] text-black">
      <span className="w-[54px] text-center text-[16px] font-semibold leading-[21px] tracking-[-0.32px]">
        9:41
      </span>
      <div className="flex items-center gap-[7px]">
        <div className="flex h-3 items-end gap-[2px]">
          <span className="h-[4px] w-[3px] rounded-sm bg-black" />
          <span className="h-[6px] w-[3px] rounded-sm bg-black" />
          <span className="h-[8px] w-[3px] rounded-sm bg-black" />
          <span className="h-[10px] w-[3px] rounded-sm bg-black" />
        </div>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden="true">
          <path
            d="M1 3.7C5.7 0.1 11.3 0.1 16 3.7M4 6.6C6.7 4.6 10.3 4.6 13 6.6M7 9.4C7.9 8.8 9.1 8.8 10 9.4"
            stroke="black"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <div className="relative h-[13px] w-[27px] rounded-[4px] border border-black/35 p-[2px]">
          <div className="h-full w-[13px] rounded-[2px] bg-black" />
          <span className="absolute -right-[3px] top-1/2 h-[4px] w-[2px] -translate-y-1/2 rounded-r bg-black/35" />
        </div>
      </div>
    </div>
  );
}

export default function SplashLoadingScreen() {
  return (
    <main className="relative h-dvh overflow-hidden bg-white text-black">
      <div className="mx-auto relative h-full bg-white">

        <div className="absolute left-1/2 top-[calc(50%)] flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-[linear-gradient(136deg,#ff6b8a_4%,#ffa66d_63%,#ffc86a_131%)] shadow-[0_14px_32px_rgba(255,107,138,0.22)]">
            <CameraIcon />
          </div>
          <p className="w-full text-center text-[18px] font-medium leading-6 text-black">
            Lumi Live
          </p>
        </div>

      </div>
    </main>
  );
}
