import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for shop type revenue
    const currentRange = [
      { shopType: "Trong Mall", date: "2025-01-01", actualRevenue: 15000000 },
      { shopType: "Trong Mall", date: "2025-01-02", actualRevenue: 17000000 },
      { shopType: "Trong Mall", date: "2025-01-03", actualRevenue: 13000000 },
      { shopType: "Trong Mall", date: "2025-01-04", actualRevenue: 19000000 },
      { shopType: "Trong Mall", date: "2025-01-05", actualRevenue: 16000000 },
      { shopType: "Trong Mall", date: "2025-01-06", actualRevenue: 20000000 },
      { shopType: "Trong Mall", date: "2025-01-07", actualRevenue: 15000000 },
      { shopType: "Shophouse", date: "2025-01-01", actualRevenue: 8000000 },
      { shopType: "Shophouse", date: "2025-01-02", actualRevenue: 9000000 },
      { shopType: "Shophouse", date: "2025-01-03", actualRevenue: 7000000 },
      { shopType: "Shophouse", date: "2025-01-04", actualRevenue: 10000000 },
      { shopType: "Shophouse", date: "2025-01-05", actualRevenue: 8500000 },
      { shopType: "Shophouse", date: "2025-01-06", actualRevenue: 11000000 },
      { shopType: "Shophouse", date: "2025-01-07", actualRevenue: 8000000 },
      { shopType: "Nhà phố", date: "2025-01-01", actualRevenue: 5000000 },
      { shopType: "Nhà phố", date: "2025-01-02", actualRevenue: 6000000 },
      { shopType: "Nhà phố", date: "2025-01-03", actualRevenue: 4500000 },
      { shopType: "Nhà phố", date: "2025-01-04", actualRevenue: 7000000 },
      { shopType: "Nhà phố", date: "2025-01-05", actualRevenue: 5500000 },
      { shopType: "Nhà phố", date: "2025-01-06", actualRevenue: 7500000 },
      { shopType: "Nhà phố", date: "2025-01-07", actualRevenue: 5000000 },
    ];
    
    const previousRange = [
      { shopType: "Trong Mall", date: "2024-12-25", actualRevenue: 14000000 },
      { shopType: "Trong Mall", date: "2024-12-26", actualRevenue: 16000000 },
      { shopType: "Trong Mall", date: "2024-12-27", actualRevenue: 12000000 },
      { shopType: "Trong Mall", date: "2024-12-28", actualRevenue: 18000000 },
      { shopType: "Trong Mall", date: "2024-12-29", actualRevenue: 15000000 },
      { shopType: "Trong Mall", date: "2024-12-30", actualRevenue: 19000000 },
      { shopType: "Trong Mall", date: "2024-12-31", actualRevenue: 14000000 },
      { shopType: "Shophouse", date: "2024-12-25", actualRevenue: 7500000 },
      { shopType: "Shophouse", date: "2024-12-26", actualRevenue: 8500000 },
      { shopType: "Shophouse", date: "2024-12-27", actualRevenue: 6500000 },
      { shopType: "Shophouse", date: "2024-12-28", actualRevenue: 9500000 },
      { shopType: "Shophouse", date: "2024-12-29", actualRevenue: 8000000 },
      { shopType: "Shophouse", date: "2024-12-30", actualRevenue: 10500000 },
      { shopType: "Shophouse", date: "2024-12-31", actualRevenue: 7500000 },
      { shopType: "Nhà phố", date: "2024-12-25", actualRevenue: 4500000 },
      { shopType: "Nhà phố", date: "2024-12-26", actualRevenue: 5500000 },
      { shopType: "Nhà phố", date: "2024-12-27", actualRevenue: 4000000 },
      { shopType: "Nhà phố", date: "2024-12-28", actualRevenue: 6500000 },
      { shopType: "Nhà phố", date: "2024-12-29", actualRevenue: 5000000 },
      { shopType: "Nhà phố", date: "2024-12-30", actualRevenue: 7000000 },
      { shopType: "Nhà phố", date: "2024-12-31", actualRevenue: 4500000 },
    ];

    return NextResponse.json({
      currentRange,
      previousRange
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



