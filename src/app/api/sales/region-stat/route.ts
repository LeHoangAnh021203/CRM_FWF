import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for region statistics matching the table in the image
    const data = [
      {
        region: "Hà Nội",
        orders: 1559,
        delta: 164,
        revenue: 1035940300,
        previousRevenue: 926000000, // Tính toán để có growthPercent = 11.8
        growthPercent: 11.8,
        percentage: 16.12
      },
      {
        region: "HCM",
        orders: 7816,
        delta: -72,
        revenue: 4965124250,
        previousRevenue: 5010000000, // Tính toán để có growthPercent = -0.9
        growthPercent: -0.9,
        percentage: 77.25
      },
      {
        region: "Nha Trang",
        orders: 240,
        delta: 60,
        revenue: 158438050,
        previousRevenue: 118800000, // Tính toán để có growthPercent = 33.3
        growthPercent: 33.3,
        percentage: 2.46
      },
      {
        region: "Đà Nẵng",
        orders: 255,
        delta: 8,
        revenue: 187907500,
        previousRevenue: 182200000, // Tính toán để có growthPercent = 3.2
        growthPercent: 3.2,
        percentage: 2.92
      },
      {
        region: "Vũng Tàu",
        orders: 186,
        delta: -27,
        revenue: 80165100,
        previousRevenue: 91700000, // Tính toán để có growthPercent = -12.7
        growthPercent: -12.7,
        percentage: 1.25
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
