"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Users, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import type { Shift, Employee } from "./types";
import { ApiService } from "@/app/lib/api-service";

interface ShiftStatsProps {
  shifts: Shift[];
  employees: Employee[];
  detailed?: boolean;
}

export function ShiftStats({
  shifts,
  employees,
  detailed = false,
}: ShiftStatsProps) {
  const totalShifts = shifts.length;
  const approvedShifts = shifts.filter(
    (shift) => shift.status === "approved",
  ).length;
  const pendingShifts = shifts.filter(
    (shift) => shift.status === "pending",
  ).length;
  const rejectedShifts = shifts.filter(
    (shift) => shift.status === "rejected",
  ).length;
  const activeEmployees = employees.filter((emp) => emp.isActive).length;

  const approvalRate =
    totalShifts > 0 ? (approvedShifts / totalShifts) * 100 : 0;

  // Calculate total working hours
  const totalHours = shifts
    .filter((shift) => shift.status === "approved")
    .reduce((total, shift) => {
      const start = new Date(`2000-01-01T${shift.startTime}`);
      const end = new Date(`2000-01-01T${shift.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);

  // Position statistics
  const positionStats = shifts.reduce((acc, shift) => {
    acc[shift.position] = (acc[shift.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Employee workload
  const employeeWorkload = shifts.reduce((acc, shift) => {
    acc[shift.employeeName] = (acc[shift.employeeName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const [remoteShifts, setRemoteShifts] = useState<Shift[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  useEffect(() => {
    if (!detailed) return;

    let isMounted = true;
    const fetchShifts = async () => {
      try {
        setRemoteLoading(true);
        setRemoteError(null);
        const data = (await ApiService.get(
          "shift/get-all-shift"
        )) as unknown;

        if (!isMounted) return;

        let parsed: Shift[] = [];
        if (Array.isArray(data)) {
          parsed = data as Shift[];
        } else if (
          data &&
          typeof data === "object" &&
          Array.isArray((data as { content?: Shift[] }).content)
        ) {
          parsed = (data as { content: Shift[] }).content;
        } else if (
          data &&
          typeof data === "object" &&
          Array.isArray((data as { data?: Shift[] }).data)
        ) {
          parsed = (data as { data: Shift[] }).data;
        }

        setRemoteShifts(parsed);
      } catch (error) {
        if (!isMounted) return;
        setRemoteError(
          error instanceof Error ? error.message : "Không thể tải dữ liệu ca làm"
        );
      } finally {
        if (isMounted) setRemoteLoading(false);
      }
    };

    fetchShifts();

    return () => {
      isMounted = false;
    };
  }, [detailed]);

  const basicStats = [
    {
      title: "Tổng ca làm",
      value: totalShifts,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Nhân viên hoạt động",
      value: activeEmployees,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Ca đã duyệt",
      value: approvedShifts,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Ca chờ duyệt",
      value: pendingShifts,
      icon: AlertCircle,
      color: "text-yellow-600",
    },
    {
      title: "Ca bị từ chối",
      value: rejectedShifts,
      icon: AlertCircle,
      color: "text-red-600",
    },
  ];

  if (!detailed) {
    return (
      <div className='flex gap-2'>
        {basicStats.map((stat, index) => (
          <Card key={index} className='w-[250px]'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3'>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className='text-2xl font-bold'>{stat.value}</p>
                  <p className='text-sm text-gray-600'>{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='w-5 h-5' />
              Thống kê thời gian
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <div className='flex justify-between mb-2'>
                <span>Tổng giờ làm việc đã duyệt</span>
                <span className='font-bold'>{totalHours.toFixed(1)} giờ</span>
              </div>
            </div>
            <div>
              <div className='flex justify-between mb-2'>
                <span>Tỷ lệ duyệt ca</span>
                <span className='font-bold'>{approvalRate.toFixed(1)}%</span>
              </div>
              <Progress value={approvalRate} className='h-2' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê theo vị trí</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {Object.entries(positionStats)
                .sort(([, a], [, b]) => b - a)
                .map(([position, count]) => (
                  <div
                    key={position}
                    className='flex justify-between items-center'
                  >
                    <span className='text-sm'>{position}</span>
                    <div className='flex items-center gap-2'>
                      <div className='w-20 bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-blue-600 h-2 rounded-full'
                          style={{ width: `${(count / totalShifts) * 100}%` }}
                        />
                      </div>
                      <span className='text-sm font-medium w-8'>{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle>Khối lượng công việc nhân viên</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {Object.entries(employeeWorkload)
                .sort(([, a], [, b]) => b - a)
                .map(([employee, count]) => (
                  <div
                    key={employee}
                    className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'
                  >
                    <span className='font-medium'>{employee}</span>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm text-gray-600'>{count} ca</span>
                      <div className='w-16 bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-green-600 h-2 rounded-full'
                          style={{
                            width: `${Math.min(
                              (count /
                                Math.max(...Object.values(employeeWorkload))) *
                                100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <CardTitle>Danh sách ca làm việc từ hệ thống</CardTitle>
            <p className='text-sm text-gray-500'>
              Nguồn: api/shift/get-all-shift
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {remoteLoading ? (
            <div className='flex justify-center items-center h-40 text-gray-500'>
              Đang tải dữ liệu...
            </div>
          ) : remoteError ? (
            <div className='text-red-500 text-sm'>{remoteError}</div>
          ) : remoteShifts.length === 0 ? (
            <div className='text-gray-500 text-sm'>
              Chưa có dữ liệu ca làm từ API
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full text-sm'>
                <thead>
                  <tr className='text-left text-gray-600 border-b'>
                    <th className='py-2 pr-4'>Nhân viên</th>
                    <th className='py-2 pr-4'>Ngày</th>
                    <th className='py-2 pr-4'>Giờ làm</th>
                    <th className='py-2 pr-4'>Vị trí</th>
                    <th className='py-2 pr-4'>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {remoteShifts.slice(0, 20).map((shift) => (
                    <tr key={shift.id} className='border-b last:border-b-0'>
                      <td className='py-2 pr-4 font-medium text-gray-900'>
                        {shift.employeeName || "—"}
                      </td>
                      <td className='py-2 pr-4 text-gray-700'>
                        {shift.date
                          ? new Date(shift.date).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td className='py-2 pr-4 text-gray-700'>
                        {shift.startTime && shift.endTime
                          ? `${shift.startTime} - ${shift.endTime}`
                          : "—"}
                      </td>
                      <td className='py-2 pr-4 text-gray-700'>
                        {shift.position || "—"}
                      </td>
                      <td className='py-2 pr-4'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            shift.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : shift.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {shift.status || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {remoteShifts.length > 20 && (
                <p className='mt-3 text-xs text-gray-500'>
                  Hiển thị 20 ca gần nhất (tổng {remoteShifts.length.toLocaleString("vi-VN")} ca).
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
