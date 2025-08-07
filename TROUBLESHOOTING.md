# 🔧 Fox AI Generator - Troubleshooting Guide

## 🚨 **Lỗi Thường Gặp**

### **1. Lỗi "AI generation failed: 400"**

#### **Nguyên nhân:**
- API key không hợp lệ
- Thiếu credits
- Request format không đúng
- Ảnh quá lớn

#### **Cách sửa:**
1. **Kiểm tra API key:**
   ```bash
   # Mở browser console (F12)
   # Xem log để kiểm tra API key
   ```

2. **Kiểm tra credits:**
   - Truy cập [platform.stability.ai/account/credits](https://platform.stability.ai/account/credits)
   - Đảm bảo còn credits

3. **Kiểm tra ảnh:**
   - Ảnh phải < 10MB
   - Format: JPG, PNG, WEBP
   - Độ phân giải hợp lý

### **2. Lỗi "API Key not configured"**

#### **Cách sửa:**
1. Click "Show AI Settings"
2. Nhập API key vào ô "API Key"
3. Đảm bảo API key bắt đầu với `sk-`

### **3. Lỗi "Insufficient credits"**

#### **Cách sửa:**
1. Mua thêm credits tại [platform.stability.ai](https://platform.stability.ai/)
2. Hoặc đợi reset credits tháng sau

### **4. Lỗi Network/Timeout**

#### **Cách sửa:**
1. Kiểm tra kết nối internet
2. Thử lại sau vài phút
3. Sử dụng VPN nếu cần

## 🔍 **Debug Steps**

### **Bước 1: Kiểm tra Console**
1. Mở Developer Tools (F12)
2. Vào tab Console
3. Thử generate ảnh
4. Xem log messages

### **Bước 2: Kiểm tra API Key**
```javascript
// Trong console, chạy:
console.log('API Key length:', apiKey.length);
console.log('API Key starts with sk-:', apiKey.startsWith('sk-'));
```

### **Bước 3: Test API Key**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.stability.ai/v1/user/balance
```

## 🛠️ **Manual API Test**

### **Test với curl:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "init_image=@test.jpg" \
  -F "text_prompts[0][text]=fox person" \
  -F "text_prompts[0][weight]=1" \
  -F "cfg_scale=7.5" \
  -F "steps=30" \
  -F "samples=1" \
  https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image
```

## 📋 **Checklist Trước Khi Generate**

- [ ] API key đã được nhập
- [ ] API key bắt đầu với `sk-`
- [ ] Còn credits trong tài khoản
- [ ] Ảnh đã được upload
- [ ] Prompt đã được nhập
- [ ] Kết nối internet ổn định

## 🎯 **Tips Để Tránh Lỗi**

### **1. Sử dụng ảnh tốt:**
- Độ phân giải: 512x512 đến 1024x1024
- Format: JPG hoặc PNG
- Kích thước: < 5MB
- Chất lượng: Rõ nét, không blur

### **2. Prompt tối ưu:**
```bash
# ✅ Tốt
"fox person, anthropomorphic, detailed fur, orange color"

# ❌ Không tốt
"fox" (quá ngắn)
"very very very detailed fox with many many details" (quá dài)
```

### **3. Settings tối ưu:**
- **Strength:** 0.7 - 0.9
- **Steps:** 20 - 30
- **CFG Scale:** 7.0 - 8.0

## 🔄 **Alternative Solutions**

### **Nếu Stability AI không hoạt động:**

#### **1. Replicate API:**
```javascript
// Thay đổi endpoint
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${REPLICATE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    input: {
      image: base64Image,
      prompt: prompt
    }
  })
});
```

#### **2. OpenAI DALL-E:**
```javascript
// Thay đổi endpoint
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024"
  })
});
```

## 📞 **Hỗ Trợ**

### **Nếu vẫn gặp vấn đề:**
1. Chụp màn hình lỗi
2. Copy console logs
3. Gửi thông tin cho support

### **Thông tin cần cung cấp:**
- Lỗi cụ thể
- Console logs
- API key (che giấu một phần)
- Ảnh test (nếu có)
- Browser và OS

---

**Happy Debugging! 🐛✨**
