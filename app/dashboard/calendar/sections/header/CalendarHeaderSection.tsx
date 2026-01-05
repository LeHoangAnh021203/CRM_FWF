"use client";

import { Button } from "@/app/components/ui/button";

interface CalendarHeaderSectionProps {
  onClearAllData: () => void;
}

export function CalendarHeaderSection({
  onClearAllData,
}: CalendarHeaderSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Calendar Report
          </h1>
          <p className="text-gray-600">
            Quản lý lịch làm việc của nhân viên với tính năng duyệt và chỉnh sửa
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClearAllData}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Xóa dữ liệu
          </Button>
        </div>
      </div>
    </div>
  );
}
