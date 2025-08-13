# Calendar Data Persistence

## Tổng quan
Calendar Report giờ đây có tính năng lưu trữ dữ liệu vào localStorage, giúp dữ liệu không bị mất khi refresh trang.

## Tính năng đã thêm

### 1. LocalStorage Hook
- Sử dụng `useLocalStorageState` hook để tự động lưu và khôi phục dữ liệu
- Dữ liệu được lưu với các key riêng biệt:
  - `calendar-employees`: Danh sách nhân viên
  - `calendar-templates`: Mẫu ca làm việc
  - `calendar-shifts`: Danh sách ca làm việc
  - `calendar-search`: Từ khóa tìm kiếm
  - `calendar-status-filter`: Bộ lọc trạng thái
  - `calendar-position-filter`: Bộ lọc vị trí

### 2. Dữ liệu được lưu trữ
- **Nhân viên**: Thông tin nhân viên, trạng thái hoạt động
- **Mẫu ca làm**: Các mẫu ca làm việc định sẵn
- **Ca làm việc**: Tất cả ca làm việc với lịch sử phê duyệt
- **Bộ lọc**: Trạng thái tìm kiếm và bộ lọc hiện tại

### 3. Nút "Xóa dữ liệu"
- Vị trí: Góc trên bên phải của trang
- Chức năng: Reset tất cả dữ liệu về trạng thái mặc định
- Có xác nhận trước khi xóa để tránh mất dữ liệu

## Cách hoạt động

### Tự động lưu
- Mỗi khi có thay đổi trong dữ liệu, localStorage sẽ được cập nhật tự động
- Dữ liệu được serialize thành JSON trước khi lưu

### Tự động khôi phục
- Khi trang được load, dữ liệu sẽ được đọc từ localStorage
- Nếu không có dữ liệu hoặc có lỗi, sẽ sử dụng dữ liệu mặc định

### Xử lý lỗi
- Nếu localStorage không khả dụng (SSR), sẽ fallback về state thường
- Các lỗi khi đọc/ghi localStorage sẽ được log ra console

## Lợi ích

1. **Không mất dữ liệu**: Dữ liệu được bảo toàn khi refresh trang
2. **Trải nghiệm người dùng tốt hơn**: Không cần nhập lại dữ liệu
3. **Làm việc offline**: Có thể sử dụng khi không có kết nối internet
4. **Dễ dàng reset**: Có thể xóa dữ liệu để bắt đầu lại

## Lưu ý

- Dữ liệu chỉ được lưu trên trình duyệt hiện tại
- Khi xóa cache trình duyệt, dữ liệu sẽ bị mất
- Dữ liệu không được đồng bộ giữa các thiết bị
- Nên backup dữ liệu quan trọng bằng cách export

## Cách sử dụng

1. **Thêm/sửa dữ liệu**: Hoạt động bình thường, dữ liệu sẽ tự động được lưu
2. **Refresh trang**: Dữ liệu sẽ được khôi phục tự động
3. **Xóa dữ liệu**: Click nút "Xóa dữ liệu" và xác nhận
4. **Kiểm tra dữ liệu**: Mở DevTools > Application > Local Storage để xem dữ liệu đã lưu
