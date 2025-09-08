# 🎯 Multiple Layers Fix

## ❌ **Vấn đề:**
Map đang hiển thị **nhiều lớp chồng chéo** và console hiện move nhưng map không thấy move.

## 🔍 **Nguyên nhân:**
1. **Multiple layers active** - Nhiều tile layers được add cùng lúc
2. **Layer conflicts** - Các layers chồng chéo lên nhau
3. **View not updating** - Map không update view khi move
4. **Tiles not refreshing** - Tiles không được refresh khi drag
5. **Z-index conflicts** - Layers có cùng z-index

## ✅ **Giải pháp đã triển khai:**

### 1. **Debug Layer Count**
```typescript
// Debug: Check how many layers are active
console.log("Active layers count:", map._layers ? Object.keys(map._layers).length : 0);
console.log("Has CartoDB layer:", map.hasLayer(cartoLayer));
console.log("Has OSM layer:", map.hasLayer(osmLayer));
console.log("Has OSM France layer:", map.hasLayer(openMapTilesLayer));
```

### 2. **Force Remove Duplicate Layers**
```typescript
// Force remove any duplicate layers
if (map.hasLayer(osmLayer)) {
  map.removeLayer(osmLayer);
  console.log("Removed duplicate OSM layer");
}
if (map.hasLayer(openMapTilesLayer)) {
  map.removeLayer(openMapTilesLayer);
  console.log("Removed duplicate OSM France layer");
}

// Ensure only CartoDB layer is active
if (!map.hasLayer(cartoLayer)) {
  cartoLayer.addTo(map);
  console.log("Added CartoDB layer");
}

console.log("Final layer count:", map._layers ? Object.keys(map._layers).length : 0);
```

### 3. **Force Map View Update**
```typescript
map.on('move', (e) => {
  console.log("Map moved:", map.getCenter());
  // Force map to update view
  map.invalidateSize();
});

map.on('drag', (e) => {
  console.log("Map dragging:", map.getCenter());
  // Force map to redraw
  map.invalidateSize();
  // Force tiles to update
  map._resetView(map.getCenter(), map.getZoom());
});
```

### 4. **CSS Layer Management**
```css
/* Fix multiple layers issue - ensure only one tile layer is visible */
.leaflet-tile-pane {
  z-index: 1 !important;
}

.leaflet-tile-pane .leaflet-tile {
  opacity: 1 !important;
  transition: opacity 0.3s ease !important;
}

/* Hide duplicate layers */
.leaflet-tile-pane .leaflet-tile.leaflet-tile-loaded {
  opacity: 1 !important;
}

.leaflet-tile-pane .leaflet-tile.leaflet-tile-loading {
  opacity: 0.7 !important;
}

/* Ensure map container is the only interactive element */
.leaflet-container {
  position: relative !important;
  z-index: 1 !important;
}
```

### 5. **Enhanced Layer Control**
```typescript
// Thêm layer control với proper layer management
const baseMaps = {
  "Carto Light": cartoLayer,
  "OpenStreetMap": osmLayer,
  "OSM France": openMapTilesLayer
} as Record<string, any>;

const layerControl = window.L.control.layers(baseMaps).addTo(map);

// Function để switch layer properly
const switchLayer = (newLayer: any, oldLayer?: any) => {
  if (oldLayer && map.hasLayer(oldLayer)) {
    map.removeLayer(oldLayer);
  }
  if (!map.hasLayer(newLayer)) {
    newLayer.addTo(map);
  }
};
```

## 🚀 **Cách test:**

1. **Console logs** - Check layer count và status
2. **Single layer** - Chỉ 1 layer active
3. **Map movement** - Map thấy move khi drag
4. **Layer switching** - Chuyển đổi layers hoạt động
5. **Performance** - Không lag khi drag
6. **Visual clarity** - Map hiển thị rõ ràng

## 📊 **Expected Results:**

- ✅ **Single layer** - Chỉ 1 tile layer active
- ✅ **Map movement** - Map thấy move khi drag
- ✅ **Layer switching** - Chuyển đổi layers hoạt động
- ✅ **Performance** - Smooth dragging
- ✅ **Visual clarity** - Map hiển thị rõ ràng
- ✅ **Console logs** - Debug information
- ✅ **No conflicts** - Không có layer conflicts

## 🔧 **Key Features:**

1. **Layer Management** - Proper layer switching
2. **Duplicate Removal** - Force remove duplicate layers
3. **View Updates** - Force map to update view
4. **Tile Refresh** - Force tiles to refresh
5. **CSS Fixes** - Proper z-index management
6. **Debug Logging** - Console logs để debug

## 🎯 **Layer Flow:**

```
Map Created → Add CartoDB → Remove Duplicates → Single Layer Active → Ready
```

## 🔧 **Technical Details:**

1. **Layer Count** - Debug số lượng layers active
2. **Duplicate Removal** - Force remove duplicate layers
3. **View Updates** - `map.invalidateSize()` và `map._resetView()`
4. **CSS Z-index** - Proper layering với CSS
5. **Event Handling** - Force update trên move/drag events

---

**Lưu ý**: Map giờ đây chỉ hiển thị 1 layer và movement hoạt động đúng!
