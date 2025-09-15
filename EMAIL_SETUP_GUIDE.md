# 📧 Hướng Dẫn Cấu Hình Email Xác Nhận Đặt Lịch

## 🎯 Tính Năng
- Gửi email xác nhận khi khách đặt lịch thành công
- Template email đẹp với thông tin chi tiết
- Hỗ trợ Gmail, SendGrid, Resend

## 🔧 Cấu Hình Gmail (Khuyến nghị)

### Bước 1: Tạo App Password
1. Truy cập [Google Account Settings](https://myaccount.google.com/)
2. Vào **Security** → **2-Step Verification** (bật nếu chưa có)
3. Vào **Security** → **App passwords**
4. Chọn **Mail** và **Other (Custom name)**
5. Nhập tên: "Face Wash Fox CRM"
6. Copy App Password (16 ký tự)

### Bước 2: Set Environment Variables
```bash
# Trong Vercel Dashboard hoặc .env.local
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Bước 3: Test Email
1. Truy cập Dashboard
2. Scroll xuống phần "Test Gửi Email Xác Nhận Đặt Lịch"
3. Điền thông tin test
4. Click "Gửi Email Test"

## 🚀 Cấu Hình SendGrid (Chuyên nghiệp)

### Bước 1: Tạo Account SendGrid
1. Truy cập [SendGrid](https://sendgrid.com/)
2. Đăng ký account miễn phí (100 emails/tháng)
3. Verify email address

### Bước 2: Tạo API Key
1. Vào **Settings** → **API Keys**
2. Click **Create API Key**
3. Chọn **Restricted Access**
4. Cấp quyền **Mail Send**
5. Copy API Key

### Bước 3: Cập nhật Code
```typescript
// Trong app/lib/email-service.ts
const EMAIL_CONFIG = {
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
};
```

## 📱 Cấu Hình Resend (Modern)

### Bước 1: Tạo Account Resend
1. Truy cập [Resend](https://resend.com/)
2. Đăng ký account miễn phí (3,000 emails/tháng)
3. Verify domain

### Bước 2: Lấy API Key
1. Vào **API Keys**
2. Click **Create API Key**
3. Copy API Key

### Bước 3: Cập nhật Code
```typescript
// Trong app/lib/email-service.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  const { data, error } = await resend.emails.send({
    from: 'Face Wash Fox <noreply@yourdomain.com>',
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }

  console.log('✅ Email sent successfully:', data);
  return { success: true, messageId: data.id };
};
```

## 🎨 Tùy Chỉnh Template Email

### Thay đổi màu sắc
```typescript
// Trong EMAIL_TEMPLATES.bookingConfirmation
background: linear-gradient(135deg, #f97316, #ea580c); // Màu cam
```

### Thêm logo
```typescript
// Thay thế emoji bằng logo
<div class="logo">
  <img src="https://yourdomain.com/logo.png" alt="Face Wash Fox" style="height: 40px;">
</div>
```

### Thêm thông tin bổ sung
```typescript
// Thêm vào booking-details
<div class="detail-row">
  <span class="detail-label">Ghi chú:</span>
  <span class="detail-value">${bookingData.notes || 'Không có'}</span>
</div>
```

## 🔍 Troubleshooting

### Lỗi "Invalid login"
- Kiểm tra EMAIL_USER và EMAIL_PASSWORD
- Đảm bảo đã bật 2-Step Verification
- Sử dụng App Password, không phải mật khẩu thường

### Lỗi "Connection timeout"
- Kiểm tra firewall
- Thử port 465 với secure: true

### Email không được gửi
- Kiểm tra spam folder
- Verify email address trong SendGrid/Resend
- Kiểm tra logs trong Vercel Functions

## 📊 Monitoring

### Xem logs email
```bash
vercel logs --follow
```

### Test email configuration
```typescript
import { testEmailConfiguration } from '@/app/lib/email-service';

// Test trong component
const testConfig = await testEmailConfiguration();
console.log('Email config:', testConfig);
```

## 🎯 Sử Dụng Trong Production

### Tích hợp với booking form
```typescript
// Trong booking form submit
const handleBookingSubmit = async (formData) => {
  // ... xử lý đặt lịch
  
  // Gửi email xác nhận
  const emailResult = await fetch('/api/booking/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: formData.name,
      customerEmail: formData.email,
      // ... other fields
    })
  });
  
  if (emailResult.ok) {
    showSuccess('Đặt lịch thành công! Email xác nhận đã được gửi.');
  }
};
```

## 📈 Nâng Cấp

### Thêm email templates khác
- Email nhắc nhở trước giờ hẹn
- Email cảm ơn sau dịch vụ
- Email khuyến mãi

### Thêm SMS notification
- Tích hợp với Twilio
- Gửi SMS + Email

### Analytics
- Track email open rates
- Track click rates
- A/B test templates
