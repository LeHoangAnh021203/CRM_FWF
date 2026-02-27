"use client";

import { Calendar } from "../../calendar";
import { ShiftForm } from "../../shiftForm";
import { ShiftList } from "../../shiftList";
import { EmployeeManager } from "../../employeeManager";
import { ShiftTemplates } from "../../shiftTemplates";
import { ShiftStats } from "../../shiftStats";
import { ApprovalWorkflow } from "../../approvalWorkflow";
import { RejectModal } from "../../rejectModal";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Plus, Search } from "lucide-react";
import type { Employee, Shift, ShiftTemplate } from "../../types";

interface CalendarTabsSectionProps {
  employees: Employee[];
  setEmployees: (employees: Employee[]) => void;
  shiftTemplates: ShiftTemplate[];
  setShiftTemplates: (templates: ShiftTemplate[]) => void;
  shifts: Shift[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onOpenShiftForm: () => void;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onApproveShift: (shiftId: string) => void;
  onRejectShift: (shift: Shift) => void;
  onDuplicateShift: (shift: Shift) => void;
  onBulkApprove: (shiftIds: string[]) => void;
  onAddTestShift: () => void;
  onResetShiftData: () => void;
  onAddTestEmployee: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  positionFilter: string;
  onPositionFilterChange: (value: string) => void;
  uniquePositions: string[];
  filteredShifts: Shift[];
  showShiftForm: boolean;
  editingShift: Shift | null;
  shiftFormDate: string;
  onSubmitShift: (
    shiftData: Omit<Shift, "id" | "status" | "approvalHistory" | "submittedAt">
  ) => void;
  onCancelShiftForm: () => void;
  showRejectModal: boolean;
  rejectingShift: Shift | null;
  onRejectWithReason: (reason: string) => void;
  onCancelRejectModal: () => void;
}

export function CalendarTabsSection({
  employees,
  setEmployees,
  shiftTemplates,
  setShiftTemplates,
  shifts,
  selectedDate,
  onDateSelect,
  onOpenShiftForm,
  onEditShift,
  onDeleteShift,
  onApproveShift,
  onRejectShift,
  onDuplicateShift,
  onBulkApprove,
  onAddTestShift,
  onResetShiftData,
  onAddTestEmployee,
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  positionFilter,
  onPositionFilterChange,
  uniquePositions,
  filteredShifts,
  showShiftForm,
  editingShift,
  shiftFormDate,
  onSubmitShift,
  onCancelShiftForm,
  showRejectModal,
  rejectingShift,
  onRejectWithReason,
  onCancelRejectModal,
}: CalendarTabsSectionProps) {
  return (
    <>
      <div className="mb-6">
        <ShiftStats shifts={shifts} />
      </div>

      <Tabs defaultValue="calendar" className="space-y-6 ">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 bg-orange-100 overflow-x-auto">
          <TabsTrigger value="calendar" className="text-xs sm:text-sm">
            Lịch làm việc
          </TabsTrigger>
          <TabsTrigger value="shifts" className="text-xs sm:text-sm">
            Danh sách ca
          </TabsTrigger>
          <TabsTrigger value="approval" className="text-xs sm:text-sm">
            Phê duyệt
          </TabsTrigger>
          <TabsTrigger value="employees" className="text-xs sm:text-sm">
            Nhân viên
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs sm:text-sm">
            Mẫu ca làm
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm">
            Báo cáo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              Lịch theo chi nhánh
            </h2>
            <Button
              onClick={onOpenShiftForm}
              className="bg-orange-500 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm ca làm
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            <div className="xl:col-span-2">
              <Calendar
                shifts={shifts}
                selectedDate={selectedDate}
                onDateSelect={onDateSelect}
              />
            </div>
            <div className="xl:col-span-1">
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">
                    Ca làm ngày {selectedDate.toLocaleDateString("vi-VN")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ShiftList
                    shifts={shifts.filter(
                      (shift) => shift.date === shiftFormDate
                    )}
                    onEdit={onEditShift}
                    onDelete={onDeleteShift}
                    onApprove={onApproveShift}
                    onReject={onRejectShift}
                    onDuplicate={onDuplicateShift}
                    showActions={true}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shifts">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg sm:text-xl">
                  Tất cả ca làm việc
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={onOpenShiftForm}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm ca làm
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onAddTestShift}
                    className="w-full sm:w-auto"
                  >
                    Test Day 2
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onResetShiftData}
                    className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                  >
                    Reset Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onAddTestEmployee}
                    className="w-full sm:w-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 hover:border-blue-300"
                  >
                    Test Add Employee
                  </Button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm theo tên nhân viên hoặc vị trí..."
                      value={searchTerm}
                      onChange={(e) => onSearchTermChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                  <Select
                    value={statusFilter}
                    onValueChange={onStatusFilterChange}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue>Trạng thái</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="approved">Đã duyệt</SelectItem>
                      <SelectItem value="rejected">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={positionFilter}
                    onValueChange={onPositionFilterChange}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue>Vị trí</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {uniquePositions.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ShiftList
                shifts={filteredShifts}
                onEdit={onEditShift}
                onDelete={onDeleteShift}
                onApprove={onApproveShift}
                onReject={onRejectShift}
                onDuplicate={onDuplicateShift}
                showActions={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval">
          <ApprovalWorkflow
            shifts={shifts.filter((shift) => shift.status === "pending")}
            onApprove={onApproveShift}
            onReject={onRejectShift}
            onBulkApprove={onBulkApprove}
            onEdit={onEditShift}
          />
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeManager employees={employees} setEmployees={setEmployees} />
        </TabsContent>

        <TabsContent value="templates">
          <ShiftTemplates
            templates={shiftTemplates}
            setTemplates={setShiftTemplates}
          />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo thống kê</CardTitle>
            </CardHeader>
            <CardContent>
              <ShiftStats shifts={shifts} detailed={true} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showShiftForm && (
        <ShiftForm
          shift={editingShift}
          employees={employees}
          templates={shiftTemplates}
          selectedDate={shiftFormDate}
          onSubmit={onSubmitShift}
          onCancel={onCancelShiftForm}
        />
      )}

      {showRejectModal && rejectingShift && (
        <RejectModal
          shift={rejectingShift}
          onReject={onRejectWithReason}
          onCancel={onCancelRejectModal}
        />
      )}
    </>
  );
}
