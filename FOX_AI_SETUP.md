# 🦊 Fox Person AI Generator - Setup Guide

## 📋 **Tổng Quan**

Ứng dụng này cho phép bạn biến đổi hình ảnh người thành người cáo bằng AI. Sử dụng Stable Diffusion để tạo ra những hình ảnh độc đáo và chất lượng cao.

## 🚀 **Cách Sử Dụng**

### 1. **Cấu Hình AI Service**

1. Truy cập trang `/generateAI`
2. Click "Show AI Settings"
3. Chọn AI service (khuyến nghị: Stability AI)
4. Nhập API key

### 2. **Các AI Service Khả Dụng**

#### **Stability AI (Khuyến Nghị)**
- ✅ **Miễn phí** cho personal use
- ✅ Chất lượng cao
- ✅ API ổn định
- 🔗 [Get API Key](https://platform.stability.ai/)

#### **Replicate**
- 💰 Pay-per-use
- 🔧 Nhiều model AI
- 🔗 [Get API Key](https://replicate.com/)

#### **OpenAI DALL-E**
- 💰 Đắt hơn
- 🏆 Chất lượng cao nhất
- 🔗 [Get API Key](https://platform.openai.com/)

### 3. **Cách Lấy API Key**

#### **Stability AI:**
1. Truy cập [platform.stability.ai](https://platform.stability.ai/)
2. Đăng ký tài khoản miễn phí
3. Vào "Account" → "API Keys"
4. Tạo API key mới
5. Copy và paste vào ứng dụng

### 4. **Sử Dụng Ứng Dụng**

1. **Upload Ảnh:** Chọn ảnh người từ máy tính
2. **Mô Tả Cáo:** Nhập mô tả loại cáo bạn muốn
3. **Điều Chỉnh:** Tùy chỉnh style và strength
4. **Tạo:** Click "Tạo Người Cáo"
5. **Tải Xuống:** Lưu kết quả về máy

## 🎨 **Prompt Gợi Ý**

### **Các Loại Cáo Phổ Biến:**
- "Cáo đỏ với đuôi xù"
- "Cáo trắng với mắt xanh"
- "Cáo hoang dã với bộ lông rậm"
- "Cáo tinh nghịch với tai nhọn"
- "Cáo thông minh với đuôi dài"

### **Style Presets:**
- **Realistic:** Chân thực, tự nhiên
- **Artistic:** Nghệ thuật, sáng tạo
- **Anime:** Phong cách anime Nhật Bản
- **Cartoon:** Hoạt hình vui nhộn
- **Oil Painting:** Tranh sơn dầu
- **Watercolor:** Tranh màu nước

## ⚙️ **Cài Đặt Kỹ Thuật**

### **Environment Variables:**
```bash
# Tạo file .env.local
NEXT_PUBLIC_STABILITY_API_KEY=your_api_key_here
```

### **Dependencies:**
```bash
npm install lucide-react
```

## 🔧 **Troubleshooting**

### **Lỗi "API Key not configured":**
- Kiểm tra API key đã được nhập chưa
- Đảm bảo API key hợp lệ
- Thử tạo API key mới

### **Lỗi "AI generation failed":**
- Kiểm tra kết nối internet
- Đảm bảo API key có đủ credits
- Thử giảm strength hoặc thay đổi prompt

### **Kết quả không như mong đợi:**
- Thử prompt khác
- Điều chỉnh strength (0.1 - 1.0)
- Thay đổi style preset

## 💡 **Tips & Tricks**

### **Để Có Kết Quả Tốt Nhất:**
1. **Chọn ảnh rõ nét:** Ảnh có độ phân giải cao
2. **Mô tả chi tiết:** "Cáo đỏ với đuôi xù, mắt xanh, tai nhọn"
3. **Điều chỉnh strength:** 0.7-0.9 cho kết quả tốt
4. **Thử nhiều lần:** AI có thể cho kết quả khác nhau

### **Prompt Engineering:**
- ✅ "anthropomorphic fox, detailed fur, fox ears, fox tail"
- ✅ "high quality, detailed, professional photography"
- ❌ "low quality, blurry, distorted"

## 🎯 **Tính Năng Nâng Cao**

### **Batch Processing:**
- Upload nhiều ảnh cùng lúc
- Xử lý hàng loạt
- Export tất cả kết quả

### **Custom Models:**
- Fine-tune model cho fox transformation
- Tạo style riêng
- Lưu preset cá nhân

## 📞 **Hỗ Trợ**

Nếu gặp vấn đề:
1. Kiểm tra console log
2. Thử refresh trang
3. Xóa cache browser
4. Liên hệ support

---

**Happy Fox Transforming! 🦊✨**
