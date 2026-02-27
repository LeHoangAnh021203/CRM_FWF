import type { SkinReportTab } from "./types";

export const moduleDisplay = [
  { key: "skin_type", label: "Sebum" },
  { key: "ext_water", label: "Hydration" },
  { key: "pore", label: "Pores" },
  { key: "spot", label: "Spots" },
  { key: "wrinkle", label: "Wrinkles" },
  { key: "acne", label: "Acne" },
  { key: "blackhead", label: "Blackheads" },
  { key: "dark_circle", label: "Dark circles" },
  { key: "collagen", label: "Collagen" },
  { key: "pockmark", label: "Pockmark" },
  { key: "uv_spot", label: "UV spot" },
] as const;

export const skinReportTabs: SkinReportTab[] = [
  {
    value: "overview",
    label: "Tổng quan hồ sơ",
    description: "Snapshot & chất lượng dữ liệu",
  },
  {
    value: "profile",
    label: "Nhân khẩu & loại da",
    description: "Tuổi, giới tính & phân loại da",
  },
  {
    value: "conditions",
    label: "Nhóm vấn đề da",
    description: "Tính nghiêm trọng & ưu tiên điều trị",
  },
  {
    value: "recommendations",
    label: "Đề xuất & KPI",
    description: "Sản phẩm nổi bật & mục tiêu",
  },
];
