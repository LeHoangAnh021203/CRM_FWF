import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromDate, toDate } = await request.json();
    
    // Mock data for payment percent old
    return NextResponse.json({
      totalCash: 4200000,
      totalTransfer: 3000000,
      totalPrepaidCard: 1600000,
      totalDebt: 400000
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

