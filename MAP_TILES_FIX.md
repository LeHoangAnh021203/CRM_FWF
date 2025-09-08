# 🗺️ Map Tiles Fix Guide

## Vấn đề hiện tại
Bản đồ hiển thị nền xám với markers nhưng **thiếu map tiles** (hình ảnh bản đồ thực tế).

## ✅ Giải pháp đã triển khai

### 1. **Thay đổi Tile Server chính**
- **Trước**: OpenStreetMap (có thể bị block)
- **Sau**: CartoDB Light (ổn định hơn)

### 2. **Thêm Multiple Fallback Layers**
```typescript
// Layer chính: CartoDB Light
const cartoLayer = window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png');

// Fallback 1: OpenStreetMap
const osmLayer = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png');

// Fallback 2: Stamen Toner
const stamenLayer = window.L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png');
```

### 3. **Auto Fallback System**
- Nếu CartoDB lỗi → chuyển sang OpenStreetMap
- Nếu OpenStreetMap lỗi → chuyển sang Stamen
- Đảm bảo luôn có map tiles hiển thị

### 4. **Cập nhật CSP**
Thêm các tile servers vào Content Security Policy:
```
img-src: https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org https://stamen-tiles-*.a.ssl.fastly.net
```

### 5. **Debug Component**
Thêm nút "🐛 Debug Map" để kiểm tra:
- Trạng thái tile servers
- Leaflet loading status
- Map container status

## 🚀 Cách test

1. **Refresh trang** `/dashboard/map`
2. **Kiểm tra Console** (F12) để xem:
   - `"Leaflet loaded from local installation"`
   - `"Enhanced interactive map initialization completed"`
3. **Click nút "🐛 Debug Map"** để xem tile server status
4. **Thử chuyển đổi layers** bằng control ở góc trái map

## 🔧 Troubleshooting

### Nếu vẫn không hiển thị tiles:

1. **Kiểm tra Network tab**:
   - Có request đến tile servers không?
   - Status code là gì? (200, 403, 404?)

2. **Thử manual test**:
   ```bash
   curl -I "https://a.basemaps.cartocdn.com/light_all/10/512/512.png"
   ```

3. **Kiểm tra CSP**:
   - Mở DevTools → Console
   - Tìm lỗi CSP violations

4. **Force reload**:
   - Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
   - Clear cache và reload

### Nếu chỉ thấy một số tiles:

- **Network issue**: Một số tile servers có thể chậm
- **Caching**: Browser có thể cache tiles cũ
- **Rate limiting**: Tile servers có thể giới hạn requests

## 📊 Expected Results

Sau khi fix, bạn sẽ thấy:
- ✅ **Map tiles hiển thị** (đường phố, tòa nhà, sông hồ)
- ✅ **3 layer options** trong control (Carto Light, OpenStreetMap, Stamen)
- ✅ **Markers hiển thị** trên nền bản đồ thực
- ✅ **Zoom/Pan hoạt động** bình thường
- ✅ **Debug info** cho biết tile servers OK

## 🎯 Next Steps

1. **Test trên production** để đảm bảo CSP hoạt động
2. **Monitor tile loading** trong production
3. **Consider caching** tiles locally nếu cần
4. **Add more tile providers** nếu cần backup

---

**Lưu ý**: Giải pháp này đảm bảo map luôn hiển thị tiles, ngay cả khi một số tile servers bị lỗi.
