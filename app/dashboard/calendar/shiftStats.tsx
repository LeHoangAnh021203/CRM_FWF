"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Users, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import type { Shift } from "./types";
import { ApiService } from "@/app/lib/api-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";

interface RemoteShiftRecord {
  id?: string;
  fullname?: string;
  username?: string;
  employeeName?: string;
  employeeId?: string;
  stockId?: string;
  stockTitle?: string;
  title?: string;
  timeFrom?: string;
  timeTo?: string;
  startTime?: string;
  endTime?: string;
  checkIn?: string;
  checkOut?: string;
  typeCheckIn?: string;
  desTypeCheckIn?: string;
  typeCheckOut?: string;
  desTypeCheckOut?: string;
  mandays?: string | number;
  diSom?: number;
  diMuon?: number;
  veSom?: number;
  veMuon?: number;
  position?: string;
  status?: string;
  date?: string;
}

interface ShiftStatsProps {
  shifts: Shift[];
  detailed?: boolean;
}

export function ShiftStats({
  shifts: _shifts,
  detailed = false,
}: ShiftStatsProps) {
  void _shifts;
  const [remoteShifts, setRemoteShifts] = useState<RemoteShiftRecord[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [remoteDate, setRemoteDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [remoteEmptyMessage, setRemoteEmptyMessage] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;
    const fetchShifts = async () => {
      if (!remoteDate) return;
      try {
        setRemoteLoading(true);
        setRemoteError(null);
        setRemoteEmptyMessage("");
        const data = (await ApiService.get(
          `shift/get-shift-by-date?date=${remoteDate}`
        )) as unknown;

        if (!isMounted) return;

        let parsed: RemoteShiftRecord[] = [];
        if (Array.isArray(data)) {
          parsed = data as RemoteShiftRecord[];
        } else if (
          data &&
          typeof data === "object" &&
          Array.isArray((data as { content?: RemoteShiftRecord[] }).content)
        ) {
          parsed = (data as { content: RemoteShiftRecord[] }).content;
        } else if (
          data &&
          typeof data === "object" &&
          Array.isArray((data as { data?: RemoteShiftRecord[] }).data)
        ) {
          parsed = (data as { data: RemoteShiftRecord[] }).data;
        }

        setRemoteShifts(parsed);
      } catch (error) {
        if (!isMounted) return;

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Không thể tải dữ liệu ca làm";

        if (errorMessage.includes("Không tìm thấy ca làm việc nào")) {
          setRemoteShifts([]);
          setRemoteError(null);
          setRemoteEmptyMessage("Ngày này tạm thời chưa có data để hiển thị.");
        } else if (errorMessage.includes("timeout") || errorMessage.includes("Request timeout")) {
          setRemoteError("Kết nối quá thời gian chờ. Vui lòng thử lại sau hoặc kiểm tra kết nối mạng.");
        } else {
          setRemoteError(errorMessage);
        }
      } finally {
        if (isMounted) setRemoteLoading(false);
      }
    };

    fetchShifts();

    return () => {
      isMounted = false;
    };
  }, [detailed, remoteDate]);

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.split("T")[0] ?? value;
    }
    return date.toLocaleDateString("vi-VN");
  };

  const formatTimeFromISO = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value.slice(11, 16) || value;
    }
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseTime = (time?: string) => {
    if (!time) return null;
    const normalized = time.includes(":")
      ? `1970-01-01T${time.padStart(5, "0")}`
      : time;
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  };

  const getShiftHours = useCallback((shift: RemoteShiftRecord) => {
    const actualStart = shift.checkIn ? new Date(shift.checkIn) : null;
    const actualEnd = shift.checkOut ? new Date(shift.checkOut) : null;
    const plannedStart =
      parseTime(shift.timeFrom) || parseTime(shift.startTime || shift.timeFrom);
    const plannedEnd =
      parseTime(shift.timeTo) || parseTime(shift.endTime || shift.timeTo);
    const start = actualStart ?? plannedStart;
    const end = actualEnd ?? plannedEnd;
    if (!start || !end) return 0;
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diff > 0 ? diff : 0;
  }, []);

  const statsShifts = useMemo(() => {
    return remoteShifts.map((shift, index) => {
      const fallbackDate = new Date(
        remoteDate || Date.now()
      ).toLocaleDateString("en-CA");
      const start =
        shift.timeFrom ||
        shift.startTime ||
        formatTimeFromISO(shift.checkIn) ||
        "00:00";
      const end =
        shift.timeTo ||
        shift.endTime ||
        formatTimeFromISO(shift.checkOut) ||
        "00:00";
      return {
        id: shift.id ?? `remote-${index}`,
        employeeName:
          shift.fullname || shift.employeeName || shift.username || "—",
        employeeId: shift.employeeId ?? shift.username ?? `remote-${index}`,
        position: shift.stockTitle || shift.position || "Chưa xác định",
        startTime: start,
        endTime: end,
        status:
          shift.typeCheckOut || shift.desTypeCheckOut || shift.checkOut
            ? "approved"
            : "pending",
        date: shift.date
          ? new Date(shift.date).toLocaleDateString("en-CA")
          : fallbackDate,
        priority: "normal",
        submittedAt: shift.checkIn || new Date().toISOString(),
        approvalHistory: [],
      } as Shift;
    });
  }, [remoteShifts, remoteDate]);

  const totalShifts = statsShifts.length;
  const approvedShifts = statsShifts.filter(
    (shift) => shift.status === "approved"
  ).length;
  const pendingShifts = statsShifts.filter(
    (shift) => shift.status === "pending"
  ).length;
  const rejectedShifts = statsShifts.filter(
    (shift) => shift.status === "rejected"
  ).length;
  const activeEmployees = useMemo(() => {
    // Chỉ lấy từ data API, không dùng data local
    const unique = new Set<string>();
    remoteShifts.forEach((shift) => {
      const key =
        shift.username ||
        shift.employeeId ||
        shift.fullname ||
        shift.employeeName;
      if (key) unique.add(key);
    });
    return unique.size;
  }, [remoteShifts]);

  const approvalRate =
    totalShifts > 0 ? (approvedShifts / totalShifts) * 100 : 0;

  const totalHours = remoteShifts
    .filter(
      (shift) => shift.typeCheckOut || shift.desTypeCheckOut || shift.checkOut
    )
    .reduce((sum, shift) => sum + getShiftHours(shift), 0);

  const positionStats = statsShifts.reduce((acc, shift) => {
    acc[shift.position] = (acc[shift.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const employeeHours = useMemo(() => {
    const map: Record<string, number> = {};
    remoteShifts.forEach((shift) => {
      const employeeName =
        shift.fullname || shift.employeeName || shift.username || "Chưa rõ";
      map[employeeName] = (map[employeeName] || 0) + getShiftHours(shift);
    });
    return map;
  }, [remoteShifts, getShiftHours]);

  const formatPlannedTime = (shift: RemoteShiftRecord) => {
    if (shift.timeFrom || shift.timeTo) {
      return `${shift.timeFrom ?? "?"} - ${shift.timeTo ?? "?"}`;
    }
    if (shift.title) {
      const match = shift.title.match(/(\\d{1,2}:\\d{2}).*(\\d{1,2}:\\d{2})/);
      if (match) {
        return `${match[1]} - ${match[2]}`;
      }
    }
    if (shift.startTime || shift.endTime) {
      return `${shift.startTime ?? "?"} - ${shift.endTime ?? "?"}`;
    }
    return "—";
  };

  const formatActualTime = (shift: RemoteShiftRecord) => {
    const checkIn = formatTimeFromISO(shift.checkIn);
    const checkOut = formatTimeFromISO(shift.checkOut);
    if (checkIn || checkOut) {
      return `${checkIn ?? "?"} - ${checkOut ?? "?"}`;
    }
    return "—";
  };

  const getStatusMeta = (shift: RemoteShiftRecord) => {
    const label =
      shift.desTypeCheckOut?.trim() ||
      shift.typeCheckOut?.trim() ||
      shift.desTypeCheckIn?.trim() ||
      shift.typeCheckIn?.trim() ||
      shift.status ||
      "—";

    const normalized = label ? label.toLowerCase() : "";
    let className = "bg-gray-100 text-gray-700";
    if (
      normalized.includes("tăng ca") ||
      normalized.includes("cong_ty") ||
      normalized.includes("tăng")
    ) {
      className = "bg-blue-100 text-blue-700";
    } else if (
      normalized.includes("ca nhân") ||
      normalized.includes("ca_nhan")
    ) {
      className = "bg-purple-100 text-purple-700";
    } else if (
      normalized.includes("rejected") ||
      normalized.includes("từ chối")
    ) {
      className = "bg-red-100 text-red-700";
    } else if (
      normalized.includes("approved") ||
      normalized.includes("duyệt")
    ) {
      className = "bg-green-100 text-green-700";
    } else if (normalized.includes("pending") || normalized.includes("chờ")) {
      className = "bg-yellow-100 text-yellow-700";
    }

    return { label, className };
  };

  const StatusBadge: React.FC<{ shift: RemoteShiftRecord }> = ({ shift }) => {
    const { label, className } = getStatusMeta(shift);
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}
      >
        {label || "—"}
      </span>
    );
  };

  const DetailButton: React.FC<{ shift: RemoteShiftRecord }> = ({ shift }) => {
    const metaNotes: string[] = [];
    if (shift.desTypeCheckOut)
      metaNotes.push(`Check-out: ${shift.desTypeCheckOut}`);
    if (shift.typeCheckOut)
      metaNotes.push(`Loại check-out: ${shift.typeCheckOut}`);
    if (shift.desTypeCheckIn)
      metaNotes.push(`Check-in: ${shift.desTypeCheckIn}`);
    if (shift.typeCheckIn)
      metaNotes.push(`Loại check-in: ${shift.typeCheckIn}`);

    const metrics = [
      { label: "Đi sớm", value: shift.diSom },
      { label: "Đi muộn", value: shift.diMuon },
      { label: "Về sớm", value: shift.veSom },
      { label: "Về muộn", value: shift.veMuon },
    ].filter((item) => typeof item.value === "number");

    const hasMetrics = metrics.some((item) => item.value && item.value > 0);

    if (!hasMetrics && metaNotes.length === 0) {
      return <span className="text-xs text-gray-400">—</span>;
    }

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors underline">
            Xem chi tiết
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết chấm công</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            {metaNotes.length > 0 && (
              <div className="space-y-1">
                {metaNotes.map((note) => (
                  <p key={note} className="text-gray-700">
                    {note}
                  </p>
                ))}
              </div>
            )}
            {hasMetrics && (
              <div className="space-y-2">
                {metrics.map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-semibold text-gray-900">
                      {value && value > 0 ? value.toLocaleString("vi-VN") : "0"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const branchOptions = useMemo(() => {
    const set = new Set<string>();
    remoteShifts.forEach((shift) => {
      const branch = shift.stockTitle || shift.stockId || "";
      if (branch.trim()) set.add(branch.trim());
    });
    return Array.from(set).sort();
  }, [remoteShifts]);

  const shiftOptions = useMemo(() => {
    const set = new Set<string>();
    remoteShifts.forEach((shift) => {
      if (shift.title?.trim()) set.add(shift.title.trim());
    });
    return Array.from(set).sort();
  }, [remoteShifts]);

  const timeOptions = useMemo(() => {
    const set = new Set<string>();
    remoteShifts.forEach((shift) => {
      const planned = formatPlannedTime(shift);
      if (planned !== "—") set.add(planned);
    });
    return Array.from(set).sort();
  }, [remoteShifts]);

  const filteredRemoteShifts = useMemo(() => {
    return remoteShifts.filter((shift) => {
      const matchesEmployee =
        !employeeFilter ||
        `${shift.fullname ?? ""} ${shift.username ?? ""}`
          .toLowerCase()
          .includes(employeeFilter.toLowerCase());

      const branchName = (shift.stockTitle || shift.stockId || "").trim();
      const matchesBranch =
        branchFilter === "all" || branchName === branchFilter;

      const matchesShift =
        shiftFilter === "all" || (shift.title ?? "").trim() === shiftFilter;

      const planned = formatPlannedTime(shift);
      const matchesTime = timeFilter === "all" || planned === timeFilter;

      return matchesEmployee && matchesBranch && matchesShift && matchesTime;
    });
  }, [employeeFilter, branchFilter, shiftFilter, timeFilter, remoteShifts]);

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
      <div className="flex gap-2">
        {basicStats.map((stat, index) => (
          <Card key={index} className="w-[250px]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="flex flex-col sm:items-end">
            <label
              htmlFor="remote-date"
              className="text-sm uppercase tracking-wide text-gray-500 mb-1"
            >
              Chọn ngày
            </label>
            <div className="flex items-center gap-2">
              <input
                id="remote-date"
                type="date"
                value={remoteDate}
                onChange={(event) => setRemoteDate(event.target.value)}
                className="border rounded-md px-3 py-1 text-sm"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {basicStats.map((stat) => (
            <Card key={stat.title} className="shadow-sm border-gray-100">
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={`p-2 rounded-full bg-gray-50 ${stat.color
                    .replace("text", "bg")
                    .replace("-600", "-100")}`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {stat.title}
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {stat.value.toLocaleString("vi-VN")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Thống kê thời gian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 text-sm text-gray-600">
                <span>Tổng giờ làm việc đã duyệt</span>
                <span className="font-semibold text-gray-900">
                  {totalHours.toFixed(1)} giờ
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm text-gray-600">
                <span>Tỷ lệ duyệt ca</span>
                <span className="font-semibold text-gray-900">
                  {approvalRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={approvalRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Thống kê theo chi nhánh</CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto pr-2">
            <div className="space-y-3">
              {Object.entries(positionStats)
                .sort(([, a], [, b]) => b - a)
                .map(([position, count]) => (
                  <div
                    key={position}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600">{position}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (count / Math.max(totalShifts, 1)) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Khối lượng công việc nhân viên</CardTitle>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(employeeHours)
                .sort(([, a], [, b]) => b - a)
                .map(([employee, hours]) => (
                  <div
                    key={employee}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900">
                      {employee}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {hours.toFixed(1)} giờ
                      </span>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              (hours /
                                Math.max(...Object.values(employeeHours), 1)) *
                                100,
                              100
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
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Danh sách ca làm việc từ hệ thống</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">
                  Tìm theo nhân viên
                </label>
                <input
                  type="text"
                  value={employeeFilter}
                  onChange={(event) => setEmployeeFilter(event.target.value)}
                  placeholder="Nhập tên hoặc username..."
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">
                  Chi nhánh
                </label>
                <select
                  value={branchFilter}
                  onChange={(event) => setBranchFilter(event.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="all">Tất cả chi nhánh</option>
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">
                  Ca làm
                </label>
                <select
                  value={shiftFilter}
                  onChange={(event) => setShiftFilter(event.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="all">Tất cả ca</option>
                  {shiftOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600">
                  Giờ làm
                </label>
                <select
                  value={timeFilter}
                  onChange={(event) => setTimeFilter(event.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="all">Tất cả</option>
                  {timeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {remoteLoading ? (
              <div className="flex justify-center items-center h-40 text-gray-500">
                Đang tải dữ liệu...
              </div>
            ) : remoteError ? (
              <div className="text-red-500 text-sm">{remoteError}</div>
            ) : filteredRemoteShifts.length === 0 ? (
              <div className="text-gray-500 text-sm">
                {remoteEmptyMessage ||
                  "Không có ca làm nào khớp bộ lọc hiện tại."}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                <table className="min-w-[960px] w-full text-sm divide-y divide-gray-100">
                  <thead className="bg-gray-50/70">
                    <tr className="text-left text-gray-600">
                      <th className="py-3 px-4">Nhân viên</th>
                      <th className="py-3 px-4">Chi nhánh / Ngày</th>
                      <th className="py-3 px-4">Ca làm</th>
                      <th className="py-3 px-4">Giờ dự kiến</th>
                      <th className="py-3 px-4">Check-in / out</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {filteredRemoteShifts.slice(0, 20).map((shift, index) => (
                      <tr
                        key={
                          shift.id ||
                          `${
                            shift.username ??
                            shift.employeeName ??
                            shift.fullname ??
                            "unknown"
                          }-${shift.date ?? index}-${index}`
                        }
                        className="hover:bg-orange-50/60 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">
                          <div className="flex flex-col">
                            <span>
                              {shift.fullname || shift.employeeName || "—"}
                            </span>
                            {shift.username && (
                              <span className="text-xs text-gray-500">
                                @{shift.username}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          <div className="flex flex-col">
                            <span>
                              {shift.stockTitle ||
                                shift.stockId ||
                                shift.position ||
                                "—"}
                            </span>
                            {shift.date && (
                              <span className="text-xs text-gray-500">
                                {formatDate(shift.date)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {shift.title || "—"}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {formatPlannedTime(shift)}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {formatActualTime(shift)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge shift={shift} />
                        </td>
                        <td className="text-center justify-center items-center py-3 px-4 text-gray-600 flex flex-col gap-1">
                          <DetailButton shift={shift} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 text-xs text-gray-500 bg-gray-50/70 border-t border-gray-100">
                  <p>
                    Hiển thị {Math.min(20, filteredRemoteShifts.length)} /{" "}
                    {filteredRemoteShifts.length.toLocaleString("vi-VN")} ca
                    khớp bộ lọc.
                  </p>
                  {remoteShifts.length > 0 &&
                    filteredRemoteShifts.length !== remoteShifts.length && (
                      <p>
                        Tổng ca trong ngày:{" "}
                        <span className="font-semibold text-gray-700">
                          {remoteShifts.length.toLocaleString("vi-VN")}
                        </span>
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
