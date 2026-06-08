import { ReactNode } from "react";

export function Divider() {
  return <div className="h-2 bg-[#f2f2f2]" />;
}

export function VndBadge() {
  return (
    <span className="rounded-xs bg-[#f2f2f2] px-2 py-0.75 text-[12px] leading-4.5 font-medium text-[#161616]">VND</span>
  );
}

export function InputField({ label, placeholder, suffix, children }: { label: string; placeholder?: string; suffix?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] leading-5.5 text-[#484848]">{label}</label>
      <div className="flex h-12 items-center gap-4 rounded-lg border border-black/10 px-4">
        {children ?? (
          <input className="min-w-0 flex-1 bg-transparent text-[14px] leading-5.5 text-black outline-none placeholder:text-[#787878]" placeholder={placeholder} />
        )}
        {suffix}
      </div>
    </div>
  );
}

export function GradientButton({ label, disabled, onClick }: { label: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center rounded-[40px] p-4 text-[16px] leading-6 font-medium text-black transition-opacity ${disabled ? "opacity-40" : ""}`}
      style={{ backgroundImage: "linear-gradient(138deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)" }}
    >
      {label}
    </button>
  );
}

export function ShippingOption({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex h-12 items-center justify-center rounded-[40px] border px-4 text-[14px] leading-5.5 font-medium ${
        active
          ? "border-[#f5c842] bg-[#fff8dc] text-black"
          : "border-black/10 bg-white text-[#484848]"
      }`}
    >
      {label}
    </button>
  );
}

export function UnitBadge({ unit }: { unit: string }) {
  return (
    <span className="flex items-center gap-1 rounded-xs bg-[#f2f2f2] px-2 py-0.75 text-[12px] font-medium text-[#161616]">
      {unit}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-checked={on}
      role="switch"
      className={`relative flex h-6 w-11 shrink-0 items-center rounded-full p-[2.4px] transition-colors ${on ? "justify-end bg-[#ff6b8a]" : "justify-start bg-[#dadada]"}`}
    >
      <span className="block h-[19.2px] w-[19.2px] rounded-full bg-white shadow" />
    </button>
  );
}
