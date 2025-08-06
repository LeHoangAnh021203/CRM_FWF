# Hệ thống Thông báo Thông minh

## Tổng quan

Hệ thống thông báo thông minh được thiết kế để theo dõi trạng thái của từng trang và tạo thông báo dựa trên các sự kiện thực tế. Hệ thống này cung cấp:

- **Theo dõi trạng thái trang**: Theo dõi hoạt động của từng trang (customers, orders, services)
- **Thông báo thông minh**: Tạo thông báo dựa trên các sự kiện thực tế
- **Phân loại thông báo**: Sắp xếp thông báo theo mức độ ưu tiên
- **Cập nhật thời gian thực**: Thông báo được cập nhật mỗi 30 giây

## Cấu trúc Hệ thống

### 1. API Notifications (`/api/notifications`)

#### GET Endpoint
- Trả về danh sách thông báo hiện tại
- Bao gồm trạng thái của các trang
- Thông tin về hệ thống (memory, uptime, file status)

#### POST Endpoint
- Cập nhật trạng thái của trang
- Được gọi bởi các trang để báo cáo hoạt động

### 2. Hook usePageStatus

Hook này cung cấp các hàm để báo cáo trạng thái trang:

```typescript
const {
  reportPageLoad,           // Báo cáo trang tải thành công
  reportPageError,          // Báo cáo lỗi trang
  reportPageActivity,       // Báo cáo hoạt động trang
  reportDataLoadSuccess,    // Báo cáo tải dữ liệu thành công
  reportDataLoadError,      // Báo cáo lỗi tải dữ liệu
  reportFilterChange,       // Báo cáo thay đổi filter
  reportResetFilters,       // Báo cáo reset filter
  reportChartInteraction    // Báo cáo tương tác biểu đồ
} = usePageStatus('pageName');
```

### 3. Component SmartNotifications

Component này hiển thị thông báo thông minh với các tính năng:

- **Phân loại thông báo**: Sắp xếp theo mức độ ưu tiên
- **Trạng thái trang**: Hiển thị trạng thái của từng trang
- **Thông báo thời gian thực**: Cập nhật tự động
- **Giao diện thân thiện**: Dễ sử dụng và trực quan

## Cách Sử dụng

### 1. Trong các trang

```typescript
import { usePageStatus } from "@/hooks/usePageStatus";

export default function CustomerPage() {
  const { 
    reportPageLoad, 
    reportPageError, 
    reportDataLoadSuccess,
    reportFilterChange 
  } = usePageStatus('customers');

  // Báo cáo khi trang tải thành công
  useEffect(() => {
    if (data && !loading && !error) {
      reportPageLoad("Trang khách hàng đã tải thành công");
      reportDataLoadSuccess("khách hàng", data.length);
    }
  }, [data, loading, error]);

  // Báo cáo lỗi
  useEffect(() => {
    if (error) {
      reportPageError(`Lỗi tải dữ liệu: ${error}`);
    }
  }, [error]);

  // Báo cáo thay đổi filter
  useEffect(() => {
    if (selectedFilters.length > 0) {
      reportFilterChange(`filter: ${selectedFilters.join(', ')}`);
    }
  }, [selectedFilters]);
}
```

### 2. Trong Header

```typescript
import { SmartNotifications } from "@/components/smart-notifications";

export function Header() {
  return (
    <header>
      {/* ... other components ... */}
      <SmartNotifications />
      {/* ... other components ... */}
    </header>
  );
}
```

## Loại Thông báo

### 1. Thông báo API
- **api_status**: Trạng thái API bình thường
- **api_error**: Lỗi API
- **api_performance**: Hiệu suất API
- **api_auth**: Xác thực API

### 2. Thông báo Hệ thống
- **system_health**: Sức khỏe hệ thống
- **database**: Trạng thái cơ sở dữ liệu

### 3. Thông báo Nghiệp vụ
- **order**: Đơn hàng mới
- **sales**: Doanh số

### 4. Thông báo Trang
- **page_status**: Trạng thái trang

## Mức độ Ưu tiên

1. **api_error**: Lỗi API (cao nhất)
2. **order**: Đơn hàng mới
3. **sales**: Doanh số
4. **page_status**: Trạng thái trang
5. **api_status**: Trạng thái API
6. **system_health**: Sức khỏe hệ thống

## Tính năng Nâng cao

### 1. Theo dõi Trang Không Hoạt động
Hệ thống sẽ thông báo khi một trang không có hoạt động trong 30 phút trở lên.

### 2. Thống kê Trang
Hiển thị số lượng trang đang được theo dõi và trạng thái của từng trang.

### 3. Thông báo Thông minh
- Tự động phân loại thông báo
- Sắp xếp theo mức độ ưu tiên
- Hiển thị thời gian tương đối

## Cấu hình

### 1. Thêm Trang Mới
Để thêm một trang mới vào hệ thống theo dõi:

1. Import hook trong trang:
```typescript
import { usePageStatus } from "@/hooks/usePageStatus";
```

2. Sử dụng hook trong component:
```typescript
const { reportPageLoad, reportPageError } = usePageStatus('newPage');
```

3. Thêm tên hiển thị trong API:
```typescript
function getPageDisplayName(pageName: string): string {
  const pageNames: { [key: string]: string } = {
    'newPage': 'Tên Hiển Thị',
    // ...
  };
  return pageNames[pageName] || pageName;
}
```

### 2. Tùy chỉnh Thông báo
Bạn có thể tùy chỉnh loại thông báo và màu sắc trong component `SmartNotifications`.

## Lợi ích

1. **Giám sát thời gian thực**: Theo dõi trạng thái của tất cả trang
2. **Thông báo thông minh**: Chỉ hiển thị thông báo quan trọng
3. **Dễ dàng mở rộng**: Thêm trang mới một cách dễ dàng
4. **Giao diện thân thiện**: Dễ sử dụng và trực quan
5. **Hiệu suất cao**: Cập nhật thông minh, không spam thông báo 