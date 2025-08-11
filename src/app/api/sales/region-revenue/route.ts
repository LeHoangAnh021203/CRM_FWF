import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromDate, toDate } = await request.json();
    
    // Mock data for region revenue
    const currentRange = [
      { region: "HCM", date: "2025-01-01", totalRevenue: 25000000 },
      { region: "HCM", date: "2025-01-02", totalRevenue: 28000000 },
      { region: "HCM", date: "2025-01-03", totalRevenue: 22000000 },
      { region: "HCM", date: "2025-01-04", totalRevenue: 32000000 },
      { region: "HCM", date: "2025-01-05", totalRevenue: 29000000 },
      { region: "HCM", date: "2025-01-06", totalRevenue: 35000000 },
      { region: "HCM", date: "2025-01-07", totalRevenue: 27000000 },
      { region: "Hà Nội", date: "2025-01-01", totalRevenue: 18000000 },
      { region: "Hà Nội", date: "2025-01-02", totalRevenue: 20000000 },
      { region: "Hà Nội", date: "2025-01-03", totalRevenue: 16000000 },
      { region: "Hà Nội", date: "2025-01-04", totalRevenue: 22000000 },
      { region: "Hà Nội", date: "2025-01-05", totalRevenue: 19000000 },
      { region: "Hà Nội", date: "2025-01-06", totalRevenue: 24000000 },
      { region: "Hà Nội", date: "2025-01-07", totalRevenue: 18000000 },
      { region: "Đà Nẵng", date: "2025-01-01", totalRevenue: 12000000 },
      { region: "Đà Nẵng", date: "2025-01-02", totalRevenue: 14000000 },
      { region: "Đà Nẵng", date: "2025-01-03", totalRevenue: 11000000 },
      { region: "Đà Nẵng", date: "2025-01-04", totalRevenue: 16000000 },
      { region: "Đà Nẵng", date: "2025-01-05", totalRevenue: 13000000 },
      { region: "Đà Nẵng", date: "2025-01-06", totalRevenue: 18000000 },
      { region: "Đà Nẵng", date: "2025-01-07", totalRevenue: 14000000 },
    ];
    
    const previousRange = [
      { region: "HCM", date: "2024-12-25", totalRevenue: 24000000 },
      { region: "HCM", date: "2024-12-26", totalRevenue: 27000000 },
      { region: "HCM", date: "2024-12-27", totalRevenue: 21000000 },
      { region: "HCM", date: "2024-12-28", totalRevenue: 31000000 },
      { region: "HCM", date: "2024-12-29", totalRevenue: 28000000 },
      { region: "HCM", date: "2024-12-30", totalRevenue: 34000000 },
      { region: "HCM", date: "2024-12-31", totalRevenue: 26000000 },
      { region: "Hà Nội", date: "2024-12-25", totalRevenue: 17000000 },
      { region: "Hà Nội", date: "2024-12-26", totalRevenue: 19000000 },
      { region: "Hà Nội", date: "2024-12-27", totalRevenue: 15000000 },
      { region: "Hà Nội", date: "2024-12-28", totalRevenue: 21000000 },
      { region: "Hà Nội", date: "2024-12-29", totalRevenue: 18000000 },
      { region: "Hà Nội", date: "2024-12-30", totalRevenue: 23000000 },
      { region: "Hà Nội", date: "2024-12-31", totalRevenue: 17000000 },
      { region: "Đà Nẵng", date: "2024-12-25", totalRevenue: 11000000 },
      { region: "Đà Nẵng", date: "2024-12-26", totalRevenue: 13000000 },
      { region: "Đà Nẵng", date: "2024-12-27", totalRevenue: 10000000 },
      { region: "Đà Nẵng", date: "2024-12-28", totalRevenue: 15000000 },
      { region: "Đà Nẵng", date: "2024-12-29", totalRevenue: 12000000 },
      { region: "Đà Nẵng", date: "2024-12-30", totalRevenue: 17000000 },
      { region: "Đà Nẵng", date: "2024-12-31", totalRevenue: 13000000 },
    ];

    return NextResponse.json({
      currentRange,
      previousRange
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

