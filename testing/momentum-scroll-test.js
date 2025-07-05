/**
 * Test script for momentum scrolling elasticity
 * Run this in browser console to test manual scroll momentum
 * Location: testing/momentum-scroll-test.js
 */

console.log('🎯 Testing Momentum Scrolling Elasticity...');

function testMomentumScroll() {
  const app = document.querySelector('#app').__vueParentComponent;
  if (!app) {
    console.log('❌ Vue app not found');
    return;
  }

  console.log('✅ Vue app found');

  // Check if autoplay is off (required for manual scroll)
  if (app.setupState.autoplay.value) {
    console.log('🔄 Turning off autoplay for manual scroll test...');
    app.setupState.autoplay.value = false;
  }

  // Wait a moment for autoplay to stop
  setTimeout(() => {
    console.log('🖱️ Testing momentum scroll...');
    
    // Get initial positions
    const initialPositions = [...app.setupState.scrollPositions.value];
    console.log('📊 Initial positions:', initialPositions);

    // Simulate multiple wheel events to build momentum
    console.log('🔄 Simulating wheel events...');
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: 100,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(wheelEvent);
        console.log(`  Wheel event ${i + 1}/5 dispatched`);
      }, i * 50); // 50ms apart
    }

    // Check positions after momentum should have started
    setTimeout(() => {
      const momentumPositions = [...app.setupState.scrollPositions.value];
      console.log('📊 Positions after momentum:', momentumPositions);
      
      // Check if momentum is active
      const hasMomentum = app.setupState.momentumAnimationId.value !== null;
      console.log(`🎯 Momentum active: ${hasMomentum}`);
      
      if (hasMomentum) {
        console.log('✅ Momentum scrolling is working!');
        
        // Monitor momentum decay
        let checkCount = 0;
        const momentumMonitor = setInterval(() => {
          checkCount++;
          const stillActive = app.setupState.momentumAnimationId.value !== null;
          const currentMomentum = app.setupState.scrollMomentum.value;
          const maxMomentum = Math.max(...currentMomentum.map(Math.abs));
          
          console.log(`📊 Check ${checkCount}: Active=${stillActive}, Max momentum=${maxMomentum.toFixed(2)}`);
          
          if (!stillActive || checkCount > 20) {
            clearInterval(momentumMonitor);
            if (!stillActive) {
              console.log('✅ Momentum naturally decayed to stop - elasticity working!');
            } else {
              console.log('⚠️ Momentum still active after 10 seconds');
            }
          }
        }, 500);
        
      } else {
        console.log('❌ Momentum scrolling not working');
        
        // Check if positions changed at all
        let positionsChanged = false;
        for (let i = 0; i < initialPositions.length; i++) {
          if (Math.abs(momentumPositions[i] - initialPositions[i]) > 10) {
            positionsChanged = true;
            break;
          }
        }
        
        if (positionsChanged) {
          console.log('⚠️ Positions changed but no momentum - using old direct scroll');
        } else {
          console.log('❌ No scrolling detected at all');
        }
      }
    }, 1000);
    
  }, 500);
}

// Auto-run test
setTimeout(testMomentumScroll, 1000);

console.log('✅ Momentum scroll test script loaded and will run in 1 second...');
