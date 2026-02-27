import type { Shift } from "./types";

export const buildFilteredShifts = (
  shifts: Shift[],
  searchTerm: string,
  statusFilter: string,
  positionFilter: string
) =>
  shifts.filter((shift) => {
    const matchesSearch =
      shift.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || shift.status === statusFilter;
    const matchesPosition =
      positionFilter === "all" || shift.position === positionFilter;

    return matchesSearch && matchesStatus && matchesPosition;
  });

export const buildUniquePositions = (shifts: Shift[]) =>
  Array.from(new Set(shifts.map((shift) => shift.position)));
