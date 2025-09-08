# Cấu hình Google Maps cho trang Map

## Bước 1: Tạo Google Maps API Key

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable Google Maps JavaScript API
4. Tạo API Key trong Credentials
5. Giới hạn API Key cho domain của bạn (khuyến nghị)

## Bước 2: Cấu hình Environment Variables

Thêm vào file `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Bước 3: Thêm icon fox

Đảm bảo file `fox.png` có trong thư mục `public/` để hiển thị icon cho các marker trên map.

## Tính năng của trang Map

### ✅ Đã hoàn thành:
- **Google Maps Integration**: Hiển thị bản đồ với các marker cho từng chi nhánh
- **Sidebar Navigation**: Danh sách chi nhánh theo thành phố với checkbox để filter
- **Interactive Markers**: Click vào marker để xem thông tin chi nhánh
- **Booking Form**: Form đặt lịch đầy đủ với validation
- **Responsive Design**: Giao diện responsive cho mobile và desktop
- **Notification System**: Thông báo thành công/lỗi khi đặt lịch

### 📋 Form đặt lịch bao gồm:
- Họ và tên (bắt buộc)
- Số điện thoại (bắt buộc)
- Email (không bắt buộc)
- Dịch vụ (bắt buộc)
- Ngày đặt lịch (bắt buộc)
- Giờ đặt lịch (bắt buộc)
- Ghi chú (không bắt buộc)

### 🗺️ Dữ liệu chi nhánh:
- **Hồ Chí Minh**: 4 chi nhánh
- **Hà Nội**: 4 chi nhánh
- **Đà Nẵng**: 1 chi nhánh
- **Vũng Tàu**: 2 chi nhánh

### 🔧 API Endpoint:
- `POST /api/booking/create` - Tạo booking mới

## Lưu ý:
- Cần có Google Maps API Key hợp lệ để map hoạt động
- Icon fox.png cần có trong thư mục public
- API booking cần được implement ở backend

