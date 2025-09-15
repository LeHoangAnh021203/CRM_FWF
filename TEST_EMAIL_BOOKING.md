# 🧪 Test Email Booking - Hướng Dẫn Kiểm Tra

## ✅ **Tính Năng Đã Tích Hợp**

### **📧 Email Notification trong Form Đặt Lịch**
- ✅ Thêm trường email (tùy chọn)
- ✅ Thêm dropdown chọn dịch vụ
- ✅ Tích hợp gửi email xác nhận khi đặt lịch
- ✅ Hiển thị thông báo thành công/lỗi

## 🎯 **Cách Test**

### **Bước 1: Truy Cập Map**
1. Đăng nhập vào dashboard
2. Vào **Map** tab
3. Click vào bất kỳ marker nào (🦊)

### **Bước 2: Đặt Lịch**
1. Click **"Đặt lịch hẹn"** trong popup
2. Điền form:
   - **Họ và tên**: Bắt buộc
   - **Số điện thoại**: Bắt buộc  
   - **Email**: Tùy chọn (để nhận xác nhận)
   - **Ngày hẹn**: Chọn ngày
   - **Giờ hẹn**: Chọn giờ
   - **Dịch vụ**: Chọn dịch vụ
3. Click **"Xác nhận đặt lịch"**

### **Bước 3: Kiểm Tra Kết Quả**

#### **✅ Thành Công (Email được gửi)**
```
🎉 Đặt lịch thành công!

📧 Email xác nhận đã được gửi!
Mã đặt lịch: FWF1234567890

Chi nhánh: Chi nhánh Quận 1
Ngày: 25/12/2024
Giờ: 14:00
Dịch vụ: Rửa mặt chuyên sâu
Khách hàng: Nguyễn Văn A
SĐT: 0123456789
```

#### **⚠️ Thành Công (Email lỗi)**
```
✅ Đặt lịch thành công!

⚠️ Không thể gửi email xác nhận: [Lỗi chi tiết]

Chi nhánh: Chi nhánh Quận 1
Ngày: 25/12/2024
Giờ: 14:00
Dịch vụ: Rửa mặt chuyên sâu
Khách hàng: Nguyễn Văn A
SĐT: 0123456789
```

## 🔧 **Cấu Hình Email (Nếu Chưa Có)**

### **Option 1: Gmail (Miễn phí)**
```bash
# Trong Vercel Dashboard hoặc .env.local
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### **Option 2: Test Mode (Không cần cấu hình)**
- Nếu chưa cấu hình email, hệ thống sẽ hiển thị thông báo lỗi
- Nhưng đặt lịch vẫn thành công
- Có thể test với component test email trong dashboard

## 📱 **Test Component Email**

### **Cách 1: Test Component**
1. Vào **Dashboard** tab
2. Scroll xuống phần **"Test Gửi Email Xác Nhận Đặt Lịch"**
3. Điền thông tin test
4. Click **"Gửi Email Test"**

### **Cách 2: Test API Trực Tiếp**
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

## 🐛 **Troubleshooting**

### **Lỗi "Email không được gửi"**
1. **Kiểm tra environment variables:**
   ```bash
   echo $EMAIL_USER
   echo $EMAIL_PASSWORD
   ```

2. **Kiểm tra logs Vercel:**
   ```bash
   vercel logs --follow
   ```

3. **Test email configuration:**
   - Dùng component test trong dashboard
   - Kiểm tra console logs

### **Lỗi "Connection failed"**
- Kiểm tra firewall
- Thử port 465 với secure: true
- Kiểm tra App Password (Gmail)

### **Email vào spam**
- Kiểm tra spam folder
- Verify email address
- Thêm domain vào whitelist

## 📊 **Monitoring**

### **Xem Logs Email**
```bash
# Vercel logs
vercel logs --follow

# Local logs
npm run dev
# Xem console trong browser
```

### **Test Email Templates**
- Mở email xác nhận
- Kiểm tra format HTML
- Test responsive design
- Kiểm tra links và buttons

## 🎨 **Customization**

### **Thay Đổi Template Email**
```typescript
// Trong app/lib/email-service.ts
export const EMAIL_TEMPLATES = {
  bookingConfirmation: (bookingData) => {
    return `
      <div style="background: linear-gradient(135deg, #f97316, #ea580c);">
        <!-- Your custom template -->
      </div>
    `;
  }
};
```

### **Thêm Dịch Vụ Mới**
```typescript
// Trong branchMap.tsx
<option value="Dịch vụ mới">Dịch vụ mới</option>
```

### **Thay Đổi Thông Báo**
```typescript
// Trong handleSubmit function
alert(`Your custom message: ${emailResult.bookingId}`);
```

## ✅ **Checklist Test**

- [ ] Form đặt lịch hiển thị đúng
- [ ] Validation hoạt động (required fields)
- [ ] Email field optional
- [ ] Service dropdown có options
- [ ] Submit form gửi email
- [ ] Thông báo thành công hiển thị
- [ ] Mã đặt lịch được tạo
- [ ] Email template đẹp
- [ ] Responsive design
- [ ] Error handling

## 🚀 **Deploy & Test Production**

1. **Deploy lên Vercel:**
   ```bash
   vercel --prod
   ```

2. **Cấu hình environment variables:**
   - Vào Vercel Dashboard
   - Settings → Environment Variables
   - Thêm EMAIL_USER và EMAIL_PASSWORD

3. **Test production:**
   - Truy cập URL production
   - Test đặt lịch với email thật
   - Kiểm tra email nhận được

## 📈 **Next Steps**

- [ ] Thêm SMS notification
- [ ] Tích hợp với calendar system
- [ ] Thêm email reminder
- [ ] Analytics email open rates
- [ ] A/B test templates
