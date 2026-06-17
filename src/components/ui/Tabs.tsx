"use client";

import type { ReactNode } from "react";

// ─── Single tab item ──────────────────────────────────────────────────────────

type TabProps<T extends string = string> = {
  value: T;
  label: ReactNode;
  active: boolean;
  onClick: (value: T) => void;
  className?: string;
};

export function Tab<T extends string = string>({
  value,
  label,
  active,
  onClick,
  className = "",
}: TabProps<T>) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={[
        "flex items-center justify-center rounded-[40px] px-6 py-[9px] transition-colors",
        "text-[14px] font-medium leading-[22px] whitespace-nowrap",
        active
          ? "bg-[#ff6b8a] text-black"
          : "bg-[#f2f2f2] text-[#787878]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </button>
  );
}

// ─── Tab group container ──────────────────────────────────────────────────────

type TabsProps<T extends string = string> = {
  value: T;
  onChange: (value: T) => void;
  tabs: { value: T; label: ReactNode }[];
  className?: string;
};

export default function Tabs<T extends string = string>({
  value,
  onChange,
  tabs,
  className = "",
}: TabsProps<T>) {
  return (
    <div className={["flex flex-wrap gap-2", className].join(" ")}>
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.label}
          active={value === tab.value}
          onClick={onChange}
        />
      ))}
    </div>
  );
}
