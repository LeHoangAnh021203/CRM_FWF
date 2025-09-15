# 🔐 Authentication Guide

Hệ thống authentication hỗ trợ cả **API Mode** và **Mock Mode** với khả năng tự động fallback.

## 🎯 Cách hoạt động

### 1. **API Mode** (Ưu tiên)
- Khi có API server chạy và cấu hình đúng
- Sử dụng API thật để xác thực
- Fallback về Mock Mode nếu API không khả dụng

### 2. **Mock Mode** (Fallback)
- Khi không có API server hoặc API không khả dụng
- Sử dụng tài khoản mock có sẵn
- Hoàn toàn local, không cần server

## ⚙️ Cấu hình

### File: `app/lib/auth-config.ts`
```typescript
export const AUTH_CONFIG = {
  // Set to true to force mock mode
  FORCE_MOCK_MODE: false,
  
  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
}
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001  # API server URL
USE_MOCK_AUTH=true                              # Force mock mode in development
```

## 🔑 Tài khoản Mock

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `admin` | `admin123` | admin | All permissions |
| `manager` | `manager123` | manager | Dashboard, customers, orders, services, reports |
| `staff` | `staff123` | staff | Dashboard, customers, orders |
| `demo` | `demo123` | manager | Dashboard, customers, orders, services |

## 🚀 Các chế độ sử dụng

### 1. **Chỉ dùng Mock Mode**
```typescript
// Trong auth-config.ts
FORCE_MOCK_MODE: true
```

### 2. **Chỉ dùng API Mode**
```typescript
// Trong auth-config.ts
FORCE_MOCK_MODE: false
// Và set NEXT_PUBLIC_API_BASE_URL
```

### 3. **API + Mock Fallback** (Mặc định)
```typescript
// Trong auth-config.ts
FORCE_MOCK_MODE: false
// API sẽ được thử trước, nếu fail thì dùng Mock
```

## 🔍 Kiểm tra chế độ hiện tại

### 1. **API Endpoint**
```bash
GET /api/auth/mode
```

### 2. **Component Indicator**
```tsx
import { AuthModeIndicator } from '@/components/auth-mode-indicator'

// Hiển thị badge ở góc màn hình
<AuthModeIndicator />
```

## 📝 Log Messages

### API Mode
- `🌐 Calling real API: http://localhost:3001/api/auth/login`
- `✅ API Login successful`

### Mock Mode
- `🎭 Using mock authentication`
- `Login successful (Mock Mode)`

### Fallback
- `❌ API Connection failed, falling back to mock`
- `🔄 API unavailable, using mock authentication as fallback`
- `Login successful (Mock Mode - API Fallback)`

## 🛠️ Troubleshooting

### Lỗi 503 Service Unavailable
- **Nguyên nhân**: API server không chạy
- **Giải pháp**: Hệ thống sẽ tự động fallback về Mock Mode

### Lỗi Connection Failed
- **Nguyên nhân**: Không thể kết nối đến API
- **Giải pháp**: Kiểm tra URL API và network

### Mock Mode không hoạt động
- **Nguyên nhân**: Tài khoản không đúng
- **Giải pháp**: Sử dụng tài khoản mock có sẵn

## 🎨 UI Components

### AuthModeIndicator
Hiển thị chế độ authentication hiện tại:
- 🌐 API Mode (xanh)
- 🎭 Mock Mode (xám)

### Vị trí: Góc trên bên phải màn hình
