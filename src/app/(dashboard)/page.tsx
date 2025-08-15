"use client";

import { Suspense, useEffect, useRef } from "react";
import {
  StatsCards,
  RevenueChart,
  RecentActivity,
  TasksWidget,
  CustomerInsights,
  QuickActions,
} from "./lazy-components";
import { Notification, useNotification } from "@/components/notification";
import { usePageStatus } from "@/hooks/usePageStatus";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const hasShownSuccess = useRef(false);
  const hasShownError = useRef(false);
  const { 
    reportPageError, 
    reportDataLoadSuccess, 
    reportPagePerformance,
    reportDataLoadError
  } = usePageStatus('dashboard');

  const { 
    loading, 
    error, 
    apiErrors, 
    apiSuccesses 
  } = useDashboardData();

  // Monitor API success notifications
  useEffect(() => {
    if (apiSuccesses.length > 0 && !hasShownSuccess.current) {
      const successMessage = apiSuccesses.length === 1 
        ? apiSuccesses[0] 
        : `${apiSuccesses.length} data sources loaded successfully`;
      
      showSuccess(successMessage);
      hasShownSuccess.current = true;
      reportDataLoadSuccess("dashboard", apiSuccesses.length);
    }
  }, [apiSuccesses, showSuccess, reportDataLoadSuccess]);

  // Monitor API error notifications
  useEffect(() => {
    if (apiErrors.length > 0 && !hasShownError.current) {
      const errorMessage = apiErrors.length === 1 
        ? apiErrors[0] 
        : `${apiErrors.length} data sources failed to load`;
      
      showError(errorMessage);
      hasShownError.current = true;
      reportDataLoadError("dashboard", errorMessage);
    }
  }, [apiErrors, showError, reportDataLoadError]);

  // Monitor general error
  useEffect(() => {
    if (error && !hasShownError.current) {
      showError(error);
      hasShownError.current = true;
      reportPageError(error);
    }
  }, [error, showError, reportPageError]);

  // Report page performance
  useEffect(() => {
    if (!loading) {
      reportPagePerformance({ loadTime: 2000 });
    }
  }, [loading, reportPagePerformance]);

  return (
    <div className="p-3 sm:p-6">
      {/* Notification Component */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="mb-3 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 flex flex-wrap items-center gap-[3px] text-sm sm:text-base">
          Welcome back! Here&apos;s what&apos;s happening with{" "}
          <span className="text-orange-500 flex">Face Wash Fox</span> today.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        }
      >
        <QuickActions />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <StatsCards />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 mt-6">
        <div className="lg:col-span-2">
          <Suspense
            fallback={
              <div className="bg-white rounded-lg shadow p-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
            }
          >
            <RevenueChart />
          </Suspense>
        </div>
        <Suspense
          fallback={
            <div className="bg-white rounded-lg shadow p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-36"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <CustomerInsights />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mt-6">
        <Suspense
          fallback={
            <div className="bg-white rounded-lg shadow p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-24"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <TasksWidget />
        </Suspense>
        <Suspense
          fallback={
            <div className="bg-white rounded-lg shadow p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <RecentActivity />
        </Suspense>
      </div>
    </div>
  );
}
