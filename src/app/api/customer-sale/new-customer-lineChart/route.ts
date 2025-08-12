import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for new customer line chart
    const currentRange = [
      { date: '2025-01-01', count: 45 },
      { date: '2025-01-02', count: 52 },
      { date: '2025-01-03', count: 38 },
      { date: '2025-01-04', count: 61 },
      { date: '2025-01-05', count: 47 },
      { date: '2025-01-06', count: 55 },
      { date: '2025-01-07', count: 42 },
    ];
    
    const previousRange = [
      { date: '2024-12-25', count: 40 },
      { date: '2024-12-26', count: 48 },
      { date: '2024-12-27', count: 35 },
      { date: '2024-12-28', count: 58 },
      { date: '2024-12-29', count: 43 },
      { date: '2024-12-30', count: 50 },
      { date: '2024-12-31', count: 39 },
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


