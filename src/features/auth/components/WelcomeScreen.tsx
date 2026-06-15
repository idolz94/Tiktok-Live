"use client";

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
      <div className="relative mx-auto h-full w-full overflow-hidden bg-[#ffd8dd]">
        <img
          src="/images/welcome/background.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <section className="absolute inset-x-0 bottom-0 px-6 pb-2">
          <div className="mx-auto flex w-full flex-col items-center">
            <h1 className="whitespace-pre-line  font-['Inter_Display'] w-full text-4xl text-left leading-10 font-semibold text-black">
              {"Comment đến đâu\nĐơn về đến đó!"}
            </h1>

            <div className="mt-7 flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={onTrial}
                className="flex h-14 w-full items-center justify-center rounded-[40px] bg-[linear-gradient(138.46deg,#FF6B8A_13.52%,#FFA66D_52.12%,#FFC86A_117.76%)] text-[16px] font-medium text-black shadow-[0_12px_26px_rgba(255,107,138,0.22)]"
              >
                Trải nghiệm dùng thử
              </button>

              <button
                type="button"
                onClick={onRegister}
                className="flex h-14 w-full items-center justify-center rounded-[40px] border border-black/20 bg-white/50 text-[16px] font-medium text-black backdrop-blur"
              >
                Đăng kí ngay
              </button>

              <button
                type="button"
                onClick={onLogin}
                className="flex h-12 w-full items-center justify-center py-2 text-[16px] font-medium text-black"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
