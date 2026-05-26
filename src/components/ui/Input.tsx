import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-slate-400 ${className}`}
      {...props}
    />
  );
}
