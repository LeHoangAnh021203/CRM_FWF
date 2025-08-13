import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for region stats
    const data = [
      {
        region: "HCM",
        orders: 1250,
        delta: 150,
        revenue: 25000000,
        growthPercent: 12.5
      },
      {
        region: "Hà Nội",
        orders: 850,
        delta: 100,
        revenue: 18000000,
        growthPercent: 15.2
      },
      {
        region: "Đà Nẵng",
        orders: 450,
        delta: 50,
        revenue: 12000000,
        growthPercent: 8.5
      },
      {
        region: "Nha Trang",
        orders: 300,
        delta: 25,
        revenue: 8000000,
        growthPercent: 5.2
      },
      {
        region: "Đã Đóng Cửa",
        orders: 0,
        delta: -50,
        revenue: 0,
        growthPercent: -100
      },
      {
        region: "Vũng Tàu",
        orders: 200,
        delta: 30,
        revenue: 5000000,
        growthPercent: 18.5
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



