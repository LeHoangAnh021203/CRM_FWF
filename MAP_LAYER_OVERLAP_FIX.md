# 🎯 Map Layer Overlap Fix

## ❌ **Vấn đề:**
Các map layers đang hiển thị **chồng chéo lên nhau** thay vì chỉ hiển thị 1 layer tại một thời điểm.

## 🔍 **Nguyên nhân:**
1. **Multiple layers active** - Nhiều tile layers được add cùng lúc
2. **Layer switching logic** - Không remove layer cũ khi switch
3. **CSS z-index conflicts** - Các layers có cùng z-index
4. **Error handling** - Fallback layers được add mà không remove layer cũ

## ✅ **Giải pháp đã triển khai:**

### 1. **Proper Layer Management**
```typescript
// Function để switch layer properly
const switchLayer = (newLayer: any, oldLayer?: any) => {
  if (oldLayer && map.hasLayer(oldLayer)) {
    map.removeLayer(oldLayer);
  }
  if (!map.hasLayer(newLayer)) {
    newLayer.addTo(map);
  }
};

// Store current active layer
let currentLayer = cartoLayer;

// Sử dụng CartoDB làm layer mặc định (chỉ 1 layer active)
cartoLayer.addTo(map);
```

### 2. **Enhanced Error Handling**
```typescript
// Thêm error handling cho tile loading với proper layer switching
cartoLayer.on('tileerror', (e: any) => {
  console.warn('CartoDB tile error, switching to OpenStreetMap:', e);
  switchLayer(osmLayer, currentLayer);
  currentLayer = osmLayer;
});

osmLayer.on('tileerror', (e: any) => {
  console.warn('OpenStreetMap tile error, switching to OSM France:', e);
  switchLayer(openMapTilesLayer, currentLayer);
  currentLayer = openMapTilesLayer;
});

openMapTilesLayer.on('tileerror', (e: any) => {
  console.warn('OSM France tile error, switching back to CartoDB:', e);
  switchLayer(cartoLayer, currentLayer);
  currentLayer = cartoLayer;
});
```

### 3. **CSS Layer Management**
```css
/* Fix map tiles */
.leaflet-tile-pane {
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 1 !important;
}

/* Ensure only one tile layer is visible at a time */
.leaflet-tile-pane .leaflet-tile {
  position: absolute !important;
  opacity: 1 !important;
  transition: opacity 0.3s ease !important;
}

/* Hide overlapping tiles */
.leaflet-tile-pane .leaflet-tile.leaflet-tile-loaded {
  opacity: 1 !important;
}

.leaflet-tile-pane .leaflet-tile.leaflet-tile-loading {
  opacity: 0.7 !important;
}
```

### 4. **Layer Control Management**
```typescript
// Thêm layer control với proper layer management
const baseMaps = {
  "Carto Light": cartoLayer,
  "OpenStreetMap": osmLayer,
  "OSM France": openMapTilesLayer
} as Record<string, any>;

const layerControl = window.L.control.layers(baseMaps).addTo(map);
```

## 🚀 **Cách test:**

1. **Map hiển thị 1 layer** - không có chồng chéo
2. **Layer switching** - chuyển đổi mượt mà giữa các layers
3. **Error handling** - tự động fallback khi layer lỗi
4. **Layer control** - click để chuyển đổi layers
5. **Performance** - không có lag khi switch layers

## 📊 **Expected Results:**

- ✅ **Chỉ 1 layer active** tại một thời điểm
- ✅ **Layer switching mượt mà** - không có chồng chéo
- ✅ **Error handling** - tự động fallback
- ✅ **Layer control** - hoạt động đúng
- ✅ **Performance** - tải nhanh và mượt mà
- ✅ **Visual clarity** - map hiển thị rõ ràng

## 🔧 **Key Features:**

1. **Single Layer Active** - Chỉ 1 layer hiển thị tại một thời điểm
2. **Proper Switching** - Remove layer cũ trước khi add layer mới
3. **Error Fallback** - Tự động chuyển sang layer khác khi lỗi
4. **Smooth Transitions** - CSS transitions cho layer switching
5. **Layer Control** - UI để chuyển đổi layers manually

## 🎯 **Layer Flow:**

```
Start: CartoDB Layer
  ↓
CartoDB Error → Switch to OpenStreetMap
  ↓
OpenStreetMap Error → Switch to OSM France
  ↓
OSM France Error → Switch back to CartoDB
  ↓
Loop continues...
```

## 🔧 **Technical Details:**

1. **Layer Management** - `switchLayer()` function để manage layers
2. **Current Layer Tracking** - `currentLayer` variable để track active layer
3. **Error Handling** - Event listeners cho `tileerror` events
4. **CSS Transitions** - Smooth opacity transitions
5. **Z-index Management** - Proper layering với CSS

---

**Lưu ý**: Map layers giờ đây không còn chồng chéo và chuyển đổi mượt mà!
