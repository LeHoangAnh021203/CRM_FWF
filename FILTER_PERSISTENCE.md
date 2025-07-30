# Filter Persistence Feature

## Tổng quan
Tính năng này cho phép lưu trữ và khôi phục trạng thái của các filter (bộ lọc) khi người dùng chuyển đổi giữa các tab khác nhau trong ứng dụng. Điều này giúp người dùng không bị mất các thiết lập filter đã chọn.

## Các tính năng

### 1. Lưu trữ tự động
- Tất cả các filter (ngày tháng, vùng miền, chi nhánh, loại khách hàng, v.v.) được tự động lưu vào localStorage
- Khi người dùng quay lại trang, các filter sẽ được khôi phục về trạng thái trước đó

### 2. Nút Reset
- Mỗi trang có nút "Reset Filters" ở góc trên bên phải
- Khi nhấn nút này, tất cả filter sẽ được reset về giá trị mặc định
- Dữ liệu trong localStorage cũng sẽ được xóa

### 3. Hỗ trợ các loại dữ liệu
- **CalendarDate**: Ngày tháng được lưu trữ dưới dạng object với year, month, day
- **Array**: Các mảng string được lưu trữ dưới dạng JSON
- **Primitive values**: Các giá trị cơ bản được lưu trữ trực tiếp

## Cách sử dụng

### Trong component
```typescript
import { useLocalStorageState, clearLocalStorageKeys } from "@/hooks/useLocalStorageState";

// Sử dụng hook
const [startDate, setStartDate] = useLocalStorageState<CalendarDate>(
  "customer-startDate",
  today(getLocalTimeZone()).subtract({ days: 7 })
);

const [selectedRegions, setSelectedRegions] = useLocalStorageState<string[]>(
  "customer-selectedRegions", 
  []
);

// Function reset
const resetFilters = () => {
  clearLocalStorageKeys([
    'customer-startDate',
    'customer-selectedRegions'
  ]);
  setStartDate(today(getLocalTimeZone()).subtract({ days: 7 }));
  setSelectedRegions([]);
  showSuccess("Đã reset tất cả filter về mặc định!");
};
```

### Thêm nút reset vào UI
```tsx
<div className="flex justify-between items-center mb-2">
  <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
    Customer Report
  </h1>
  <button
    onClick={resetFilters}
    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
  >
    Reset Filters
  </button>
</div>
```

## Cấu trúc localStorage

### Customer Page
- `customer-startDate`: Ngày bắt đầu
- `customer-endDate`: Ngày kết thúc
- `customer-selectedType`: Loại khách hàng đã chọn
- `customer-selectedStatus`: Trạng thái đã chọn
- `customer-selectedRegions`: Vùng miền đã chọn
- `customer-selectedBranches`: Chi nhánh đã chọn

### Orders Page
- `orders-startDate`: Ngày bắt đầu
- `orders-endDate`: Ngày kết thúc
- `orders-selectedRegions`: Vùng miền đã chọn
- `orders-selectedBranches`: Chi nhánh đã chọn

### Services Page
- `services-startDate`: Ngày bắt đầu
- `services-endDate`: Ngày kết thúc
- `services-selectedRegions`: Vùng miền đã chọn
- `services-selectedBranches`: Chi nhánh đã chọn
- `services-selectedServiceTypes`: Loại dịch vụ đã chọn
- `services-selectedGenders`: Giới tính đã chọn

## Lưu ý kỹ thuật

### Hook useLocalStorageState
- Hỗ trợ cả value và function updater (giống useState)
- Tự động xử lý CalendarDate objects
- Có error handling cho localStorage
- SSR-safe (không gây lỗi khi render trên server)

### Error Handling
- Nếu localStorage không khả dụng, sẽ fallback về default value
- Các lỗi JSON parsing được log ra console nhưng không crash app
- Graceful degradation khi localStorage bị disable

### Performance
- Chỉ lưu trữ khi value thay đổi
- Sử dụng JSON.stringify/parse hiệu quả
- Không gây re-render không cần thiết

## Troubleshooting

### Filter không được lưu
1. Kiểm tra localStorage có được enable không
2. Kiểm tra key có đúng format không
3. Kiểm tra console có lỗi JSON parsing không

### Filter không được khôi phục
1. Kiểm tra dữ liệu trong localStorage
2. Kiểm tra default value có đúng type không
3. Kiểm tra logic parsing trong hook

### Nút reset không hoạt động
1. Kiểm tra function resetFilters có được gọi không
2. Kiểm tra danh sách keys trong clearLocalStorageKeys
3. Kiểm tra các setter function có được gọi đúng không 