# Map Implementation Guide - Face Wash Fox CRM

## Tổng quan

Dự án đã được triển khai với hai giải pháp bản đồ chính:

1. **Leaflet + OpenStreetMap** (Mặc định)
2. **Mapbox GL JS** (Thay thế)

## 🗺️ Leaflet + OpenStreetMap Implementation

### Ưu điểm
- ✅ **Hoàn toàn miễn phí** - Không cần API key
- ✅ **Nhẹ** - Kích thước ~50KB gzipped
- ✅ **Tương thích tốt** - Hỗ trợ IE9+ và tất cả trình duyệt
- ✅ **Plugin phong phú** - Nhiều tính năng mở rộng
- ✅ **Dễ tùy chỉnh** - CSS và JavaScript linh hoạt

### Tính năng đã triển khai
- 🎯 **Interactive markers** với custom fox icons
- 🔍 **Search functionality** - Tìm kiếm theo tên và địa chỉ
- 🏙️ **City filtering** - Lọc theo thành phố
- 📍 **Geolocation** - Tìm vị trí hiện tại
- 🗺️ **Multiple tile layers** - OpenStreetMap và Carto
- 📱 **Responsive design** - Tối ưu cho mobile
- 🎨 **Custom popups** - Thông tin chi nhánh với booking form
- ⚡ **Performance optimized** - Lazy loading và requestAnimationFrame

### Cấu trúc file
```
app/dashboard/map/
├── page.tsx              # Leaflet implementation (mặc định)
├── MapboxMap.tsx         # Mapbox implementation
├── MapComparison.tsx     # So sánh hai giải pháp
├── comparison/
│   └── page.tsx          # Route cho comparison page
├── loading.tsx           # Loading component
└── map-styles.css        # CSS styles cho cả hai maps
```

## 🚀 Mapbox GL JS Implementation

### Ưu điểm
- ✅ **Vector tiles** - Chất lượng cao, hiệu suất tốt
- ✅ **3D Maps** - Hỗ trợ pitch, bearing, terrain
- ✅ **Smooth animations** - Chuyển động mượt mà
- ✅ **Advanced styling** - Tùy chỉnh giao diện linh hoạt
- ✅ **Built-in controls** - Navigation, Geolocation, Fullscreen

### Hạn chế
- ⚠️ **Cần API key** - Có giới hạn sử dụng miễn phí (50,000 views/tháng)
- ⚠️ **Kích thước lớn** - ~200KB gzipped
- ⚠️ **Yêu cầu WebGL** - Không hỗ trợ IE10 và cũ hơn

## 📊 So sánh Performance

| Tiêu chí | Leaflet + OSM | Mapbox GL JS |
|----------|---------------|--------------|
| **Kích thước** | ~50KB | ~200KB |
| **Tải lần đầu** | Nhanh | Chậm hơn |
| **Render markers** | Tốt | Rất tốt |
| **3D support** | Không | Có |
| **Vector tiles** | Không | Có |
| **API key** | Không cần | Cần |
| **Chi phí** | Miễn phí | 50K views/tháng miễn phí |

## 🛠️ Cài đặt và Sử dụng

### 1. Dependencies đã cài đặt
```bash
npm install leaflet react-leaflet mapbox-gl @types/leaflet --legacy-peer-deps
```

### 2. Truy cập maps
- **Leaflet Map**: `/dashboard/map`
- **Mapbox Map**: `/dashboard/map/comparison` (chọn Mapbox)
- **Comparison**: `/dashboard/map/comparison`

### 3. Cấu hình Mapbox (nếu sử dụng)
```typescript
// Trong MapboxMap.tsx
window.mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
```

## 🎨 Customization

### Thay đổi marker icons
```typescript
const foxIcon = window.L.divIcon({
  html: `<div style="background: url('/fox.png') no-repeat center center; background-size: contain; width: 32px; height: 32px;"></div>`,
  className: 'custom-div-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});
```

### Thêm tile layer mới
```typescript
const newLayer = window.L.tileLayer('https://tile-url/{z}/{x}/{y}.png', {
  attribution: '© Your Attribution',
  maxZoom: 19
});
```

### Tùy chỉnh popup
```typescript
const popupContent = `
  <div style="padding: 12px;">
    <h3>${branch.name}</h3>
    <p>${branch.address}</p>
    <button onclick="window.openBookingForm('${branch.id}')">
      Đặt lịch ngay
    </button>
  </div>
`;
```

## 🔧 API Integration

### Booking Form API
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  try {
    await ApiService.post("booking/create", bookingForm);
    showSuccess("Đặt lịch thành công!");
  } catch {
    showError("Có lỗi xảy ra khi đặt lịch.");
  }
};
```

### Branch Data Structure
```typescript
interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  workingHours?: string;
}
```

## 📱 Responsive Design

### Mobile Optimization
- Sidebar có thể collapse trên mobile
- Touch-friendly controls
- Optimized popup sizes
- Gesture support (pinch to zoom, pan)

### Breakpoints
```css
@media (max-width: 768px) {
  .custom-popup .leaflet-popup-content-wrapper {
    max-width: 250px;
  }
}
```

## 🚀 Performance Optimizations

### 1. Lazy Loading
```typescript
const LeafletMap = dynamic(() => import('./page'), { 
  ssr: false,
  loading: () => <LoadingComponent />
});
```

### 2. RequestAnimationFrame
```typescript
script.onload = () => {
  requestAnimationFrame(() => {
    initializeMap();
  });
};
```

### 3. Debounced Search
```typescript
const [searchQuery, setSearchQuery] = useState("");
// Search được filter real-time với useMemo
```

## 🔒 Security Considerations

### 1. CSP Headers
```html
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' https://cdnjs.cloudflare.com https://api.mapbox.com;">
```

### 2. API Key Protection
- Mapbox API key nên được lưu trong environment variables
- Sử dụng domain restrictions trong Mapbox dashboard

## 🐛 Troubleshooting

### Common Issues

1. **Map không load**
   - Kiểm tra network connection
   - Verify CDN links
   - Check browser console for errors

2. **Markers không hiển thị**
   - Verify fox.png exists in public folder
   - Check CSS styles
   - Ensure coordinates are valid

3. **Popup không hoạt động**
   - Check global function `window.openBookingForm`
   - Verify event handlers

### Debug Mode
```typescript
// Enable debug logging
console.log("Leaflet loaded successfully");
console.log("Map created successfully");
console.log("Enhanced interactive map initialization completed");
```

## 📈 Future Enhancements

### Planned Features
- [ ] **Cluster markers** - Group nearby markers
- [ ] **Heatmap** - Show density of branches
- [ ] **Routing** - Directions to branches
- [ ] **Real-time data** - Live branch status
- [ ] **Offline support** - PWA capabilities
- [ ] **Analytics** - Track user interactions

### Performance Improvements
- [ ] **Service Worker** - Cache map tiles
- [ ] **WebP images** - Optimize marker icons
- [ ] **Code splitting** - Lazy load map components
- [ ] **Virtual scrolling** - Handle large datasets

## 📚 Resources

### Documentation
- [Leaflet Documentation](https://leafletjs.com/)
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [OpenStreetMap](https://www.openstreetmap.org/)

### CDN Links
- Leaflet CSS: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css`
- Leaflet JS: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js`
- Mapbox CSS: `https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css`
- Mapbox JS: `https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js`

---

**Tác giả**: AI Assistant  
**Ngày cập nhật**: 2024  
**Phiên bản**: 1.0.0
