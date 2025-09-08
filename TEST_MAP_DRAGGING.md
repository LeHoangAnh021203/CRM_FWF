# 🧪 Test Map Dragging

## 🚀 **Cách test map dragging:**

### 1. **Start Development Server**
```bash
npm run dev
```

### 2. **Navigate to Map Page**
```
http://localhost:3000/dashboard/map
```

### 3. **Test Dragging Functionality**

#### ✅ **Expected Behavior:**
- **Mouse cursor** - Should show `grab` cursor when hovering over map
- **Click and drag** - Should show `grabbing` cursor when dragging
- **Map movement** - Map should move smoothly when dragging
- **Console logs** - Should show dragging events in console

#### 🔍 **Console Logs to Check:**
```
Map created successfully: [object Object]
Dragging enabled immediately: true
Map container dragging enabled
Map loaded
Dragging enabled after load: true
Map container dragging enabled after load
Map clicked: [object Object]
Dragging enabled on click: true
Map mouse down
Dragging enabled on mousedown: true
Map drag started
Map dragging: [object Object]
Map drag ended
```

### 4. **Test Different Interactions**

#### 🖱️ **Mouse Interactions:**
- **Hover** - Cursor should be `grab`
- **Click** - Should enable dragging
- **Drag** - Map should move
- **Release** - Should stop dragging

#### 📱 **Touch Interactions:**
- **Touch** - Should work on mobile
- **Drag** - Should move map
- **Pinch** - Should zoom

#### ⌨️ **Keyboard Interactions:**
- **Arrow keys** - Should move map
- **+/-** - Should zoom
- **Space** - Should enable dragging

### 5. **Debug Information**

#### 🔧 **Check Dragging Status:**
```javascript
// In browser console
console.log("Dragging enabled:", map.dragging.enabled());
console.log("Map center:", map.getCenter());
console.log("Map zoom:", map.getZoom());
```

#### 🎯 **Force Enable Dragging:**
```javascript
// In browser console
map.dragging.enable();
console.log("Dragging enabled:", map.dragging.enabled());
```

### 6. **Common Issues & Solutions**

#### ❌ **Map not moving:**
- Check console for errors
- Verify dragging is enabled
- Check CSS pointer-events
- Verify map container size

#### ❌ **Cursor not changing:**
- Check CSS cursor styles
- Verify map container styling
- Check for CSS conflicts

#### ❌ **Touch not working:**
- Check touch-action CSS
- Verify touch events
- Check mobile compatibility

### 7. **Performance Check**

#### ⚡ **Smooth Dragging:**
- Map should move smoothly
- No lag or stuttering
- Responsive to user input
- Proper event handling

#### 🎯 **Layer Management:**
- Only 1 tile layer active
- No overlapping layers
- Proper layer switching
- Clean console logs

### 8. **Final Verification**

#### ✅ **All Tests Pass:**
- [ ] Mouse dragging works
- [ ] Touch dragging works
- [ ] Keyboard navigation works
- [ ] Zoom controls work
- [ ] Layer switching works
- [ ] Console logs show events
- [ ] No errors in console
- [ ] Smooth performance

## 🎯 **Success Criteria:**

1. **Map moves** when dragging with mouse
2. **Cursor changes** to grab/grabbing
3. **Console logs** show dragging events
4. **No errors** in console
5. **Smooth performance** during dragging
6. **All interactions** work properly

---

**Lưu ý**: Nếu map vẫn không di chuyển, check console logs và verify dragging status!
