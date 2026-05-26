import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-slate-950 text-white active:bg-slate-800",
  secondary: "bg-slate-100 text-slate-900 active:bg-slate-200",
  danger: "bg-red-600 text-white active:bg-red-500",
  ghost: "bg-transparent text-slate-700 active:bg-slate-100",
};

export default function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-bold transition ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
