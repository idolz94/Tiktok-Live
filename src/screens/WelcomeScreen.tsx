"use client";

const FIGMA_BACKGROUND_URL =
  "https://www.figma.com/api/mcp/asset/80ac6d5b-4c14-4e5a-971d-1da2b2de6a36";
const FIGMA_BACKGROUND_OVERLAY_URL =
  "https://www.figma.com/api/mcp/asset/af5dc581-83f1-4980-9f73-23630d2a944d";
const FIGMA_FOREGROUND_URL =
  "https://www.figma.com/api/mcp/asset/18e007d0-fc5d-49b5-b922-5d8184b32aa9";

export default function WelcomeScreen({
  onLogin,
  onRegister,
  onTrial,
}: {
  onLogin: () => void;
  onRegister: () => void;
  onTrial: () => void;
}) {
  return (
    <main className="relative h-dvh overflow-hidden bg-white text-black">
      <div className="relative mx-auto h-full max-w-155 overflow-hidden bg-[#ffd8dd]">
        <img
          src={FIGMA_BACKGROUND_URL}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <img
          src={FIGMA_BACKGROUND_OVERLAY_URL}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-95 mix-blend-plus-lighter"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.46)_45%,rgba(255,255,255,0.98)_73%,#fff_100%)]" />

        <div className="absolute inset-x-0 top-[calc(70px+env(safe-area-inset-top))] flex justify-center px-4">
          <img
            src={FIGMA_FOREGROUND_URL}
            alt="Lumi Live"
            className="h-auto w-full max-w-[360px] object-contain"
          />
        </div>

        <section className="absolute inset-x-0 bottom-0 px-4 pb-[calc(34px+env(safe-area-inset-bottom))]">
          <div className="mx-auto flex w-full max-w-[390px] flex-col items-center">
            <h1 className="whitespace-pre-line text-center text-[40px] leading-[46px] font-semibold tracking-[-0.6px] text-black">
              {"Sáng comment\nSáng doanh thu"}
            </h1>

            <div className="mt-9 flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={onRegister}
                className="flex h-14 w-full items-center justify-center rounded-[40px] bg-[linear-gradient(138.46deg,#ff6b8a_13.52%,#ffa66d_52.12%,#ffc86a_117.76%)] text-[16px] font-medium text-black shadow-[0_12px_26px_rgba(255,107,138,0.22)]"
              >
                Đăng kí
              </button>

              <button
                type="button"
                onClick={onLogin}
                className="flex h-14 w-full items-center justify-center rounded-[40px] border border-black/20 bg-white/50 text-[16px] font-medium text-black backdrop-blur"
              >
                Đăng nhập
              </button>

              <button
                type="button"
                onClick={onTrial}
                className="flex h-12 w-full items-center justify-center text-[16px] font-medium text-black"
              >
                Trải nghiệm dùng thử
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
