import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for customer source trend
    const data = {
      "Website": [
        { date: '2025-01-01', count: 85 },
        { date: '2025-01-02', count: 92 },
        { date: '2025-01-03', count: 78 },
        { date: '2025-01-04', count: 105 },
        { date: '2025-01-05', count: 95 },
        { date: '2025-01-06', count: 112 },
        { date: '2025-01-07', count: 88 },
      ],
      "Mobile App": [
        { date: '2025-01-01', count: 120 },
        { date: '2025-01-02', count: 135 },
        { date: '2025-01-03', count: 98 },
        { date: '2025-01-04', count: 156 },
        { date: '2025-01-05', count: 142 },
        { date: '2025-01-06', count: 168 },
        { date: '2025-01-07', count: 134 },
      ],
      "Social Media": [
        { date: '2025-01-01', count: 45 },
        { date: '2025-01-02', count: 52 },
        { date: '2025-01-03', count: 38 },
        { date: '2025-01-04', count: 61 },
        { date: '2025-01-05', count: 47 },
        { date: '2025-01-06', count: 55 },
        { date: '2025-01-07', count: 42 },
      ],
      "Referral": [
        { date: '2025-01-01', count: 30 },
        { date: '2025-01-02', count: 35 },
        { date: '2025-01-03', count: 28 },
        { date: '2025-01-04', count: 42 },
        { date: '2025-01-05', count: 38 },
        { date: '2025-01-06', count: 45 },
        { date: '2025-01-07', count: 36 },
      ]
    };

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

