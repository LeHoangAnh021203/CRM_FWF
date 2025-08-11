import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromDate, toDate } = await request.json();
    
    // Mock data for service type breakdown
    const data = [
      {
        serviceType: "Spa",
        totalServices: 485,
        revenue: 48500000,
        avgRevenue: 100000,
        growthPercent: 12.5
      },
      {
        serviceType: "Gym",
        totalServices: 515,
        revenue: 25750000,
        avgRevenue: 50000,
        growthPercent: 8.2
      },
      {
        serviceType: "Restaurant",
        totalServices: 460,
        revenue: 92000000,
        avgRevenue: 200000,
        growthPercent: 15.8
      },
      {
        serviceType: "Beauty Salon",
        totalServices: 320,
        revenue: 48000000,
        avgRevenue: 150000,
        growthPercent: 10.5
      },
      {
        serviceType: "Swimming Pool",
        totalServices: 280,
        revenue: 14000000,
        avgRevenue: 50000,
        growthPercent: 6.8
      }
    ];

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

