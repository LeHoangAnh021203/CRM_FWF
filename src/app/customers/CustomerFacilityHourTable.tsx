import React from "react";

interface FacilityHourRow {
  facility: string;
  total: number;
  [key: string]: string | number;
}

interface CustomerFacilityHourTableProps {
  allHourRanges: string[];
  peakHours: string[];
  facilityHourTableData: FacilityHourRow[];
  peakFacilities: string[];
  rowMaxMap: Record<string, number>;
  getCellBg: (val: number, max: number) => string;
  isMobile: boolean;
  loadingFacilityHour: boolean;
  errorFacilityHour: string | null;
}

const CustomerFacilityHourTable: React.FC<CustomerFacilityHourTableProps> = ({
  allHourRanges,
  peakHours,
  facilityHourTableData,
  peakFacilities,
  rowMaxMap,
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
          <span className="inline-flex items-center px-2 py-1 rounded bg-[#ffe5e5]">
            Khung giờ cao điểm
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded bg-[#fff3cd]">
            Giá trị cao
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded bg-[#e3fcec]">
            Giá trị trung bình
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded bg-[#d1e7dd] border border-[#0f5132]">
            Chi nhánh cao điểm
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
                    <th className={`border px-2 py-1 bg-gray-100 text-left font-bold ${isMobile ? 'text-xs' : ''} sticky left-0 z-10 bg-white`}>Cơ sở</th>
                    {allHourRanges.map((hour) => (
                      <th
                        key={hour}
                        className={`border px-2 py-1 font-bold text-sm ${peakHours.includes(hour) ? 'bg-[#ffe5e5]' : ''} ${isMobile ? 'text-xs px-1 py-0.5' : ''}`}
                      >
                        {hour}
                      </th>
                    ))}
                    <th className={`border px-2 py-1 bg-gray-100 font-bold ${isMobile ? 'text-xs' : ''} sticky right-0 z-10 bg-[#e0e7ff]`}>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {facilityHourTableData.map((row) => (
                    <tr
                      key={row.facility}
                      className={
                        peakFacilities.includes(row.facility)
                          ? 'bg-[#d1e7dd] border-2 border-[#0f5132] font-bold'
                          : ''
                      }
                    >
                      <td className={`border px-2 py-1 text-left font-semibold ${isMobile ? 'text-xs px-1 py-0.5' : ''} sticky left-0 z-10 bg-white`}>{row.facility}</td>
                      {allHourRanges.map((hour) => {
                        const val = Number(row[hour] ?? 0);
                        const maxRow = rowMaxMap[row.facility] || 1;
                        return (
                          <td
                            key={hour}
                            className={`border px-2 py-1 ${peakHours.includes(hour) ? 'bg-[#ffe5e5]' : ''} ${getCellBg(val, maxRow)} ${isMobile ? 'text-xs px-1 py-0.5' : ''}`}
                          >
                            {val}
                          </td>
                        );
                      })}
                      <td className={`border px-2 py-1 font-bold ${isMobile ? 'text-xs px-1 py-0.5' : ''} sticky right-0 z-10 bg-[#e0e7ff]`}>{row.total}</td>
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