"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginApi, registerApi } from "@/api/authApi";
import { emitAuthChanged } from "@/lib/request";
import { ForgotPasswordDrawer } from "@/features/auth/ForgotPassword";

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
      <span className="flex size-6 shrink-0 items-center justify-center rounded-[4px] border border-black/20 bg-white" />
    );
  }
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-[4px] bg-[#ff6b8a]">
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M2.5 6.5L5.5 9.5L10.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

function InputField({
  label,
  value,
  onChange,
  onBlur,
  onKeyDown,
  type = "text",
  rightSlot,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  type?: string;
  rightSlot?: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`form-item${error ? " border-[#ff6b8a]!" : ""}`}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder=" "
        />
        {rightSlot}
        <label>{label}</label>
      </div>
      {error && (
        <p className="px-1 text-[12px] leading-4.5 text-[#ff6b8a]">{error}</p>
      )}
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
      <p className="absolute top-[79px] left-1/2 w-[184px] -translate-x-1/2 text-center text-[20px] leading-6 font-semibold text-black">
        3 bước đơn giản, chốt đơn dễ dàng
      </p>


      <div className="absolute inset-x-0 top-[150px] flex items-center justify-between gap-0 px-6">
        <div className="flex items-center justify-center" style={{ width: 88, height: 88 }}>
          <div className="rotate-15">
            <div className="overflow-hidden rounded-[19.765px] bg-white shadow-[0_3px_7px_rgba(0,0,0,0.05),0_13px_13px_rgba(0,0,0,0.04),0_29px_17px_rgba(0,0,0,0.03)]">
              <img src="/images/auth/step-1.png" alt="" className="size-18 object-cover" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center" style={{ width: 88, height: 88 }}>
          <div className="-rotate-15">
            <div className="overflow-hidden rounded-[19.765px] bg-white shadow-[0_3px_7px_rgba(0,0,0,0.05),0_13px_13px_rgba(0,0,0,0.04),0_29px_17px_rgba(0,0,0,0.03)]">
              <img src="/images/auth/step-2.png" alt="" className="size-18 object-cover" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center" style={{ width: 88, height: 88 }}>
          <div className="rotate-15">
            <div className="overflow-hidden rounded-[19.765px] bg-white shadow-[0_3px_7px_rgba(0,0,0,0.05),0_13px_13px_rgba(0,0,0,0.04),0_29px_17px_rgba(0,0,0,0.03)]">
              <img src="/images/auth/step-3.png" alt="" className="size-18 object-cover" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[22px] flex justify-around px-4 text-center">
        <span className="text-[14px] leading-[22px] text-black">Gom comment</span>
        <span className="text-[14px] leading-[22px] text-black">Xác nhận đơn</span>
        <span className="text-[14px] leading-[22px] text-black">Gửi vận chuyển</span>
      </div>
    </div>
  );
}

type RegisterErrors = {
  fullName?: string;
  username?: string;
  password?: string;
  tiktokId?: string;
};

function validateRegisterField(field: keyof RegisterErrors, value: string): string {
  if (field === "fullName") {
    return value.trim().length === 0 ? "Vui lòng nhập họ và tên" : "";
  }
  if (field === "username") {
    if (value.trim().length === 0) return "Vui lòng nhập tên tài khoản";
    if (value.trim().length < 5) return "Tên tài khoản phải có ít nhất 5 ký tự";
    if (!/^[a-z0-9_.-]+$/.test(value.trim())) return "Tên tài khoản chỉ gồm chữ thường, số, _ . -";
    return "";
  }
  if (field === "password") {
    if (value.length === 0) return "Vui lòng nhập mật khẩu";
    if (value.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    return "";
  }
  if (field === "tiktokId") {
    return value.trim().length === 0 ? "Vui lòng nhập TikTok ID" : "";
  }
  return "";
}

export default function AuthScreen({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tiktokId, setTiktokId] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [registerErrors, setRegisterErrors] = useState<RegisterErrors>({});

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  const canSubmitRegister =
    fullName.trim().length > 0 &&
    username.trim().length >= 5 &&
    /^[a-z0-9_.-]+$/.test(username.trim()) &&
    password.length >= 6 &&
    tiktokId.trim().length > 0 &&
    agreedToTerms;

  function handleRegisterBlur(field: keyof RegisterErrors, value: string) {
    const error = validateRegisterField(field, value);
    setRegisterErrors((prev) => ({ ...prev, [field]: error }));
  }

  function switchMode(next: Mode) {
    setMode(next);
    setRegisterErrors({});
    setFullName("");
    setUsername("");
    setPassword("");
    setTiktokId("");
    setAgreedToTerms(false);
  }

  async function handleSubmit() {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      toast.warning("Vui lòng nhập tên tài khoản");
      return;
    }

    if (trimmedUsername.length < 5) {
      toast.warning("Tên tài khoản phải có ít nhất 5 ký tự");
      return;
    }

    if (!/^[a-z0-9_.-]+$/.test(trimmedUsername)) {
      toast.warning("Tên tài khoản chỉ gồm chữ thường, số, _ . -");
      return;
    }

    if (!password) {
      toast.warning("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 6) {
      toast.warning("Mật khẩu phải có ít nhất 6 ký tự");
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

    if (!isLogin && !tiktokId.trim()) {
      toast.warning("Vui lòng nhập TikTok ID");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isLogin) {
        await loginApi({ username: trimmedUsername, password });
        emitAuthChanged("login");
        router.replace("/dashboard/live");
      } else {
        await registerApi({
          username: trimmedUsername,
          password,
          tiktokId: tiktokId.trim(),
          fullName: fullName.trim() || undefined,
        });
        emitAuthChanged("register");
        router.replace("/dashboard/live");
      }
    } catch (error) {
      toast.error(
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

  return (
    <main className="relative h-dvh overflow-hidden bg-white">
      <div className="mx-auto size-full overflow-hidden">
        <HeroHeader />

        <div
          className="relative -mt-10.25 flex flex-col rounded-t-4xl bg-white"
          style={{ height: "calc(100dvh - 309px)" }}
        >
          <div className="flex-1 overflow-y-auto px-4 py-6 [-webkit-overflow-scrolling:touch]">
            <div className="flex flex-col gap-6">

              {isLogin ? (
                <>
                  <p className="w-full text-center text-[18px] leading-6 font-medium text-black">
                    Đăng nhập
                  </p>

                  <div className="flex flex-col gap-5">                    <InputField
                      label="Tên tài khoản"
                      value={username}
                      onChange={setUsername}
                      onKeyDown={(e) => { if (e.key === "Enter" && username.trim() && password) handleSubmit(); }}
                    />

                    <InputField
                      label="Mật khẩu"
                      value={password}
                      onChange={setPassword}
                      onKeyDown={(e) => { if (e.key === "Enter" && username.trim() && password) handleSubmit(); }}
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
                  </div>

                  <div className="flex justify-end">
                    <ForgotPasswordDrawer />
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex h-14 w-full items-center justify-center rounded-[40px] text-[16px] font-medium text-black disabled:opacity-60"
                    style={{
                      background: "linear-gradient(138.46deg, #FF6B8A 13.52%, #FFA66D 52.12%, #FFC86A 117.76%)",
                    }}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-[#dadada]" />
                    <span className="text-[12px] leading-4.5 font-medium text-[#484848]">
                      Tư vấn
                    </span>
                    <span className="h-px flex-1 bg-[#dadada]" />
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <img src="/assets/icon/fb.png" alt="Phone" className="size-10" />
                    <img src="/assets/icon/tiktok.png" alt="tiktok" className="size-10" />
                    <img src="/assets/icon/zalo.png" alt="Instagram" className="size-10" />
                  </div>

                  <p className="text-center text-[14px] leading-[22px] text-[#484848]">
                    Bạn chưa có tài khoản.{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="font-medium text-[#ff6b8a]"
                    >
                      Đăng kí ngay
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-center text-[18px] leading-6 font-medium text-black">
                      Đăng kí
                    </p>
                    <p className="text-center text-[14px] leading-5.5 text-[#484848]">
                      Bạn có tài khoản.{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="font-medium text-[#ff6b8a]"
                      >
                        Đăng nhập
                      </button>
                    </p>
                  </div>


                  <div className="flex flex-col gap-4">
                    <InputField
                      label="Họ và tên"
                      value={fullName}
                      onChange={setFullName}
                      onBlur={() => handleRegisterBlur("fullName", fullName)}
                      error={registerErrors.fullName}
                    />
                    <InputField
                      label="Tên tài khoản"
                      value={username}
                      onChange={setUsername}
                      onBlur={() => handleRegisterBlur("username", username)}
                      error={registerErrors.username}
                    />
                    <InputField
                      label="Mật khẩu"
                      value={password}
                      onChange={setPassword}
                      onBlur={() => handleRegisterBlur("password", password)}
                      type={isPasswordVisible ? "text" : "password"}
                      error={registerErrors.password}
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
                      label="Tiktok ID (@wii15_08)"
                      value={tiktokId}
                      onChange={setTiktokId}
                      onBlur={() => handleRegisterBlur("tiktokId", tiktokId)}
                      error={registerErrors.tiktokId}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setAgreedToTerms((v) => !v)}
                    className="flex items-start gap-3"
                  >
                    <CheckboxIcon checked={agreedToTerms} />
                    <p className="text-left text-[14px] leading-5.5 text-[#484848]">
                      Bấm nút đăng kí bạn đồng ý với{" "}
                      <span className="font-medium text-[#ff6b8a]">điều kiện</span>
                      {" "}và{" "}
                      <span className="font-medium text-[#ff6b8a]">điều khoản</span>
                      {" "}của chúng tôi.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !canSubmitRegister}
                    className="flex h-14 w-full items-center justify-center rounded-[40px] text-[16px] font-medium text-black disabled:opacity-40"
                    style={{
                      background: "linear-gradient(138.46deg, #FF6B8A 13.52%, #FFA66D 52.12%, #FFC86A 117.76%)",
                    }}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Đăng kí"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
