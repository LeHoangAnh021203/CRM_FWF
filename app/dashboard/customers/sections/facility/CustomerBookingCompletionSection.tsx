import React from "react";
import CustomerFacilityBookingTable, {
  FacilityHourRow,
} from "../../CustomerFacilityBookingHour";

interface CustomerBookingCompletionSectionProps {
  bookingCompletionStatus: string | null;
  setBookingCompletionStatus: (value: string) => void;
  showDropdown: boolean;
  setShowDropdown: (value: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  getDropdownStyle: () => React.CSSProperties;
  bookingHourRanges: string[];
  bookingCompletionTableData: Array<{ [key: string]: number | string }>;
  getCellBg: (val: number) => string;
  isMobile: boolean;
  loadingFacilityHour: boolean;
  errorFacilityHour: string | null;
}

const STATUS_OPTIONS = [
  "Khách đến",
  "Khách không đến",
  "Đã xác nhận",
  "Từ chối đặt lịch",
  "Chưa xác nhận",
];

export function CustomerBookingCompletionSection({
  bookingCompletionStatus,
  setBookingCompletionStatus,
  showDropdown,
  setShowDropdown,
  dropdownRef,
  getDropdownStyle,
  bookingHourRanges,
  bookingCompletionTableData,
  getCellBg,
  isMobile,
  loadingFacilityHour,
  errorFacilityHour,
}: CustomerBookingCompletionSectionProps) {
  return (
    <div className="mt-5">
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium text-gray-700">
          Trạng thái đơn hàng:
        </span>
        <div
          className="relative booking-completion-status-dropdown"
          ref={dropdownRef}
          style={{ zIndex: 99999 }}
        >
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {bookingCompletionStatus || "Khách đến"} ▼
          </button>
          {showDropdown && (
            <div
              className="dropdown-menu w-48 bg-white border border-gray-300 rounded-md shadow-lg"
              style={getDropdownStyle()}
            >
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    setBookingCompletionStatus(status);
                    setShowDropdown(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    bookingCompletionStatus === status
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <CustomerFacilityBookingTable
        data-search-ref="customers_booking_hour"
        allHourRanges={bookingHourRanges}
        facilityHourTableData={bookingCompletionTableData as FacilityHourRow[]}
        getCellBg={getCellBg}
        isMobile={isMobile}
        loadingFacilityHour={loadingFacilityHour}
        errorFacilityHour={errorFacilityHour}
      />
    </div>
  );
}
