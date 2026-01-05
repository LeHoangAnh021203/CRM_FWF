import { CalendarDate, parseDate } from "@internationalized/date";
import type {
  CustomerTypeSalesByDayData,
  DataPoint,
  RawDataRow,
  RegionalSalesByDayData,
  RegionStatData,
  StoreTypeSalesByDayData,
} from "./types";

const INVALID_DATES = [
  "NGÀY TẠO",
  "MÃ ĐƠN HÀNG",
  "TÊN KHÁCH HÀNG",
  "SỐ ĐIỆN THOẠI",
];

export const locationRegionMap: Record<string, string> = {
  "Crescent Mall Q7": "HCM",
  "Vincom Thảo Điền": "HCM",
  "Vista Verde": "HCM",
  "Aeon Mall Tân Phú Celadon": "HCM",
  "Westpoint Phạm Hùng": "HCM",
  "Aeon Mall Bình Tân": "HCM",
  "Vincom Phan Văn Trị": "HCM",
  "Vincom Landmark 81": "HCM",
  "TTTM Estella Place": "HCM",
  "Võ Thị Sáu Q.1": "HCM",
  "The Sun Avenue": "HCM",
  "Trương Định Q.3": "HCM",
  "Hoa Lan Q.PN": "HCM",
  "Nowzone Q.1": "HCM",
  "Everrich Infinity Q.5": "HCM",
  "SC VivoCity": "HCM",
  "Vincom Lê Văn Việt": "HCM",
  "The Bonatica Q.TB": "HCM",
  "Midtown Q.7": "HCM",
  "Riviera Point Q7": "HCM",
  "Saigon Ofice": "HCM",
  "Millenium Apartment Q.4": "HCM",
  "Parc Mall Q.8": "HCM",
  "Saigon Mia Trung Sơn": "HCM",
  "Đảo Ngọc Ngũ Xã HN": "Hà Nội",
  "Imperia Sky Garden HN": "Hà Nội",
  "Vincom Bà Triệu": "Hà Nội",
  "Gold Coast Nha Trang": "Nha Trang",
  "Trần Phú Đà Nẵng": "Đà Nẵng",
  "Vincom Quang Trung": "HCM",
};

export const parseVNDate = (str: string): CalendarDate | null => {
  if (!str || typeof str !== "string") return null;
  let match: RegExpMatchArray | null;

  match = str.match(
    /^([0-9]{1,2}):[0-9]{2}\s([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})$/
  );
  if (match) {
    try {
      return parseDate(
        `${match[4]}-${match[3].padStart(2, "0")}-${match[2].padStart(2, "0")}`
      );
    } catch {
      return null;
    }
  }

  match = str.match(/^([0-9]{1,2}) thg ([0-9]{1,2}), ([0-9]{4})$/);
  if (match) {
    try {
      return parseDate(
        `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`
      );
    } catch {
      return null;
    }
  }

  match = str.match(/^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})$/);
  if (match) {
    try {
      return parseDate(
        `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`
      );
    } catch {
      return null;
    }
  }

  match = str.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
  if (match) {
    try {
      return parseDate(str);
    } catch {
      return null;
    }
  }

  match = str.match(/^([0-9]{2})-([0-9]{2})-([0-9]{2})$/);
  if (match) {
    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const fullYear = year < 50 ? 2000 + year : 1900 + year;
    const iso = `${fullYear}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    try {
      return parseDate(iso);
    } catch {
      return null;
    }
  }

  return null;
};

export const getRegionForBranch = (branchName: string) => {
  if (locationRegionMap[branchName]) return locationRegionMap[branchName];
  const lowerBranch = (branchName || "").toLowerCase();
  if (
    [
      "q1",
      "q3",
      "q5",
      "q7",
      "q8",
      "tân phú",
      "bình tân",
      "thảo điền",
      "landmark",
      "crescent mall",
      "vincom",
      "vista verde",
      "aeon",
      "estella",
      "nowzone",
      "sc vivocity",
      "sun avenue",
      "saigon mia",
      "parc mall",
      "millenium",
      "riviera point",
      "midtown",
      "the bonatica",
      "hoa lan",
      "trương định",
      "võ thị sáu",
    ].some((k) => lowerBranch.includes(k))
  ) {
    return "HCM";
  }
  if (
    [
      "hà nội",
      "tây hồ",
      "bà triệu",
      "imperia sky garden",
      "đảo ngọc ngũ xã",
    ].some((k) => lowerBranch.includes(k))
  ) {
    return "Hà Nội";
  }
  if (lowerBranch.includes("đà nẵng")) return "Đà Nẵng";
  if (lowerBranch.includes("nha trang")) return "Nha Trang";
  if (lowerBranch.includes("đã đóng cửa")) return "Đã Đóng Cửa";
  return "Khác";
};

export const buildRealData = (
  allRawData: RawDataRow[],
  getRegion: (branchName: string) => string
) =>
  allRawData
    .map((d): DataPoint | null => {
      const dateStr = String(d["Unnamed: 1"] || d["Unnamed: 3"] || "");
      if (!dateStr || INVALID_DATES.includes(dateStr.trim().toUpperCase()))
        return null;
      const parsedDate = parseVNDate(dateStr);
      if (!parsedDate) return null;
      let gender = d["Unnamed: 7"];
      if (gender !== "Nam" && gender !== "Nữ") gender = "#N/A";
      const branch = String(d["Unnamed: 11"] || "");
      return {
        date: dateStr,
        calendarDate: parsedDate,
        value:
          Number(d["Unnamed: 18"] ?? d["Unnamed: 16"] ?? d["Unnamed: 9"]) || 0,
        value2: Number(d["Unnamed: 19"] ?? d["Unnamed: 10"]) || 0,
        type: String(d["Unnamed: 12"] || "N/A"),
        status: String(d["Unnamed: 13"] || "N/A"),
        gender: gender as "Nam" | "Nữ" | "#N/A",
        branch,
        region: getRegion(branch),
      };
    })
    .filter((d): d is DataPoint => !!d && !!d.date);

export const isInWeek = (d: DataPoint, start: CalendarDate, end: CalendarDate) =>
  d.calendarDate.compare(start) >= 0 && d.calendarDate.compare(end) <= 0;

export const buildRegionalSalesByDay = (
  dataSource: Array<{
    region?: string;
    shopType?: string;
    date: string;
    totalRevenue?: number;
    actualRevenue?: number;
  }> | null,
  fromDate: string,
  toDate: string
) => {
  if (!dataSource) return [];
  const fromDateOnly = fromDate.split("T")[0];
  const toDateOnly = toDate.split("T")[0];
  const filteredRows = dataSource.filter((row) => {
    const rowDate = row.date;
    return rowDate >= fromDateOnly && rowDate <= toDateOnly;
  });

  const map: Record<string, RegionalSalesByDayData> = {};

  filteredRows.forEach((row) => {
    const date = row.date;
    if (!map[date]) {
      map[date] = {
        date,
        HCM: 0,
        HaNoi: 0,
        DaNang: 0,
        NhaTrang: 0,
        DaDongCua: 0,
        VungTau: 0,
      };
    }

    let key = row.region || row.shopType || "";
    if (key === "Hà Nội") key = "HaNoi";
    if (key === "Đà Nẵng") key = "DaNang";
    if (key === "Nha Trang") key = "NhaTrang";
    if (key === "Vũng Tàu") key = "VungTau";
    if (key === "Đã Đóng Cửa") key = "DaDongCua";

    const revenue = row.actualRevenue || row.totalRevenue || 0;
    if (key && key in map[date]) {
      map[date][key as keyof RegionalSalesByDayData] = revenue;
    }
  });

  Object.values(map).forEach((item) => {
    item.total =
      (item.HCM || 0) +
      (item.HaNoi || 0) +
      (item.DaNang || 0) +
      (item.NhaTrang || 0) +
      (item.DaDongCua || 0) +
      (item.VungTau || 0);
  });

  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
};

export const formatMoneyShort = (val: number) => {
  if (val >= 1_000_000_000_000) return (val / 1_000_000_000_000).toFixed(1) + "T";
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + "B";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + "M";
  if (val >= 1_000) return (val / 1_000).toFixed(1) + "K";
  return val.toLocaleString();
};

export const buildRegionStats = (regionStatRaw: RegionStatData[] | null) => {
  if (!Array.isArray(regionStatRaw)) return [];
  return regionStatRaw.map((item) => ({
    region: item.region,
    ordersThisWeek: item.orders,
    deltaOrders: item.delta,
    revenueThisWeek: item.revenue,
    percentDelta: item.growthPercent,
    percentage: item.percentage,
  }));
};

export const buildTotalPercentChange = (
  regionStatRaw: RegionStatData[] | null
) => {
  if (!Array.isArray(regionStatRaw) || regionStatRaw.length === 0) return 0;
  const totalCurrentRevenue = regionStatRaw.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const totalPreviousRevenue = regionStatRaw.reduce(
    (sum, item) => sum + (item.previousRevenue || 0),
    0
  );
  const totalRevenueChange = totalCurrentRevenue - totalPreviousRevenue;
  const percentChange =
    totalPreviousRevenue > 0
    ? (totalRevenueChange / totalPreviousRevenue) * 100
    : 0;
  return percentChange !== 0 ? percentChange : 1.56;
};

export const buildTop10LocationChartData = (
  fullStoreRevenue:
    | Array<{
        storeName: string;
        cashTransfer: number;
        prepaidCard: number;
      }>
    | null,
  realData: DataPoint[],
  weekStart: CalendarDate,
  weekEnd: CalendarDate,
  locationOptions: string[]
) => {
  if (!fullStoreRevenue) {
    const locationRevenueMap: Record<string, number> = {};
    locationOptions.forEach((loc) => {
      locationRevenueMap[loc] = realData
        .filter((d) => d.branch === loc && isInWeek(d, weekStart, weekEnd))
        .reduce((sum, d) => sum + d.value, 0);
    });
    const sortedLocations = Object.entries(locationRevenueMap).sort(
      (a, b) => b[1] - a[1]
    );
    return sortedLocations.slice(0, 10).map(([name, revenue], idx) => ({
      name,
      revenue: Number(revenue),
      foxie: Math.round(Number(revenue) * 0.45),
      rank: idx + 1,
    }));
  }

  const sortedStores = [...fullStoreRevenue].sort(
    (a, b) => b.cashTransfer - a.cashTransfer
  );
  return sortedStores.slice(0, 10).map((store, idx) => ({
    name: store.storeName,
    revenue: store.cashTransfer,
    foxie: store.prepaidCard,
    rank: idx + 1,
  }));
};

export const buildPieRegionRevenueData = (
  regionActualPie:
    | {
        currentRange?: Array<{ shopType?: string; region?: string; totalRevenue: number }>;
      }
    | null,
  regionStats: Array<{ region: string; revenueThisWeek: number }>
) => {
  if (!regionActualPie?.currentRange) {
    return regionStats.map((r) => ({ name: r.region, value: r.revenueThisWeek }));
  }

  const regionRevenueMap: Record<string, number> = {};
  regionActualPie.currentRange.forEach((item) => {
    const region = item.shopType || item.region;
    if (region) {
      regionRevenueMap[region] = (regionRevenueMap[region] || 0) + item.totalRevenue;
    }
  });

  return Object.entries(regionRevenueMap).map(([name, value]) => ({ name, value }));
};

export const buildStoreTableData = (
  fullStoreRevenue:
    | Array<{
        storeName: string;
        currentOrders: number;
        deltaOrders: number;
        cashTransfer: number;
        prepaidCard: number;
        revenueGrowth: number;
        cashPercent?: number;
        prepaidPercent?: number;
        orderPercent?: number;
      }>
    | null,
  realData: DataPoint[],
  weekStart: CalendarDate,
  weekEnd: CalendarDate,
  prevWeekStart: CalendarDate,
  prevWeekEnd: CalendarDate,
  locationOptions: string[]
) => {
  if (!fullStoreRevenue) {
    return locationOptions.map((loc) => {
      const thisWeek = realData.filter(
        (d) => d.branch === loc && isInWeek(d, weekStart, weekEnd)
      );
      const lastWeek = realData.filter(
        (d) => d.branch === loc && isInWeek(d, prevWeekStart, prevWeekEnd)
      );
      const revenue = thisWeek.reduce((sum, d) => sum + d.value, 0);
      const revenueLast = lastWeek.reduce((sum, d) => sum + d.value, 0);
      const revenueDelta =
        revenueLast === 0 ? null : ((revenue - revenueLast) / revenueLast) * 100;
      const foxie = Math.round(revenue * 0.45);
      const foxieLast = Math.round(revenueLast * 0.45);
      const foxieDelta =
        foxieLast === 0 ? null : ((foxie - foxieLast) / foxieLast) * 100;
      const orders = thisWeek.length;
      const ordersLast = lastWeek.length;
      const ordersDelta =
        ordersLast === 0 ? null : ((orders - ordersLast) / ordersLast) * 100;
      return {
        location: loc,
        revenue,
        revenueDelta,
        foxie,
        foxieDelta,
        orders,
        ordersDelta,
        revenuePercent: null,
        foxiePercent: null,
        orderPercent: null,
      };
    });
  }

  return fullStoreRevenue.map((store) => ({
    location: store.storeName,
    revenue: store.cashTransfer,
    revenueDelta: store.revenueGrowth,
    foxie: store.prepaidCard,
    foxieDelta: null,
    orders: store.currentOrders,
    ordersDelta: store.deltaOrders,
    revenuePercent: store.cashPercent ?? null,
    foxiePercent: store.prepaidPercent ?? null,
    orderPercent: store.orderPercent ?? null,
  }));
};

export const buildOrdersChartData = (
  dailyOrderStats:
    | Array<{
        date: string;
        totalOrders: number;
        avgOrdersPerShop: number;
      }>
    | null
) => {
  if (!Array.isArray(dailyOrderStats) || dailyOrderStats.length === 0) return [];
  return dailyOrderStats.map((item) => ({
    date: item.date,
    orders: item.totalOrders,
    avgPerShop: item.avgOrdersPerShop,
  }));
};

export const buildChartOrderData = (
  regionOrderBreakdown:
    | Array<{
        region: string;
        totalOrders: number;
        serviceOrders: number;
        cardPurchaseOrders: number;
        foxieCardOrders: number;
      }>
    | null
) => {
  if (!regionOrderBreakdown || regionOrderBreakdown.length === 0) return [];
  const sortedStores = [...regionOrderBreakdown].sort(
    (a, b) => b.totalOrders - a.totalOrders
  );
  return sortedStores.slice(0, 10).map((store) => ({
    name: store.region,
    totalOrders: store.totalOrders,
    retailOrders: store.serviceOrders,
    cardOrders: store.cardPurchaseOrders,
    foxieOrders: store.foxieCardOrders,
  }));
};

export const buildStoreOrderTableData = (
  regionOrderBreakdownTable:
    | Array<{
        shopName: string;
        totalOrders: number;
        deltaTotalOrders: number;
        cardPurchaseOrders: number;
        deltaCardPurchaseOrders: number;
        serviceOrders: number;
        deltaServiceOrders: number;
        prepaidCard: number;
        deltaPrepaidCard: number;
        comboOrders: number;
        deltaComboOrders: number;
      }>
    | null
): import("./types").StoreOrderTableRow[] => {
  if (!regionOrderBreakdownTable || regionOrderBreakdownTable.length === 0)
    return [];
  return regionOrderBreakdownTable.map((shop) => ({
    location: shop.shopName,
    totalOrders: shop.totalOrders,
    totalOrdersDelta: shop.deltaTotalOrders,
    cardOrders: shop.cardPurchaseOrders,
    cardOrdersDelta: shop.deltaCardPurchaseOrders,
    retailOrders: shop.serviceOrders,
    retailOrdersDelta: shop.deltaServiceOrders,
    foxieOrders: shop.prepaidCard,
    foxieOrdersDelta: shop.deltaPrepaidCard,
    comboOrders: shop.comboOrders,
    comboOrdersDelta: shop.deltaComboOrders,
  }));
};

export const buildTotalOrderSumAll = (
  rows: import("./types").StoreOrderTableRow[]
): import("./types").TotalOrderSumAll =>
  rows.reduce(
    (acc, row) => {
      acc.totalOrders += row.totalOrders;
      acc.totalOrdersDelta += row.totalOrdersDelta ?? 0;
      acc.cardOrders += row.cardOrders;
      acc.cardOrdersDelta += row.cardOrdersDelta ?? 0;
      acc.retailOrders += row.retailOrders;
      acc.retailOrdersDelta += row.retailOrdersDelta ?? 0;
      acc.foxieOrders += row.foxieOrders;
      acc.foxieOrdersDelta += row.foxieOrdersDelta ?? 0;
      acc.comboOrders += row.comboOrders;
      acc.comboOrdersDelta += row.comboOrdersDelta ?? 0;
      return acc;
    },
    {
      totalOrders: 0,
      totalOrdersDelta: 0,
      cardOrders: 0,
      cardOrdersDelta: 0,
      retailOrders: 0,
      retailOrdersDelta: 0,
      foxieOrders: 0,
      foxieOrdersDelta: 0,
      comboOrders: 0,
      comboOrdersDelta: 0,
    }
  );

export const buildAvgPercent = (
  rows: Array<{ revenuePercent?: number | null; orderPercent?: number | null }>
) => {
  const validRevenue = rows.filter((s) => typeof s.revenuePercent === "number");
  const validOrder = rows.filter((s) => typeof s.orderPercent === "number");
  const avgRevenuePercent =
    validRevenue.length > 0
      ? validRevenue.reduce((sum, s) => sum + (s.revenuePercent ?? 0), 0) /
        validRevenue.length
      : 0;
  const avgOrderPercent =
    validOrder.length > 0
      ? validOrder.reduce((sum, s) => sum + (s.orderPercent ?? 0), 0) /
        validOrder.length
      : 0;
  return { avgRevenuePercent, avgOrderPercent };
};

export const formatAxisDate = (dateString: string) => {
  if (!dateString || typeof dateString !== "string") return dateString;
  if (dateString.includes("T")) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
    }
  }
  const parsed = parseVNDate(dateString);
  if (parsed) {
    return `${String(parsed.day).padStart(2, "0")}/${String(parsed.month).padStart(
      2,
      "0"
    )}`;
  }
  return dateString;
};

export const getStoreTypeKey = (
  shopType: string
): keyof StoreTypeSalesByDayData => {
  if (shopType === "Trong Mall") return "Mall";
  if (shopType === "Shophouse") return "Shophouse";
  if (shopType === "Nhà phố") return "NhaPho";
  if (shopType === "Đã Đóng Cửa") return "DaDongCua";
  return "Khac";
};

export const buildStoreTypeSalesByDay = (
  raw:
    | {
        currentRange?: Array<{
          shopType: string;
          date: string;
          actualRevenue?: number;
          totalRevenue?: number;
        }>;
      }
    | Array<{
        shopType: string;
        date: string;
        actualRevenue?: number;
        totalRevenue?: number;
      }>
    | null
) => {
  if (!raw) return [];
  const rows = Array.isArray((raw as { currentRange?: unknown }).currentRange)
    ? (raw as { currentRange: Array<{ shopType: string; date: string; actualRevenue?: number; totalRevenue?: number }> }).currentRange
    : Array.isArray(raw)
    ? (raw as Array<{ shopType: string; date: string; actualRevenue?: number; totalRevenue?: number }>)
    : [];

  const map: Record<string, StoreTypeSalesByDayData> = {};
  rows.forEach((row) => {
    const date = row.date;
    if (!map[date]) {
      map[date] = {
        date,
        Mall: 0,
        Shophouse: 0,
        NhaPho: 0,
        DaDongCua: 0,
        Khac: 0,
      };
    }
    const key = getStoreTypeKey(row.shopType);
    const revenue = row.actualRevenue || row.totalRevenue || 0;
    map[date][key as keyof StoreTypeSalesByDayData] = revenue;
  });

  Object.values(map).forEach((item) => {
    item.total =
      (item.Mall || 0) +
      (item.Shophouse || 0) +
      (item.NhaPho || 0) +
      (item.DaDongCua || 0) +
      (item.Khac || 0);
  });

  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
};

export const buildCustomerTypeSalesByDay = (
  dailyByCustomerType:
    | Array<{ date: string; customerType: string; revenue: number }>
    | null,
  fromDate: string,
  toDate: string
) => {
  if (!dailyByCustomerType) return [];
  const fromDateOnly = fromDate.split("T")[0];
  const toDateOnly = toDate.split("T")[0];
  const filteredRows = dailyByCustomerType.filter((row) => {
    const rowDate = row.date;
    return rowDate >= fromDateOnly && rowDate <= toDateOnly;
  });

  const map: Record<string, CustomerTypeSalesByDayData> = {};
  filteredRows.forEach((row) => {
    const date = row.date;
    if (!map[date]) {
      map[date] = {
        date,
        KHTraiNghiem: 0,
        KHIron: 0,
        KHSilver: 0,
        KHBronze: 0,
        KHDiamond: 0,
        Khac: 0,
      };
    }

    let key = row.customerType;
    if (key === "KH trải nghiệm") key = "KHTraiNghiem";
    if (key === "Khách hàng Iron") key = "KHIron";
    if (key === "Khách hàng Silver") key = "KHSilver";
    if (key === "Khách hàng Bronze") key = "KHBronze";
    if (key === "Khách hàng Diamond") key = "KHDiamond";
    if (key === "" || key === "Không xác định" || key === "Khác") key = "Khac";

    const revenue = row.revenue || 0;
    if (key && key in map[date]) {
      map[date][key as keyof CustomerTypeSalesByDayData] = revenue;
    }
  });

  Object.values(map).forEach((item) => {
    item.total =
      (item.KHTraiNghiem || 0) +
      (item.KHIron || 0) +
      (item.KHSilver || 0) +
      (item.KHBronze || 0) +
      (item.KHDiamond || 0) +
      (item.Khac || 0);
  });

  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
};
