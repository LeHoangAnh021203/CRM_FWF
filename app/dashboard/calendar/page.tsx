"use client";

import { useState, useEffect } from "react";
import { useLocalStorageState } from "@/app/hooks/useLocalStorageState";
import type { Employee, Shift, ShiftTemplate } from "./types";
import { sampleEmployees, sampleShifts, sampleTemplates } from "./data";
import { buildFilteredShifts, buildUniquePositions } from "./helpers";
import { CalendarHeaderSection } from "./sections/header/CalendarHeaderSection";
import { CalendarTabsSection } from "./sections/tabs/CalendarTabsSection";

export interface ApprovalHistory {
  id: string;
  action: "approved" | "rejected" | "pending";
  approvedBy: string;
  approvedAt: string;
  reason?: string;
  previousStatus?: "pending" | "approved" | "rejected";
}

export default function WorkSchedulePage() {
  const [employees, setEmployees, employeesLoaded] = useLocalStorageState<
    Employee[]
  >("calendar-employees", []);

  // Đảm bảo luôn có dữ liệu mẫu employees khi khởi tạo
  useEffect(() => {
    if (employeesLoaded && employees.length === 0) {
      setEmployees(sampleEmployees);
    }
  }, [employeesLoaded, employees.length, setEmployees]);

  const [shiftTemplates, setShiftTemplates, templatesLoaded] =
    useLocalStorageState<ShiftTemplate[]>("calendar-templates", []);

  // Đảm bảo luôn có dữ liệu mẫu templates khi khởi tạo
  useEffect(() => {
    if (templatesLoaded && shiftTemplates.length === 0) {
      setShiftTemplates(sampleTemplates);
    }
  }, [templatesLoaded, shiftTemplates.length, setShiftTemplates]);

  const [shifts, setShifts, shiftsLoaded] = useLocalStorageState<Shift[]>(
    "calendar-shifts",
    [],
  );

  // Đảm bảo luôn có dữ liệu mẫu khi khởi tạo
  useEffect(() => {
    if (shiftsLoaded && shifts.length === 0) {
      setShifts(sampleShifts);
    }
  }, [shiftsLoaded, shifts.length, setShifts]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingShift, setRejectingShift] = useState<Shift | null>(null);

  const [searchTerm, setSearchTerm] = useLocalStorageState<string>(
    "calendar-search",
    "",
  );
  const [statusFilter, setStatusFilter] = useLocalStorageState<string>(
    "calendar-status-filter",
    "all",
  );
  const [positionFilter, setPositionFilter] = useLocalStorageState<string>(
    "calendar-position-filter",
    "all",
  );

  const handleAddShift = (
    shiftData: Omit<Shift, "id" | "status" | "approvalHistory" | "submittedAt">,
  ) => {
    console.log("Received shift data:", shiftData); // Debug log
    console.log("Date from form:", shiftData.date); // Debug log
    console.log("Selected date:", selectedDate.toLocaleDateString("en-CA")); // Debug log

    const newShift: Shift = {
      ...shiftData,
      id: Date.now().toString(),
      status: "pending",
      approvalHistory: [],
      priority: shiftData.priority || "normal",
      submittedAt: new Date().toISOString(),
    };
    console.log("Created new shift:", newShift); // Debug log
    console.log("New shift date:", newShift.date); // Debug log
    const updatedShifts = [...shifts, newShift];
    console.log("Updated shifts array:", updatedShifts); // Debug log
    setShifts(updatedShifts);
    setShowShiftForm(false);
  };

  const handleEditShift = (
    shiftData: Omit<Shift, "id" | "status" | "approvalHistory" | "submittedAt">,
  ) => {
    if (editingShift) {
      const updatedShift = {
        ...editingShift,
        ...shiftData,
        approvalHistory: editingShift.approvalHistory,
        submittedAt: editingShift.submittedAt,
      };
      setShifts(
        shifts.map((shift) =>
          shift.id === editingShift.id ? updatedShift : shift,
        ),
      );
      setEditingShift(null);
      setShowShiftForm(false);
    }
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts(shifts.filter((shift) => shift.id !== shiftId));
  };

  const handleApproveShift = (shiftId: string) => {
    setShifts(
      shifts.map((shift) => {
        if (shift.id === shiftId) {
          const newHistory: ApprovalHistory = {
            id: Date.now().toString(),
            action: "approved",
            approvedBy: "Quản lý hệ thống",
            approvedAt: new Date().toISOString(),
            previousStatus: shift.status,
          };

          return {
            ...shift,
            status: "approved" as const,
            approvalHistory: [...(shift.approvalHistory || []), newHistory],
            rejectionReason: undefined,
          };
        }
        return shift;
      }),
    );
  };

  const handleRejectShift = (shiftId: string, reason?: string) => {
    setShifts(
      shifts.map((shift) => {
        if (shift.id === shiftId) {
          const newHistory: ApprovalHistory = {
            id: Date.now().toString(),
            action: "rejected",
            approvedBy: "Quản lý hệ thống",
            approvedAt: new Date().toISOString(),
            reason,
            previousStatus: shift.status,
          };

          return {
            ...shift,
            status: "rejected" as const,
            approvalHistory: [...(shift.approvalHistory || []), newHistory],
            rejectionReason: reason,
          };
        }
        return shift;
      }),
    );
  };

  const handleBulkApprove = (shiftIds: string[]) => {
    setShifts(
      shifts.map((shift) => {
        if (shiftIds.includes(shift.id) && shift.status === "pending") {
          const newHistory: ApprovalHistory = {
            id: Date.now().toString(),
            action: "approved",
            approvedBy: "Quản lý hệ thống",
            approvedAt: new Date().toISOString(),
            previousStatus: shift.status,
          };
          return {
            ...shift,
            status: "approved" as const,
            approvalHistory: [...(shift.approvalHistory || []), newHistory],
          };
        }
        return shift;
      }),
    );
  };

  const handleDuplicateShift = (shift: Shift) => {
    const newShift: Shift = {
      ...shift,
      id: Date.now().toString(),
      status: "pending",
      date: shift.date, // Giữ nguyên ngày của shift gốc
      approvalHistory: [],
      submittedAt: new Date().toISOString(),
      rejectionReason: undefined,
    };
    setShifts([...shifts, newShift]);
  };

  const handleClearAllData = () => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.",
      )
    ) {
      // Xóa tất cả localStorage keys
      localStorage.removeItem("calendar-employees");
      localStorage.removeItem("calendar-templates");
      localStorage.removeItem("calendar-shifts");
      localStorage.removeItem("calendar-search");
      localStorage.removeItem("calendar-status-filter");
      localStorage.removeItem("calendar-position-filter");

      // Reload trang để load lại dữ liệu mẫu
      window.location.reload();
    }
  };

  const openEditForm = (shift: Shift) => {
    setEditingShift(shift);
    setShowShiftForm(true);
  };

  const closeForm = () => {
    setShowShiftForm(false);
    setEditingShift(null);
  };

  const openRejectModal = (shift: Shift) => {
    setRejectingShift(shift);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectingShift(null);
  };

  const handleRejectWithReason = (reason: string) => {
    if (rejectingShift) {
      handleRejectShift(rejectingShift.id, reason);
      closeRejectModal();
    }
  };

  const filteredShifts = buildFilteredShifts(
    shifts,
    searchTerm,
    statusFilter,
    positionFilter
  );

  const uniquePositions = buildUniquePositions(shifts);

  // Check if all data is loaded to prevent hydration mismatch
  const isDataLoaded = employeesLoaded && templatesLoaded && shiftsLoaded;

  // Show loading state until data is loaded
  if (!isDataLoaded) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <CalendarHeaderSection onClearAllData={handleClearAllData} />
      <CalendarTabsSection
        employees={employees}
        setEmployees={setEmployees}
        shiftTemplates={shiftTemplates}
        setShiftTemplates={setShiftTemplates}
        shifts={shifts}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onOpenShiftForm={() => setShowShiftForm(true)}
        onEditShift={openEditForm}
        onDeleteShift={handleDeleteShift}
        onApproveShift={handleApproveShift}
        onRejectShift={openRejectModal}
        onDuplicateShift={handleDuplicateShift}
        onBulkApprove={handleBulkApprove}
        onAddTestShift={() => {
          const testShift: Shift = {
            id: Date.now().toString(),
            employeeName: "Test Employee",
            employeeId: "test",
            date: "2025-08-02",
            startTime: "10:00",
            endTime: "18:00",
            position: "Test Position",
            status: "pending",
            approvalHistory: [],
            priority: "normal",
            submittedAt: new Date().toISOString(),
          };
          console.log("Adding test shift for day 2:", testShift);
          setShifts([...shifts, testShift]);
        }}
        onResetShiftData={() => {
          if (confirm("Bạn có muốn reset về dữ liệu mẫu?")) {
            localStorage.removeItem("calendar-shifts");
            window.location.reload();
          }
        }}
        onAddTestEmployee={() => {
          const testEmployee: Employee = {
            id: Date.now().toString(),
            name: "Test Employee",
            position: "Test Position",
            email: "test@email.com",
            phone: "0123456789",
            isActive: true,
          };
          console.log("Adding test employee:", testEmployee);
          console.log("Current employees:", employees);
          setEmployees([...employees, testEmployee]);
          console.log("Updated employees:", [...employees, testEmployee]);
        }}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        positionFilter={positionFilter}
        onPositionFilterChange={setPositionFilter}
        uniquePositions={uniquePositions}
        filteredShifts={filteredShifts}
        showShiftForm={showShiftForm}
        editingShift={editingShift}
        shiftFormDate={selectedDate.toLocaleDateString("en-CA")}
        onSubmitShift={editingShift ? handleEditShift : handleAddShift}
        onCancelShiftForm={closeForm}
        showRejectModal={showRejectModal}
        rejectingShift={rejectingShift}
        onRejectWithReason={handleRejectWithReason}
        onCancelRejectModal={closeRejectModal}
      />
    </div>
  );
}
