import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromDate, toDate } = await request.json();
    
    // Mock data for payment by region
    const data = [
      {
        region: "HCM",
        cash: 4500000,
        transfer: 3200000,
        creditCard: 1800000
      },
      {
        region: "Hà Nội",
        cash: 3200000,
        transfer: 2400000,
        creditCard: 1200000
      },
      {
        region: "Đà Nẵng",
        cash: 1800000,
        transfer: 1400000,
        creditCard: 800000
      },
      {
        region: "Nha Trang",
        cash: 1200000,
        transfer: 900000,
        creditCard: 500000
      },
      {
        region: "Vũng Tàu",
        cash: 800000,
        transfer: 600000,
        creditCard: 300000
      }
    ];

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

