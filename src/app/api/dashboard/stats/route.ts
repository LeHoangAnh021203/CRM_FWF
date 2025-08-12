import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for dashboard stats
    return NextResponse.json({
      totalRevenue: 68000000,
      totalOrders: 1250,
      totalCustomers: 850,
      totalServices: 2060,
      revenueGrowth: 12.5,
      ordersGrowth: 15.2,
      customersGrowth: 8.8,
      servicesGrowth: 10.5
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


