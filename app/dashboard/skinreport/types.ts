export type ModuleData = {
  level?: number | string;
  score?: number | string;
  goods?: string;
  type?: string;
  [key: string]: unknown;
};

export type ModuleDetailEntry = {
  key: string;
  label: string;
  data?: ModuleData;
};

export type SkinReportTab = {
  value: string;
  label: string;
  description: string;
};
