"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  SkinInsights,
  SkinRecordSummary,
} from "@/app/lib/skin-insights";

interface DialogListCustomerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  insights: SkinInsights;
  records: SkinRecordSummary[];
  paginatedRecords: SkinRecordSummary[];
  page: number;
  totalPages: number;
  pageSize: number;
  formatSex: (value?: number | string) => string;
  formatDateTime: (value?: string) => string;
  onViewRecord: (record: SkinRecordSummary) => void;
  onPageChange: (page: number) => void;
}

export function DialogListCustomer({
  isOpen,
  onOpenChange,
  insights,
  records,
  paginatedRecords,
  page,
  totalPages,
  pageSize,
  formatSex,
  formatDateTime,
  onViewRecord,
  onPageChange,
}: DialogListCustomerProps) {
  const formatAgeValue = (value?: number | null) =>
    value !== null && value !== undefined ? `${value}` : "—";
  const handlePrev = () => onPageChange(Math.max(1, page - 1));
  const handleNext = () => onPageChange(Math.min(totalPages, page + 1));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-full sm:max-w-5xl sm:rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Danh sách khách hàng ({insights.totalRecords.toLocaleString("vi-VN")})
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Từ {(records?.length ?? 0).toLocaleString("vi-VN")} bản ghi đã hợp nhất · sắp xếp
            mới nhất
          </p>
        </DialogHeader>
        {records.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có bản ghi nào.</p>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[65vh] overflow-auto pr-1">
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm table-fixed">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-orange-400">
                      <th className="py-3">Ảnh</th>
                      <th className="py-3">Tên/SĐT</th>
                      <th className="py-3">Giới tính</th>
                      <th className="py-3">Account</th>
                      <th className="py-3">Thời gian</th>
                      <th className="py-3">Tuổi (CRM/AI)</th>
                      <th className="py-3">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRecords.map((record) => {
                      return (
                        <tr
                          key={`${record.id}-${record.resultId}-${record.code}`}
                          className="border-b last:border-0"
                        >
                          <td className="py-3 align-top">
                            <div className="h-24 w-24 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                              {record.image ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={record.image}
                                    alt={record.nickname ?? "Ảnh khách hàng"}
                                    className="h-full w-full object-cover"
                                  />
                                </>
                              ) : (
                                <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                                  No image
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 align-top">
                            <div className="font-semibold text-gray-900">
                              {record.nickname ?? "Ẩn danh"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.phone ?? "Không có số ĐT"}
                            </div>
                          </td>
                          <td className="py-3 align-top capitalize text-gray-600">
                            {formatSex(record.sex)}
                          </td>
                          <td className="py-3 align-top text-gray-600">
                            {record.account ?? "—"}
                          </td>
                          <td className="py-3 align-top text-gray-600">
                            {formatDateTime(record.createdAt)}
                          </td>
                          <td className="py-3 align-top">
                            <div className="text-xs text-gray-500">
                              <p>
                                CRM:{" "}
                                <span className="font-semibold text-gray-900">
                                  {formatAgeValue(record.age)}
                                </span>
                              </p>
                              <p>
                                AI:{" "}
                                <span className="font-semibold text-gray-900">
                                  {formatAgeValue(record.aiAge)}
                                </span>
                              </p>
                            </div>
                          </td>
                          <td className="py-3 align-top">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewRecord(record)}
                            >
                              Xem chi tiết
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="space-y-3 md:hidden">
                {paginatedRecords.map((record) => {
                  return (
                    <div
                      key={`${record.id}-${record.resultId}-${record.code}-card`}
                      className="rounded-2xl border border-gray-100 p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-26 w-26 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
                          {record.image ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={record.image}
                                alt={record.nickname ?? "Ảnh khách hàng"}
                                className="h-full w-full object-cover"
                              />
                            </>
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {record.nickname ?? "Ẩn danh"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.phone ?? "Không có số ĐT"}
                            </p>
                            <div className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                              CRM: {formatAgeValue(record.age)} · AI:{" "}
                              {formatAgeValue(record.aiAge)}
                            </div>
                          </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
                        <MobileInfo label="Mã" value={record.code ?? record.id} />
                        <MobileInfo label="Giới tính" value={formatSex(record.sex)} />
                        <MobileInfo
                          label="Thời gian"
                          value={formatDateTime(record.createdAt)}
                        />
                        <MobileInfo label="Account" value={record.account ?? "—"} />
                        <MobileInfo
                          label="Tuổi CRM"
                          value={`${formatAgeValue(record.age)} tuổi`}
                        />
                        <MobileInfo
                          label="Tuổi AI"
                          value={`${formatAgeValue(record.aiAge)} tuổi`}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => onViewRecord(record)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Trang {page}/{totalPages} ·{" "}
                {Math.min(page * pageSize, records.length).toLocaleString("vi-VN")} /{" "}
                {records.length.toLocaleString("vi-VN")} hồ sơ
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" disabled={page === 1} onClick={handlePrev}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={page === totalPages}
                  onClick={handleNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MobileInfo({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{label}</p>
      <p className="mt-1 text-xs font-semibold text-gray-900">{value ?? "—"}</p>
    </div>
  );
}
