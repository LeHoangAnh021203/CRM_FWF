import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for customer type trend
    const data = {
      "KH trải nghiệm": [
        { date: '2025-01-01', count: 120 },
        { date: '2025-01-02', count: 135 },
        { date: '2025-01-03', count: 98 },
        { date: '2025-01-04', count: 156 },
        { date: '2025-01-05', count: 142 },
        { date: '2025-01-06', count: 168 },
        { date: '2025-01-07', count: 134 },
      ],
      "Khách hàng Iron": [
        { date: '2025-01-01', count: 45 },
        { date: '2025-01-02', count: 52 },
        { date: '2025-01-03', count: 38 },
        { date: '2025-01-04', count: 61 },
        { date: '2025-01-05', count: 47 },
        { date: '2025-01-06', count: 55 },
        { date: '2025-01-07', count: 42 },
      ],
      "Khách hàng Silver": [
        { date: '2025-01-01', count: 30 },
        { date: '2025-01-02', count: 35 },
        { date: '2025-01-03', count: 28 },
        { date: '2025-01-04', count: 42 },
        { date: '2025-01-05', count: 38 },
        { date: '2025-01-06', count: 45 },
        { date: '2025-01-07', count: 36 },
      ],
      "Khách hàng Bronze": [
        { date: '2025-01-01', count: 20 },
        { date: '2025-01-02', count: 25 },
        { date: '2025-01-03', count: 18 },
        { date: '2025-01-04', count: 32 },
        { date: '2025-01-05', count: 28 },
        { date: '2025-01-06', count: 35 },
        { date: '2025-01-07', count: 26 },
      ],
      "Khách hàng Diamond": [
        { date: '2025-01-01', count: 15 },
        { date: '2025-01-02', count: 18 },
        { date: '2025-01-03', count: 12 },
        { date: '2025-01-04', count: 25 },
        { date: '2025-01-05', count: 22 },
        { date: '2025-01-06', count: 28 },
        { date: '2025-01-07', count: 20 },
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

