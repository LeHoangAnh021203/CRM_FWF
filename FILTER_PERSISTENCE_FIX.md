# Sửa lỗi Filter Persistence

## Vấn đề
Khi chọn ngày tháng ở các trang và chuyển tab, dữ liệu bị reset lại như ban đầu. Điều này xảy ra do:

1. **Hydration Mismatch**: Component render với giá trị mặc định trên server, sau đó load giá trị từ localStorage trên client, gây ra sự không đồng bộ
2. **Không sử dụng flag `isLoaded`**: Các component không kiểm tra xem localStorage đã được load xong chưa trước khi render

## Giải pháp đã áp dụng

### 1. Cập nhật hook `useLocalStorageState`
- Thêm flag `isClient` để đảm bảo chỉ thao tác localStorage sau khi component đã mount trên client
- Cải thiện logic để tránh hydration mismatch

### 2. Cập nhật tất cả các trang chính
- **Customers**: Sử dụng flag `isLoaded` cho tất cả localStorage states
- **Orders**: Sử dụng flag `isLoaded` cho tất cả localStorage states  
- **Services**: Sử dụng flag `isLoaded` cho tất cả localStorage states
- **Accounting**: Sử dụng flag `isLoaded` cho tất cả localStorage states

### 3. Thêm điều kiện loading
- Hiển thị loading screen khi localStorage chưa được load xong
- Chỉ render component chính khi tất cả dữ liệu đã sẵn sàng

## Cách hoạt động

### Trước khi sửa:
```typescript
const [startDate, setStartDate] = useLocalStorageState<CalendarDate>(
  "customer-startDate",
  today(getLocalTimeZone()).subtract({ days: 7 })
);
```

### Sau khi sửa:
```typescript
const [startDate, setStartDate, startDateLoaded] = useLocalStorageState<CalendarDate>(
  "customer-startDate",
  today(getLocalTimeZone()).subtract({ days: 7 })
);

// Kiểm tra xem tất cả localStorage đã được load chưa
const isAllLoaded = startDateLoaded && endDateLoaded && /* ... */;

// Hiển thị loading nếu chưa load xong
if (!isAllLoaded) {
  return <LoadingComponent />;
}
```

## Lợi ích

1. **Không còn reset filter**: Khi chuyển tab, filter sẽ được giữ nguyên
2. **Tránh hydration mismatch**: Không còn lỗi SSR/CSR không đồng bộ
3. **UX tốt hơn**: Hiển thị loading screen thay vì flash content
4. **Ổn định hơn**: Dữ liệu được load một cách đồng bộ và an toàn

## Kiểm tra

Để kiểm tra xem fix có hoạt động không:

1. Mở một trang (ví dụ: Customers)
2. Chọn ngày tháng khác
3. Chuyển sang tab khác (ví dụ: Orders)
4. Quay lại tab Customers
5. Ngày tháng phải được giữ nguyên, không bị reset

## Troubleshooting

Nếu vẫn còn vấn đề:

1. **Kiểm tra console**: Xem có lỗi localStorage không
2. **Kiểm tra browser**: Đảm bảo localStorage được enable
3. **Clear localStorage**: Xóa localStorage và thử lại
4. **Kiểm tra network**: Đảm bảo không có lỗi network

## Files đã sửa

- `src/hooks/useLocalStorageState.ts`
- `src/app/customers/page.tsx`
- `src/app/orders/page.tsx`
- `src/app/services/page.tsx`
- `src/app/accounting/page.tsx`

