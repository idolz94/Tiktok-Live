import type { InputHTMLAttributes, ReactNode } from "react";

type FloatingLabelInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "placeholder"
> & {
  label: string;
  rightSlot?: ReactNode;
  inputClassName?: string;
};

export default function FloatingLabelInput({
  id,
  label,
  rightSlot,
  className = "",
  inputClassName = "",
  ...props
}: FloatingLabelInputProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        placeholder=" "
        className={`peer min-h-14 w-full rounded-[13px] border border-[#a3a8b0] bg-white px-3.5 py-4 text-base text-[#273044] transition-colors outline-none focus:border-[#070f66] ${rightSlot ? "pr-15" : ""} ${inputClassName}`}
        {...props}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 bg-white px-1 text-lg font-black text-[#a3a8b0] transition-all duration-200 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xl peer-focus:font-black peer-focus:text-[#070f66] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xl peer-[:not(:placeholder-shown)]:font-black peer-[:not(:placeholder-shown)]:text-[#070f66]"
      >
        {label}
      </label>
      {rightSlot}
    </div>
  );
}
