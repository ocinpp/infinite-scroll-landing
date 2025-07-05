/**
 * Focused test for layer change autoplay issue
 * Run this in browser console after page loads
 * Location: testing/layer-change-test.js
 * 
 * NOTE: Use comprehensive-test.js for full testing
 */

console.log("🎯 Testing Layer Change Autoplay Issue...");

function testLayerChange() {
  const app = document.querySelector("#app").__vueParentComponent;
  if (!app) {
    console.log("❌ Vue app not found");
    return;
  }

  console.log("✅ Vue app found");

  // Get current state
  const originalLayers = app.setupState.numberOfContainers.value;
  console.log(`📊 Starting with ${originalLayers} layers`);

  // Function to check state
  function checkState(label) {
    const isInitialized = app.setupState.isInitialized.value;
    const autoplay = app.setupState.autoplay.value;
    const animationId = app.setupState.animationId.value;
    const numberOfContainers = app.setupState.numberOfContainers.value;

    let registeredCount = 0;
    for (let i = 0; i < numberOfContainers; i++) {
      if (app.setupState.scrollContainers.value[i]) {
        registeredCount++;
      }
    }

    console.log(`${label}:`);
    console.log(`  - Containers: ${numberOfContainers}`);
    console.log(`  - Registered: ${registeredCount}/${numberOfContainers}`);
    console.log(`  - Initialized: ${isInitialized}`);
    console.log(`  - Autoplay: ${autoplay}`);
    console.log(`  - Animation: ${animationId ? "Running" : "Stopped"}`);

    return {
      containers: numberOfContainers,
      registered: registeredCount,
      initialized: isInitialized,
      autoplay: autoplay,
      animation: !!animationId,
      allGood:
        registeredCount === numberOfContainers &&
        isInitialized &&
        autoplay &&
        animationId,
    };
  }

  // Check initial state
  const initialState = checkState("📊 Initial State");

  if (!initialState.allGood) {
    console.log("⚠️ Initial state not good, waiting...");
    setTimeout(() => {
      const retryState = checkState("📊 Retry Initial State");
      if (!retryState.allGood) {
        console.log("❌ Initial state still not good, aborting test");
        return;
      }
      proceedWithTest();
    }, 2000);
  } else {
    proceedWithTest();
  }

  function proceedWithTest() {
    console.log("🔄 Changing to 2 layers...");

    // Change to 2 layers
    app.setupState.numberOfContainers.value = 2;

    // Check state after 3 seconds
    setTimeout(() => {
      const afterChangeState = checkState("📊 After Change to 2 Layers");

      if (afterChangeState.allGood) {
        console.log("✅ SUCCESS: Autoplay working after layer change!");
      } else {
        console.log("❌ FAILED: Autoplay not working after layer change");

        // Try to debug why
        if (afterChangeState.registered < afterChangeState.containers) {
          console.log("🔍 Issue: Not all containers registered");
        } else if (!afterChangeState.initialized) {
          console.log("🔍 Issue: System not initialized");
        } else if (!afterChangeState.autoplay) {
          console.log("🔍 Issue: Autoplay disabled");
        } else if (!afterChangeState.animation) {
          console.log("🔍 Issue: Animation not running");
        }

        // Try manual fix
        console.log("🔧 Attempting manual fix...");
        if (afterChangeState.registered === afterChangeState.containers) {
          app.setupState.checkIfAllReady();

          setTimeout(() => {
            const fixedState = checkState("📊 After Manual Fix");
            if (fixedState.allGood) {
              console.log("✅ Manual fix worked!");
            } else {
              console.log("❌ Manual fix failed");
            }
          }, 500);
        }
      }

      // Change back to original
      setTimeout(() => {
        console.log(`🔄 Changing back to ${originalLayers} layers...`);
        app.setupState.numberOfContainers.value = originalLayers;

        setTimeout(() => {
          const finalState = checkState("📊 Final State");
          if (finalState.allGood) {
            console.log("✅ SUCCESS: Autoplay working after changing back!");
          } else {
            console.log("❌ FAILED: Autoplay not working after changing back");
          }
          console.log("🏁 Test completed!");
        }, 3000);
      }, 2000);
    }, 3000);
  }
}

// Wait for page to be ready
setTimeout(testLayerChange, 1000);
