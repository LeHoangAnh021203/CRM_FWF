import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data for dashboard activity
    const data = [
      {
        id: 1,
        type: 'order',
        message: 'Đơn hàng mới từ Crescent Mall Q7',
        time: '2025-01-07T10:30:00Z',
        amount: 2500000
      },
      {
        id: 2,
        type: 'customer',
        message: 'Khách hàng mới đăng ký',
        time: '2025-01-07T09:15:00Z',
        amount: null
      },
      {
        id: 3,
        type: 'service',
        message: 'Dịch vụ Spa được sử dụng',
        time: '2025-01-07T08:45:00Z',
        amount: 500000
      },
      {
        id: 4,
        type: 'order',
        message: 'Đơn hàng từ Vincom Landmark 81',
        time: '2025-01-07T08:20:00Z',
        amount: 3200000
      },
      {
        id: 5,
        type: 'customer',
        message: 'Khách hàng VIP mới',
        time: '2025-01-07T07:30:00Z',
        amount: null
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

