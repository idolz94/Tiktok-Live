"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { createTikTokChannelApi } from "@/api/meApi";
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

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.94418 4.23002C10.8853 3.99869 12.8489 4.40904 14.5349 5.39839C16.221 6.38775 17.5369 7.90175 18.2817 9.70919C18.3511 9.89628 18.3511 10.1021 18.2817 10.2892C17.9754 11.0317 17.5707 11.7296 17.0783 12.3642M11.7367 11.7984C11.2652 12.2537 10.6337 12.5057 9.97818 12.5C9.32269 12.4943 8.69565 12.2314 8.23213 11.7679C7.76861 11.3044 7.50569 10.6773 7.5 10.0219C7.4943 9.36636 7.74629 8.73486 8.20168 8.26335M14.5658 14.5825C13.4604 15.2373 12.2271 15.6467 10.9495 15.7828C9.6719 15.919 8.37997 15.7787 7.16137 15.3716C5.94277 14.9644 4.82601 14.2999 3.88686 13.4231C2.94771 12.5464 2.20814 11.4778 1.71835 10.29C1.6489 10.1029 1.6489 9.89712 1.71835 9.71002C2.45721 7.91823 3.75724 6.41439 5.42335 5.42419M1.66668 1.66669L18.3333 18.3334" stroke="#484848" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function EyeOnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.72 10C2.46 7.91 4.24 5 10 5C15.76 5 17.54 7.91 18.28 10C17.54 12.09 15.76 15 10 15C4.24 15 2.46 12.09 1.72 10Z" stroke="#484848" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="10" r="2.5" stroke="#484848" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  if (!checked) {
    return (
      <span className="flex size-6 items-center justify-center rounded-[4px] border border-black/20 bg-white shrink-0" />
    );
  }
  return (
    <span className="flex size-6 items-center justify-center rounded-[4px] bg-[#ff6b8a] shrink-0">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M2.5 6.5L5.5 9.5L10.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  rightSlot,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label className="text-[14px] leading-[22px] text-[#484848] font-['Inter_Display',sans-serif]">{label}</label>
      <div className="flex h-12 items-center gap-4 rounded-[8px] border border-black/10 bg-white px-4">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 text-[14px] leading-[22px] text-black placeholder:text-[#787878] bg-transparent outline-none font-['Inter_Display',sans-serif]"
        />
        {rightSlot}
      </div>
    </div>
  );
}

function HeroHeader() {
  return (
    <div
      className="relative h-[350px] w-full shrink-0 overflow-hidden"
      style={{
        background: "linear-gradient(150.59deg, #FF6B8A 5.85%, #FFA66D 45.40%, #FFC86A 84.96%)",
      }}
    >
      <p className="absolute left-1/2 top-[79px] w-[184px] -translate-x-1/2 text-center font-['Inter_Display',sans-serif] text-[20px] font-semibold leading-[24px] text-black">
        3 bước đơn giản, chốt đơn dễ dàng
      </p>

      <div className="absolute top-[150px] left-0 right-0 flex items-center justify-between gap-0 px-6">
        <div className="flex items-center justify-center" style={{ width: 88, height: 88 }}>
          <div className="rotate-15">
            <div className="overflow-hidden rounded-[19.765px] bg-white shadow-[0_3px_7px_rgba(0,0,0,0.05),0_13px_13px_rgba(0,0,0,0.04),0_29px_17px_rgba(0,0,0,0.03)]">
              <img src="/images/auth/step-1.png" alt="" className="size-full object-cover w-18 h-18" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center" style={{ width: 88, height: 88 }}>
          <div className="-rotate-15">
            <div className="overflow-hidden rounded-[19.765px] bg-white shadow-[0_3px_7px_rgba(0,0,0,0.05),0_13px_13px_rgba(0,0,0,0.04),0_29px_17px_rgba(0,0,0,0.03)]">
              <img src="/images/auth/step-2.png" alt="" className="size-full object-cover w-18 h-18" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center" style={{ width: 88, height: 88 }}>
          <div className="rotate-15">
            <div className="overflow-hidden rounded-[19.765px] bg-white shadow-[0_3px_7px_rgba(0,0,0,0.05),0_13px_13px_rgba(0,0,0,0.04),0_29px_17px_rgba(0,0,0,0.03)]">
              <img src="/images/auth/step-3.png" alt="" className="size-full object-cover w-18 h-18" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[22px] left-0 right-0 flex justify-around px-4 text-center">
        <span className="text-[14px] leading-[22px] text-black font-['Inter_Display',sans-serif]">Gom comment</span>
        <span className="text-[14px] leading-[22px] text-black font-['Inter_Display',sans-serif]">Xác nhận đơn</span>
        <span className="text-[14px] leading-[22px] text-black font-['Inter_Display',sans-serif]">Gửi vận chuyển</span>
      </div>
    </div>
  );
}

export default function AuthScreen({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const [mode, setMode] = useState<Mode>(initialMode);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tiktokId, setTiktokId] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit() {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      toast.warning("Vui lòng nhập tên tài khoản");
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

    if (!isLogin && !fullName.trim()) {
      toast.warning("Vui lòng nhập họ tên");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isLogin) {
        if (!signIn) throw new Error("Sign in not available");

        const result = await signIn.create({
          identifier: trimmedUsername,
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
          username: trimmedUsername,
          password,
          firstName: fullName.trim(),
          unsafeMetadata: {
            tiktokId: tiktokId.trim(),
          },
        });

        if (result.status === "complete") {
          await setSignUpActive({ session: result.createdSessionId });

          if (tiktokId.trim()) {
            await createTikTokChannelApi({
              tiktokUsername: tiktokId.trim(),
              isDefault: true,
            });
          }

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

  return (
    <main className="relative h-dvh overflow-hidden bg-white">
      <div className="mx-auto h-full w-full overflow-hidden">
        <HeroHeader />

        <div
          className="relative -mt-[41px] flex flex-col rounded-t-[32px] bg-white"
          style={{ height: "calc(100dvh - 309px)" }}
        >
          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-6 [-webkit-overflow-scrolling:touch]">
            <div className="flex flex-col gap-6">

              {isLogin ? (
                <>
                  <p className="w-full text-center font-['Inter_Display',sans-serif] text-[18px] font-medium leading-[24px] text-black">
                    Đăng nhập
                  </p>

                  <div className="flex flex-col gap-5">
                    <InputField
                      label="Tên tài khoản"
                      placeholder="Nhập tên tài khoản của bạn"
                      value={username}
                      onChange={setUsername}
                    />

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[14px] leading-[22px] text-[#484848] font-['Inter_Display',sans-serif]">Mật khẩu</label>
                        <ForgotPasswordDrawer />
                      </div>
                      <div className="flex h-12 items-center gap-4 rounded-[8px] border border-black/10 bg-white px-4">
                        <input
                          type={isPasswordVisible ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Nhập mật khẩu"
                          className="flex-1 min-w-0 text-[14px] leading-[22px] text-black placeholder:text-[#787878] bg-transparent outline-none font-['Inter_Display',sans-serif]"
                        />
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible((v) => !v)}
                          className="shrink-0"
                        >
                          {isPasswordVisible ? <EyeOnIcon /> : <EyeOffIcon />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex h-14 w-full items-center justify-center rounded-[40px] text-[16px] font-medium text-black disabled:opacity-60 font-['Inter_Display',sans-serif]"
                    style={{
                      background: "linear-gradient(138.46deg, #FF6B8A 13.52%, #FFA66D 52.12%, #FFC86A 117.76%)",
                    }}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-[#dadada]" />
                    <span className="text-[12px] font-medium leading-[18px] text-[#484848] font-['Inter_Display',sans-serif]">
                      Tư vấn
                    </span>
                    <span className="h-px flex-1 bg-[#dadada]" />
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      className="flex size-12 items-center justify-center rounded-[12px] border border-[#dadada] bg-white"
                    >
                      <img src="/images/auth/icon-phone.svg" alt="Phone" className="size-5" />
                    </button>
                    <button
                      type="button"
                      className="flex size-12 items-center justify-center rounded-[12px] border border-[#dadada] bg-white"
                    >
                      <img src="/images/auth/icon-messenger.svg" alt="Messenger" className="size-5" />
                    </button>
                    <button
                      type="button"
                      className="flex size-12 items-center justify-center rounded-[12px] border border-[#dadada] bg-white"
                    >
                      <img src="/images/auth/icon-instagram.svg" alt="Instagram" className="size-5" />
                    </button>
                    <button
                      type="button"
                      className="flex size-12 items-center justify-center rounded-[12px] border border-[#dadada] bg-white"
                    >
                      <img src="/images/auth/icon-tiktok.svg" alt="TikTok" className="size-5" />
                    </button>
                  </div>

                  <p className="text-center text-[14px] leading-[22px] text-[#484848] font-['Inter_Display',sans-serif]">
                    Bạn chưa có tài khoản.{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="font-medium text-[#ff6b8a]"
                    >
                      Đăng kí ngay
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-center font-['Inter_Display',sans-serif] text-[18px] font-medium leading-[24px] text-black">
                      Đăng kí
                    </p>
                    <p className="text-center text-[14px] leading-[22px] text-[#484848] font-['Inter_Display',sans-serif]">
                      Bạn có tài khoản.{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="font-medium text-[#ff6b8a]"
                      >
                        Đăng nhập
                      </button>
                    </p>
                  </div>

                  <div className="flex flex-col gap-5">
                    <InputField
                      label="Họ và tên"
                      placeholder="Nhập họ và tên của bạn"
                      value={fullName}
                      onChange={setFullName}
                    />
                    <InputField
                      label="Tên tài khoản"
                      placeholder="Nhập tên tài khoản của bạn"
                      value={username}
                      onChange={setUsername}
                    />
                    <InputField
                      label="Mật khẩu"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={setPassword}
                      type={isPasswordVisible ? "text" : "password"}
                      rightSlot={
                        <button
                          type="button"
                          onClick={() => setIsPasswordVisible((v) => !v)}
                          className="shrink-0"
                        >
                          {isPasswordVisible ? <EyeOnIcon /> : <EyeOffIcon />}
                        </button>
                      }
                    />
                    <InputField
                      label="Tiktok ID (tùy chọn)"
                      placeholder="@username"
                      value={tiktokId}
                      onChange={setTiktokId}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setAgreedToTerms((v) => !v)}
                    className="flex items-start gap-3"
                  >
                    <CheckboxIcon checked={agreedToTerms} />
                    <p className="text-left text-[14px] leading-[22px] text-[#484848] font-['Inter_Display',sans-serif]">
                      Bấm nút đăng kí bạn đồng ý với{" "}
                      <span className="font-medium text-[#ff6b8a]">điều kiện</span>
                      {" "}và{" "}
                      <span className="font-medium text-[#ff6b8a]">điều khoản</span>
                      {" "}của chúng tôi.
                    </p>
                  </button>
                </>
              )}
            </div>
          </div>

          {!isLogin && (
            <div className="shrink-0 px-4 pb-[calc(8px+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !agreedToTerms}
                className="flex h-14 w-full items-center justify-center rounded-[40px] text-[16px] font-medium text-black disabled:opacity-40 font-['Inter_Display',sans-serif]"
                style={{
                  background: "linear-gradient(138.46deg, #FF6B8A 13.52%, #FFA66D 52.12%, #FFC86A 117.76%)",
                }}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng kí"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
