"use client";

import React from "react";
import { Building2, Check, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Skeleton } from "@/app/components/ui/skeleton";
import { useBranchFilter } from "@/app/contexts/BranchContext";
import {
  BRANCH_REGION_TREE,
  BRANCHES_BY_CITY,
  CITY_CONFIG,
  BranchCity,
  BranchRegion,
} from "@/app/constants/branches";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { cn } from "@/app/lib/utils";

export function BranchFilter() {
  const { stockId, setStockId, selectedBranch, isLoaded } = useBranchFilter();
  const [open, setOpen] = React.useState(false);
  const [activeRegion, setActiveRegion] = React.useState<BranchRegion>("south");
  const [activeCity, setActiveCity] = React.useState<BranchCity | null>("hcm");

  React.useEffect(() => {
    if (!open) return;
    if (selectedBranch.region !== "all" && selectedBranch.region) {
      setActiveRegion(selectedBranch.region as BranchRegion);
      setActiveCity((selectedBranch.city as BranchCity) ?? null);
    } else {
      setActiveRegion("south");
      setActiveCity("hcm");
    }
  }, [open, selectedBranch]);

  if (!isLoaded) {
    return <Skeleton className="h-10 w-40 rounded-md" />;
  }

  const handleRegionChange = (region: BranchRegion) => {
    if (region === activeRegion) return;
    const regionNode = BRANCH_REGION_TREE.find((node) => node.key === region);
    setActiveRegion(region);
    setActiveCity(regionNode?.cities[0] ?? null);
  };

  const handleCityChange = (city: BranchCity) => {
    setActiveCity(city);
  };

  const handleBranchSelect = (id: string) => {
    setStockId(id);
    setOpen(false);
  };

  const handleRegionSelect = (region: BranchRegion) => {
    setStockId(`region:${region}`);
    setOpen(false);
  };

  const handleCitySelect = (city: BranchCity) => {
    setStockId(`city:${city}`);
    setOpen(false);
  };

  const handleSelectAll = () => {
    setStockId("");
    setOpen(false);
  };

  const branchOptions = activeCity ? BRANCHES_BY_CITY[activeCity] ?? [] : [];
  const cityLabel = activeCity ? CITY_CONFIG[activeCity].label : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-orange-500 text-sm font-medium flex items-center gap-2 min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span className="truncate">
              {selectedBranch?.name ?? "Tất cả cơ sở"}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Chọn chi nhánh</DialogTitle>
          <DialogDescription>
            Lọc theo cấp độ: tổng quát &rarr; khu vực &rarr; tỉnh thành &rarr; chi
            nhánh cụ thể.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          <section className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Tất cả cơ sở
              </p>
              <p className="text-xs text-gray-500">
                Xem dữ liệu tổng hợp toàn hệ thống
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "rounded-full border-amber-500 text-amber-600",
                stockId === "" && "bg-amber-500 text-white hover:bg-amber-500"
              )}
              onClick={handleSelectAll}
            >
              Chọn tất cả
            </Button>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Khu vực
                </p>
                <p className="text-xs text-gray-500">
                  Chọn để xem tất cả chi nhánh trong khu vực
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {BRANCH_REGION_TREE.map((region) => {
                const regionStockId = `region:${region.key}`;
                const isSelected = stockId === regionStockId;
                const isActive = region.key === activeRegion;
                return (
                  <div key={region.key} className="flex items-center gap-2">
                    <button
                      type="button"
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2",
                        isSelected
                          ? "border-gray-900 bg-gray-900 text-white shadow-md"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
                        isActive && !isSelected
                          ? "ring-2 ring-orange-300 border-orange-400"
                          : ""
                      )}
                      onClick={() => {
                        // Click to select region
                        handleRegionSelect(region.key);
                      }}
                    >
                      {region.label}
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                    {!isSelected && (
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                        onClick={() => handleRegionChange(region.key)}
                        title="Xem chi tiết các tỉnh thành"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {activeRegion && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Tỉnh/Thành phố
                  </p>
                  <p className="text-xs text-gray-500">
                    Chọn để xem tất cả chi nhánh trong tỉnh/thành
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {BRANCH_REGION_TREE.find((node) => node.key === activeRegion)
                  ?.cities.map((city) => {
                    const cityStockId = `city:${city}`;
                    const isSelected = stockId === cityStockId;
                    const isActive = city === activeCity;
                    return (
                      <div key={city} className="flex items-center gap-2">
                        <button
                          type="button"
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2",
                            isSelected
                              ? "border-gray-900 bg-gray-900 text-white shadow-md"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-400",
                            isActive && !isSelected
                              ? "ring-2 ring-orange-300 border-orange-400"
                              : ""
                          )}
                          onClick={() => {
                            // Click to select city
                            handleCitySelect(city);
                          }}
                        >
                          {CITY_CONFIG[city].label}
                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                        {!isSelected && (
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                            onClick={() => handleCityChange(city)}
                            title="Xem chi tiết các chi nhánh"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {activeCity && (
            <section>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Chi nhánh tại {cityLabel}
                  </p>
                  <p className="text-xs text-gray-500">
                    Chọn 1 chi nhánh để áp dụng filter
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {branchOptions.map((option) => {
                  const isActive = option.stockId === stockId;
                  return (
                    <button
                      key={option.stockId}
                      type="button"
                      onClick={() => handleBranchSelect(option.stockId)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                        isActive
                          ? "border-gray-900 bg-gray-900 text-white shadow-lg"
                          : "border-gray-200 bg-white hover:border-gray-400"
                      )}
                    >
                      <span className="text-sm font-medium">
                        {option.name}
                      </span>
                      {isActive && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
                {branchOptions.length === 0 && (
                  <div className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-gray-500">
                    Chưa có chi nhánh trong nhóm này
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            Xóa lọc
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

