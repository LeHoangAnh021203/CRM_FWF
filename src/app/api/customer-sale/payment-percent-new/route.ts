import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for payment percent new
    return NextResponse.json({
      totalCash: 4500000,
      totalTransfer: 3200000,
      totalPrepaidCard: 1800000,
      totalDebt: 500000,
      percentCash: 45.0,
      percentTransfer: 32.0,
      percentPrepaidCard: 18.0,
      percentDebt: 5.0
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


