import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data for dashboard revenue
    const data = [
      { date: '2025-01-01', revenue: 25000000 },
      { date: '2025-01-02', revenue: 28000000 },
      { date: '2025-01-03', revenue: 22000000 },
      { date: '2025-01-04', revenue: 32000000 },
      { date: '2025-01-05', revenue: 29000000 },
      { date: '2025-01-06', revenue: 35000000 },
      { date: '2025-01-07', revenue: 27000000 },
    ];

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

