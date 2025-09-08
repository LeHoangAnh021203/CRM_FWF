# Markers Wrong Position Fix

## 🚨 **Vấn đề nghiêm trọng:**
- **Markers hiển thị ở sai vị trí** hoàn toàn
- **Không nằm đúng vị trí Việt Nam** như mong đợi
- **Có thể do thứ tự lat/lng bị đảo ngược** hoặc tọa độ sai

## 🔧 **Giải pháp đã áp dụng:**

### 1. **Thêm debug logs chi tiết**
```javascript
// Debug: Log marker position
console.log(`Marker for ${branch.name}: lat=${branch.lat}, lng=${branch.lng}`);

// Debug: Check actual marker positions
markersRef.current.getLayers().forEach((marker: any, index: number) => {
  const latlng = marker.getLatLng();
  console.log(`Marker ${index}: lat=${latlng.lat}, lng=${latlng.lng}`);
});
```

### 2. **Thêm debug bounds**
```javascript
const bounds = group.getBounds();
console.log("Bounds:", bounds.getNorth(), bounds.getSouth(), bounds.getEast(), bounds.getWest());
```

### 3. **Thêm nút Reset to Vietnam**
```javascript
<button onClick={() => {
  if (mapInstanceRef.current) {
    console.log("Resetting map to Vietnam...");
    mapInstanceRef.current.setView([10.8231, 106.6297], 10); // TP.HCM
    setTimeout(() => {
      if (markersRef.current) {
        const group = window.L.featureGroup(markersRef.current.getLayers());
        const bounds = group.getBounds();
        mapInstanceRef.current.fitBounds(bounds.pad(0.1));
        console.log("Map reset to show all markers");
      }
    }, 500);
  }
}}>
  🗺️ Reset to Vietnam
</button>
```

## 📊 **Tọa độ đúng của các chi nhánh:**

### TP.HCM:
- **Landmark 81**: `lat: 10.7951, lng: 106.7215`
- **Thảo Điền**: `lat: 10.7321, lng: 106.7223`
- **The Sun Avenue**: `lat: 10.7871, lng: 106.7492`
- **Phan Văn Trị**: `lat: 10.8391, lng: 106.6734`

### Hà Nội:
- **Bà Triệu**: `lat: 21.0285, lng: 105.8542`
- **Westpoint**: `lat: 21.0179, lng: 105.7838`
- **Imperia**: `lat: 21.0455, lng: 105.8127`
- **Ngũ Xã**: `lat: 21.0528, lng: 105.8340`

### Đà Nẵng:
- **Trần Phú**: `lat: 16.0544, lng: 108.2022`

### Vũng Tàu:
- **Joi Boutique**: `lat: 10.3459, lng: 107.0842`
- **Hạ Long**: `lat: 10.3564, lng: 107.0842`

## 🎯 **Cách kiểm tra và sửa:**

### 1. **Kiểm tra console logs:**
- Mở Developer Tools (F12)
- Xem console logs để kiểm tra tọa độ markers
- So sánh với tọa độ đúng ở trên

### 2. **Sử dụng nút Reset:**
- Click nút **"🗺️ Reset to Vietnam"** để reset map về Việt Nam
- Click nút **"🚨 Force Create Markers"** để tạo lại markers

### 3. **Kiểm tra thứ tự lat/lng:**
- Trong Leaflet: `[lat, lng]` (vĩ độ trước, kinh độ sau)
- Đảm bảo không bị đảo ngược thành `[lng, lat]`

## ⚠️ **Lưu ý quan trọng:**

- **Tọa độ Việt Nam** nằm trong khoảng:
  - **Latitude**: 8.5° - 23.5° (Bắc)
  - **Longitude**: 102° - 110° (Đông)
- **Nếu markers nằm ngoài khoảng này** = tọa độ sai
- **Nếu markers nằm ở Ấn Độ/Châu Phi** = thứ tự lat/lng bị đảo ngược

## 🚨 **Nếu vẫn sai vị trí:**

1. **Kiểm tra console logs** - xem tọa độ thực tế
2. **So sánh với tọa độ đúng** ở trên
3. **Click nút "🗺️ Reset to Vietnam"** để reset map
4. **Báo cáo tọa độ sai** để tôi sửa

## 📍 **Tọa độ trung tâm map:**
- **Center**: `[10.8231, 106.6297]` (TP.HCM)
- **Zoom**: 10 (phù hợp để xem toàn bộ Việt Nam)
