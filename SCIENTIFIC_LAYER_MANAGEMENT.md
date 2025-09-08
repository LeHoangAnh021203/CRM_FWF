# Scientific Layer Management System

## 🚨 **Vấn đề:**
- **Logic layers không khoa học** - thứ tự và quản lý không hợp lý
- **Z-index không rõ ràng** - markers có thể bị che khuất
- **Error handling không hiệu quả** - fallback chain không tối ưu

## 🔧 **Giải pháp - Layer Management khoa học:**

### 1. **LAYER HIERARCHY - Thứ tự khoa học**

```javascript
// Z-INDEX HIERARCHY (từ thấp đến cao)
// 1-3: Base Layers (Background maps)
// 1000+: Overlay Layers (Data layers)
// 2000+: Popups (User interface)

const baseLayers = {
  "OpenStreetMap": zIndex: 1,     // Primary (most reliable)
  "Carto Light": zIndex: 2,       // Secondary (clean design)  
  "OSM France": zIndex: 3         // Fallback (backup)
};

const overlayLayers = {
  "Chi nhánh": zIndex: 1000       // Markers (highest priority)
};
```

### 2. **BASE LAYERS - Background maps**

```javascript
// 1. OpenStreetMap (Primary)
// - Most reliable and widely used
// - Good for general purpose
// - zIndex: 1

// 2. CartoDB Light (Secondary)  
// - Clean, modern design
// - Good for business applications
// - zIndex: 2

// 3. OSM France (Fallback)
// - Backup when others fail
// - High zoom levels (20)
// - zIndex: 3
```

### 3. **OVERLAY LAYERS - Data layers**

```javascript
// Markers Layer (zIndex: 1000)
// - Always on top of base layers
// - Contains all branch markers
// - User can toggle on/off
```

### 4. **LAYER CONTROL - User interface**

```javascript
const layerControl = window.L.control.layers(baseLayers, overlayLayers, {
  position: 'topright',
  collapsed: true
}).addTo(map);
```

### 5. **ERROR HANDLING - Fallback chain**

```javascript
// Error Chain: OpenStreetMap -> CartoDB -> OSM France -> OpenStreetMap
// 1. OpenStreetMap error -> switch to CartoDB
// 2. CartoDB error -> switch to OSM France  
// 3. OSM France error -> switch back to OpenStreetMap
```

### 6. **MARKER Z-INDEX - Scientific hierarchy**

```javascript
// Marker styling with proper z-index
const createFoxIcon = () => {
  return window.L.divIcon({
    html: `
      <div style="
        z-index: 1000;                    // Above base layers
        position: relative;               // Establish stacking context
        transform: translateZ(0);         // Hardware acceleration
        backface-visibility: hidden;      // Prevent flickering
        pointer-events: auto;             // Ensure clickability
      ">
        🦊
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};
```

### 7. **VISIBILITY MANAGEMENT - Event handlers**

```javascript
// Ensure markers maintain visibility during map operations
const ensureMarkersVisibility = () => {
  markersRef.current.getLayers().forEach((marker) => {
    const element = marker.getElement();
    if (element) {
      element.style.zIndex = '1000';      // Above base layers
      element.style.visibility = 'visible';
      element.style.opacity = '1';
      element.style.pointerEvents = 'auto';
    }
  });
};

// Event handlers
map.on('zoomstart', ensureMarkersVisibility);
map.on('zoomend', ensureMarkersVisibility);
map.on('viewreset', ensureMarkersVisibility);
map.on('moveend', ensureMarkersVisibility);
```

## 🎯 **Cải tiến chính:**

### 1. **Thứ tự khoa học:**
- ✅ **Base layers** (1-3) - Background maps
- ✅ **Overlay layers** (1000+) - Data layers
- ✅ **Popups** (2000+) - User interface

### 2. **Error handling hiệu quả:**
- ✅ **Fallback chain** - OpenStreetMap → CartoDB → OSM France
- ✅ **Automatic switching** - Khi layer bị lỗi
- ✅ **Console logging** - Để debug

### 3. **Z-index hierarchy:**
- ✅ **Base layers**: 1, 2, 3
- ✅ **Markers**: 1000
- ✅ **Popups**: 2000+
- ✅ **Hardware acceleration** - `transform: translateZ(0)`

### 4. **Layer management:**
- ✅ **User control** - Toggle layers on/off
- ✅ **Automatic initialization** - Markers layer on by default
- ✅ **Proper cleanup** - Remove old layers before adding new

## 📊 **Kết quả mong đợi:**

### Layer Display:
- ✅ **OpenStreetMap** hiển thị mặc định
- ✅ **Markers** luôn ở trên cùng
- ✅ **Layer control** ở góc phải trên
- ✅ **Error handling** tự động chuyển layer

### Performance:
- ✅ **Hardware acceleration** - Smooth rendering
- ✅ **Proper z-index** - No overlapping issues
- ✅ **Memory efficient** - Clean layer management

### User Experience:
- ✅ **Layer switching** - Click để chuyển đổi
- ✅ **Markers visibility** - Luôn hiển thị rõ ràng
- ✅ **Error recovery** - Tự động fallback

## 🚨 **Cách test:**

1. **Kiểm tra layer control** - Góc phải trên có nút layers
2. **Test layer switching** - Click để chuyển đổi base layers
3. **Test markers visibility** - Markers luôn ở trên cùng
4. **Test error handling** - Disconnect internet để test fallback
5. **Test zoom/pan** - Markers vẫn hiển thị đúng

## 🎉 **Nếu hoạt động tốt:**

- ✅ **Layers hiển thị khoa học**
- ✅ **Markers luôn visible**
- ✅ **Error handling tự động**
- ✅ **Performance tốt**

## 🔧 **Nếu vẫn có lỗi:**

1. **Kiểm tra console logs** - Xem layer switching
2. **Kiểm tra z-index** - Markers có ở trên không
3. **Kiểm tra layer control** - Có hiển thị không
4. **Báo cáo lỗi cụ thể** - Để tôi sửa tiếp
