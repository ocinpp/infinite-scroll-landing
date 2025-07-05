/**
 * Test script for responsive manual scrolling
 * Run this in browser console to test immediate scroll response
 * Location: testing/responsive-scroll-test.js
 */

console.log('⚡ Testing Responsive Manual Scrolling...');

function testResponsiveScroll() {
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
    console.log('⚡ Testing immediate scroll response...');
    
    // Get initial positions
    const initialPositions = [...app.setupState.scrollPositions.value];
    console.log('📊 Initial positions:', initialPositions.map(p => Math.round(p)));

    // Test rapid wheel events
    console.log('🔄 Simulating rapid wheel events...');
    
    let eventCount = 0;
    const rapidTest = setInterval(() => {
      eventCount++;
      
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 50,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(wheelEvent);
      
      // Check immediate response
      const currentPositions = [...app.setupState.scrollPositions.value];
      const totalMovement = currentPositions.reduce((sum, pos, i) => 
        sum + Math.abs(pos - initialPositions[i]), 0
      );
      
      console.log(`Event ${eventCount}: Total movement = ${Math.round(totalMovement)}px`);
      
      if (eventCount >= 5) {
        clearInterval(rapidTest);
        
        // Final check
        setTimeout(() => {
          const finalPositions = [...app.setupState.scrollPositions.value];
          console.log('📊 Final positions:', finalPositions.map(p => Math.round(p)));
          
          // Check responsiveness
          let responsiveContainers = 0;
          let totalFinalMovement = 0;
          
          for (let i = 0; i < app.setupState.numberOfContainers.value; i++) {
            const movement = Math.abs(finalPositions[i] - initialPositions[i]);
            if (movement > 50) { // Should have moved significantly
              responsiveContainers++;
            }
            totalFinalMovement += movement;
          }
          
          console.log(`📊 Responsive containers: ${responsiveContainers}/${app.setupState.numberOfContainers.value}`);
          console.log(`📊 Average movement per container: ${Math.round(totalFinalMovement / app.setupState.numberOfContainers.value)}px`);
          
          // Check for transitions (should be none for immediate response)
          let hasTransitions = 0;
          for (let i = 0; i < app.setupState.numberOfContainers.value; i++) {
            const container = app.setupState.scrollContainers.value[i];
            if (container && container.style.transition && container.style.transition.includes('transform')) {
              hasTransitions++;
            }
          }
          
          console.log(`📊 Containers with transitions: ${hasTransitions}/${app.setupState.numberOfContainers.value}`);
          
          if (responsiveContainers === app.setupState.numberOfContainers.value && hasTransitions === 0) {
            console.log('✅ Perfect! All containers responsive with immediate updates');
            console.log('⚡ Manual scrolling is now fast and responsive!');
          } else if (responsiveContainers === app.setupState.numberOfContainers.value) {
            console.log('✅ All containers responsive');
            if (hasTransitions > 0) {
              console.log('⚠️ Some containers still have transitions (may feel sluggish)');
            }
          } else {
            console.log('❌ Some containers not responding properly');
          }
          
        }, 100);
      }
    }, 50); // 50ms between events for rapid testing
    
  }, 500);
}

// Auto-run test
setTimeout(testResponsiveScroll, 1000);

console.log('✅ Responsive scroll test script loaded and will run in 1 second...');
