export const CARRIERS = [
  {
    id: "vtp",
    name: "Viettel Post",
    shortName: "VTP",
    description: "Dịch vụ bưu chính của Viettel với mạng lưới rộng khắp.",
    bgColor: "bg-[#d71920]",
    linked: true,
    isDefault: true,
  },
  {
    id: "jt",
    name: "JT - J&T Express",
    shortName: "J&T",
    description: "Dịch vụ chuyển phát nhanh J&T Express với mạng lưới toàn quốc.",
    bgColor: "bg-[#e31837]",
    linked: false,
    isDefault: false,
  },
  {
    id: "ghn",
    name: "GHN - Giao Hàng Nhanh",
    shortName: "GHN",
    description: "Dịch vụ giao hàng nhanh với mạng lưới rộng khắp cả nước.",
    bgColor: "bg-[#ff6700]",
    linked: false,
    isDefault: false,
  },
];

export type Carrier = (typeof CARRIERS)[number];
