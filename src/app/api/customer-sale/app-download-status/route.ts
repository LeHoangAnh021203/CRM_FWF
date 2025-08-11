import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromDate, toDate } = await request.json();
    
    // Mock data for app download status
    const data = {
      "Downloaded": [
        { date: '2025-01-01', count: 85 },
        { date: '2025-01-02', count: 92 },
        { date: '2025-01-03', count: 78 },
        { date: '2025-01-04', count: 105 },
        { date: '2025-01-05', count: 95 },
        { date: '2025-01-06', count: 112 },
        { date: '2025-01-07', count: 88 },
      ],
      "Not Downloaded": [
        { date: '2025-01-01', count: 45 },
        { date: '2025-01-02', count: 52 },
        { date: '2025-01-03', count: 38 },
        { date: '2025-01-04', count: 61 },
        { date: '2025-01-05', count: 47 },
        { date: '2025-01-06', count: 55 },
        { date: '2025-01-07', count: 42 },
      ]
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

