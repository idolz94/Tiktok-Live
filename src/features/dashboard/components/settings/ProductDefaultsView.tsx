"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DrawlerBase } from "@/components/ui/Drawler";
import {
  listProductPresetsApi,
  createProductPresetApi,
  updateProductPresetApi,
  deleteProductPresetApi,
  type ProductPreset,
} from "@/api/productPresetsApi";
import { formatPrice, parsePrice } from "@/utils/formatPrice";
import { ChevronLeftSmIcon } from "./SettingsIcons";

export function ProductDefaultsSettingsView({ onBack }: { onBack: () => void }) {
  const [presets, setPresets] = useState<ProductPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerMode, setDrawerMode] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<ProductPreset | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ProductPreset | null>(null);

  const [draftCode, setDraftCode] = useState("");
  const [draftColor, setDraftColor] = useState("");
  const [draftPriceDisplay, setDraftPriceDisplay] = useState("");
  const [errors, setErrors] = useState<{ code?: string; price?: string }>({});

  const reload = async () => {
    const data = await listProductPresetsApi();
    setPresets(data);
  };

  useEffect(() => {
    reload()
      .catch(() => toast.error("Không thể tải danh sách sản phẩm"))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setSelected(null);
    setDraftCode("");
    setDraftColor("");
    setDraftPriceDisplay("");
    setErrors({});
    setDrawerMode("add");
  };

  const openEdit = (preset: ProductPreset) => {
    setSelected(preset);
    setDraftCode(preset.code);
    setDraftColor(preset.color ?? "");
    setDraftPriceDisplay(preset.price > 0 ? formatPrice(preset.price) : "");
    setErrors({});
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setSelected(null);
    setErrors({});
  };

  const handlePriceInput = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    if (!digits) { setDraftPriceDisplay(""); return; }
    setDraftPriceDisplay(formatPrice(parseInt(digits, 10)));
  };

  const submitForm = async () => {
    const newErrors: { code?: string; price?: string } = {};
    if (!draftCode.trim()) newErrors.code = "Tên sản phẩm không được trống";
    const price = parsePrice(draftPriceDisplay);
    if (!draftPriceDisplay.trim() || price <= 0) newErrors.price = "Giá phải lớn hơn 0";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (drawerMode === "add") {
        await createProductPresetApi({
          code: draftCode.trim(),
          color: draftColor.trim() || null,
          price,
        });
        toast.success("Đã thêm sản phẩm");
      } else if (drawerMode === "edit" && selected) {
        await updateProductPresetApi(selected.id, {
          code: draftCode.trim(),
          color: draftColor.trim() || null,
          price,
        });
        toast.success("Đã cập nhật sản phẩm");
      }
      closeDrawer();
      await reload();
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await deleteProductPresetApi(confirmDelete.id);
      toast.success("Đã xoá sản phẩm");
      setConfirmDelete(null);
      await reload();
    } catch {
      toast.error("Không thể xoá sản phẩm");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex h-full flex-col bg-[#f2f2f2]">
        <div className="flex shrink-0 items-center justify-between bg-white px-4 pt-3 pb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex size-11 items-center justify-center rounded-full bg-[#f2f2f2]"
            aria-label="Quay lại"
          >
            <ChevronLeftSmIcon />
          </button>
          <p className="text-[18px] leading-6 font-medium text-black">Thông tin sản phẩm</p>
          <button
            type="button"
            onClick={openAdd}
            className="flex size-11 items-center justify-center rounded-full bg-[#ff6b8a] text-white"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-8 [-webkit-overflow-scrolling:touch]">
          {loading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[72px] w-full animate-pulse rounded-2xl bg-[#e4e4e4]" />
              ))}
            </div>
          ) : presets.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-4 py-8 text-center">
              <p className="text-[16px] font-medium text-[#111827]">Chưa có sản phẩm nào</p>
              <p className="text-[13px] leading-5 text-[#787878]">
                Thêm sản phẩm để tự động nhận diện từ comment LIVE
              </p>
              <button
                type="button"
                onClick={openAdd}
                className="mt-2 h-11 rounded-full bg-[#ff6b8a] px-6 text-[14px] font-semibold text-white"
              >
                Thêm sản phẩm
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {presets.map((preset, idx) => (
                <div
                  key={preset.id}
                  className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ffe8ef] text-[13px] font-bold text-[#ff6b8a]">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-[#111827]">
                      {preset.code}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#787878]">
                      {preset.color ? `${preset.color} · ` : ""}
                      {formatPrice(preset.price)} VNĐ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEdit(preset)}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f2f2f2] text-[#484848]"
                    aria-label="Sửa"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(preset)}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-[#ef4444]"
                    aria-label="Xoá"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DrawlerBase
        open={drawerMode !== null}
        onOpenChange={(open) => { if (!open) closeDrawer(); }}
        height="auto"
        showHandle
        showCloseButton={false}
        title={drawerMode === "add" ? "Thêm sản phẩm" : "Sửa sản phẩm"}
        footer={
          <button
            type="button"
            onClick={submitForm}
            disabled={saving || !draftCode.trim() || parsePrice(draftPriceDisplay) <= 0}
            className="flex w-full items-center justify-center rounded-[40px] py-4 text-[16px] font-medium text-black disabled:opacity-40"
            style={{ backgroundImage: "linear-gradient(138deg, #ff6b8a 13%, #ffa66d 52%, #ffc86a 118%)" }}
          >
            {saving ? "Đang lưu..." : drawerMode === "add" ? "Thêm sản phẩm" : "Cập nhật"}
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#111827]">
              Tên sản phẩm <span className="text-[#ef4444]">*</span>
            </span>
            <div className={`flex h-11 items-center rounded-[8px] border bg-white px-3 ${errors.code ? "border-[#ef4444]" : "border-[#d1d5db]"}`}>
              <input
                type="text"
                value={draftCode}
                onChange={(e) => { setDraftCode(e.target.value); if (errors.code) setErrors((prev) => ({ ...prev, code: undefined })); }}
                placeholder="VD: Áo thun trắng"
                className="flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#d1d5db]"
              />
            </div>
            {errors.code && <p className="text-[12px] text-[#ef4444]">{errors.code}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#111827]">Màu sắc</span>
            <div className="flex h-11 items-center rounded-[8px] border border-[#d1d5db] bg-white px-3">
              <input
                type="text"
                value={draftColor}
                onChange={(e) => setDraftColor(e.target.value)}
                placeholder="VD: Đỏ, Xanh..."
                className="flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#d1d5db]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#111827]">Giá <span className="text-[#ef4444]">*</span></span>
            <div className={`flex h-11 items-center rounded-[8px] border bg-white px-3 ${errors.price ? "border-[#ef4444]" : "border-[#d1d5db]"}`}>
              <input
                type="text"
                inputMode="numeric"
                value={draftPriceDisplay}
                onChange={(e) => { handlePriceInput(e.target.value); if (errors.price) setErrors((prev) => ({ ...prev, price: undefined })); }}
                placeholder="0"
                className="flex-1 bg-transparent text-[14px] text-black outline-none placeholder:text-[#d1d5db]"
              />
              <span className="text-[13px] text-[#9ca3af]">VNĐ</span>
            </div>
            {errors.price && <p className="text-[12px] text-[#ef4444]">{errors.price}</p>}
          </div>
        </div>
      </DrawlerBase>

      <DrawlerBase
        open={confirmDelete !== null}
        onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
        height="auto"
        showHandle
        showCloseButton={false}
        title="Xoá sản phẩm?"
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConfirmDelete(null)}
              className="h-12 rounded-full bg-[#f2f2f2] text-[15px] font-medium text-[#111827]"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={doDelete}
              disabled={saving}
              className="h-12 rounded-full bg-[#ff6b8a] text-[15px] font-medium text-white disabled:opacity-60"
            >
              Xoá
            </button>
          </div>
        }
      >
        <p className="text-[14px] leading-5.5 text-[#484848]">
          Bạn có chắc muốn xoá sản phẩm <span className="font-semibold">{confirmDelete?.code}</span>?
        </p>
      </DrawlerBase>
    </>
  );
}
