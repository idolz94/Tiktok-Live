export function formatPrice(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value);
}

export function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[.,\s]/g, "").replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}
