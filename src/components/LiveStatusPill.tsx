"use client";

export default function LiveStatusPill({
  isConnected,
  status,
}: {
  isConnected: boolean;
  status: string;
}) {
  return (
    <div className="mx-auto mt-2.5 flex w-fit items-center rounded-full border border-white/90 bg-white/85 px-3 py-[7px]">
      <span
        className={`mr-2 size-2 rounded-full ${isConnected ? "bg-green-600" : "bg-orange-500"}`}
      />
      <span
        className={`min-w-0 truncate text-[13px] font-extrabold ${isConnected ? "text-green-700" : "text-orange-600"}`}
      >
        {status}
      </span>
    </div>
  );
}
