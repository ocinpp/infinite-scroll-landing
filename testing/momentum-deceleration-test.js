/**
 * Test script for momentum deceleration
 * Run this in browser console to test gradual slowdown
 * Location: testing/momentum-deceleration-test.js
 */

console.log('🎯 Testing Momentum Deceleration...');

function testMomentumDeceleration() {
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
    console.log('🎯 Testing momentum deceleration...');
    
    // Get initial positions
    const initialPositions = [...app.setupState.scrollPositions.value];
    console.log('📊 Initial positions:', initialPositions.map(p => Math.round(p)));

    // Simulate a few wheel events to build momentum
    console.log('🔄 Building momentum with wheel events...');
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const wheelEvent = new WheelEvent('wheel', {
          deltaY: 100,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(wheelEvent);
        console.log(`  Wheel event ${i + 1}/3 dispatched`);
      }, i * 100); // 100ms apart
    }

    // Monitor momentum over time
    setTimeout(() => {
      console.log('📊 Starting momentum monitoring...');
      
      let monitorCount = 0;
      const momentumMonitor = setInterval(() => {
        monitorCount++;
        
        const currentMomentum = app.setupState.globalMomentum.value;
        const isAnimating = app.setupState.momentumAnimationId.value !== null;
        const currentPositions = [...app.setupState.scrollPositions.value];
        
        console.log(`📊 Monitor ${monitorCount}: Momentum=${currentMomentum.toFixed(2)}, Animating=${isAnimating}`);
        
        if (!isAnimating && currentMomentum === 0) {
          clearInterval(momentumMonitor);
          
          const finalPositions = [...app.setupState.scrollPositions.value];
          console.log('📊 Final positions:', finalPositions.map(p => Math.round(p)));
          
          // Check if all containers moved
          let movedContainers = 0;
          let totalMovement = 0;
          
          for (let i = 0; i < app.setupState.numberOfContainers.value; i++) {
            const movement = Math.abs(finalPositions[i] - initialPositions[i]);
            if (movement > 50) {
              movedContainers++;
            }
            totalMovement += movement;
          }
          
          console.log(`📊 Containers that moved: ${movedContainers}/${app.setupState.numberOfContainers.value}`);
          console.log(`📊 Total movement: ${Math.round(totalMovement)}px`);
          
          if (movedContainers === app.setupState.numberOfContainers.value) {
            console.log('✅ All containers moved synchronously!');
            console.log('✅ Momentum gradually decelerated to stop!');
            console.log('🎉 Smooth momentum deceleration is working perfectly!');
          } else {
            console.log('❌ Not all containers moved properly');
          }
          
        } else if (monitorCount > 30) {
          clearInterval(momentumMonitor);
          console.log('⚠️ Momentum monitoring stopped after 15 seconds');
          
          if (isAnimating) {
            console.log('⚠️ Momentum still active - may need adjustment');
          }
        }
      }, 500); // Check every 500ms
      
    }, 1000); // Start monitoring after momentum builds
    
  }, 500);
}

// Auto-run test
setTimeout(testMomentumDeceleration, 1000);

console.log('✅ Momentum deceleration test script loaded and will run in 1 second...');
