import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromDate, toDate } = await request.json();
    
    // Mock data for region actual pie
    return NextResponse.json({
      currentRange: [
        { shopType: "HCM", date: "2025-01-01", totalRevenue: 25000000 },
        { shopType: "Hà Nội", date: "2025-01-01", totalRevenue: 18000000 },
        { shopType: "Đà Nẵng", date: "2025-01-01", totalRevenue: 12000000 },
        { shopType: "Nha Trang", date: "2025-01-01", totalRevenue: 8000000 },
        { shopType: "Vũng Tàu", date: "2025-01-01", totalRevenue: 5000000 },
      ],
      previousRange: [
        { shopType: "HCM", date: "2024-12-25", totalRevenue: 24000000 },
        { shopType: "Hà Nội", date: "2024-12-25", totalRevenue: 17000000 },
        { shopType: "Đà Nẵng", date: "2024-12-25", totalRevenue: 11000000 },
        { shopType: "Nha Trang", date: "2024-12-25", totalRevenue: 7500000 },
        { shopType: "Vũng Tàu", date: "2024-12-25", totalRevenue: 4500000 },
      ],
      totalRevenue: 68000000,
      actualRevenue: 65000000,
      revenueGrowth: 12.5,
      actualGrowth: 15.2
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

