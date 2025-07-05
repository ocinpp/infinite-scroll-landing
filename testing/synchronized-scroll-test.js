/**
 * Test script for synchronized smooth scrolling
 * Run this in browser console to test manual scroll synchronization
 * Location: testing/synchronized-scroll-test.js
 */

console.log('🎯 Testing Synchronized Smooth Scrolling...');

function testSynchronizedScroll() {
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
    console.log('🖱️ Testing synchronized scroll...');
    
    // Get initial positions
    const initialPositions = [...app.setupState.scrollPositions.value];
    console.log('📊 Initial positions:', initialPositions.map(p => Math.round(p)));

    // Test single wheel event
    console.log('🔄 Simulating single wheel event...');
    
    const wheelEvent = new WheelEvent('wheel', {
      deltaY: 100,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(wheelEvent);

    // Check positions immediately after
    setTimeout(() => {
      const newPositions = [...app.setupState.scrollPositions.value];
      console.log('📊 Positions after scroll:', newPositions.map(p => Math.round(p)));
      
      // Check if all containers moved
      let movedContainers = 0;
      let totalMovement = 0;
      
      for (let i = 0; i < app.setupState.numberOfContainers.value; i++) {
        const movement = Math.abs(newPositions[i] - initialPositions[i]);
        if (movement > 10) {
          movedContainers++;
          totalMovement += movement;
        }
      }
      
      console.log(`📊 Containers that moved: ${movedContainers}/${app.setupState.numberOfContainers.value}`);
      console.log(`📊 Average movement: ${Math.round(totalMovement / movedContainers)}px`);
      
      if (movedContainers === app.setupState.numberOfContainers.value) {
        console.log('✅ All containers moved synchronously!');
        
        // Test smooth transition
        console.log('🔄 Testing smooth transition...');
        
        // Check if containers have transitions applied
        let hasTransitions = 0;
        for (let i = 0; i < app.setupState.numberOfContainers.value; i++) {
          const container = app.setupState.scrollContainers.value[i];
          if (container && container.style.transition.includes('transform')) {
            hasTransitions++;
          }
        }
        
        console.log(`📊 Containers with smooth transitions: ${hasTransitions}/${app.setupState.numberOfContainers.value}`);
        
        if (hasTransitions > 0) {
          console.log('✅ Smooth transitions applied!');
          
          // Wait for transitions to complete
          setTimeout(() => {
            let clearedTransitions = 0;
            for (let i = 0; i < app.setupState.numberOfContainers.value; i++) {
              const container = app.setupState.scrollContainers.value[i];
              if (container && !container.style.transition) {
                clearedTransitions++;
              }
            }
            
            console.log(`📊 Transitions cleared: ${clearedTransitions}/${app.setupState.numberOfContainers.value}`);
            
            if (clearedTransitions === app.setupState.numberOfContainers.value) {
              console.log('✅ Transitions properly cleaned up!');
              console.log('🎉 Synchronized smooth scrolling is working perfectly!');
            } else {
              console.log('⚠️ Some transitions not cleaned up properly');
            }
          }, 1000);
          
        } else {
          console.log('⚠️ No smooth transitions detected');
        }
        
      } else {
        console.log('❌ Not all containers moved - synchronization failed');
        
        // Debug which containers didn't move
        for (let i = 0; i < app.setupState.numberOfContainers.value; i++) {
          const movement = Math.abs(newPositions[i] - initialPositions[i]);
          if (movement <= 10) {
            console.log(`❌ Container ${i} didn't move (movement: ${Math.round(movement)}px)`);
          }
        }
      }
    }, 100);
    
  }, 500);
}

// Auto-run test
setTimeout(testSynchronizedScroll, 1000);

console.log('✅ Synchronized scroll test script loaded and will run in 1 second...');
