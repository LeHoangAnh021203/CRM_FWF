import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for overall summary matching the provided structure
    const data = {
      totalRevenue: 2779537500.00,
      serviceRevenue: 1750024500.00,
      foxieCardRevenue: 1081191000.00,
      productRevenue: 48272800.00,
      cardPurchaseRevenue: 1103628000.00,
      deltaTotalRevenue: 62222400.00,
      deltaServiceRevenue: 124147400.00,
      deltaFoxieCardRevenue: -36220000.00,
      deltaProductRevenue: 14639550.00,
      deltaCardPurchaseRevenue: -3421550.00,
      percentTotalRevenue: 2.29,
      percentServiceRevenue: 7.64,
      percentFoxieCardRevenue: -3.24,
      percentProductRevenue: 43.53,
      percentCardPurchaseRevenue: -0.31
    };

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


