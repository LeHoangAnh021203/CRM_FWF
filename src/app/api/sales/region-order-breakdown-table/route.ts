import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for region order breakdown table
    const data = [
      {
        "shopName": "Crescent Mall Q7",
        "totalOrders": 204,
        "serviceOrders": 68,
        "foxieCardOrders": 113,
        "productOrders": 16,
        "cardPurchaseOrders": 20,
        "deltaTotalOrders": -33,
        "deltaServiceOrders": -1,
        "deltaFoxieCardOrders": 1,
        "deltaProductOrders": -9,
        "deltaCardPurchaseOrders": -8
      },
      {
        "shopName": "Vincom Landmark 81",
        "totalOrders": 183,
        "serviceOrders": 60,
        "foxieCardOrders": 89,
        "productOrders": 11,
        "cardPurchaseOrders": 20,
        "deltaTotalOrders": 1,
        "deltaServiceOrders": -2,
        "deltaFoxieCardOrders": 4,
        "deltaProductOrders": -2,
        "deltaCardPurchaseOrders": -3
      },
      {
        "shopName": "Vista Verde",
        "totalOrders": 137,
        "serviceOrders": 31,
        "foxieCardOrders": 91,
        "productOrders": 12,
        "cardPurchaseOrders": 14,
        "deltaTotalOrders": 27,
        "deltaServiceOrders": 9,
        "deltaFoxieCardOrders": 16,
        "deltaProductOrders": 5,
        "deltaCardPurchaseOrders": 3
      },
      {
        "shopName": "Vincom Thảo Điền",
        "totalOrders": 129,
        "serviceOrders": 35,
        "foxieCardOrders": 74,
        "productOrders": 10,
        "cardPurchaseOrders": 15,
        "deltaTotalOrders": -4,
        "deltaServiceOrders": -2,
        "deltaFoxieCardOrders": 0,
        "deltaProductOrders": 2,
        "deltaCardPurchaseOrders": -1
      },
      {
        "shopName": "SC VivoCity",
        "totalOrders": 128,
        "serviceOrders": 36,
        "foxieCardOrders": 48,
        "productOrders": 38,
        "cardPurchaseOrders": 14,
        "deltaTotalOrders": 21,
        "deltaServiceOrders": -4,
        "deltaFoxieCardOrders": -5,
        "deltaProductOrders": 23,
        "deltaCardPurchaseOrders": 1
      },
      {
        "shopName": "Westpoint Phạm Hùng",
        "totalOrders": 127,
        "serviceOrders": 33,
        "foxieCardOrders": 65,
        "productOrders": 3,
        "cardPurchaseOrders": 16,
        "deltaTotalOrders": 127,
        "deltaServiceOrders": 33,
        "deltaFoxieCardOrders": 65,
        "deltaProductOrders": 3,
        "deltaCardPurchaseOrders": 16
      },
      {
        "shopName": "Aeon Mall Tân Phú Celadon",
        "totalOrders": 127,
        "serviceOrders": 43,
        "foxieCardOrders": 67,
        "productOrders": 7,
        "cardPurchaseOrders": 21,
        "deltaTotalOrders": -7,
        "deltaServiceOrders": -9,
        "deltaFoxieCardOrders": -10,
        "deltaProductOrders": 4,
        "deltaCardPurchaseOrders": 1
      },
      {
        "shopName": "Aeon Mall Bình Tân",
        "totalOrders": 122,
        "serviceOrders": 56,
        "foxieCardOrders": 49,
        "productOrders": 8,
        "cardPurchaseOrders": 10,
        "deltaTotalOrders": 7,
        "deltaServiceOrders": 10,
        "deltaFoxieCardOrders": 1,
        "deltaProductOrders": -6,
        "deltaCardPurchaseOrders": -4
      },
      {
        "shopName": "Saigon Centre",
        "totalOrders": 115,
        "serviceOrders": 47,
        "foxieCardOrders": 51,
        "productOrders": 3,
        "cardPurchaseOrders": 21,
        "deltaTotalOrders": 4,
        "deltaServiceOrders": 3,
        "deltaFoxieCardOrders": 2,
        "deltaProductOrders": -5,
        "deltaCardPurchaseOrders": 7
      },
      {
        "shopName": "Vincom Bà Triệu",
        "totalOrders": 114,
        "serviceOrders": 31,
        "foxieCardOrders": 61,
        "productOrders": 4,
        "cardPurchaseOrders": 10,
        "deltaTotalOrders": 114,
        "deltaServiceOrders": 31,
        "deltaFoxieCardOrders": 61,
        "deltaProductOrders": 4,
        "deltaCardPurchaseOrders": 10
      }
    ];

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



