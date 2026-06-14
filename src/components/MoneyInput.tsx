"use client";

import { useState, useEffect } from "react";

function formatVnd(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("vi-VN");
}

function parseToK(formatted: string): number {
  const digits = formatted.replace(/\D/g, "");
  if (!digits) return 0;
  const vnd = parseInt(digits, 10);
  return Math.round(vnd / 1000);
}

export function MoneyInput({
  valueK,
  onChange,
  placeholder = "0",
  className,
}: {
  valueK: number;
  onChange: (k: number) => void;
  placeholder?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(() =>
    valueK > 0 ? (valueK * 1000).toLocaleString("vi-VN") : "",
  );

  useEffect(() => {
    const currentK = parseToK(display);
    if (currentK !== valueK) {
      setDisplay(valueK > 0 ? (valueK * 1000).toLocaleString("vi-VN") : "");
    }
  }, [valueK]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatVnd(e.target.value);
    setDisplay(formatted);
    onChange(parseToK(formatted));
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
