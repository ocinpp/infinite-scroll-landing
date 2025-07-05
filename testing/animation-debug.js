/**
 * Animation debugging script
 * Run this in browser console to monitor animation behavior
 * Location: testing/animation-debug.js
 */

console.log('🔍 Starting Animation Debug Monitor...');

let lastAnimationId = null;
let animationStartCount = 0;
let animationStopCount = 0;

function monitorAnimation() {
  const app = document.querySelector('#app').__vueParentComponent;
  if (!app) {
    console.log('❌ Vue app not found');
    return;
  }

  const currentAnimationId = app.setupState.animationId.value;
  const isInitialized = app.setupState.isInitialized.value;
  const autoplay = app.setupState.autoplay.value;
  const isPaused = app.setupState.isPaused.value;
  
  // Check if animation ID changed
  if (currentAnimationId !== lastAnimationId) {
    if (currentAnimationId && !lastAnimationId) {
      animationStartCount++;
      console.log(`🎬 Animation STARTED #${animationStartCount} - ID: ${currentAnimationId}`);
    } else if (!currentAnimationId && lastAnimationId) {
      animationStopCount++;
      console.log(`⏹️ Animation STOPPED #${animationStopCount} - was ID: ${lastAnimationId}`);
    } else if (currentAnimationId && lastAnimationId) {
      animationStartCount++;
      console.log(`🔄 Animation RESTARTED #${animationStartCount} - ID: ${lastAnimationId} → ${currentAnimationId}`);
    }
    lastAnimationId = currentAnimationId;
  }
  
  // Log current state every 2 seconds
  if (Date.now() % 2000 < 100) {
    console.log(`📊 Current State: initialized=${isInitialized}, autoplay=${autoplay}, paused=${isPaused}, animationId=${currentAnimationId}`);
  }
}

// Monitor every 100ms
const monitorInterval = setInterval(monitorAnimation, 100);

// Stop monitoring after 30 seconds
setTimeout(() => {
  clearInterval(monitorInterval);
  console.log(`🏁 Animation monitoring stopped. Starts: ${animationStartCount}, Stops: ${animationStopCount}`);
}, 30000);

console.log('✅ Animation monitor running for 30 seconds...');
