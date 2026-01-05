import React from "react";
import CustomerFacilityHourTable, { FacilityHourRow } from "../../CustomerFacilityHourTable";

interface CustomerFacilitySectionProps {
  allHourRanges: string[];
  facilityHourTableData: FacilityHourRow[];
  getCellBg: (val: number) => string;
  isMobile: boolean;
  loadingFacilityHour: boolean;
  errorFacilityHour: string | null;
}

export function CustomerFacilitySection({
  allHourRanges,
  facilityHourTableData,
  getCellBg,
  isMobile,
  loadingFacilityHour,
  errorFacilityHour,
}: CustomerFacilitySectionProps) {
  return (
    <CustomerFacilityHourTable
      data-search-ref="customers_facility_hour"
      allHourRanges={allHourRanges}
      facilityHourTableData={facilityHourTableData}
      getCellBg={getCellBg}
      isMobile={isMobile}
      loadingFacilityHour={loadingFacilityHour}
      errorFacilityHour={errorFacilityHour}
    />
  );
}
