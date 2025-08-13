import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for service summary
    return NextResponse.json({
      totalAll: 2060,
      totalRevenue: 228250000,
      avgRevenue: 110800,
      growthPercent: 12.8,
      topService: "Restaurant",
      topRevenue: 92000000
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



