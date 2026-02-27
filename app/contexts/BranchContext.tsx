"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useLocalStorageState } from "@/app/hooks/useLocalStorageState";
import {
  ALL_BRANCH_OPTION,
  BRANCH_FILTER_OPTIONS,
  BranchFilterOption,
} from "@/app/constants/branches";

interface BranchContextValue {
  stockId: string;
  setStockId: (value: string) => void;
  selectedBranch: BranchFilterOption;
  isLoaded: boolean;
}

const BranchContext = createContext<BranchContextValue | undefined>(undefined);

interface BranchProviderProps {
  children: React.ReactNode;
}

export function BranchProvider({ children }: BranchProviderProps) {
  const [stockId, setStockId, isLoaded] = useLocalStorageState<string>(
    "global-branch-stock-id",
    ""
  );

  const selectedBranch = useMemo(() => {
    return (
      BRANCH_FILTER_OPTIONS.find((option) => option.stockId === stockId) ||
      ALL_BRANCH_OPTION
    );
  }, [stockId]);

  const value = useMemo<BranchContextValue>(
    () => ({
      stockId,
      setStockId,
      selectedBranch,
      isLoaded,
    }),
    [stockId, setStockId, selectedBranch, isLoaded]
  );

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  );
}

export function useBranchFilter() {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranchFilter must be used within a BranchProvider");
  }
  return context;
}


