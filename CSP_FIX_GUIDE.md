# 🔒 CSP (Content Security Policy) Fix Guide

## Vấn đề gặp phải

Lỗi CSP chặn việc tải Leaflet và Mapbox từ CDN:
```
Content Security Policy of your site blocks some resources
Some resources are blocked because their origin is not listed in your site's Content Security Policy (CSP)
```

## ✅ Giải pháp đã triển khai

### 1. Cập nhật CSP trong middleware.ts

Đã thêm các domain được phép vào CSP:
- `https://cdnjs.cloudflare.com` - Cho Leaflet CDN
- `https://api.mapbox.com` - Cho Mapbox CDN

### 2. Sử dụng Local Installation với Fallback CDN

Thay vì chỉ dựa vào CDN, giờ đây:
- **Ưu tiên**: Load từ `node_modules` (local installation)
- **Fallback**: Load từ CDN nếu local thất bại

### 3. Tạo MapLoader Component

Component mới để xử lý việc load map libraries một cách an toàn.

## 🛠️ Cách sử dụng

### Option 1: Sử dụng MapLoader (Khuyến nghị)

```tsx
import MapLoader from '@/app/components/MapLoader';

function MapPage() {
  return (
    <MapLoader mapType="leaflet">
      {/* Your map component */}
    </MapLoader>
  );
}
```

### Option 2: Direct Import (Đã cập nhật)

Map components đã được cập nhật để tự động:
1. Thử load từ local installation trước
2. Fallback về CDN nếu cần

## 🔧 Cấu hình CSP

### Development Environment
```typescript
script-src: 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com https://api.mapbox.com
style-src: 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://api.mapbox.com
```

### Production Environment
```typescript
script-src: 'self' 'unsafe-eval' https://cdnjs.cloudflare.com https://api.mapbox.com
style-src: 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://api.mapbox.com
```

## 🚀 Kiểm tra hoạt động

1. **Mở Developer Tools** (F12)
2. **Vào tab Console**
3. **Tìm các message**:
   - ✅ `"Leaflet loaded from local installation"`
   - ✅ `"Leaflet loaded from CDN fallback"`
   - ❌ `"Failed to load Leaflet"`

## 🔍 Troubleshooting

### Nếu vẫn gặp lỗi CSP:

1. **Kiểm tra CSP header**:
   ```bash
   curl -I http://localhost:3000/dashboard/map
   ```

2. **Xem CSP trong DevTools**:
   - Network tab → Response Headers → Content-Security-Policy

3. **Tạm thời disable CSP** (chỉ cho development):
   ```typescript
   // Trong middleware.ts
   // Comment out CSP header để test
   // response.headers.set("Content-Security-Policy", cspConfig);
   ```

### Nếu local import thất bại:

1. **Kiểm tra dependencies**:
   ```bash
   npm list leaflet mapbox-gl
   ```

2. **Reinstall nếu cần**:
   ```bash
   npm install leaflet mapbox-gl --legacy-peer-deps
   ```

## 📊 Performance Impact

### Local Installation (Khuyến nghị)
- ✅ **Faster loading** - Không cần tải từ CDN
- ✅ **Offline support** - Hoạt động khi mất mạng
- ✅ **Version control** - Kiểm soát version chính xác
- ✅ **No CSP issues** - Không cần whitelist domain

### CDN Fallback
- ⚠️ **Network dependent** - Cần kết nối internet
- ⚠️ **CSP required** - Cần cấu hình CSP
- ✅ **Always latest** - Luôn có version mới nhất
- ✅ **Cached globally** - Có thể đã được cache

## 🔒 Security Best Practices

1. **Sử dụng integrity checks** cho CDN:
   ```html
   <script src="..." integrity="sha512-..." crossorigin=""></script>
   ```

2. **Subresource Integrity (SRI)**:
   ```typescript
   link.integrity = 'sha512-0cW2aWRH96nBr9zmiTac/laV2qdm65UlQpaj0RbvvsLyq2eM40pnzszXsWUF2TQB3XaVqjTQPHgfoe9w0P6msA==';
   link.crossOrigin = '';
   ```

3. **Minimize CSP permissions**:
   - Chỉ whitelist domain cần thiết
   - Sử dụng specific paths khi có thể

## 📝 Next Steps

1. **Test thoroughly** trên cả development và production
2. **Monitor CSP violations** trong production
3. **Consider moving to local-only** để tránh CSP issues hoàn toàn
4. **Update documentation** khi có thay đổi

---

**Lưu ý**: Giải pháp này đảm bảo map hoạt động trong mọi trường hợp, với ưu tiên performance và security.
