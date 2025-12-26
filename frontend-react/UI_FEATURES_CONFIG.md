# UI Features Configuration

## Mini Card Preview Feature (Option 2)

### Overview
Displays small card previews below each opponent's property set, making it immediately visible which cards (including dual wild cards) they own without requiring hover interaction.

### Current Status
✅ **ENABLED** by default in StadiumLayout

### How to Toggle

#### To DISABLE:
In `StadiumLayout.jsx` (line ~27), change:
```javascript
showMiniCardPreviews = true  // Currently ON
```
to:
```javascript
showMiniCardPreviews = false  // Turn OFF
```

#### Component Hierarchy:
```
StadiumLayout.jsx (toggle here)
  └─> OpponentCard.jsx (passes through)
      └─> PropertySetDisplay.jsx (implements feature)
```

### Visual Design
- **Position**: Below each property set block
- **Size**: Extra-small cards (`xs`) at ~24x36px
- **Layout**: Overlapping fan (-16px spacing) showing up to 5 cards
- **Overflow**: Shows "+N" badge if more than 5 cards in set
- **Spacing**: Adds 40px bottom padding to property container when enabled

### Benefits
✓ Immediate visibility of dual wild cards  
✓ No hover required (mobile-friendly)  
✓ Clear card composition at a glance  
✓ Helps strategic planning against opponents

### Trade-offs
⚠ Uses ~35-45px additional vertical space per opponent  
⚠ May feel cluttered with 3-4 opponents on smaller screens

### Testing
The feature is currently **LIVE** in your dev server. Check opponent property displays to see the mini cards below each set.

---

## Future UI Options Available

### Option 1: Badge System
*(Not yet implemented)* - Small icon badges indicating wild cards

### Option 3: Dual-Color Blocks  
*(Not yet implemented)* - Gradient blocks showing wild card colors

### Option 4: Full Card List  
*(Not yet implemented)* - Horizontal card rows replacing abstraction

### Option 5: Enhanced Tooltip  
*(Current hover system)* - Existing tooltip with possible improvements
