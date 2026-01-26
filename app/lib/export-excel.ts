import { ApiService } from './api-service';

interface CustomerPhoneData {
  phoneNumber?: string;
  [key: string]: unknown;
}

/**
 * Export all customer phone numbers to Excel file
 */
export async function exportCustomerPhonesToExcel(): Promise<void> {
  try {
    // Call API to get all customers (this endpoint is GET, not POST)
    const response = await ApiService.get(
      'customer-sale/export-customer-phones'
    ) as {
      content?: CustomerPhoneData[];
      totalElements?: number;
    } | CustomerPhoneData[];

    // Extract customer list
    let customers: CustomerPhoneData[] = [];
    if (Array.isArray(response)) {
      customers = response;
    } else if (response && Array.isArray(response.content)) {
      customers = response.content;
    }

    if (customers.length === 0) {
      throw new Error('Không có dữ liệu khách hàng để xuất');
    }

    // Extract phone numbers and create CSV content
    const phoneNumbers = customers
      .map((customer) => customer.phoneNumber)
      .filter((phone): phone is string => typeof phone === 'string' && phone.trim() !== '');

    if (phoneNumbers.length === 0) {
      throw new Error('Không tìm thấy số điện thoại nào trong dữ liệu');
    }

    // Create CSV content
    const csvContent = [
      'STT,Số điện thoại', // Header
      ...phoneNumbers.map((phone, index) => `${index + 1},"${phone}"`),
    ].join('\n');

    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `danh-sach-so-dien-thoai-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting customer phones:', error);
    throw error;
  }
}

