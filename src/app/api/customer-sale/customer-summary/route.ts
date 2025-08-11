import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromDate, toDate } = await request.json();
    
    // Mock data for customer summary
    return NextResponse.json({
      totalNewCustomers: 1250,
      actualCustomers: 980,
      growthTotal: 15.2,
      growthActual: 12.8
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

