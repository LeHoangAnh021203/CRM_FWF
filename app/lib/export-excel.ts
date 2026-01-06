import { TokenService } from './token-service';
import { AUTH_CONFIG } from './auth-config';

/**
 * Export all customer phone numbers to Excel file
 */
export async function exportCustomerPhonesToExcel(): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('Chức năng xuất Excel chỉ hoạt động trên trình duyệt');
    }

    // Lấy access token hợp lệ
    const token = await TokenService.getValidAccessToken();
    if (!token) {
      window.dispatchEvent(new CustomEvent('auth-expired'));
      throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }

    // Build direct backend URL từ ENV:
    // NEXT_PUBLIC_API_BASE_URL + NEXT_PUBLIC_API_PREFIX + /customer-sale/export-customer-phones
    const base = (AUTH_CONFIG.API_BASE_URL || '').replace(/\/+$/, '');
    const prefix = AUTH_CONFIG.API_PREFIX || '';
    const apiUrl = `${base}${prefix}/customer-sale/export-customer-phones`;

    console.log('[exportCustomerPhonesToExcel] Calling:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/csv',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}), // backend chấp nhận body rỗng
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[exportCustomerPhonesToExcel] Backend error:', response.status, text);
      throw new Error(`Backend trả về lỗi ${response.status}: ${text || response.statusText}`);
    }

    const csvText = await response.text();
    if (!csvText || !csvText.trim()) {
      throw new Error('Backend không trả về dữ liệu CSV');
    }

    // Thêm BOM để Excel đọc UTF-8 đúng
    const BOM = '\uFEFF';
    const csvContent = BOM + csvText;

    // Add BOM for Excel UTF-8 support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

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

