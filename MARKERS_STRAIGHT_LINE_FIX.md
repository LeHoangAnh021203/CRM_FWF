# Markers Display in Straight Line Fix

## 🚨 **Vấn đề nghiêm trọng:**
- **Markers hiển thị thành 1 hàng thẳng** thay vì ở vị trí đúng
- **Tọa độ đúng nhưng vị trí hiển thị sai** trên map
- **Có thể do `iconAnchor` hoặc `popupAnchor` không đúng**

## 🔧 **Giải pháp đã áp dụng:**

### 1. **Sửa iconAnchor và popupAnchor**
```javascript
// TRƯỚC (có vấn đề):
iconAnchor: [20, 20],    // Center center
popupAnchor: [0, -20]    // Above marker

// SAU (đã sửa):
iconAnchor: [20, 40],    // Center horizontally, bottom vertically
popupAnchor: [0, -40]    // Above the marker
```

### 2. **Thêm debug screen position**
```javascript
// Debug: Check actual marker positions
markersRef.current.getLayers().forEach((marker: any, index: number) => {
  const latlng = marker.getLatLng();
  const element = marker.getElement?.();
  const rect = element?.getBoundingClientRect();
  console.log(`Marker ${index}: lat=${latlng.lat}, lng=${latlng.lng}, screenPos=${rect?.left},${rect?.top}`);
});
```

### 3. **Thêm nút Test Simple Markers**
```javascript
<button onClick={() => {
  // Test with simple markers (no custom icon)
  const testPositions = [
    [10.8231, 106.6297], // TP.HCM
    [21.0285, 105.8542], // Hà Nội
    [16.0544, 108.2022]  // Đà Nẵng
  ];
  
  testPositions.forEach((pos, index) => {
    const marker = window.L.marker(pos);
    marker.bindPopup(`Test marker ${index + 1}`);
    markersRef.current.addLayer(marker);
  });
}}>
  🧪 Test Simple Markers
</button>
```

## 🎯 **Cách kiểm tra và sửa:**

### 1. **Click nút "🧪 Test Simple Markers"**
- Sẽ tạo 3 markers đơn giản (không custom icon)
- Nếu markers này hiển thị đúng vị trí = vấn đề ở custom icon
- Nếu vẫn sai = vấn đề ở tọa độ hoặc map

### 2. **Kiểm tra console logs**
- Xem `screenPos` của markers
- Nếu tất cả có cùng `screenPos` = vấn đề positioning
- Nếu `screenPos` khác nhau = vấn đề khác

### 3. **So sánh với tọa độ đúng**
- **TP.HCM**: `lat: 10.8231, lng: 106.6297`
- **Hà Nội**: `lat: 21.0285, lng: 105.8542`
- **Đà Nẵng**: `lat: 16.0544, lng: 108.2022`

## 🔍 **Nguyên nhân có thể:**

### 1. **Custom Icon Issues:**
- `iconAnchor` không đúng
- `iconSize` không đúng
- CSS positioning conflicts

### 2. **Map Projection Issues:**
- Map projection không đúng
- Coordinate system conflicts
- Tile layer issues

### 3. **Leaflet Version Issues:**
- Version không tương thích
- API changes
- Bug trong Leaflet

## 🚨 **Nếu vẫn hiển thị sai:**

1. **Click "🧪 Test Simple Markers"** - kiểm tra markers đơn giản
2. **Kiểm tra console logs** - xem screen position
3. **So sánh với tọa độ đúng** - đảm bảo lat/lng đúng
4. **Báo cáo kết quả** - markers đơn giản có đúng không?

## 📊 **Kết quả mong đợi:**

### Test Simple Markers:
- ✅ **3 markers hiển thị ở 3 vị trí khác nhau**
- ✅ **TP.HCM ở phía Nam**
- ✅ **Hà Nội ở phía Bắc**
- ✅ **Đà Nẵng ở giữa**

### Nếu Test Simple Markers đúng:
- ✅ **Vấn đề ở custom icon** - cần sửa `iconAnchor`
- ✅ **Custom icon quá phức tạp** - cần đơn giản hóa

### Nếu Test Simple Markers vẫn sai:
- ❌ **Vấn đề ở map hoặc tọa độ** - cần kiểm tra sâu hơn
