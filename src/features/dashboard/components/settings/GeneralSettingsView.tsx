"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeftSmIcon,
  ChevronRightIcon,
  EditDocIcon,
  TagIcon,
  BoxIcon,
  PackageIcon,
  ShipPrintIcon,
  IconPrinter,
} from "./SettingsIcons";

type GeneralSettingsSection = { title: string; items: GeneralSettingsItem[] };
type GeneralSettingsItem =
  | { kind: "toggle"; label: string; key: string }
  | { kind: "nav"; label: string; icon: React.ReactNode; onClick?: () => void };

export function GeneralSettingsView({
  onBack,
  onProductDefaults,
}: {
  onBack: () => void;
  onProductDefaults: () => void;
}) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    printLive: true,
    editBeforePrint: true,
  });

  const toggle = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  const sections: GeneralSettingsSection[] = [
    {
      title: "Tính năng in trong phiên Live",
      items: [
        { kind: "toggle", label: "In trực tiếp khi đang Live", key: "printLive" },
        { kind: "toggle", label: "Chỉnh sửa bình luận trước khi in", key: "editBeforePrint" },
        { kind: "nav", label: "Điều chỉnh mẫu in Live", icon: <IconPrinter /> },
        { kind: "nav", label: "Cài đặt thông tin sản phẩm trước khi live", icon: <EditDocIcon />, onClick: onProductDefaults },
      ],
    },
    {
      title: "Cài đặt đơn hàng",
      items: [
        { kind: "nav", label: "Giá trị mặc định", icon: <TagIcon /> },
        { kind: "nav", label: "Đồng giá", icon: <BoxIcon /> },
        { kind: "nav", label: "Kích thước sản phẩm (SHIP)", icon: <PackageIcon /> },
        { kind: "nav", label: "Điều chỉnh mẫu in vận đơn (SHIP)", icon: <ShipPrintIcon /> },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2f2f2]"
          aria-label="Quay lại"
        >
          <ChevronLeftSmIcon />
        </button>
        <p className="text-[18px] font-medium leading-6 text-black">Cài đặt chung</p>
        <div className="h-11 w-11" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        {sections.map((section, sIdx) => (
          <div key={section.title}>
            {sIdx > 0 && <div className="h-2 bg-[#f2f2f2]" />}
            <div className="flex flex-col gap-4 px-4 py-5">
              <p className="text-[16px] font-medium leading-6 text-black">{section.title}</p>
              <div className="flex flex-col gap-4">
                {section.items.map((item, iIdx) => (
                  <div key={item.label}>
                    {iIdx > 0 && <div className="mb-4 h-px bg-black/8" />}
                    {item.kind === "toggle" ? (
                      <div className="flex items-center gap-4">
                        <p className="flex-1 text-[14px] leading-[22px] text-[#484848]">{item.label}</p>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={toggles[item.key]}
                          onClick={() => toggle(item.key)}
                          className={`flex h-6 w-11 shrink-0 items-center rounded-[24px] p-[2.4px] transition-colors ${
                            toggles[item.key] ? "justify-end bg-[#ff6b8a]" : "justify-start bg-[#d1d5db]"
                          }`}
                        >
                          <span className="block h-[19px] w-[19px] rounded-full bg-white shadow-sm" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={item.onClick ?? (() => toast.info("Tính năng đang phát triển"))}
                        className="flex w-full items-center gap-4"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center text-[#484848]">
                          {item.icon}
                        </div>
                        <p className="flex-1 text-left text-[14px] leading-[22px] text-black">{item.label}</p>
                        <ChevronRightIcon />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
