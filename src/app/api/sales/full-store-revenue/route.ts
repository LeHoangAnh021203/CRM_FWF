import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromDate, toDate } = await request.json();
    
    // Mock data for full store revenue
    const data = [
      {
        storeName: "Crescent Mall Q7",
        currentOrders: 125,
        deltaOrders: 15,
        actualRevenue: 25000000,
        foxieRevenue: 11250000,
        revenueGrowth: 12.5,
        revenuePercent: 25.0,
        foxiePercent: 45.0,
        orderPercent: 20.0
      },
      {
        storeName: "Vincom Thảo Điền",
        currentOrders: 98,
        deltaOrders: 12,
        actualRevenue: 19500000,
        foxieRevenue: 8775000,
        revenueGrowth: 15.2,
        revenuePercent: 19.5,
        foxiePercent: 45.0,
        orderPercent: 15.7
      },
      {
        storeName: "Vista Verde",
        currentOrders: 85,
        deltaOrders: 8,
        actualRevenue: 17000000,
        foxieRevenue: 7650000,
        revenueGrowth: 8.5,
        revenuePercent: 17.0,
        foxiePercent: 45.0,
        orderPercent: 13.6
      },
      {
        storeName: "Aeon Mall Tân Phú Celadon",
        currentOrders: 112,
        deltaOrders: 18,
        actualRevenue: 22400000,
        foxieRevenue: 10080000,
        revenueGrowth: 18.5,
        revenuePercent: 22.4,
        foxiePercent: 45.0,
        orderPercent: 17.9
      },
      {
        storeName: "Westpoint Phạm Hùng",
        currentOrders: 76,
        deltaOrders: 5,
        actualRevenue: 15200000,
        foxieRevenue: 6840000,
        revenueGrowth: 5.2,
        revenuePercent: 15.2,
        foxiePercent: 45.0,
        orderPercent: 12.2
      },
      {
        storeName: "Aeon Mall Bình Tân",
        currentOrders: 95,
        deltaOrders: 10,
        actualRevenue: 19000000,
        foxieRevenue: 8550000,
        revenueGrowth: 10.8,
        revenuePercent: 19.0,
        foxiePercent: 45.0,
        orderPercent: 15.2
      },
      {
        storeName: "Vincom Phan Văn Trị",
        currentOrders: 88,
        deltaOrders: 7,
        actualRevenue: 17600000,
        foxieRevenue: 7920000,
        revenueGrowth: 7.2,
        revenuePercent: 17.6,
        foxiePercent: 45.0,
        orderPercent: 14.1
      },
      {
        storeName: "Vincom Landmark 81",
        currentOrders: 145,
        deltaOrders: 22,
        actualRevenue: 29000000,
        foxieRevenue: 13050000,
        revenueGrowth: 22.5,
        revenuePercent: 29.0,
        foxiePercent: 45.0,
        orderPercent: 23.2
      },
      {
        storeName: "TTTM Estella Place",
        currentOrders: 92,
        deltaOrders: 9,
        actualRevenue: 18400000,
        foxieRevenue: 8280000,
        revenueGrowth: 9.8,
        revenuePercent: 18.4,
        foxiePercent: 45.0,
        orderPercent: 14.7
      },
      {
        storeName: "Võ Thị Sáu Q.1",
        currentOrders: 78,
        deltaOrders: 6,
        actualRevenue: 15600000,
        foxieRevenue: 7020000,
        revenueGrowth: 6.5,
        revenuePercent: 15.6,
        foxiePercent: 45.0,
        orderPercent: 12.5
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

