"use client";

import type { ReactNode } from "react";

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  subtext?: ReactNode;
  disabled?: boolean;
  className?: string;
};

export default function Checkbox({
  checked,
  onChange,
  label,
  subtext,
  disabled = false,
  className = "",
}: CheckboxProps) {
  return (
    <label
      className={[
        "flex cursor-pointer items-start gap-3",
        disabled && "cursor-not-allowed opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />

      {/* Checkbox indicator */}
      <span
        aria-hidden="true"
        className={[
          "mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[4px] transition-colors",
          checked
            ? "bg-[#ff6b8a]"
            : "border-2 border-[#d0d0d0] bg-white",
        ].join(" ")}
      >
        {checked && (
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M2 6.5L5.2 10L11 3"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

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
