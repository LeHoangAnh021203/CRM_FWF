import { useEffect, useCallback } from 'react';

interface PageStatus {
  page: string;
  lastActivity: Date;
  dataLoaded: boolean;
  errorCount: number;
  successCount: number;
  lastError?: string;
  lastSuccess?: string;
}

// Global event emitter for real-time notifications
class NotificationEventEmitter {
  private listeners: Set<() => void> = new Set();

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit() {
    this.listeners.forEach(callback => callback());
  }
}

export const notificationEmitter = new NotificationEventEmitter();

export function usePageStatus(pageName: string) {
  // Update page status to API
  const updatePageStatus = useCallback(async (statusData: Partial<PageStatus>) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageName,
          ...statusData
        }),
      });
      
      // Emit event to trigger immediate notification update
      notificationEmitter.emit();
    } catch (error) {
      console.error('Failed to update page status:', error);
    }
  }, [pageName]);

  // Report page load success with objective status
  const reportPageLoad = useCallback((message?: string) => {
    updatePageStatus({
      dataLoaded: true,
      successCount: 1,
      lastSuccess: message || `Trang ${getPageDisplayName(pageName)} đã sẵn sàng sử dụng`
    });
  }, [updatePageStatus, pageName]);

  // Report page error with objective status
  const reportPageError = useCallback((error: string) => {
    updatePageStatus({
      errorCount: 1,
      lastError: error
    });
  }, [updatePageStatus]);

  // Report page activity with objective status
  const reportPageActivity = useCallback((activity: string) => {
    updatePageStatus({
      lastSuccess: activity
    });
  }, [updatePageStatus]);

  // Report data load success with objective metrics
  const reportDataLoadSuccess = useCallback((dataType: string, count?: number) => {
    const message = count 
      ? `Dữ liệu ${dataType}: ${count.toLocaleString()} bản ghi đã sẵn sàng`
      : `Dữ liệu ${dataType} đã được tải thành công`;
    
    updatePageStatus({
      successCount: 1,
      lastSuccess: message
    });
  }, [updatePageStatus]);

  // Report data load error with objective status
  const reportDataLoadError = useCallback((dataType: string, error: string) => {
    updatePageStatus({
      errorCount: 1,
      lastError: `Không thể tải dữ liệu ${dataType}: ${error}`
    });
  }, [updatePageStatus]);

  // Report filter changes with objective status
  const reportFilterChange = useCallback((filterType: string) => {
    updatePageStatus({
      lastSuccess: `Bộ lọc ${filterType} đã được cập nhật`
    });
  }, [updatePageStatus]);

  // Report reset filters with objective status
  const reportResetFilters = useCallback(() => {
    updatePageStatus({
      lastSuccess: 'Tất cả bộ lọc đã được đặt lại về mặc định'
    });
  }, [updatePageStatus]);

  // Report chart interactions with objective status
  const reportChartInteraction = useCallback((chartType: string, action: string) => {
    updatePageStatus({
      lastSuccess: `Biểu đồ ${chartType}: ${action}`
    });
  }, [updatePageStatus]);

  // Report page performance with objective metrics
  const reportPagePerformance = useCallback((metrics: { loadTime?: number; dataSize?: number }) => {
    let message = `Trang ${getPageDisplayName(pageName)} đã tải xong`;
    
    if (metrics.loadTime) {
      message += ` (${metrics.loadTime}ms)`;
    }
    
    if (metrics.dataSize) {
      message += ` - ${metrics.dataSize} bản ghi`;
    }
    
    updatePageStatus({
      dataLoaded: true,
      successCount: 1,
      lastSuccess: message
    });
  }, [updatePageStatus, pageName]);

  // Initialize page status on mount
  useEffect(() => {
    updatePageStatus({
      dataLoaded: false,
      errorCount: 0,
      successCount: 0
    });
  }, [updatePageStatus]);

  return {
    reportPageLoad,
    reportPageError,
    reportPageActivity,
    reportDataLoadSuccess,
    reportDataLoadError,
    reportFilterChange,
    reportResetFilters,
    reportChartInteraction,
    reportPagePerformance
  };
}

// Helper function to get display name for pages
function getPageDisplayName(pageName: string): string {
  const pageNames: { [key: string]: string } = {
    'customers': 'Khách hàng',
    'orders': 'Đơn hàng',
    'services': 'Dịch vụ',
    'dashboard': 'Tổng quan'
  };
  return pageNames[pageName] || pageName;
} 