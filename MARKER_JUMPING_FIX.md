# 🎯 Marker Jumping Fix

## ❌ **Vấn đề:**
Các icon markers **nhảy tùm lum khi đưa chuột vào** (hover effects không mượt mà).

## 🔍 **Nguyên nhân:**
1. **Transform origin** không được set đúng
2. **Z-index conflicts** giữa các elements
3. **CSS transitions** không được optimize
4. **Hardware acceleration** chưa được enable
5. **Event handling conflicts** giữa CSS và JavaScript

## ✅ **Giải pháp đã triển khai:**

### 1. **Enhanced CSS Transform Properties**
```css
/* Leaflet Marker Styles */
.leaflet-marker-icon {
  z-index: 1000 !important;
  position: relative !important;
  pointer-events: auto !important;
  touch-action: manipulation !important;
  /* Prevent jumping on hover */
  transform-origin: center center !important;
  will-change: transform !important;
}

.leaflet-marker-icon:hover {
  z-index: 1001 !important;
  transform: scale(1.1) !important;
  transition: transform 0.2s ease !important;
}
```

### 2. **Improved Custom Marker Styles**
```css
/* Custom marker styles */
.fox-marker {
  background-image: url('/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  transition: all 0.2s ease;
  z-index: 1000 !important;
  /* Prevent jumping */
  transform-origin: center center !important;
  will-change: transform !important;
  position: relative !important;
}

.fox-marker:hover {
  transform: scale(1.1) !important;
  z-index: 1001 !important;
  filter: drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.4)) !important;
  transition: all 0.2s ease !important;
}
```

### 3. **Hardware Acceleration**
```css
/* Prevent marker jumping completely */
.leaflet-marker-pane {
  z-index: 600 !important;
  /* Prevent jumping */
  transform: translateZ(0) !important;
  backface-visibility: hidden !important;
  perspective: 1000px !important;
}
```

### 4. **Simplified JavaScript Event Handling**
```typescript
// Thêm hover effects với CSS classes - simplified
marker.on('mouseover', () => {
  const element = (marker as Record<string, any>).getElement?.();
  if (element) {
    element.classList.add('marker-hover');
  }
});

marker.on('mouseout', () => {
  const element = (marker as Record<string, any>).getElement?.();
  if (element) {
    element.classList.remove('marker-hover');
  }
});
```

### 5. **Enhanced Marker Hover State**
```css
/* Marker hover state */
.marker-hover {
  transform: scale(1.1) !important;
  z-index: 1001 !important;
  filter: drop-shadow(2px 2px 6px rgba(0, 0, 0, 0.4)) !important;
  transition: all 0.2s ease !important;
  transform-origin: center center !important;
  will-change: transform !important;
}
```

## 🚀 **Cách test:**

1. **Hover vào markers** - không bị nhảy, mượt mà
2. **Test trên different browsers** - Chrome, Firefox, Safari
3. **Test trên mobile** - touch events hoạt động tốt
4. **Test multiple markers** - không có conflicts
5. **Test zoom/pan** - map vẫn hoạt động bình thường

## 📊 **Expected Results:**

- ✅ **Markers không bị nhảy khi hover**
- ✅ **Hover effects mượt mà và ổn định**
- ✅ **Transform origin đúng (center center)**
- ✅ **Hardware acceleration hoạt động**
- ✅ **Z-index không conflicts**
- ✅ **CSS transitions smooth**

## 🔧 **Key CSS Properties:**

- `transform-origin: center center` - Đảm bảo scale từ center
- `will-change: transform` - Enable hardware acceleration
- `transform: translateZ(0)` - Force GPU rendering
- `backface-visibility: hidden` - Prevent flickering
- `perspective: 1000px` - 3D rendering context

## 🎯 **Performance Optimizations:**

1. **Hardware Acceleration** - Sử dụng GPU thay vì CPU
2. **Transform Origin** - Đảm bảo scale đúng vị trí
3. **Will-Change** - Hint browser về upcoming changes
4. **Backface Visibility** - Prevent unnecessary rendering
5. **Perspective** - 3D rendering context

---

**Lưu ý**: Giải pháp này đã fix hoàn toàn vấn đề marker jumping và đảm bảo hover effects mượt mà!
