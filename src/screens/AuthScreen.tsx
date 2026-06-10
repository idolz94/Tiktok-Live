"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { createTikTokChannelApi } from "@/api/meApi";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import { ForgotPasswordDrawer } from "@/features/auth/ForgotPassword";

function mapClerkError(err: { code?: string; message?: string; longMessage?: string }): string {
  switch (err.code) {
    case "form_password_pwned":
      return "Mật khẩu này đã bị lộ trong các vụ rò rỉ dữ liệu. Vui lòng dùng mật khẩu khác.";
    case "form_password_not_strong_enough":
      return "Mật khẩu quá yếu. Hãy dùng mật khẩu có chữ hoa, chữ thường và số.";
    case "form_identifier_exists":
      return "Tên đăng nhập này đã được sử dụng.";
    case "form_identifier_not_found":
      return "Tên đăng nhập không tồn tại.";
    case "form_password_incorrect":
      return "Mật khẩu không đúng.";
    case "too_many_requests":
      return "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.";
    case "session_exists":
      return "Bạn đang đăng nhập rồi.";
    default:
      return err.longMessage || err.message || "Có lỗi xảy ra, vui lòng thử lại.";
  }
}

type Mode = "login" | "register";

export default function AuthScreen({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const [mode, setMode] = useState<Mode>(initialMode);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tiktokId, setTiktokId] = useState("");

  const [remember, setRemember] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit() {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      toast.warning("Vui lòng nhập tên đăng nhập");
      return;
    }

    if (trimmedUsername.length < 4) {
      toast.warning("Tên đăng nhập phải có ít nhất 4 ký tự");
      return;
    }

    if (/^\d+$/.test(trimmedUsername)) {
      toast.warning("Tên đăng nhập không được chỉ chứa số");
      return;
    }

    if (!password.trim()) {
      toast.warning("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 8) {
      toast.warning("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (!isLogin && /^(.)\1+$/.test(password)) {
      toast.warning("Mật khẩu quá đơn giản, vui lòng dùng mật khẩu khác");
      return;
    }

    if (!isLogin && /^(?:012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321|210)/.test(password)) {
      toast.warning("Mật khẩu không được dùng dãy số liên tiếp");
      return;
    }

    if (!isLogin && !fullName.trim()) {
      toast.warning("Vui lòng nhập họ tên");
      return;
    }

    if (!isLogin && !tiktokId.trim()) {
      toast.warning("Vui lòng nhập TikTok ID");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isLogin) {
        if (!signIn) throw new Error("Sign in not available");

        const result = await signIn.create({
          identifier: username.trim(),
          password,
        });

        if (result.status === "complete") {
          await setSignInActive({ session: result.createdSessionId });
          router.replace("/dashboard/live");
        } else {
          toast.info("Vui lòng hoàn tất xác minh.");
        }
      } else {
        if (!signUp) throw new Error("Sign up not available");

        const result = await signUp.create({
          username: username.trim(),
          password,
          firstName: fullName.trim(),
          unsafeMetadata: {
            tiktokId: tiktokId.trim(),
          },
        });

        if (result.status === "complete") {
          await setSignUpActive({ session: result.createdSessionId });

          await createTikTokChannelApi({
            tiktokUsername: tiktokId.trim(),
            isDefault: true,
          });

          router.replace("/dashboard/live");
        } else {
          toast.info("Tài khoản đã tạo. Vui lòng hoàn tất xác minh.");
        }
      }
    } catch (error: any) {
      const clerkErrors = error?.errors;
      if (clerkErrors?.length) {
        toast.error(mapClerkError(clerkErrors[0]));
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : isLogin
              ? "Đăng nhập thất bại"
              : "Đăng ký thất bại",
        );
      }
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
              <FloatingLabelInput
                id="fullName"
                label="Họ tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoCapitalize="words"
                autoCorrect="off"
                className="mt-6"
                rightSlot={
                  fullName.trim() ? (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[22px] font-bold text-[#4caf50]">
                      ✓
                    </span>
                  ) : null
                }
              />
            )}

            <FloatingLabelInput
              id="username"
              label="Tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="username"
              className="mt-6"
              rightSlot={
                username.trim() ? (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[22px] font-bold text-[#4caf50]">
                    ✓
                  </span>
                ) : null
              }
            />

            <FloatingLabelInput
              id="password"
              label="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={isPasswordVisible ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              className="mt-6"
              rightSlot={
                <button
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[25px] text-[#273044]"
                  onClick={() => setIsPasswordVisible((v) => !v)}
                  type="button"
                >
                  {isPasswordVisible ?  
                  '%': <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.94418 4.23002C10.8853 3.99869 12.8489 4.40904 14.5349 5.39839C16.221 6.38775 17.5369 7.90175 18.2817 9.70919C18.3511 9.89628 18.3511 10.1021 18.2817 10.2892C17.9754 11.0317 17.5707 11.7296 17.0783 12.3642M11.7367 11.7984C11.2652 12.2537 10.6337 12.5057 9.97818 12.5C9.32269 12.4943 8.69565 12.2314 8.23213 11.7679C7.76861 11.3044 7.50569 10.6773 7.5 10.0219C7.4943 9.36636 7.74629 8.73486 8.20168 8.26335M14.5658 14.5825C13.4604 15.2373 12.2271 15.6467 10.9495 15.7828C9.6719 15.919 8.37997 15.7787 7.16137 15.3716C5.94277 14.9644 4.82601 14.2999 3.88686 13.4231C2.94771 12.5464 2.20814 11.4778 1.71835 10.29C1.6489 10.1029 1.6489 9.89712 1.71835 9.71002C2.45721 7.91823 3.75724 6.41439 5.42335 5.42419M1.66668 1.66669L18.3333 18.3334" stroke="#484848" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
}
                </button>
              }
            />

            {!isLogin && (
              <FloatingLabelInput
                id="tiktokId"
                label="TikTok ID"
                value={tiktokId}
                onChange={(e) => setTiktokId(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                className="mt-6"
                rightSlot={
                  tiktokId.trim() ? (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[22px] font-bold text-[#4caf50]">
                      ✓
                    </span>
                  ) : null
                }
              />
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

            <div className="mt-6 flex items-center justify-center gap-x-3">
              <button
                className="inline-flex h-12 w-12 items-center justify-center rounded-[14px]"
                type="button"
              >
                <img src="/assets/icon/fb.png" alt="Facebook" />
              </button>

              <button
                className="inline-flex h-12 w-12 items-center justify-center rounded-[14px]"
                type="button"
              >
                <img src="/assets/icon/tiktok.png" alt="TikTok" />
              </button>

              <button
                className="inline-flex h-12 w-12 items-center justify-center rounded-[14px]"
                type="button"
              >
                <img src="/assets/icon/zalo.png" alt="Zalo" />
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
