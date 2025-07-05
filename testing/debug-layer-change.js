/**
 * Debug script for layer change issues
 * Run this in browser console when layer change fails
 * Location: testing/debug-layer-change.js
 */

console.log('🔍 Debug Layer Change Issue...');

function debugLayerChange() {
  const app = document.querySelector('#app').__vueParentComponent;
  if (!app) {
    console.log('❌ Vue app not found');
    return;
  }

  console.log('✅ Vue app found');

  // Get current state
  const state = {
    isInitialized: app.setupState.isInitialized.value,
    autoplay: app.setupState.autoplay.value,
    isPaused: app.setupState.isPaused.value,
    animationId: app.setupState.animationId.value,
    numberOfContainers: app.setupState.numberOfContainers.value,
    scrollContainers: app.setupState.scrollContainers.value,
    scrollPositions: app.setupState.scrollPositions.value
  };

  console.log('📊 Current State:', state);

  // Count registered containers
  let registeredCount = 0;
  for (let i = 0; i < state.numberOfContainers; i++) {
    if (state.scrollContainers[i]) {
      registeredCount++;
      console.log(`  Container ${i}: ✅ registered, position: ${state.scrollPositions[i]}`);
    } else {
      console.log(`  Container ${i}: ❌ not registered`);
    }
  }

  console.log(`📊 Registered: ${registeredCount}/${state.numberOfContainers}`);

  // Check if we should be ready
  const shouldBeReady = registeredCount === state.numberOfContainers;
  console.log(`🔍 Should be ready: ${shouldBeReady}`);

  if (shouldBeReady && !state.isInitialized) {
    console.log('🔧 Manually triggering checkIfAllReady...');
    app.setupState.checkIfAllReady();
    
    setTimeout(() => {
      const newState = {
        isInitialized: app.setupState.isInitialized.value,
        autoplay: app.setupState.autoplay.value,
        animationId: app.setupState.animationId.value
      };
      console.log('📊 State after manual trigger:', newState);
      
      if (newState.isInitialized && newState.autoplay && newState.animationId) {
        console.log('✅ Manual trigger worked!');
      } else {
        console.log('❌ Manual trigger failed');
        
        // Try force starting animation
        if (newState.isInitialized && newState.autoplay && !newState.animationId) {
          console.log('🔧 Force starting animation...');
          app.setupState.startAnimation();
          
          setTimeout(() => {
            const finalState = app.setupState.animationId.value;
            console.log(`📊 Animation ID after force start: ${finalState}`);
          }, 100);
        }
      }
    }, 500);
  } else if (shouldBeReady && state.isInitialized && !state.animationId) {
    console.log('🔧 System initialized but no animation, starting...');
    app.setupState.startAnimation();
  } else if (shouldBeReady && state.isInitialized && state.animationId) {
    console.log('✅ System appears to be working correctly');
  } else {
    console.log('⏳ System not ready yet, waiting for containers...');
  }
}

// Auto-run
setTimeout(debugLayerChange, 1000);

console.log('✅ Debug script loaded and will run in 1 second...');
