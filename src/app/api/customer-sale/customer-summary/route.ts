import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for customer summary
    return NextResponse.json({
      totalNewCustomers: 1250,
      actualCustomers: 980,
      growthTotal: 15.2,
      growthActual: 12.8
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


