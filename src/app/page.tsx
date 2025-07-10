import { StatsCards } from "@/components/stats-cards"
import { RevenueChart } from "@/components/revenue-chart"
import { RecentActivity } from "@/components/recent-activity"
import { TasksWidget } from "@/components/tasks-widget"
import { CustomerInsights } from "@/components/customer-insights"
import { QuickActions } from "@/components/quick-actions"

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your business today.</p>
      </div>

      <QuickActions />
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <CustomerInsights />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <TasksWidget />
        <RecentActivity />
      </div>
    </div>
  )
}
