import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromDate, toDate } = await request.json();
    
    // Mock data for daily region revenue
    return NextResponse.json({
      currentRange: [
        { shopType: "HCM", date: "2025-01-01", totalRevenue: 25000000 },
        { shopType: "HCM", date: "2025-01-02", totalRevenue: 28000000 },
        { shopType: "HCM", date: "2025-01-03", totalRevenue: 22000000 },
        { shopType: "HCM", date: "2025-01-04", totalRevenue: 32000000 },
        { shopType: "HCM", date: "2025-01-05", totalRevenue: 29000000 },
        { shopType: "HCM", date: "2025-01-06", totalRevenue: 35000000 },
        { shopType: "HCM", date: "2025-01-07", totalRevenue: 27000000 },
        { shopType: "Hà Nội", date: "2025-01-01", totalRevenue: 18000000 },
        { shopType: "Hà Nội", date: "2025-01-02", totalRevenue: 20000000 },
        { shopType: "Hà Nội", date: "2025-01-03", totalRevenue: 16000000 },
        { shopType: "Hà Nội", date: "2025-01-04", totalRevenue: 22000000 },
        { shopType: "Hà Nội", date: "2025-01-05", totalRevenue: 19000000 },
        { shopType: "Hà Nội", date: "2025-01-06", totalRevenue: 24000000 },
        { shopType: "Hà Nội", date: "2025-01-07", totalRevenue: 18000000 },
      ],
      previousRange: [
        { shopType: "HCM", date: "2024-12-25", totalRevenue: 24000000 },
        { shopType: "HCM", date: "2024-12-26", totalRevenue: 27000000 },
        { shopType: "HCM", date: "2024-12-27", totalRevenue: 21000000 },
        { shopType: "HCM", date: "2024-12-28", totalRevenue: 31000000 },
        { shopType: "HCM", date: "2024-12-29", totalRevenue: 28000000 },
        { shopType: "HCM", date: "2024-12-30", totalRevenue: 34000000 },
        { shopType: "HCM", date: "2024-12-31", totalRevenue: 26000000 },
        { shopType: "Hà Nội", date: "2024-12-25", totalRevenue: 17000000 },
        { shopType: "Hà Nội", date: "2024-12-26", totalRevenue: 19000000 },
        { shopType: "Hà Nội", date: "2024-12-27", totalRevenue: 15000000 },
        { shopType: "Hà Nội", date: "2024-12-28", totalRevenue: 21000000 },
        { shopType: "Hà Nội", date: "2024-12-29", totalRevenue: 18000000 },
        { shopType: "Hà Nội", date: "2024-12-30", totalRevenue: 23000000 },
        { shopType: "Hà Nội", date: "2024-12-31", totalRevenue: 17000000 },
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

