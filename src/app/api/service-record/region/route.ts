import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for service region
    const data = [
      {
        region: "HCM",
        totalServices: 850,
        revenue: 95000000,
        avgRevenue: 111765,
        growthPercent: 15.2
      },
      {
        region: "Hà Nội",
        totalServices: 620,
        revenue: 68000000,
        avgRevenue: 109677,
        growthPercent: 12.8
      },
      {
        region: "Đà Nẵng",
        totalServices: 350,
        revenue: 38000000,
        avgRevenue: 108571,
        growthPercent: 8.5
      },
      {
        region: "Nha Trang",
        totalServices: 240,
        revenue: 27250000,
        avgRevenue: 113542,
        growthPercent: 6.2
      }
    ];

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



