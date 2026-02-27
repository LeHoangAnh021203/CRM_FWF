export type BranchRegion = "south" | "central" | "north";

export type BranchCity =
  | "hcm"
  | "vung-tau"
  | "nha-trang"
  | "da-nang"
  | "hanoi";

export interface BranchFilterOption {
  stockId: string;
  name: string;
  region: BranchRegion | "all";
  city?: BranchCity;
}

export type BranchOption = BranchFilterOption & {
  region: BranchRegion;
  city: BranchCity;
};

interface CityConfig {
  label: string;
  region: BranchRegion;
  description?: string;
}

export const CITY_CONFIG: Record<BranchCity, CityConfig> = {
  "hcm": { label: "TP. HCM", region: "south", description: "Các quận nội thành" },
  "vung-tau": { label: "Vũng Tàu", region: "south" },
  "nha-trang": { label: "Nha Trang", region: "central" },
  "da-nang": { label: "Đà Nẵng", region: "central" },
  "hanoi": { label: "Hà Nội", region: "north" },
};

const RAW_BRANCHES: Array<{ stockId: string; name: string; city: BranchCity }> =
  [
    { stockId: "8975", name: "Saigon Office", city: "hcm" },
    { stockId: "11287", name: "The Sun Avenue", city: "hcm" },
    { stockId: "11288", name: "Vincom Landmark 81", city: "hcm" },
    { stockId: "11289", name: "Vincom Quang Trung", city: "hcm" },
    { stockId: "11290", name: "Vincom Phan Văn Trị", city: "hcm" },
    { stockId: "11301", name: "Riveria Point Q7", city: "hcm" },
    { stockId: "11302", name: "Vincom Bà Triệu", city: "hanoi" },
    { stockId: "11306", name: "Vincom Lê Văn Việt", city: "hcm" },
    { stockId: "11307", name: "Vincom Thảo Điền", city: "hcm" },
    { stockId: "12313", name: "Parc Mall Q8", city: "hcm" },
    { stockId: "12315", name: "Vista Verde", city: "hcm" },
    { stockId: "12316", name: "Westpoint Phạm Hùng", city: "hanoi" },
    { stockId: "12320", name: "Crescent Mall Q7", city: "hcm" },
    { stockId: "12322", name: "The Botanica Q.Tân Bình", city: "hcm" },
    { stockId: "12323", name: "Hoa Lan Q.Phú Nhuận", city: "hcm" },
    { stockId: "12324", name: "Everrich Infinity Q5", city: "hcm" },
    { stockId: "12325", name: "Thống Nhất Vũng Tàu", city: "vung-tau" },
    { stockId: "12326", name: "Võ Thị Sáu Q1", city: "hcm" },
    { stockId: "12327", name: "Imperia Sky Garden HN", city: "hanoi" },
    { stockId: "12329", name: "Đảo Ngọc Ngũ Xã HN", city: "hanoi" },
    { stockId: "12330", name: "Gold Coast Nha Trang", city: "nha-trang" },
    { stockId: "12331", name: "Trương Định Q3", city: "hcm" },
    { stockId: "12333", name: "Aeon Mall Tân Phú Celadon", city: "hcm" },
    { stockId: "12336", name: "Trần Phú Đà Nẵng", city: "da-nang" },
    { stockId: "12338", name: "Sương Nguyệt Ánh Q1", city: "hcm" },
    { stockId: "12344", name: "TTTM Estella Place", city: "hcm" },
    { stockId: "12345", name: "SC Vivo City", city: "hcm" },
    { stockId: "12346", name: "Midtown Q7", city: "hcm" },
    { stockId: "12347", name: "Aeon Mall Bình Tân", city: "hcm" },
    { stockId: "12348", name: "Nowzone Q1", city: "hcm" },
    { stockId: "12350", name: "Hanoi Office", city: "hanoi" },
    { stockId: "12351", name: "Saigon Centre", city: "hcm" },
    { stockId: "12352", name: "Xuân Thủy Thảo Điền", city: "hcm" },
    { stockId: "12353", name: "Thi Sách Q1", city: "hcm" },
    { stockId: "12354", name: "Kosmo Tây Hồ", city: "hanoi" },
    { stockId: "12356", name: "Vincom Plaza 3-2", city: "hcm" },
    { stockId: "12357", name: "Yên Hòa Hà Nội", city: "hanoi" },
    { stockId: "12358", name: "Hạ Long Vũng Tàu", city: "vung-tau" },
    { stockId: "12359", name: "Nguyễn Du Q1", city: "hcm" },
    { stockId: "12360", name: "Vincom Plaza Skylake", city: "hanoi" },
    { stockId: "12361", name: "Vincom Phạm Ngọc Thạch", city: "hanoi" },
    { stockId: "12362", name: "Starlake", city: "hanoi" },
    { stockId: "12363", name: "Marina", city: "hanoi" },
    { stockId: "12365", name: "Greenbay", city: "hanoi" },
    { stockId: "12366", name: "Lumiere", city: "hanoi" },
    { stockId: "12367", name: "Times City", city: "hanoi" },
    { stockId: "12368", name: "Hanoi Tower", city: "hanoi" },
    { stockId: "12369", name: "Saigon Pearl", city: "hcm" },
    { stockId: "12370", name: "Vincom Saigonres", city: "hcm" },
    { stockId: "12371", name: "Diamond Island", city: "hcm" },
    { stockId: "12372", name: "Vincom Bắc Từ Liêm", city: "hanoi" },
    { stockId: "12373", name: "Lotte Hanoi", city: "hanoi" },
    { stockId: "12374", name: "Hanoi Centre", city: "hanoi" },
  ];

export const BRANCH_OPTIONS: BranchOption[] = RAW_BRANCHES.map((branch) => ({
  stockId: branch.stockId,
  name: branch.name,
  city: branch.city,
  region: CITY_CONFIG[branch.city].region,
}));

export const ALL_BRANCH_OPTION: BranchFilterOption = {
  stockId: "",
  name: "Tất cả cơ sở",
  region: "all",
};

type BranchCityRecord = Record<BranchCity, BranchFilterOption[]>;

const buildCityRecord = () => {
  const record: BranchCityRecord = {
    "hcm": [],
    "vung-tau": [],
    "nha-trang": [],
    "da-nang": [],
    "hanoi": [],
  };

  BRANCH_OPTIONS.forEach((branch) => {
    if (!branch.city) return;
    record[branch.city].push(branch);
  });

  (Object.keys(record) as BranchCity[]).forEach((city) => {
    record[city].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  });

  return record;
};

export const BRANCHES_BY_CITY: BranchCityRecord = buildCityRecord();

export interface BranchRegionNode {
  key: BranchRegion;
  label: string;
  description: string;
  cities: BranchCity[];
}

export const BRANCH_REGION_TREE: BranchRegionNode[] = [
  {
    key: "south",
    label: "Miền Nam",
    description: "Chứa TP.HCM và Vũng Tàu",
    cities: ["hcm", "vung-tau"],
  },
  {
    key: "central",
    label: "Miền Trung",
    description: "Bao gồm Nha Trang và Đà Nẵng",
    cities: ["nha-trang", "da-nang"],
  },
  {
    key: "north",
    label: "Miền Bắc",
    description: "Tập trung tại Hà Nội",
    cities: ["hanoi"],
  },
];

// Helper functions to get stockIds by region/city
export const getStockIdsByRegion = (region: BranchRegion): string[] => {
  return BRANCH_OPTIONS
    .filter((branch) => branch.region === region)
    .map((branch) => branch.stockId);
};

export const getStockIdsByCity = (city: BranchCity): string[] => {
  return BRANCH_OPTIONS
    .filter((branch) => branch.city === city)
    .map((branch) => branch.stockId);
};

// Create region and city options (must be after BRANCH_REGION_TREE is defined)
export const REGION_OPTIONS: BranchFilterOption[] = BRANCH_REGION_TREE.map((node) => ({
  stockId: `region:${node.key}`,
  name: node.label,
  region: node.key,
}));

export const CITY_OPTIONS: BranchFilterOption[] = (Object.keys(CITY_CONFIG) as BranchCity[]).map((city) => ({
  stockId: `city:${city}`,
  name: CITY_CONFIG[city].label,
  region: CITY_CONFIG[city].region,
  city: city,
}));

export const BRANCH_FILTER_OPTIONS: BranchFilterOption[] = [
  ALL_BRANCH_OPTION,
  ...REGION_OPTIONS,
  ...CITY_OPTIONS,
  ...BRANCH_OPTIONS,
];

export const BRANCH_LOOKUP = new Map(
  BRANCH_FILTER_OPTIONS.map((option) => [option.stockId, option] as const)
);

// Helper to parse stockId and get actual stockIds for API
export const getActualStockIds = (stockId: string): string[] => {
  if (!stockId || stockId === "") {
    return []; // All branches - empty means all
  }
  
  if (stockId.startsWith("region:")) {
    const region = stockId.replace("region:", "") as BranchRegion;
    return getStockIdsByRegion(region);
  }
  
  if (stockId.startsWith("city:")) {
    const city = stockId.replace("city:", "") as BranchCity;
    return getStockIdsByCity(city);
  }
  
  // Regular stockId
  return [stockId];
};

// Helper to parse and aggregate string values that might contain currency formatting
export const parseNumericValue = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;
  // Remove currency symbols, commas, and other non-numeric chars except minus and decimal
  return parseFloat(String(value).replace(/[^\d.-]/g, "")) || 0;
};

