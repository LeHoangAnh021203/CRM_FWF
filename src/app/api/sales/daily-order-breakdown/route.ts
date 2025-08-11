import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fromDate, toDate } = await request.json();
    
    // Mock data for daily order breakdown
    const data = [
      {
        "date": "2025-06-01",
        "totalOrders": 463,
        "shopCount": 34,
        "avgOrdersPerShop": 13.617647058823529
      },
      {
        "date": "2025-06-02",
        "totalOrders": 233,
        "shopCount": 33,
        "avgOrdersPerShop": 7.0606060606060606
      },
      {
        "date": "2025-06-03",
        "totalOrders": 230,
        "shopCount": 32,
        "avgOrdersPerShop": 7.1875
      },
      {
        "date": "2025-06-04",
        "totalOrders": 306,
        "shopCount": 34,
        "avgOrdersPerShop": 9.0
      },
      {
        "date": "2025-06-05",
        "totalOrders": 273,
        "shopCount": 33,
        "avgOrdersPerShop": 8.272727272727273
      },
      {
        "date": "2025-06-06",
        "totalOrders": 293,
        "shopCount": 33,
        "avgOrdersPerShop": 8.878787878787879
      },
      {
        "date": "2025-06-07",
        "totalOrders": 452,
        "shopCount": 34,
        "avgOrdersPerShop": 13.294117647058824
      },
      {
        "date": "2025-06-08",
        "totalOrders": 450,
        "shopCount": 34,
        "avgOrdersPerShop": 13.235294117647058
      },
      {
        "date": "2025-06-09",
        "totalOrders": 244,
        "shopCount": 34,
        "avgOrdersPerShop": 7.176470588235294
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

