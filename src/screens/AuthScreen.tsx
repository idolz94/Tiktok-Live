"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInApi, signOutApi, signUpApi } from "@/api/authApi";
import { bootstrapAuth } from "@/hooks/useAuth";
import { ForgotPasswordDrawer } from "@/features/auth/ForgotPassword";

type Mode = "login" | "register";

export default function AuthScreen({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [tiktokId, setTiktokId] = useState("");

  const [remember, setRemember] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit() {
    if (!phone.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    if (!password.trim()) {
      alert("Vui lòng nhập mật khẩu");
      return;
    }

    if (!isLogin && !fullName.trim()) {
      alert("Vui lòng nhập họ tên");
      return;
    }

    if (!isLogin && !tiktokId.trim()) {
      alert("Vui lòng nhập TikTok ID");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isLogin) {
        await signInApi({ phone, password, remember });
      } else {
        await signUpApi({ fullName, phone, password, tiktokId });
      }

      const user = await bootstrapAuth();

      if (!user) {
        alert("Tài khoản đã tạo. Vui lòng đăng nhập lại.");
        setMode("login");
        return;
      }

      if (!user.canUseApp) {
        await signOutApi();
        alert("Shop đã hết hạn dùng thử hoặc chưa có license.");
        return;
      }

      router.push("/");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : isLogin
            ? "Đăng nhập thất bại"
            : "Đăng ký thất bại",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMode() {
    setMode((current) => (current === "login" ? "register" : "login"));
  }

  return (
    <main className="h-dvh overflow-hidden bg-[#f3f4f6] bg-[url('/assets/login-background.png')] bg-cover bg-center bg-no-repeat">
      <div className="mx-auto h-full w-full max-w-[560px]">
        <div className="h-full overflow-y-auto px-3 pt-[calc(22px+env(safe-area-inset-top))] pb-10 [-webkit-overflow-scrolling:touch]">
          <img
            src="/assets/login-banner.png"
            alt="Flive banner"
            className="h-[266px] w-full rounded-[22px] bg-[#f2c233] object-cover"
          />

          <section className="relative mt-[-70px] w-full rounded-[28px] bg-white/95 px-[18px] pt-[34px] pb-8 shadow-[0_8px_16px_rgba(15,23,42,0.08)]">
            <h1 className="m-0 text-center text-[23px] font-black text-[#273044]">
              {isLogin ? "Đăng nhập tài khoản" : "Trải nghiệm miễn phí"}
            </h1>

            {isLogin && (
              <>
                <button
                  className="mt-[26px] min-h-[62px] w-full rounded-[31px] border-[2.5px] border-[#070f66] bg-[#fffef5] text-xl font-black tracking-[0.4px] text-[#070f66]"
                  onClick={() => setMode("register")}
                  type="button"
                >
                  ĐĂNG KÝ NGAY
                </button>

                <div className="mt-[30px] flex items-center">
                  <span className="h-px flex-1 bg-gray-300" />
                  <span className="mx-[14px] text-[17px] font-extrabold text-[#273044]">
                    hoặc đăng nhập
                  </span>
                  <span className="h-px flex-1 bg-gray-300" />
                </div>
              </>
            )}

            {!isLogin && (
              <>
                <label className="mt-6 mb-2 block text-lg font-black text-[#273044]">
                  Full Name
                </label>

                <div className="flex min-h-14 items-center rounded-[13px] border border-[#a3a8b0] bg-white px-[14px]">
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    autoCapitalize="words"
                    autoCorrect="off"
                    placeholder="Nhập họ tên"
                    className="min-w-0 flex-1 border-0 bg-transparent text-xl text-[#273044] outline-none"
                  />

                  {fullName.trim() && (
                    <span className="ml-2.5 text-[22px] font-bold text-[#4caf50]">
                      ✓
                    </span>
                  )}
                </div>
              </>
            )}

            <label className="mt-6 mb-2 block text-lg font-black text-[#273044]">
              Phone
            </label>

            <div className="flex min-h-14 items-center rounded-[13px] border border-[#a3a8b0] bg-white px-[14px]">
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="tel"
                placeholder="Nhập số điện thoại"
                className="min-w-0 flex-1 border-0 bg-transparent text-xl text-[#273044] outline-none"
              />

              {phone.trim() && (
                <span className="ml-2.5 text-[22px] font-bold text-[#4caf50]">
                  ✓
                </span>
              )}
            </div>

            <label className="mt-6 mb-2 block text-lg font-black text-[#273044]">
              Mật khẩu
            </label>

            <div className="flex min-h-14 items-center rounded-[13px] border border-[#a3a8b0] bg-white px-[14px]">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={isPasswordVisible ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="Nhập mật khẩu"
                className="min-w-0 flex-1 border-0 bg-transparent text-xl text-[#273044] outline-none"
              />

              <button
                className="ml-2 text-[25px] text-[#273044]"
                onClick={() => setIsPasswordVisible((value) => !value)}
                type="button"
              >
                {isPasswordVisible ? "◉" : "◉̸"}
              </button>

              {password.trim() && (
                <span className="ml-2.5 text-[22px] font-bold text-[#4caf50]">
                  ✓
                </span>
              )}
            </div>

            {!isLogin && (
              <>
                <label className="mt-6 mb-2 block text-lg font-black text-[#273044]">
                  TikTok ID
                </label>

                <div className="flex min-h-14 items-center rounded-[13px] border border-[#a3a8b0] bg-white px-[14px]">
                  <input
                    value={tiktokId}
                    onChange={(event) => setTiktokId(event.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder="Nhập TikTok ID"
                    className="min-w-0 flex-1 border-0 bg-transparent text-xl text-[#273044] outline-none"
                  />

                  {tiktokId.trim() && (
                    <span className="ml-2.5 text-[22px] font-bold text-[#4caf50]">
                      ✓
                    </span>
                  )}
                </div>
              </>
            )}

            {isLogin && (
              <button
                className="mt-5 flex w-fit items-center"
                onClick={() => setRemember((value) => !value)}
                type="button"
              >
                <span
                  className={`mr-3 inline-flex h-8 w-8 items-center justify-center rounded border border-[#e9b834] text-2xl leading-[27px] font-black ${
                    remember ? "bg-[#e9b834] text-white" : "bg-white text-white"
                  }`}
                >
                  {remember ? "✓" : ""}
                </span>
                <span className="text-lg text-[#273044]">Ghi nhớ đăng nhập</span>
              </button>
            )}

            <button
              className="mt-[26px] min-h-[62px] w-full rounded-xl bg-[#e9b834] text-xl font-black tracking-[0.5px] text-white disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSubmit}
              type="button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "ĐANG XỬ LÝ..."
                : isLogin
                  ? "ĐĂNG NHẬP"
                  : "TẠO TÀI KHOẢN"}
            </button>

            {isLogin && (
              <ForgotPasswordDrawer />
            )}

            <div className="mt-[30px] flex items-center">
              <span className="h-px flex-1 bg-gray-300" />
              <span className="mx-4 text-[17px] font-black text-[#273044]">
                Tư vấn
              </span>
              <span className="h-px flex-1 bg-gray-300" />
            </div>

            <div className="mt-6 flex items-center justify-evenly">
              <button
                className="inline-flex h-16 w-16 items-center justify-center rounded-[14px] bg-white [&_img]:h-16 [&_img]:w-16 [&_img]:object-contain"
                type="button"
              >
                <img src="/assets/login-facebook.png" alt="Facebook" />
              </button>

              <button
                className="inline-flex h-16 w-16 items-center justify-center rounded-[14px] bg-white [&_img]:h-16 [&_img]:w-16 [&_img]:object-contain"
                type="button"
              >
                <img src="/assets/login-zalo.png" alt="Zalo" />
              </button>

              <button
                className="inline-flex h-16 w-16 items-center justify-center rounded-[14px] bg-white [&_img]:h-16 [&_img]:w-16 [&_img]:object-contain"
                type="button"
              >
                <img src="/assets/login-tiktok.png" alt="TikTok" />
              </button>
            </div>

            <button
              className="mx-auto mt-[22px] block text-center text-sm font-extrabold text-[#070f66]"
              onClick={toggleMode}
              type="button"
            >
              {isLogin
                ? "Chưa có tài khoản? Đăng ký"
                : "Đã có tài khoản? Đăng nhập"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}