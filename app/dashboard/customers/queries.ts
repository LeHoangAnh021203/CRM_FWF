export const CUSTOMER_API_BASE = "/api/proxy";

export const customerUrl = (path: string) =>
  `${CUSTOMER_API_BASE}/api/${path}`;

export const CUSTOMER_ENDPOINTS = {
  newCustomer: "customer-sale/new-customer-lineChart",
  customerType: "customer-sale/customer-type-trend",
  customerOldType: "customer-sale/old-customer-lineChart",
  customerSource: "customer-sale/customer-source-trend",
  appDownloadStatus: "customer-sale/app-download-status",
  appDownloadPie: "customer-sale/app-download-pieChart",
  customerSummary: "customer-sale/customer-summary",
  uniqueCustomers: "customer-sale/unique-customers-comparison",
  rangedCustomers: "customer-sale/get-all-customer",
  allCustomers: "customer-sale/get-all-customer-no-range-time",
  bookingCompletion: "booking/facility-booking-hour",
  facilityHourService: "customer-sale/facility-hour-service",
} as const;
