# 🔐 Security Setup Guide

## Environment Variables Setup

### 1. Local Development

Tạo file `.env.local` trong thư mục gốc của project:

```bash
# API Keys - Thay thế bằng key thật của bạn
OPENAI_API_KEY=sk-your_openai_api_key_here
STABILITY_API_KEY=sk-your_stability_api_key_here
REPLICATE_API_KEY=r8_your_replicate_api_key_here

# Database (nếu có)
DATABASE_URL=your_database_url_here

# JWT Secret (cho authentication)
JWT_SECRET=your_super_secret_jwt_key_here

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Production Deployment

#### Vercel Deployment:
1. Vào Vercel Dashboard
2. Chọn project của bạn
3. Vào Settings > Environment Variables
4. Thêm từng biến môi trường:
   - `OPENAI_API_KEY`
   - `STABILITY_API_KEY`
   - `REPLICATE_API_KEY`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_BASE_URL`

#### Netlify Deployment:
1. Vào Netlify Dashboard
2. Chọn site của bạn
3. Vào Site settings > Environment variables
4. Thêm các biến môi trường tương tự

#### Railway/Render:
- Sử dụng Environment Variables section trong dashboard

### 3. Bảo mật API Keys

#### ✅ DO (Nên làm):
- Sử dụng environment variables
- Thêm `.env*` vào `.gitignore`
- Sử dụng prefix `NEXT_PUBLIC_` chỉ cho biến public
- Rotate keys định kỳ
- Sử dụng least privilege principle

#### ❌ DON'T (Không nên làm):
- Hardcode API keys trong code
- Commit `.env` files vào git
- Log API keys
- Share keys qua email/chat
- Sử dụng keys trong client-side code

### 4. Kiểm tra bảo mật

```bash
# Kiểm tra xem có key nào bị lộ không
grep -r "sk-" src/
grep -r "r8_" src/
grep -r "Bearer" src/

# Kiểm tra .env files có bị commit không
git log --all --full-history -- .env*
```

### 5. Monitoring & Alerts

- Setup alerts khi có suspicious activity
- Monitor API usage
- Log failed authentication attempts
- Setup rate limiting

### 6. Backup & Recovery

- Backup environment variables securely
- Document key rotation process
- Setup emergency access procedures

## 🔒 Additional Security Measures

### 1. API Rate Limiting
```typescript
// Thêm rate limiting cho API routes
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 2. CORS Configuration
```typescript
// Chỉ cho phép domain được tin cậy
const corsOptions = {
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
};
```

### 3. Input Validation
```typescript
// Validate tất cả input từ user
import { z } from 'zod';

const userInputSchema = z.object({
  prompt: z.string().min(1).max(500),
  strength: z.number().min(0).max(1)
});
```

### 4. Error Handling
```typescript
// Không expose sensitive information trong errors
try {
  // API call
} catch (error) {
  console.error('Internal error:', error);
  return NextResponse.json({ 
    error: 'Something went wrong' 
  }, { status: 500 });
}
```

## 🚨 Emergency Procedures

### Nếu API key bị lộ:
1. **IMMEDIATELY** revoke key trong provider dashboard
2. Generate new key
3. Update environment variables
4. Deploy immediately
5. Audit logs for suspicious activity
6. Notify team members

### Key Rotation Schedule:
- Production keys: Every 90 days
- Development keys: Every 180 days
- Emergency rotation: As needed

## 📞 Support

Nếu có vấn đề về bảo mật:
- Email: security@yourcompany.com
- Slack: #security-alerts
- Emergency: +1-XXX-XXX-XXXX

