/**
 * Test script for mobile touch scrolling
 * Run this in browser console to test touch events on mobile
 * Location: testing/mobile-touch-test.js
 */

console.log('📱 Testing Mobile Touch Scrolling...');

function testMobileTouchScroll() {
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
    console.log('📱 Testing touch events...');
    
    // Get initial positions
    const initialPositions = [...app.setupState.scrollPositions.value];
    console.log('📊 Initial positions:', initialPositions.map(p => Math.round(p)));

    // Simulate touch events
    console.log('🔄 Simulating touch swipe down (should scroll forward)...');
    
    // Create touch events
    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientY: 300 }],
      bubbles: true,
      cancelable: true
    });
    
    const touchEndEvent = new TouchEvent('touchend', {
      changedTouches: [{ clientY: 200 }], // Swipe up 100px
      bubbles: true,
      cancelable: true
    });

    // Dispatch touch start
    window.dispatchEvent(touchStartEvent);
    console.log('  Touch start dispatched at Y=300');
    
    // Wait a bit then dispatch touch end
    setTimeout(() => {
      window.dispatchEvent(touchEndEvent);
      console.log('  Touch end dispatched at Y=200 (100px swipe up)');
      
      // Check results after a moment
      setTimeout(() => {
        const newPositions = [...app.setupState.scrollPositions.value];
        console.log('📊 Positions after touch:', newPositions.map(p => Math.round(p)));
        
        // Check if positions changed
        let movedContainers = 0;
        let totalMovement = 0;
        
        for (let i = 0; i < app.setupState.numberOfContainers.value; i++) {
          const movement = Math.abs(newPositions[i] - initialPositions[i]);
          if (movement > 10) {
            movedContainers++;
          }
          totalMovement += movement;
        }
        
        console.log(`📊 Containers that moved: ${movedContainers}/${app.setupState.numberOfContainers.value}`);
        console.log(`📊 Total movement: ${Math.round(totalMovement)}px`);
        
        // Check momentum state
        const hasMomentum = app.setupState.globalMomentum.value > 0;
        const isAnimating = app.setupState.momentumAnimationId.value !== null;
        
        console.log(`📊 Has momentum: ${hasMomentum} (${app.setupState.globalMomentum.value.toFixed(2)})`);
        console.log(`📊 Is animating: ${isAnimating}`);
        
        if (movedContainers === app.setupState.numberOfContainers.value) {
          console.log('✅ Touch scrolling working! All containers moved');
          
          if (hasMomentum || isAnimating) {
            console.log('✅ Momentum system activated');
            
            // Monitor momentum decay
            let checkCount = 0;
            const momentumMonitor = setInterval(() => {
              checkCount++;
              const currentMomentum = app.setupState.globalMomentum.value;
              const stillAnimating = app.setupState.momentumAnimationId.value !== null;
              
              console.log(`📊 Momentum check ${checkCount}: ${currentMomentum.toFixed(2)}, animating: ${stillAnimating}`);
              
              if (!stillAnimating || checkCount > 20) {
                clearInterval(momentumMonitor);
                if (!stillAnimating) {
                  console.log('✅ Momentum naturally decayed - touch scrolling perfect!');
                  console.log('🎉 Mobile touch scrolling is working correctly!');
                } else {
                  console.log('⚠️ Momentum still active after 10 seconds');
                }
              }
            }, 500);
            
          } else {
            console.log('⚠️ No momentum detected - may be using direct positioning');
            console.log('✅ But touch scrolling is working!');
          }
          
        } else {
          console.log('❌ Touch scrolling not working properly');
          
          // Debug info
          console.log('🔍 Debug info:');
          console.log(`  - Touch state: ${app.setupState.isTouching.value}`);
          console.log(`  - Manual scrolling: ${app.setupState.isManualScrolling.value}`);
          console.log(`  - Autoplay: ${app.setupState.autoplay.value}`);
          console.log(`  - Modal open: ${app.setupState.isModalOpen.value}`);
          
          if (movedContainers === 0) {
            console.log('❌ No containers moved - touch events may not be working');
          } else {
            console.log(`⚠️ Only ${movedContainers} containers moved - synchronization issue`);
          }
        }
        
        // Test reverse direction
        setTimeout(() => {
          console.log('🔄 Testing reverse touch swipe...');
          
          const reverseStartEvent = new TouchEvent('touchstart', {
            touches: [{ clientY: 200 }],
            bubbles: true,
            cancelable: true
          });
          
          const reverseEndEvent = new TouchEvent('touchend', {
            changedTouches: [{ clientY: 350 }], // Swipe down 150px
            bubbles: true,
            cancelable: true
          });

          window.dispatchEvent(reverseStartEvent);
          setTimeout(() => {
            window.dispatchEvent(reverseEndEvent);
            console.log('  Reverse swipe completed (150px down)');
            
            setTimeout(() => {
              const finalPositions = [...app.setupState.scrollPositions.value];
              const reverseMovement = finalPositions.reduce((sum, pos, i) => 
                sum + Math.abs(pos - newPositions[i]), 0
              );
              
              console.log(`📊 Reverse movement: ${Math.round(reverseMovement)}px`);
              
              if (reverseMovement > 50) {
                console.log('✅ Bidirectional touch scrolling working!');
              } else {
                console.log('⚠️ Reverse direction may not be working properly');
              }
            }, 500);
          }, 100);
        }, 2000);
        
      }, 500);
    }, 100);
    
  }, 500);
}

// Auto-run test
setTimeout(testMobileTouchScroll, 1000);

console.log('✅ Mobile touch test script loaded and will run in 1 second...');
