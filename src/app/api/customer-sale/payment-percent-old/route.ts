import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for payment percent old
    return NextResponse.json({
      totalCash: 4200000,
      totalTransfer: 3000000,
      totalPrepaidCard: 1600000,
      totalDebt: 400000
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



