# 🎯 Map Jumping Fix

## ❌ **Vấn đề:**
Map đang **jump từ vị trí này sang vị trí khác rất xa** khi drag/click.

## 🔍 **Nguyên nhân:**
1. **Invalid coordinates** - Coordinates ngoài phạm vi hợp lệ
2. **World copy jump** - Leaflet world copy jump
3. **Coordinate system** - Coordinate system conflicts
4. **Map bounds** - Map bounds không được set
5. **Event handling** - Event handling conflicts

## ✅ **Giải pháp đã triển khai:**

### 1. **Set Map Bounds**
```typescript
const map = window.L.map(mapRef.current, {
  center: [10.8231, 106.6297],
  zoom: 10,
  // Prevent map from jumping
  worldCopyJump: false,
  maxBounds: [[-90, -180], [90, 180]],
  // ... other options
});
```

### 2. **Prevent Invalid Coordinates in Move Event**
```typescript
map.on('move', (e) => {
  const center = map.getCenter();
  console.log("Map moved:", center);
  
  // Prevent map from jumping to invalid coordinates
  if (center.lat < -90 || center.lat > 90 || center.lng < -180 || center.lng > 180) {
    console.warn("Invalid coordinates detected, resetting to default");
    map.setView([10.8231, 106.6297], 10);
  }
  
  // Force map to update view
  map.invalidateSize();
});
```

### 3. **Prevent Invalid Coordinates in Drag Event**
```typescript
map.on('drag', (e) => {
  const center = map.getCenter();
  console.log("Map dragging:", center);
  
  // Prevent map from jumping to invalid coordinates
  if (center.lat < -90 || center.lat > 90 || center.lng < -180 || center.lng > 180) {
    console.warn("Invalid coordinates during drag, resetting to default");
    map.setView([10.8231, 106.6297], 10);
    return;
  }
  
  // Force map to redraw
  map.invalidateSize();
  // Force tiles to update
  map._resetView(map.getCenter(), map.getZoom());
});
```

### 4. **Prevent Invalid Coordinates in Click Event**
```typescript
map.on('click', (e) => {
  console.log("Map clicked:", e.latlng);
  
  // Prevent map from jumping to invalid coordinates
  if (e.latlng.lat < -90 || e.latlng.lat > 90 || e.latlng.lng < -180 || e.latlng.lng > 180) {
    console.warn("Invalid click coordinates detected, resetting to default");
    map.setView([10.8231, 106.6297], 10);
    return;
  }
  
  // Force enable dragging on click
  map.dragging.enable();
  console.log("Dragging enabled on click:", map.dragging.enabled());
});
```

## 🚀 **Cách test:**

### 1. **Check Console Logs**
```
Map moved: LatLng {lat: 10.8231, lng: 106.6297}
Map dragging: LatLng {lat: 10.8231, lng: 106.6297}
Map clicked: LatLng {lat: 10.8231, lng: 106.6297}
```

### 2. **Check for Warnings**
```
Invalid coordinates detected, resetting to default
Invalid coordinates during drag, resetting to default
Invalid click coordinates detected, resetting to default
```

### 3. **Test Dragging**
- **Map should stay in bounds** - Không jump ra ngoài bounds
- **Coordinates should be valid** - Lat: -90 to 90, Lng: -180 to 180
- **Smooth dragging** - Dragging mượt mà
- **No jumping** - Không jump từ vị trí này sang vị trí khác

## 📊 **Expected Results:**

- ✅ **Valid coordinates** - Coordinates trong phạm vi hợp lệ
- ✅ **No jumping** - Map không jump
- ✅ **Smooth dragging** - Dragging mượt mà
- ✅ **Consistent behavior** - Behavior nhất quán
- ✅ **Warning logs** - Warning logs khi có invalid coordinates
- ✅ **Auto reset** - Tự động reset về vị trí mặc định

## 🔧 **Key Features:**

1. **Map Bounds** - Set maxBounds để prevent jumping
2. **Coordinate Validation** - Validate coordinates trong events
3. **Auto Reset** - Tự động reset về vị trí mặc định
4. **Warning Logs** - Log warnings khi có invalid coordinates
5. **Event Prevention** - Prevent events khi coordinates invalid
6. **Consistent Behavior** - Behavior nhất quán

## 🎯 **Map Jumping Flow:**

```
User Action → Check Coordinates → Valid? → Yes: Continue → No: Reset to Default
```

## 🔧 **Technical Details:**

1. **Map Bounds** - `maxBounds: [[-90, -180], [90, 180]]`
2. **Coordinate Validation** - Check lat/lng ranges
3. **Auto Reset** - `map.setView([10.8231, 106.6297], 10)`
4. **Warning Logs** - Console warnings
5. **Event Prevention** - Early return on invalid coordinates
6. **Consistent Behavior** - Consistent map behavior

---

**Lưu ý**: Map giờ đây sẽ không jump và luôn ở trong bounds hợp lệ!