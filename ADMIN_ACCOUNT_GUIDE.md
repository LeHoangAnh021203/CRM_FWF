# Hướng dẫn tài khoản Admin

## Thông tin đăng nhập Admin

Tôi đã tạo thành công tài khoản admin cho bạn với thông tin sau:

### 🔐 Thông tin đăng nhập
- **Username:** `admin`
- **Password:** `1234`

### 🚀 Cách sử dụng

1. **Truy cập trang đăng nhập:**
   - Mở trình duyệt và đi đến `/login`
   - Hoặc truy cập trực tiếp: `http://localhost:3000/login`

2. **Đăng nhập:**
   - Nhập username: `admin`
   - Nhập password: `1234`
   - Nhấn nút "Sign In"

3. **Quyền hạn Admin:**
   - Tài khoản admin có quyền `ROLE_ADMIN`
   - Có thể truy cập tất cả các tính năng của hệ thống
   - Có quyền quản lý người dùng và cài đặt hệ thống

### 🔧 Chi tiết kỹ thuật

#### API Endpoint được tạo:
- **File:** `/app/api/proxy/auth/login/route.ts`
- **Endpoint:** `POST /api/proxy/auth/login`
- **Chức năng:** Xử lý đăng nhập admin với mock data

#### Thông tin tài khoản Admin:
```json
{
  "id": 1,
  "firstname": "Admin",
  "lastname": "User", 
  "username": "admin",
  "email": "admin@fwnetwork.com",
  "phoneNumber": "+84901234567",
  "dob": "1990-01-01",
  "gender": true,
  "bio": "System Administrator",
  "avatar": null,
  "role": "ADMIN",
  "active": true
}
```

#### Token được tạo:
- **Access Token:** JWT token với quyền `ROLE_ADMIN`
- **Refresh Token:** Token để làm mới access token
- **Expiration:** Token có thời hạn 7 ngày

### 🛡️ Bảo mật

- Tài khoản admin chỉ hoạt động trong môi trường development
- Trong production, cần thay đổi password mạnh hơn
- Token được lưu trữ an toàn trong localStorage và cookies

### 🔄 Cách hoạt động

1. Khi đăng nhập với `admin/1234`, hệ thống sẽ:
   - Kiểm tra credentials trong mock API
   - Tạo JWT token với quyền admin
   - Lưu token và thông tin user
   - Chuyển hướng đến dashboard

2. Token được sử dụng để:
   - Xác thực các API calls
   - Kiểm tra quyền truy cập
   - Tự động refresh khi cần thiết

### 📝 Lưu ý

- Tài khoản này chỉ dành cho mục đích testing và development
- Không sử dụng trong môi trường production
- Có thể thay đổi thông tin tài khoản trong file `/app/api/proxy/auth/login/route.ts`

### 🎯 Test ngay

Bạn có thể test ngay bằng cách:
1. Khởi động ứng dụng: `npm run dev`
2. Truy cập: `http://localhost:3000/login`
3. Đăng nhập với: `admin` / `1234`
4. Kiểm tra quyền admin trong dashboard

---

**Chúc bạn sử dụng thành công! 🎉**
