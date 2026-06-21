"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DrawlerBase } from "@/components/ui/Drawler";
import { getPrinterSettingsApi, savePrinterSettingsApi } from "@/api/meApi";
import { BackIcon } from "./icons";

type PaperSize = "57mm" | "80mm" | "A4";

type Props = {
  onBack: () => void;
  onConfirmPrint?: () => void;
};

export function PrinterSettingsScreen({ onBack, onConfirmPrint }: Props) {
  const [paperSize, setPaperSize] = useState<PaperSize>(
    () => (localStorage.getItem("printerPaperSize") as PaperSize) ?? "A4"
  );
  const [paperSizeOpen, setPaperSizeOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);

  const [savedIp, setSavedIp] = useState("");
  const [savedPort, setSavedPort] = useState(9100);
  const [savedName, setSavedName] = useState("");
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [inputIp, setInputIp] = useState("");
  const [inputPort, setInputPort] = useState("9100");
  const [inputName, setInputName] = useState("");
  const [saving, setSaving] = useState(false);

  const ipRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPrinterSettingsApi()
      .then((s) => {
        setSavedIp(s.printerIp ?? "");
        setSavedPort(s.printerPort ?? 9100);
        setSavedName(s.printerName ?? "");
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, []);

  function selectPaperSize(size: PaperSize) {
    setPaperSize(size);
    localStorage.setItem("printerPaperSize", size);
    setPaperSizeOpen(false);
  }

  function openConnectDrawer() {
    setInputIp(savedIp);
    setInputPort(String(savedPort));
    setInputName(savedName);
    setConnectOpen(true);
    setTimeout(() => ipRef.current?.focus(), 100);
  }

  async function handleSaveConnection() {
    const ip = inputIp.trim();
    const port = parseInt(inputPort, 10);
    const name = inputName.trim();

    if (!ip) {
      toast.error("Vui lòng nhập địa chỉ IP máy in.");
      return;
    }
    if (Number.isNaN(port) || port < 1 || port > 65535) {
      toast.error("Cổng không hợp lệ (1–65535).");
      return;
    }

    setSaving(true);
    try {
      const saved = await savePrinterSettingsApi({ printerIp: ip, printerPort: port, printerName: name });
      setSavedIp(saved.printerIp);
      setSavedPort(saved.printerPort);
      setSavedName(saved.printerName);
      setConnectOpen(false);
      toast.success("Đã lưu cài đặt máy in.");
    } catch {
      toast.error("Không lưu được cài đặt. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  const isConnected = Boolean(savedIp);
  const displayName = savedName || "Máy in LAN/Wi-Fi";
  const displayIp = savedIp || "—";
  const connectButtonLabel = isConnected ? "Đổi máy in" : "Kết nối";
  const connectDrawerTitle = isConnected ? "Cập nhật máy in LAN/Wi-Fi" : "Kết nối máy in LAN/Wi-Fi";

  return (
    <main className="mx-auto flex h-dvh w-full flex-col bg-white text-black">
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between bg-white px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex size-11 items-center justify-center rounded-full bg-[#f2f2f2]"
        >
          <BackIcon />
        </button>
        <h1 className="min-w-0 flex-1 px-4 text-center text-[18px] leading-6 font-medium text-black">
          Cài đặt máy in
        </h1>
        <div className="size-11 opacity-0" aria-hidden />
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pt-2 pb-6 [-webkit-overflow-scrolling:touch]">
        {/* Warning banner */}
        <div className="flex items-start gap-3 rounded-[12px] bg-[#fdedd3] p-4">
          <svg className="mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 19h20L12 2z" stroke="#f5a623" strokeWidth="2" strokeLinejoin="round" fill="#f5a623" fillOpacity="0.15" />
            <path d="M12 9v5M12 16.5v.5" stroke="#f5a623" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-[12px] leading-[18px] text-[#2b2b2b]">
            Đảm bảo máy in và điện thoại của bạn kết nối cùng mạng Wi-Fi và cùng lớp mạng.
          </p>
        </div>

        {/* Printer info card */}
        <div className="space-y-4 rounded-[16px] border border-black/10 bg-[#f2f2f2] p-4">
          {/* Status row */}
          <div className="flex items-center gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-[12px] leading-[18px] text-[#484848]">Máy in</p>
              {loadingSettings ? (
                <div className="h-4 w-40 animate-pulse rounded bg-black/10" />
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-[14px] leading-[22px] font-medium text-black">{displayName}</p>
                  {isConnected && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f6ef] px-2 py-0.5 text-[11px] font-medium text-[#2ca87b]">
                      <span className="size-1.5 rounded-full bg-[#2ca87b]" />
                      Đã lưu
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* IP row */}
          <div className="flex items-center justify-between">
            <p className="text-[12px] leading-[18px] text-[#484848]">IP máy in</p>
            {loadingSettings ? (
              <div className="h-4 w-28 animate-pulse rounded bg-black/10" />
            ) : (
              <p className="text-[14px] leading-[22px] font-medium text-black">
                {savedPort !== 9100 ? `${displayIp}:${savedPort}` : displayIp}
              </p>
            )}
          </div>

          <Divider />

          {/* Khổ giấy row */}
          <button
            type="button"
            onClick={() => setPaperSizeOpen(true)}
            className="flex w-full items-center gap-4"
          >
            <div className="flex flex-1 items-center justify-between">
              <p className="text-[12px] leading-[18px] text-[#484848]">Khổ giấy in</p>
              <p className="text-[14px] leading-[22px] font-medium text-black">{paperSize}</p>
            </div>
            <ChevronRight />
          </button>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={openConnectDrawer}
              className="flex w-full items-center justify-center rounded-[40px] border border-black/10 bg-white py-3 text-[14px] leading-[22px] font-medium text-black transition-transform active:scale-95"
            >
              {isConnected ? "Đổi máy in" : "Tìm máy in"}
            </button>
            <button
              type="button"
              onClick={openConnectDrawer}
              className="flex w-full items-center justify-center rounded-[40px] py-3.5 text-[14px] leading-[22px] font-medium text-black shadow-[0_8px_20px_rgba(255,166,109,0.28)] transition-transform active:scale-95"
              style={{ backgroundImage: "linear-gradient(138deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)" }}
            >
              {connectButtonLabel}
            </button>
          </div>
        </div>

        {/* Nav rows */}
        <div>
          <button type="button" className="flex w-full items-center gap-4 py-1">
            <div className="flex size-6 shrink-0 items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="black" strokeWidth="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="black" strokeWidth="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="black" strokeWidth="1.5" />
                <path d="M14 17.5h7M17.5 14v7" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="flex-1 text-left text-[14px] leading-[22px] text-black">Điều chỉnh mẫu in Live</p>
            <ChevronRight />
          </button>

          <div className="my-4 h-px bg-black/10" />

          <button type="button" className="flex w-full items-center gap-4 py-1">
            <div className="flex size-6 shrink-0 items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M3 12h12M3 18h9" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="19" cy="17" r="3" stroke="black" strokeWidth="1.5" />
                <path d="M21.5 19.5l2 2" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="flex-1 text-left text-[14px] leading-[22px] text-black">Điều chỉnh mẫu in vận đơn (SHIP)</p>
            <ChevronRight />
          </button>
        </div>

        {/* Confirm print button */}
        {onConfirmPrint && (
          <button
            type="button"
            onClick={onConfirmPrint}
            className="mt-4 flex w-full items-center justify-center rounded-[40px] bg-black py-3.5 text-[14px] leading-[22px] font-medium text-white transition-transform active:scale-95"
          >
            In đơn
          </button>
        )}
      </div>

      {/* Paper size bottom sheet */}
      <DrawlerBase open={paperSizeOpen} onOpenChange={setPaperSizeOpen} title="Khổ giấy in" height="sm">
        <div className="space-y-3 px-1 pt-1">
          {(["57mm", "80mm", "A4"] as PaperSize[]).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => selectPaperSize(size)}
              className="flex w-full items-center gap-4 rounded-[16px] bg-[#f2f2f2] p-4 text-left"
            >
              <p className="min-w-0 flex-1 text-[14px] leading-[22px] font-medium text-black">{size}</p>
              {paperSize === size && (
                <svg className="shrink-0 text-[#2ca87b]" width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="currentColor" />
                  <path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </DrawlerBase>

      {/* Connect drawer */}
      <DrawlerBase open={connectOpen} onOpenChange={setConnectOpen} title={connectDrawerTitle} height="md">
        <div className="space-y-4 px-1 pt-1 pb-2">
          <div className="rounded-[16px] bg-[#f2f2f2] p-4">
            <p className="text-[12px] leading-[18px] text-[#484848]">Máy in hiện tại</p>
            <p className="mt-1 text-[14px] leading-[22px] font-medium text-black">{displayName}</p>
            <p className="mt-1 text-[12px] leading-[18px] text-[#484848]">
              {isConnected ? `${displayIp}:${savedPort}` : "Chưa kết nối"}
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="printer-name" className="text-[12px] leading-[18px] text-[#484848]">
              Tên máy in (tuỳ chọn)
            </label>
            <input
              id="printer-name"
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="VD: Máy in kho"
              className="w-full rounded-[14px] border border-black/10 bg-[#f2f2f2] px-4 py-3 text-[14px] leading-[22px] text-black placeholder:text-[#b0b0b0] outline-none focus:border-black/30"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="printer-ip" className="text-[12px] leading-[18px] text-[#484848]">
              Địa chỉ IP <span className="text-[#e53935]">*</span>
            </label>
            <input
              ref={ipRef}
              id="printer-ip"
              type="text"
              inputMode="decimal"
              value={inputIp}
              onChange={(e) => setInputIp(e.target.value)}
              placeholder="VD: 192.168.1.100"
              className="w-full rounded-[14px] border border-black/10 bg-[#f2f2f2] px-4 py-3 text-[14px] leading-[22px] text-black placeholder:text-[#b0b0b0] outline-none focus:border-black/30"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="printer-port" className="text-[12px] leading-[18px] text-[#484848]">
              Cổng (Port)
            </label>
            <input
              id="printer-port"
              type="number"
              inputMode="numeric"
              value={inputPort}
              onChange={(e) => setInputPort(e.target.value)}
              placeholder="9100"
              className="w-full rounded-[14px] border border-black/10 bg-[#f2f2f2] px-4 py-3 text-[14px] leading-[22px] text-black placeholder:text-[#b0b0b0] outline-none focus:border-black/30"
            />
            <p className="text-[11px] leading-[16px] text-[#484848]">Mặc định: 9100 (RAW printing)</p>
          </div>

          <button
            type="button"
            onClick={() => void handleSaveConnection()}
            disabled={saving}
            className="mt-2 flex w-full items-center justify-center rounded-[40px] py-3.5 text-[14px] leading-[22px] font-medium text-black shadow-[0_8px_20px_rgba(255,166,109,0.28)] transition-transform active:scale-95 disabled:opacity-60"
            style={{ backgroundImage: "linear-gradient(138deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)" }}
          >
            {saving ? "Đang lưu..." : "Lưu kết nối"}
          </button>
        </div>
      </DrawlerBase>
    </main>
  );
}

function ChevronRight() {
  return (
    <svg className="shrink-0 text-[#484848]" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Divider() {
  return <div className="h-px bg-black/10" />;
}
