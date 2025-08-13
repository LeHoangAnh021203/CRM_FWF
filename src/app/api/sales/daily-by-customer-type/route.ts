import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for daily by customer type
    const data = [
      { date: "2025-01-01", customerType: "KH trải nghiệm", revenue: 12000000 },
      { date: "2025-01-01", customerType: "Khách hàng Iron", revenue: 8000000 },
      { date: "2025-01-01", customerType: "Khách hàng Silver", revenue: 5000000 },
      { date: "2025-01-02", customerType: "KH trải nghiệm", revenue: 13500000 },
      { date: "2025-01-02", customerType: "Khách hàng Iron", revenue: 9000000 },
      { date: "2025-01-02", customerType: "Khách hàng Silver", revenue: 5500000 },
      { date: "2025-01-03", customerType: "KH trải nghiệm", revenue: 9800000 },
      { date: "2025-01-03", customerType: "Khách hàng Iron", revenue: 6500000 },
      { date: "2025-01-03", customerType: "Khách hàng Silver", revenue: 4200000 },
      { date: "2025-01-04", customerType: "KH trải nghiệm", revenue: 15600000 },
      { date: "2025-01-04", customerType: "Khách hàng Iron", revenue: 10500000 },
      { date: "2025-01-04", customerType: "Khách hàng Silver", revenue: 6800000 },
      { date: "2025-01-05", customerType: "KH trải nghiệm", revenue: 14200000 },
      { date: "2025-01-05", customerType: "Khách hàng Iron", revenue: 9500000 },
      { date: "2025-01-05", customerType: "Khách hàng Silver", revenue: 6200000 },
      { date: "2025-01-06", customerType: "KH trải nghiệm", revenue: 16800000 },
      { date: "2025-01-06", customerType: "Khách hàng Iron", revenue: 11200000 },
      { date: "2025-01-06", customerType: "Khách hàng Silver", revenue: 7200000 },
      { date: "2025-01-07", customerType: "KH trải nghiệm", revenue: 13400000 },
      { date: "2025-01-07", customerType: "Khách hàng Iron", revenue: 8900000 },
      { date: "2025-01-07", customerType: "Khách hàng Silver", revenue: 5800000 },
    ];

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



