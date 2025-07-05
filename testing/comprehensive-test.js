/**
 * Comprehensive automated testing suite
 * Tests all functionality with confidence
 * Location: testing/comprehensive-test.js
 */

console.log('🧪 Starting Comprehensive Test Suite...');

class ComprehensiveTester {
  constructor() {
    this.app = null;
    this.results = {};
    this.init();
  }

  init() {
    this.app = document.querySelector('#app').__vueParentComponent;
    if (!this.app) {
      console.log('❌ Vue app not found');
      return;
    }
    console.log('✅ Vue app found');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      success: 'color: green; font-weight: bold',
      error: 'color: red; font-weight: bold',
      warning: 'color: orange; font-weight: bold',
      info: 'color: blue'
    };
    console.log(`%c[${timestamp}] ${message}`, colors[type] || colors.info);
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getDetailedState() {
    const state = {
      isInitialized: this.app.setupState.isInitialized.value,
      autoplay: this.app.setupState.autoplay.value,
      isPaused: this.app.setupState.isPaused.value,
      animationId: this.app.setupState.animationId.value,
      numberOfContainers: this.app.setupState.numberOfContainers.value,
      isManualScrolling: this.app.setupState.isManualScrolling.value,
      scrollPositions: [...this.app.setupState.scrollPositions.value],
      registeredContainers: 0
    };

    // Count registered containers
    for (let i = 0; i < state.numberOfContainers; i++) {
      if (this.app.setupState.scrollContainers.value[i]) {
        state.registeredContainers++;
      }
    }

    return state;
  }

  async testInitialLoad() {
    this.log('🚀 Testing initial load...');
    
    // Wait for initial load
    await this.wait(3000);
    
    const state = this.getDetailedState();
    this.log(`Initial state: ${JSON.stringify(state, null, 2)}`);
    
    const passed = state.isInitialized && 
                   state.autoplay && 
                   state.animationId && 
                   state.registeredContainers === state.numberOfContainers;
    
    this.log(`Initial load test: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
    this.results.initialLoad = passed;
    return passed;
  }

  async testHoverPauseResume() {
    this.log('🖱️ Testing hover pause/resume...');
    
    const gallery = document.querySelector('.infinite-scroll-gallery');
    if (!gallery) {
      this.log('Gallery element not found', 'error');
      this.results.hover = false;
      return false;
    }

    const beforeHover = this.getDetailedState();
    
    // Simulate hover
    gallery.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await this.wait(500);
    
    const duringHover = this.getDetailedState();
    
    // Simulate unhover
    gallery.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    await this.wait(1000);
    
    const afterHover = this.getDetailedState();
    
    const passed = duringHover.isPaused && 
                   !afterHover.isPaused && 
                   afterHover.animationId;
    
    this.log(`Hover test: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
    this.log(`  Before: paused=${beforeHover.isPaused}, animationId=${beforeHover.animationId}`);
    this.log(`  During: paused=${duringHover.isPaused}, animationId=${duringHover.animationId}`);
    this.log(`  After: paused=${afterHover.isPaused}, animationId=${afterHover.animationId}`);
    
    this.results.hover = passed;
    return passed;
  }

  async testLayerChanges() {
    this.log('🔄 Testing layer changes...');
    
    const originalLayers = this.app.setupState.numberOfContainers.value;
    const testLayers = [2, 1, 3, 5, originalLayers];
    
    let allPassed = true;
    
    for (const layers of testLayers) {
      this.log(`  Changing to ${layers} layers...`);
      
      this.app.setupState.numberOfContainers.value = layers;
      await this.wait(4000); // Give more time for layer changes
      
      const state = this.getDetailedState();
      const passed = state.isInitialized && 
                     state.autoplay && 
                     state.animationId && 
                     state.numberOfContainers === layers &&
                     state.registeredContainers === layers;
      
      this.log(`    ${layers} layers: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
      
      if (!passed) {
        this.log(`    State: ${JSON.stringify(state, null, 2)}`);
        allPassed = false;
      }
    }
    
    this.log(`Layer changes test: ${allPassed ? 'PASSED' : 'FAILED'}`, allPassed ? 'success' : 'error');
    this.results.layerChanges = allPassed;
    return allPassed;
  }

  async testManualScroll() {
    this.log('🖱️ Testing manual scroll...');
    
    // Turn off autoplay
    this.app.setupState.autoplay.value = false;
    await this.wait(500);
    
    const beforeScroll = this.getDetailedState();
    const initialPositions = [...beforeScroll.scrollPositions];
    
    // Simulate wheel events
    for (let i = 0; i < 3; i++) {
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(wheelEvent);
      await this.wait(200);
    }
    
    await this.wait(500);
    const afterScroll = this.getDetailedState();
    
    // Check if positions changed
    let positionsChanged = false;
    for (let i = 0; i < beforeScroll.numberOfContainers; i++) {
      if (Math.abs(afterScroll.scrollPositions[i] - initialPositions[i]) > 50) {
        positionsChanged = true;
        break;
      }
    }
    
    // Turn autoplay back on
    this.app.setupState.autoplay.value = true;
    await this.wait(1000);
    
    const finalState = this.getDetailedState();
    const autoplayResumed = finalState.animationId;
    
    const passed = positionsChanged && autoplayResumed;
    
    this.log(`Manual scroll test: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
    this.log(`  Positions changed: ${positionsChanged}`);
    this.log(`  Autoplay resumed: ${autoplayResumed}`);
    
    this.results.manualScroll = passed;
    return passed;
  }

  async testControlChanges() {
    this.log('🎛️ Testing control changes...');
    
    const originalAutoplay = this.app.setupState.autoplay.value;
    const originalSpeed = this.app.setupState.scrollSpeed.value;
    
    // Test autoplay toggle
    this.app.setupState.autoplay.value = false;
    await this.wait(500);
    const autoplayOff = this.getDetailedState();
    
    this.app.setupState.autoplay.value = true;
    await this.wait(500);
    const autoplayOn = this.getDetailedState();
    
    // Test speed change
    this.app.setupState.scrollSpeed.value = 50;
    await this.wait(500);
    const speedChanged = this.getDetailedState();
    
    // Restore original values
    this.app.setupState.autoplay.value = originalAutoplay;
    this.app.setupState.scrollSpeed.value = originalSpeed;
    await this.wait(500);
    
    const passed = !autoplayOff.animationId && 
                   autoplayOn.animationId && 
                   speedChanged.animationId;
    
    this.log(`Control changes test: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
    this.results.controls = passed;
    return passed;
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive test suite...', 'info');
    
    const tests = [
      { name: 'Initial Load', fn: () => this.testInitialLoad() },
      { name: 'Hover Pause/Resume', fn: () => this.testHoverPauseResume() },
      { name: 'Layer Changes', fn: () => this.testLayerChanges() },
      { name: 'Manual Scroll', fn: () => this.testManualScroll() },
      { name: 'Control Changes', fn: () => this.testControlChanges() }
    ];
    
    for (const test of tests) {
      try {
        await test.fn();
      } catch (error) {
        this.log(`${test.name} failed with error: ${error.message}`, 'error');
        this.results[test.name.toLowerCase().replace(/\s+/g, '')] = false;
      }
      await this.wait(1000); // Pause between tests
    }
    
    this.printResults();
  }

  printResults() {
    const passed = Object.values(this.results).filter(Boolean).length;
    const total = Object.keys(this.results).length;
    
    this.log('🏁 TEST RESULTS SUMMARY', 'info');
    this.log(`Total: ${total}, Passed: ${passed}, Failed: ${total - passed}`);
    
    Object.entries(this.results).forEach(([test, result]) => {
      this.log(`  ${test}: ${result ? 'PASSED' : 'FAILED'}`, result ? 'success' : 'error');
    });
    
    if (passed === total) {
      this.log('🎉 ALL TESTS PASSED! Gallery is working perfectly.', 'success');
    } else {
      this.log(`⚠️ ${total - passed} tests failed. Check logs for details.`, 'warning');
    }
  }
}

// Auto-run tests
setTimeout(() => {
  const tester = new ComprehensiveTester();
  tester.runAllTests();
}, 2000);

console.log('✅ Comprehensive test suite loaded and will run in 2 seconds...');
