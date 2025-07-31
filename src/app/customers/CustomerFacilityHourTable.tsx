import React from "react";

interface FacilityHourRow {
  facility: string;
  total: number;
  [key: string]: string | number;
}

interface CustomerFacilityHourTableProps {
  allHourRanges: string[];
  facilityHourTableData: FacilityHourRow[];
  getCellBg: (val: number, hour: string) => string;
  isMobile: boolean;
  loadingFacilityHour: boolean;
  errorFacilityHour: string | null;
}

const CustomerFacilityHourTable: React.FC<CustomerFacilityHourTableProps> = ({
  allHourRanges,
  facilityHourTableData,
  getCellBg,
  isMobile,
  loadingFacilityHour,
  errorFacilityHour,
}) => {
  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-4 mt-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-5 gap-4">
        <h2 className="text-lg sm:text-xl font-semibold">
          Thời gian đơn hàng được tạo
        </h2>
        <div className="flex flex-wrap gap-2 text-xs mt-2 sm:mt-0">
          <span className="inline-flex items-center px-2 py-1 rounded bg-[#68B2A0] text-white">
            Cao điểm (≥90%)
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded bg-[#CDE0C9]">
            Bận rộn (≥70%)
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded bg-[#E0ECDE]">
            Khá bận (≥50%)
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded bg-[#F0F8F0]">
            Ít bận (≥30%)
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded bg-[#F8FCF8]">
            Thưa thớt (≥10%)
          </span>
        </div>
      </div>
      {loadingFacilityHour ? (
        <div>Đang tải dữ liệu...</div>
      ) : errorFacilityHour ? (
        <div className="text-red-500">{errorFacilityHour}</div>
      ) : (
        <div className="overflow-x-auto mt-4 custom-scrollbar">
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
            <div className="max-h-[320px] overflow-y-auto">
              <table className={`min-w-[600px] w-full border text-center ${isMobile ? 'text-xs' : ''}`}>
                <thead>
                  <tr>
                    <th className={`border px-2 py-1 bg-[#2C6975] text-white text-left font-bold ${isMobile ? 'text-xs' : ''} sticky left-0 z-10`}>Cơ sở</th>
                    {allHourRanges.map((hour) => (
                      <th
                        key={hour}
                        className={`border px-2 py-1 font-bold text-sm bg-[#2C6975] text-white ${isMobile ? 'text-xs px-1 py-0.5' : ''}`}
                      >
                        {hour}
                      </th>
                    ))}
                    <th className={`border px-2 py-1 bg-[#2C6975] text-white font-bold ${isMobile ? 'text-xs' : ''} sticky right-0 z-10`}>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {facilityHourTableData.map((row) => (
                    <tr
                      key={row.facility}
                    >
                      <td className={`border px-2 py-1 text-left font-semibold ${isMobile ? 'text-xs px-1 py-0.5' : ''} sticky left-0 z-10 bg-gray-50`}>{row.facility}</td>
                      {allHourRanges.map((hour) => {
                        const val = Number(row[hour] ?? 0);
                        return (
                          <td
                            key={hour}
                            className={`border px-2 py-1 ${getCellBg(val, hour)} ${isMobile ? 'text-xs px-1 py-0.5' : ''}`}
                          >
                            {val}
                          </td>
                        );
                      })}
                      <td className={`border px-2 py-1 font-bold ${isMobile ? 'text-xs px-1 py-0.5' : ''} sticky right-0 z-10 bg-gray-100`}>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFacilityHourTable;