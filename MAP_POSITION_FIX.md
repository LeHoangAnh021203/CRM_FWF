# Map Position Fix - Vị Trí Sai

## 🚨 **Vấn đề nghiêm trọng:**
- **Vị trí hiển thị sai hết rồi** - map không hiển thị đúng vùng Việt Nam
- **Center map sai** - đang focus vào TP.HCM thay vì toàn bộ Việt Nam
- **Zoom level sai** - quá gần, không thấy được tất cả chi nhánh

## 🔧 **Giải pháp đã áp dụng:**

### 1. **Sửa center và zoom của map**
```javascript
// TRƯỚC (sai):
const map = window.L.map(mapRef.current, {
  center: [10.8231, 106.6297], // TP.HCM - quá phía Nam
  zoom: 10, // Quá gần
});

// SAU (đúng):
const map = window.L.map(mapRef.current, {
  center: [16.0, 106.0], // Center of Vietnam
  zoom: 6, // Phù hợp để xem toàn bộ Việt Nam
});
```

### 2. **Sửa nút Reset to Vietnam**
```javascript
// TRƯỚC (sai):
mapInstanceRef.current.setView([10.8231, 106.6297], 10); // TP.HCM

// SAU (đúng):
mapInstanceRef.current.setView([16.0, 106.0], 6); // Center of Vietnam
```

### 3. **Thêm nút "🎯 Fix Map Position"**
```javascript
<button onClick={() => {
  // Reset map to Vietnam center
  mapInstanceRef.current.setView([16.0, 106.0], 6);
  
  // Wait then fit to all branches
  setTimeout(() => {
    if (markersRef.current && markersRef.current.getLayers().length > 0) {
      const group = window.L.featureGroup(markersRef.current.getLayers());
      const bounds = group.getBounds();
      mapInstanceRef.current.fitBounds(bounds.pad(0.2));
    }
  }, 1000);
}}>
  🎯 Fix Map Position
</button>
```

## 📊 **Tọa độ đúng của Việt Nam:**

### **Center of Vietnam:**
- **Latitude**: 16.0° (giữa Bắc và Nam)
- **Longitude**: 106.0° (giữa Đông và Tây)
- **Zoom**: 6 (phù hợp để xem toàn bộ đất nước)

### **Vùng hiển thị:**
- **Bắc**: Hà Nội (21.0°)
- **Nam**: Vũng Tàu (10.3°)
- **Đông**: Đà Nẵng (108.2°)
- **Tây**: Hà Nội (105.8°)

## 🎯 **Cách kiểm tra và sửa:**

### 1. **Click "🎯 Fix Map Position"**
- Reset map về center đúng của Việt Nam
- Fit bounds để hiển thị tất cả markers
- Kiểm tra console logs

### 2. **Click "🗺️ Reset to Vietnam"**
- Reset map về vị trí đúng
- Fit bounds với padding 0.2

### 3. **Click "🔍 Check Map Position"**
- Kiểm tra center có đúng không
- Center phải là: `~16.0, ~106.0`
- Zoom phải là: `6`

## 🔍 **Nguyên nhân vị trí sai:**

### 1. **Center Map Sai:**
- `[10.8231, 106.6297]` = TP.HCM (quá phía Nam)
- `[16.0, 106.0]` = Center of Vietnam (đúng)

### 2. **Zoom Level Sai:**
- `zoom: 10` = Quá gần, chỉ thấy TP.HCM
- `zoom: 6` = Phù hợp để xem toàn bộ Việt Nam

### 3. **Bounds Fitting Sai:**
- `bounds.pad(0.1)` = Quá chặt
- `bounds.pad(0.2)` = Phù hợp hơn

## 📊 **Kết quả mong đợi:**

### Map View:
- ✅ **Center**: `16.0, 106.0` (giữa Việt Nam)
- ✅ **Zoom**: 6 (xem được toàn bộ đất nước)
- ✅ **11 markers hiển thị** ở đúng vị trí

### Markers Distribution:
- ✅ **TP.HCM**: 4 markers ở phía Nam
- ✅ **Hà Nội**: 4 markers ở phía Bắc
- ✅ **Đà Nẵng**: 1 marker ở giữa
- ✅ **Vũng Tàu**: 2 markers ở phía Nam

## 🚨 **Nếu vẫn sai vị trí:**

1. **Click "🎯 Fix Map Position"** - reset map về vị trí đúng
2. **Click "🗺️ Reset to Vietnam"** - reset và fit bounds
3. **Kiểm tra console logs** - xem center và zoom
4. **Báo cáo kết quả** - map hiển thị vùng nào?

## 🎉 **Nếu hiển thị đúng:**

- ✅ **Map hiển thị toàn bộ Việt Nam**
- ✅ **11 markers hiển thị đúng vị trí**
- ✅ **Có thể zoom in/out để xem chi tiết**
- ✅ **Markers có thể click được**
