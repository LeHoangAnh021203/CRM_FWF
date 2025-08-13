import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for revenue summary
    return NextResponse.json({
      currentRange: [
        { shopType: "Trong Mall", date: "2025-01-01", totalRevenue: 15000000 },
        { shopType: "Shophouse", date: "2025-01-01", totalRevenue: 8000000 },
        { shopType: "Nhà phố", date: "2025-01-01", totalRevenue: 5000000 },
      ],
      previousRange: [
        { shopType: "Trong Mall", date: "2024-12-25", totalRevenue: 14000000 },
        { shopType: "Shophouse", date: "2024-12-25", totalRevenue: 7500000 },
        { shopType: "Nhà phố", date: "2024-12-25", totalRevenue: 4500000 },
      ],
      totalRevenue: 28000000,
      actualRevenue: 25000000,
      revenueGrowth: 12.5,
      actualGrowth: 15.2
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



