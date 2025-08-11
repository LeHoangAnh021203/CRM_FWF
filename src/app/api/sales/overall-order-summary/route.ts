import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromDate, toDate } = await request.json();
    
    // Mock data for overall order summary
    const data = {
      "totalOrders": 2944,
      "serviceOrders": 963,
      "foxieCardOrders": 1479,
      "productOrders": 221,
      "cardPurchaseOrders": 355,
      "deltaTotalOrders": 107,
      "deltaServiceOrders": 69,
      "deltaFoxieCardOrders": 7,
      "deltaProductOrders": 30,
      "deltaCardPurchaseOrders": 3
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

