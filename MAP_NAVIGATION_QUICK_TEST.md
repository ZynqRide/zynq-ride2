# Map Navigation - Quick Test Steps

## ✅ Quick Ride Test
1. Open app → Login as driver
2. Go to **Dashboard → World Class → Smart Pricing**
3. Leave defaults or change:
   - Pickup: Gelvandale
   - Destination: Greenacres
   - Distance: 8 km
4. Click **Book Quick Ride**
5. **Expected**: 
   - ✅ Navigation overlay appears (bottom-right)
   - ✅ Map shows 🟢 pickup and 🔴 drop-off markers
   - ✅ Turn-by-turn directions visible
   - ✅ Blue location dot appears on map

## ✅ Smart Bid Test
1. In **Smart Bid** section:
2. Enter bid amount (70)
3. Click **Start 60s Bid**
4. When driver offers → Click **Accept**
5. **Expected**:
   - ✅ Navigation overlay appears
   - ✅ Route displays with directions
   - ✅ Real-time location tracking starts

## ✅ Manual Map Navigation Test
1. Go to **Map** page
2. Edit address inputs:
   - Pickup: "Summerstrand, Gqeberha"
   - Destination: "Uitenhage, Kariega"
3. Click **Build Route**
4. **Expected**:
   - ✅ Markers appear on map
   - ✅ Map zooms to fit both locations
   - ✅ Distance & ETA displayed
   - ✅ Directions panel shows steps

## ✅ Location Tracking Test
1. When navigation is active:
2. Look for blue circle on map
3. Change location permission to:
   - **Precise location**: Full accuracy
   - **Allow**: Always allow
4. **Expected**:
   - ✅ Blue marker shows your position
   - ✅ Updates every 3-5 seconds
   - ✅ "ETA to Pickup" counts down

## ✅ Address Syncing Test
1. Go to **Map** page
2. Click in "Pickup address" field
3. Type: "Loerie Park"
4. Click outside field
5. **Expected**:
   - ✅ Map marker appears
   - ✅ Address becomes full address
   - ✅ Map centers on location

## ✅ Navigation Close Test
1. During active navigation:
2. Look for ✕ button (top-right of overlay)
3. Click it
4. **Expected**:
   - ✅ Navigation overlay disappears
   - ✅ Location tracking stops
   - ✅ Blue marker disappears

## ✅ Multiple Trips Test
1. Book Quick Ride #1 → Accept
2. Watch navigation appear
3. Close navigation (✕ button)
4. Book Quick Ride #2 → Different addresses
5. **Expected**:
   - ✅ New markers replace old ones
   - ✅ New directions loaded
   - ✅ No marker confusion

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Map blank | Refresh page, check internet |
| No directions | Use full addresses (suburb names) |
| Location not updating | Check GPS is ON, allow permission |
| Wrong location marker | Click outside address field to update |
| Navigation not starting | Try "Build Route" button first |
| Overlay hidden | Scroll down on mobile |

## Live Demo Flow (2 min)
```
1. Open app in browser
2. Login (Rider/Driver)
3. Dashboard → World Class → Smart Pricing
4. "Pickup: Gelvandale, Destination: Greenacres"
5. Click "Book Quick Ride"
6. Watch navigation overlay + map update
7. Blue location marker appears
8. See "ETA to Pickup: X min" update
9. Click "Build Route" again to recalculate
10. Close navigation with ✕ button
```

## For Backend Team
Ready to integrate:
- `startTripNavigation(pickupAddr, dropoffAddr)` - Call from backend
- `endTripNavigation()` - Cleanup when trip completes
- `googleMapsService.currentTrip` - Contains {pickupLat, pickupLng, dropoffLat, dropoffLng, status}
- Location updates ready for WebSocket broadcast

## Performance Notes
- Location updates: Every 1-5 seconds (device dependent)
- Geocoding: Real-time as user types
- Navigation overlay: Fixed position, won't scroll away
- Works on 4G, WiFi, and slow connections

---
**Status**: ✅ Ready for testing and live deployment
**Google Maps API**: Included with development key
**Fallback**: OSM/Leaflet for offline areas
