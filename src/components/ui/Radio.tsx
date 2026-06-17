"use client";

import type { ReactNode } from "react";

type RadioProps = {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label?: ReactNode;
  subtext?: ReactNode;
  disabled?: boolean;
  className?: string;
};

export default function Radio({
  name,
  value,
  checked,
  onChange,
  label,
  subtext,
  disabled = false,
  className = "",
}: RadioProps) {
  return (
    <label
      className={[
        "flex cursor-pointer items-start gap-3",
        disabled && "cursor-not-allowed opacity-40",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="sr-only"
      />

      {/* Radio indicator */}
      <span
        aria-hidden="true"
        className={[
          "mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          checked
            ? "border-[#070f66] bg-white"
            : "border-[#d0d0d0] bg-white",
        ].join(" ")}
      >
        {checked && (
          <span className="h-[10px] w-[10px] rounded-full bg-[#070f66]" />
        )}
      </span>

      {/* Label area — custom HTML supported via children-style props */}
      {(label || subtext) && (
        <span className="flex min-w-0 flex-1 flex-col">
          {label && (
            <span className="text-[14px] leading-[22px] text-[#0c0c0c]">
              {label}
            </span>
          )}
          {subtext && (
            <span className="text-[12px] leading-[18px] text-[#484848]">
              {subtext}
            </span>
          )}
        </span>
      )}
    </label>
  );
}
