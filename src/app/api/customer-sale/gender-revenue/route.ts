import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for gender revenue
    return NextResponse.json({
      avgRevenueMale: 850000,
      avgRevenueFemale: 920000,
      avgServiceMale: 3.2,
      avgServiceFemale: 3.8
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


