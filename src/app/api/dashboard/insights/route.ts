import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for dashboard insights
    const data = [
      {
        id: 1,
        title: 'Tăng trưởng doanh thu',
        description: 'Doanh thu tăng 12.5% so với tuần trước',
        type: 'positive',
        value: '12.5%'
      },
      {
        id: 2,
        title: 'Khách hàng mới',
        description: 'Có 150 khách hàng mới trong tuần này',
        type: 'positive',
        value: '150'
      },
      {
        id: 3,
        title: 'Dịch vụ phổ biến',
        description: 'Restaurant là dịch vụ được sử dụng nhiều nhất',
        type: 'info',
        value: 'Restaurant'
      },
      {
        id: 4,
        title: 'Cửa hàng hàng đầu',
        description: 'Vincom Landmark 81 có doanh thu cao nhất',
        type: 'info',
        value: 'Vincom Landmark 81'
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


