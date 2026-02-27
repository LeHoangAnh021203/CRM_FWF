import React from "react";

interface OrderHeaderSectionProps {
  onReset: () => void;
}

export function OrderHeaderSection({ onReset }: OrderHeaderSectionProps) {
  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Order Report
        </h1>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          Reset Filters
        </button>
      </div>
      {/* Filter (temporarily removed) */}
    </div>
  );
}
