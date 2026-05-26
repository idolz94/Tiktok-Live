"use client";

export default function SectionHeader({
  title,
  actionText,
  onAction,
}: {
  title: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-1 pt-[18px] pb-2.5">
      <h2 className="m-0 text-lg font-black text-[#273044]">{title}</h2>
      {actionText && onAction ? (
        <button className="text-sm font-black text-red-500" onClick={onAction} type="button">
          {actionText}
        </button>
      ) : null}
    </div>
  );
}
