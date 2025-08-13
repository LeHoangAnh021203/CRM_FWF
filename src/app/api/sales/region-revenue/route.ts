import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Region Revenue API called with:', body);
    
    // Real data from your API - this would normally come from a database
    const rawData = [
      { region: "Nha Trang", date: "2025-06-01", totalRevenue: 14665000.00 },
      { region: "Đà Nẵng", date: "2025-06-01", totalRevenue: 11890000.00 },
      { region: "HCM", date: "2025-06-01", totalRevenue: 332536500.00 },
      { region: "Hà Nội", date: "2025-06-01", totalRevenue: 55266000.00 },
      { region: "Vũng Tàu", date: "2025-06-01", totalRevenue: 7203600.00 },
      { region: "Đà Nẵng", date: "2025-06-02", totalRevenue: 9554000.00 },
      { region: "Nha Trang", date: "2025-06-02", totalRevenue: 7175000.00 },
      { region: "Vũng Tàu", date: "2025-06-02", totalRevenue: 0.00 },
      { region: "Hà Nội", date: "2025-06-02", totalRevenue: 26618000.00 },
      { region: "HCM", date: "2025-06-02", totalRevenue: 175951000.00 },
      { region: "Vũng Tàu", date: "2025-06-03", totalRevenue: 539000.00 },
      { region: "Đà Nẵng", date: "2025-06-03", totalRevenue: 3096000.00 },
      { region: "Nha Trang", date: "2025-06-03", totalRevenue: 1795000.00 },
      { region: "Hà Nội", date: "2025-06-03", totalRevenue: 27367600.00 },
      { region: "HCM", date: "2025-06-03", totalRevenue: 195453800.00 },
      { region: "Nha Trang", date: "2025-06-04", totalRevenue: 8936000.00 },
      { region: "Đà Nẵng", date: "2025-06-04", totalRevenue: 13346000.00 },
      { region: "Vũng Tàu", date: "2025-06-04", totalRevenue: 2395000.00 },
      { region: "HCM", date: "2025-06-04", totalRevenue: 154680000.00 },
      { region: "Hà Nội", date: "2025-06-04", totalRevenue: 48858000.00 },
      { region: "HCM", date: "2025-06-05", totalRevenue: 170540800.00 },
      { region: "Hà Nội", date: "2025-06-05", totalRevenue: 36377200.00 },
      { region: "Đà Nẵng", date: "2025-06-05", totalRevenue: 8323000.00 },
      { region: "Nha Trang", date: "2025-06-05", totalRevenue: 12062300.00 },
      { region: "Vũng Tàu", date: "2025-06-05", totalRevenue: 3208000.00 },
      { region: "Vũng Tàu", date: "2025-06-06", totalRevenue: 4815400.00 },
      { region: "Nha Trang", date: "2025-06-06", totalRevenue: 8909000.00 },
      { region: "Đà Nẵng", date: "2025-06-06", totalRevenue: 10566000.00 },
      { region: "HCM", date: "2025-06-06", totalRevenue: 236083600.00 },
      { region: "Hà Nội", date: "2025-06-06", totalRevenue: 48538000.00 },
      { region: "Nha Trang", date: "2025-06-07", totalRevenue: 2776000.00 },
      { region: "Đà Nẵng", date: "2025-06-07", totalRevenue: 13325000.00 },
      { region: "Vũng Tàu", date: "2025-06-07", totalRevenue: 6783000.00 },
      { region: "Hà Nội", date: "2025-06-07", totalRevenue: 68380000.00 },
      { region: "HCM", date: "2025-06-07", totalRevenue: 364909700.00 },
      { region: "Đà Nẵng", date: "2025-06-08", totalRevenue: 7662000.00 },
      { region: "Vũng Tàu", date: "2025-06-08", totalRevenue: 12485000.00 },
      { region: "Nha Trang", date: "2025-06-08", totalRevenue: 11748900.00 },
      { region: "Hà Nội", date: "2025-06-08", totalRevenue: 50507000.00 },
      { region: "HCM", date: "2025-06-08", totalRevenue: 346342900.00 },
      { region: "HCM", date: "2025-06-09", totalRevenue: 196144200.00 },
      { region: "Đà Nẵng", date: "2025-06-09", totalRevenue: 8605000.00 },
      { region: "Vũng Tàu", date: "2025-06-09", totalRevenue: 1326000.00 },
      { region: "Nha Trang", date: "2025-06-09", totalRevenue: 15970000.00 },
      { region: "Hà Nội", date: "2025-06-09", totalRevenue: 35824000.00 }
    ];

    // Group data by date and sum revenue for each date
    const revenueByDate = new Map<string, number>();
    
    rawData.forEach(item => {
      const date = item.date;
      const revenue = item.totalRevenue;
      
      if (revenueByDate.has(date)) {
        revenueByDate.set(date, revenueByDate.get(date)! + revenue);
      } else {
        revenueByDate.set(date, revenue);
      }
    });

    // Generate all dates in the month (June 2025)
    const startDate = new Date('2025-06-01');
    const endDate = new Date('2025-06-30');
    const allDates: string[] = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toISOString().split('T')[0]);
    }

    // Create chart data with all dates, showing total revenue per day
    const currentRange = allDates.map(date => {
      const totalRevenue = revenueByDate.get(date) || 0;
      return {
        region: "Tổng hợp tất cả regions",
        date,
        totalRevenue,
        // Add breakdown by region for reference
        breakdown: rawData
          .filter(item => item.date === date)
          .map(item => ({
            region: item.region,
            revenue: item.totalRevenue
          }))
      };
    });

    // Calculate total revenue for the period
    const totalRevenue = currentRange.reduce((sum, item) => sum + item.totalRevenue, 0);

    console.log('📤 Region Revenue API response:', {
      totalRevenue,
      dataPoints: currentRange.length,
      sampleData: currentRange.slice(0, 3)
    });

    return NextResponse.json({
      currentRange,
      totalRevenue,
      revenueGrowth: 15.2 // This would be calculated from previous period
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


