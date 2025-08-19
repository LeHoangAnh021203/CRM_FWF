import { lazy } from "react";

// Lazy load all dashboard components
export const StatsCards = lazy(() => import("@/components/stats-cards").then(module => ({ default: module.StatsCards })));
export const RevenueChart = lazy(() => import("@/components/revenue-chart").then(module => ({ default: module.RevenueChart })));
export const RecentActivity = lazy(() => import("@/components/recent-activity").then(module => ({ default: module.RecentActivity })));
export const TasksWidget = lazy(() => import("@/components/tasks-widget").then(module => ({ default: module.TasksWidget })));
export const CustomerInsights = lazy(() => import("@/components/customer-insights").then(module => ({ default: module.CustomerInsights })));
export const QuickActions = lazy(() => import("@/components/quick-actions").then(module => ({ default: module.QuickActions })));
