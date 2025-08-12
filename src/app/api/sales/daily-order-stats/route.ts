import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for daily order stats
    const data = [
      { date: "2025-01-01", customerType: "KH trải nghiệm", revenue: 12000000, totalOrders: 240, avgOrdersPerShop: 8 },
      { date: "2025-01-02", customerType: "KH trải nghiệm", revenue: 13500000, totalOrders: 270, avgOrdersPerShop: 9 },
      { date: "2025-01-03", customerType: "KH trải nghiệm", revenue: 9800000, totalOrders: 196, avgOrdersPerShop: 7 },
      { date: "2025-01-04", customerType: "KH trải nghiệm", revenue: 15600000, totalOrders: 312, avgOrdersPerShop: 10 },
      { date: "2025-01-05", customerType: "KH trải nghiệm", revenue: 14200000, totalOrders: 284, avgOrdersPerShop: 9 },
      { date: "2025-01-06", customerType: "KH trải nghiệm", revenue: 16800000, totalOrders: 336, avgOrdersPerShop: 11 },
      { date: "2025-01-07", customerType: "KH trải nghiệm", revenue: 13400000, totalOrders: 268, avgOrdersPerShop: 9 },
    ];

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


