# 📧 Dual Email Notification - Hướng Dẫn

## ✅ **Tính Năng Đã Hoàn Thành**

### ** Dual Email Notification**
- **Email cho khách hàng**: Xác nhận đặt lịch thành công
- **Email cho nhà cáo**: Thông báo có khách đặt lịch mới
- **Gửi đồng thời** cả 2 email khi có đặt lịch

## 📧 **Email Templates**

### **1. Email Cho Khách Hàng**
- **Subject**: `🦊 Xác nhận đặt lịch thành công - [Dịch vụ]`
- **Nội dung**: Thông tin đặt lịch, lưu ý quan trọng
- **Màu sắc**: Cam (#f97316) - thân thiện
- **Call-to-action**: Xem chi nhánh trên bản đồ

### **2. Email Cho Nhà Cáo**
- **Subject**: `🔔 Có khách đặt lịch mới - [Tên khách] - [Dịch vụ]`
- **Nội dung**: Thông tin khách hàng, hành động cần thực hiện
- **Màu sắc**: Xanh lá (#059669) - chuyên nghiệp
- **Call-to-action**: Gọi khách hàng, gửi email, xem hệ thống

## 🎯 **Cách Test**

### **Bước 1: Cấu Hình Email**
```bash
# Trong Vercel Dashboard hoặc .env.local
EMAIL_USER=nhacao@gmail.com          # Email của nhà cáo
EMAIL_PASSWORD=abcd-efgh-ijkl-mnop   # App Password của nhà cáo
```

### **Bước 2: Test Đặt Lịch**
1. Vào **Dashboard** → **Map**
2. Click vào marker 🦊
3. Click **"Đặt lịch hẹn"**
4. Điền form:
   - **Họ và tên**: Test User
   - **Số điện thoại**: 0123456789
   - **Email**: test@example.com
   - **Ngày hẹn**: Chọn ngày
   - **Giờ hẹn**: Chọn giờ
   - **Dịch vụ**: Chọn dịch vụ
5. Click **"Xác nhận đặt lịch"**

### **Bước 3: Kiểm Tra Kết Quả**

#### **✅ Thành Công (Cả 2 email)**
```
🎉 Đặt lịch thành công!

📧 Email đã được gửi cho khách hàng và nhà cáo!
Mã đặt lịch: FWF1234567890

Chi nhánh: Chi nhánh Quận 1
Ngày: 25/12/2024
Giờ: 14:00
Dịch vụ: Rửa mặt chuyên sâu
Khách hàng: Test User
SĐT: 0123456789
```

#### **⚠️ Thành Công (Chỉ 1 email)**
```
🎉 Đặt lịch thành công!

📧 Email đã được gửi cho khách hàng (nhà cáo chưa nhận được)
Mã đặt lịch: FWF1234567890
```

## 📱 **Email Templates Chi Tiết**

### **Email Khách Hàng**
```html
🦊 Xác nhận đặt lịch thành công

Mã đặt lịch: #FWF1234567890
Tên khách hàng: Test User
Email: test@example.com
Số điện thoại: 0123456789
Dịch vụ: Rửa mặt chuyên sâu
Chi nhánh: Chi nhánh Quận 1
Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP.HCM
Ngày đặt lịch: 25/12/2024
Giờ đặt lịch: 14:00

Lưu ý quan trọng:
- Vui lòng đến đúng giờ đã đặt lịch
- Mang theo CMND/CCCD để xác minh thông tin
- Liên hệ hotline 0889 866 666 nếu cần hỗ trợ
- Có thể hủy/đổi lịch trước 2 giờ

[Xem chi nhánh trên bản đồ]
```

### **Email Nhà Cáo**
```html
🔔 Có khách đặt lịch mới

🚨 Có khách đặt lịch mới!
Vui lòng chuẩn bị và xác nhận lịch hẹn với khách hàng.

Mã đặt lịch: #FWF1234567890
Tên khách hàng: Test User
Email khách hàng: test@example.com
Số điện thoại: 0123456789
Dịch vụ: Rửa mặt chuyên sâu
Chi nhánh: Chi nhánh Quận 1
Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP.HCM
Ngày đặt lịch: 25/12/2024
Giờ đặt lịch: 14:00

Hành động cần thực hiện:
- Xác nhận lịch hẹn với khách hàng qua điện thoại
- Chuẩn bị không gian và dụng cụ cho dịch vụ
- Kiểm tra lịch trình nhân viên
- Gửi lời nhắc nhở trước giờ hẹn 1 tiếng

[Gọi khách hàng] [Gửi email] [Xem hệ thống]
```

## 🔧 **Cấu Hình Nâng Cao**

### **Thay Đổi Email Nhà Cáo**
```typescript
// Trong app/lib/email-service.ts
const businessEmail = process.env.EMAIL_USER || 'your-email@gmail.com';
// Thay đổi thành email khác nếu cần
const businessEmail = process.env.BUSINESS_EMAIL || process.env.EMAIL_USER;
```

### **Thêm Environment Variable**
```bash
# Trong Vercel Dashboard
EMAIL_USER=nhacao@gmail.com
EMAIL_PASSWORD=app-password
BUSINESS_EMAIL=admin@facewashfox.com  # Email riêng cho thông báo
```

### **Customize Templates**
```typescript
// Thay đổi màu sắc
.header { background: linear-gradient(135deg, #your-color, #your-color); }

// Thay đổi nội dung
<h1>Your Custom Title</h1>
<p>Your custom message</p>
```

## 📊 **Monitoring & Debugging**

### **Xem Logs**
```bash
# Vercel logs
vercel logs --follow

# Local logs
npm run dev
# Xem console trong browser
```

### **Test API Trực Tiếp**
```bash
curl -X POST https://your-domain.vercel.app/api/booking/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "0123456789",
    "service": "Rửa mặt chuyên sâu",
    "branchName": "Chi nhánh Test",
    "branchAddress": "123 Test Street",
    "bookingDate": "2024-12-25",
    "bookingTime": "14:00"
  }'
```

### **Response Format**
```json
{
  "success": true,
  "message": "📧 Email đã được gửi cho khách hàng và nhà cáo",
  "bookingId": "FWF1234567890",
  "emailMessageId": "message-id",
  "emailDetails": {
    "customer": {
      "success": true,
      "messageId": "customer-message-id"
    },
    "business": {
      "success": true,
      "messageId": "business-message-id"
    }
  }
}
```

## 🚀 **Deploy & Production**

### **1. Deploy lên Vercel**
```bash
vercel --prod
```

### **2. Cấu hình Environment Variables**
- Vào Vercel Dashboard
- Settings → Environment Variables
- Thêm EMAIL_USER và EMAIL_PASSWORD

### **3. Test Production**
- Truy cập URL production
- Test đặt lịch với email thật
- Kiểm tra cả 2 email nhận được

## ✅ **Checklist Test**

- [ ] Form đặt lịch hiển thị đúng
- [ ] Validation hoạt động
- [ ] Submit form gửi dual email
- [ ] Email khách hàng nhận được
- [ ] Email nhà cáo nhận được
- [ ] Thông báo hiển thị chi tiết
- [ ] Mã đặt lịch được tạo
- [ ] Templates đẹp và responsive
- [ ] Error handling hoạt động
- [ ] Production deploy thành công

## 🎯 **Next Steps**

- [ ] Thêm SMS notification
- [ ] Tích hợp với calendar system
- [ ] Thêm email reminder
- [ ] Analytics email open rates
- [ ] A/B test templates
- [ ] Multi-language support
