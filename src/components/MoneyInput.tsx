"use client";

import { useState, useEffect } from "react";

function formatVnd(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

function parseVnd(formatted: string): number {
  const digits = formatted.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10);
}

export function MoneyInput({
  value,
  onChange,
  placeholder = "0",
  className,
}: {
  value: number;
  onChange: (vnd: number) => void;
  placeholder?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(() =>
    value > 0 ? value.toLocaleString("vi-VN") : "",
  );

  useEffect(() => {
    const current = parseVnd(display);
    if (current !== value) {
      setDisplay(value > 0 ? value.toLocaleString("vi-VN") : "");
    }
  }, [display, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatVnd(e.target.value);
    setDisplay(formatted);
    onChange(parseVnd(formatted));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      className={
        className ??
        "min-w-0 flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#787878]"
      }
    />
  );
}
