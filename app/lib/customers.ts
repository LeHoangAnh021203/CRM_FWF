export type CustomerRecord = Record<string, unknown>;

export const getTotalCustomers = (payload: unknown): number => {
  if (!payload) return 0;
  if (typeof payload === "number") return payload;
  if (Array.isArray(payload)) return payload.length;

  const asObj = payload as {
    totalCustomers?: number;
    totalElements?: number;
    content?: CustomerRecord[];
  };

  if (typeof asObj.totalCustomers === "number") return asObj.totalCustomers;
  if (typeof asObj.totalElements === "number") return asObj.totalElements;
  if (Array.isArray(asObj.content)) {
    return typeof asObj.totalElements === "number"
      ? asObj.totalElements
      : asObj.content.length;
  }

  return 0;
};

export const getCustomerList = (payload: unknown): CustomerRecord[] => {
  if (!payload) return [];
  if (typeof payload === "number") return [];
  if (Array.isArray(payload)) return payload as CustomerRecord[];

  const asObj = payload as { content?: CustomerRecord[] };
  return Array.isArray(asObj.content) ? asObj.content : [];
};

export const buildCustomerBreakdowns = (records: CustomerRecord[]) => {
  if (!records.length) return [];

  const configs: Array<{ label: string; keys: string[] }> = [
    { label: "Theo trạng thái", keys: ["status", "customerStatus", "bookingStatus"] },
    { label: "Theo loại khách", keys: ["customerType", "type"] },
    { label: "Theo khu vực", keys: ["region", "regionName", "area"] },
    { label: "Theo chi nhánh", keys: ["branch", "branchName", "shopName"] },
  ];

  return configs
    .map((config) => {
      const activeKey = config.keys.find((key) =>
        records.some((item) => typeof item[key] === "string" && item[key] !== "")
      );
      if (!activeKey) return null;

      const counts = records.reduce<Record<string, number>>((acc, item) => {
        const raw = item[activeKey];
        if (typeof raw !== "string") return acc;
        const value = raw.trim();
        if (!value) return acc;
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});

      const rows = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([label, value]) => ({ label, value }));

      return rows.length
        ? { label: config.label, key: activeKey, rows }
        : null;
    })
    .filter(Boolean) as Array<{
    label: string;
    key: string;
    rows: { label: string; value: number }[];
  }>;
};
