# Mobile Testing Guide

## 📱 Testing Manual Scroll on Mobile Devices

### Quick Manual Test
1. **Open the gallery** on your mobile device
2. **Turn off autoplay** using the controls (gear icon)
3. **Swipe up/down** on the gallery area
4. **Expected**: Gallery should scroll smoothly with momentum

### Automated Mobile Test
1. **Open browser console** on mobile (varies by browser)
2. **Copy and paste** the content of `testing/mobile-touch-test.js`
3. **Run the script** and watch console output
4. **Expected output**:
   ```
   ✅ Touch scrolling working! All containers moved
   ✅ Momentum system activated
   ✅ Momentum naturally decayed - touch scrolling perfect!
   🎉 Mobile touch scrolling is working correctly!
   ```

### Mobile Browser Console Access

#### Chrome Mobile
1. Connect device to computer
2. Open Chrome DevTools on computer
3. Go to "Remote devices" tab
4. Select your mobile device
5. Open console for the gallery page

#### Safari Mobile (iOS)
1. Enable "Web Inspector" in Safari settings
2. Connect to Mac with Safari open
3. Use Safari's Develop menu to connect to mobile Safari
4. Open console for the gallery page

#### Firefox Mobile
1. Enable "Remote debugging" in Firefox settings
2. Connect to computer with Firefox
3. Go to `about:debugging` on desktop Firefox
4. Connect to mobile device and open console

### Touch Event Details

#### Swipe Detection
- **Minimum distance**: 20px movement required
- **Maximum time**: 500ms for swipe recognition
- **Velocity calculation**: Distance / time for momentum
- **Direction**: Swipe up = forward, swipe down = reverse

#### Momentum Physics
- **Base intensity**: Distance-based (up to 2x)
- **Velocity bonus**: Speed-based (up to 1x additional)
- **Minimum intensity**: 0.5x for gentle swipes
- **Deceleration**: 6% reduction per frame (0.94 multiplier)

### Troubleshooting Mobile Issues

#### Controls Modal Won't Close
- **Try close button**: Tap the X button in top-right of controls
- **Try outside tap**: Tap anywhere outside the controls panel
- **Check button size**: Close button should be at least 44px for easy tapping
- **Run test script**: Use `testing/mobile-controls-test.js` to diagnose

#### Image Modal Won't Open in Manual Scroll Mode
- **Check autoplay**: Turn off autoplay to enable manual scroll mode
- **Tap directly on image**: Avoid tapping on empty gallery areas
- **Check for touch interference**: Touch events should not prevent image clicks
- **Run test script**: Use `testing/modal-manual-scroll-test.js` to diagnose

#### Touch Not Working
- **Check autoplay**: Must be disabled for manual scroll
- **Check console**: Look for JavaScript errors
- **Test swipe distance**: Try longer swipes (>20px)
- **Test swipe speed**: Try faster swipes

#### No Momentum
- **Check velocity**: Swipe faster for momentum
- **Check distance**: Swipe further for more momentum
- **Check console**: Look for momentum values in debug output

#### Containers Not Synchronized
- **Check registration**: All containers should be registered
- **Check console**: Look for container count mismatches
- **Refresh page**: Sometimes helps with initialization

### Expected Mobile Behavior

#### Single Swipe
- Immediate response to touch
- Smooth momentum-based movement
- Gradual deceleration to stop
- All containers move together

#### Multiple Rapid Swipes
- Momentum builds up
- Longer gliding motion
- Smooth deceleration
- Consistent direction

#### Different Swipe Speeds
- Slow swipes: Short movement
- Fast swipes: Longer momentum
- Very fast swipes: Maximum momentum (capped)

### Performance on Mobile

#### Smooth Animation
- 60fps target on modern devices
- Efficient touch event handling
- Minimal DOM manipulation
- Optimized momentum calculations

#### Memory Usage
- Event listeners properly cleaned up
- No memory leaks from touch handlers
- Efficient position calculations

### Browser Compatibility

#### Supported
- ✅ Chrome Mobile (Android/iOS)
- ✅ Safari Mobile (iOS)
- ✅ Firefox Mobile (Android)
- ✅ Edge Mobile (Android/iOS)

#### Touch Events Used
- `touchstart`: Capture initial touch position
- `touchmove`: Prevent page scrolling during gallery interaction
- `touchend`: Calculate swipe distance and velocity

### Debug Information

When running the mobile test script, you'll see:
- Touch start/end positions
- Calculated swipe distance and velocity
- Momentum values and animation state
- Container movement verification
- Bidirectional swipe testing

This helps identify exactly where any issues might be occurring in the touch handling pipeline.
