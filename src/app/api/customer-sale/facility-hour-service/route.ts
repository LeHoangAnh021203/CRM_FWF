import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Consume the request body
    
    // Mock data for facility hour service
    const data = [
      {
        facility: "Spa",
        hourlyCounts: {
          "09:00": 15,
          "10:00": 25,
          "11:00": 30,
          "12:00": 35,
          "13:00": 40,
          "14:00": 45,
          "15:00": 50,
          "16:00": 55,
          "17:00": 60,
          "18:00": 55,
          "19:00": 45,
          "20:00": 35,
          "21:00": 25,
          "22:00": 15
        },
        total: 485
      },
      {
        facility: "Gym",
        hourlyCounts: {
          "06:00": 20,
          "07:00": 35,
          "08:00": 45,
          "09:00": 30,
          "10:00": 25,
          "11:00": 20,
          "12:00": 15,
          "13:00": 20,
          "14:00": 25,
          "15:00": 30,
          "16:00": 40,
          "17:00": 55,
          "18:00": 60,
          "19:00": 50,
          "20:00": 35,
          "21:00": 25,
          "22:00": 15
        },
        total: 515
      },
      {
        facility: "Restaurant",
        hourlyCounts: {
          "07:00": 10,
          "08:00": 25,
          "09:00": 15,
          "10:00": 10,
          "11:00": 20,
          "12:00": 60,
          "13:00": 55,
          "14:00": 20,
          "15:00": 15,
          "16:00": 20,
          "17:00": 25,
          "18:00": 70,
          "19:00": 65,
          "20:00": 45,
          "21:00": 30,
          "22:00": 20
        },
        total: 460
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


