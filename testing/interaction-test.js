/**
 * Comprehensive interaction testing script
 * Tests hover, manual scroll, control changes, and layer changes
 * Location: testing/interaction-test.js
 */

console.log('🎮 Starting Comprehensive Interaction Test...');

class InteractionTester {
  constructor() {
    this.app = null;
    this.testResults = [];
    this.init();
  }

  init() {
    this.app = document.querySelector('#app').__vueParentComponent;
    if (!this.app) {
      console.log('❌ Vue app not found');
      return;
    }
    console.log('✅ Vue app found, starting tests...');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getState() {
    return {
      isInitialized: this.app.setupState.isInitialized.value,
      autoplay: this.app.setupState.autoplay.value,
      isPaused: this.app.setupState.isPaused.value,
      animationId: this.app.setupState.animationId.value,
      numberOfContainers: this.app.setupState.numberOfContainers.value,
      isManualScrolling: this.app.setupState.isManualScrolling.value
    };
  }

  logState(label) {
    const state = this.getState();
    this.log(`${label}: ${JSON.stringify(state)}`);
    return state;
  }

  async testHoverInteraction() {
    this.log('🖱️ Testing hover interaction...');
    
    const initialState = this.logState('Before hover');
    
    // Find a gallery container
    const galleryContainer = document.querySelector('[data-testid="gallery-container"]') || 
                            document.querySelector('.gallery-container') ||
                            document.querySelector('.infinite-scroll-gallery');
    
    if (!galleryContainer) {
      this.log('Gallery container not found for hover test', 'error');
      return false;
    }

    // Simulate mouse enter
    const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
    galleryContainer.dispatchEvent(mouseEnterEvent);
    
    await this.wait(500);
    const hoveredState = this.logState('During hover');
    
    // Simulate mouse leave
    const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
    galleryContainer.dispatchEvent(mouseLeaveEvent);
    
    await this.wait(500);
    const afterHoverState = this.logState('After hover');
    
    // Check if hover properly paused/resumed
    const hoverWorked = hoveredState.isPaused && !afterHoverState.isPaused && afterHoverState.animationId;
    
    this.log(`Hover test: ${hoverWorked ? 'PASSED' : 'FAILED'}`, hoverWorked ? 'success' : 'error');
    return hoverWorked;
  }

  async testManualScroll() {
    this.log('🖱️ Testing manual scroll...');
    
    // Turn off autoplay first
    this.app.setupState.autoplay.value = false;
    await this.wait(200);
    
    const beforeScrollState = this.logState('Before manual scroll');
    
    // Get initial positions
    const initialPositions = [...this.app.setupState.scrollPositions.value];
    
    // Simulate wheel event
    const wheelEvent = new WheelEvent('wheel', {
      deltaY: 100,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(wheelEvent);
    await this.wait(300);
    
    const afterScrollState = this.logState('After manual scroll');
    const newPositions = this.app.setupState.scrollPositions.value;
    
    // Check if positions changed
    let positionsChanged = false;
    for (let i = 0; i < beforeScrollState.numberOfContainers; i++) {
      if (Math.abs(newPositions[i] - initialPositions[i]) > 10) {
        positionsChanged = true;
        break;
      }
    }
    
    // Turn autoplay back on
    this.app.setupState.autoplay.value = true;
    await this.wait(200);
    
    this.log(`Manual scroll test: ${positionsChanged ? 'PASSED' : 'FAILED'}`, positionsChanged ? 'success' : 'error');
    return positionsChanged;
  }

  async testLayerChange() {
    this.log('🔄 Testing layer change...');
    
    const originalLayers = this.app.setupState.numberOfContainers.value;
    const targetLayers = originalLayers === 3 ? 2 : 3;
    
    const beforeChangeState = this.logState('Before layer change');
    
    // Change layers
    this.app.setupState.numberOfContainers.value = targetLayers;
    
    // Wait for change to process
    await this.wait(3000);
    
    const afterChangeState = this.logState('After layer change');
    
    // Check if autoplay resumed
    const layerChangeWorked = afterChangeState.isInitialized && 
                             afterChangeState.autoplay && 
                             afterChangeState.animationId &&
                             afterChangeState.numberOfContainers === targetLayers;
    
    // Change back
    this.app.setupState.numberOfContainers.value = originalLayers;
    await this.wait(2000);
    
    this.log(`Layer change test: ${layerChangeWorked ? 'PASSED' : 'FAILED'}`, layerChangeWorked ? 'success' : 'error');
    return layerChangeWorked;
  }

  async testControlChanges() {
    this.log('🎛️ Testing control changes...');
    
    const originalAutoplay = this.app.setupState.autoplay.value;
    
    // Turn off autoplay
    this.app.setupState.autoplay.value = false;
    await this.wait(500);
    const autoplayOffState = this.logState('Autoplay OFF');
    
    // Turn on autoplay
    this.app.setupState.autoplay.value = true;
    await this.wait(500);
    const autoplayOnState = this.logState('Autoplay ON');
    
    const controlsWorked = !autoplayOffState.animationId && autoplayOnState.animationId;
    
    // Restore original state
    this.app.setupState.autoplay.value = originalAutoplay;
    
    this.log(`Control changes test: ${controlsWorked ? 'PASSED' : 'FAILED'}`, controlsWorked ? 'success' : 'error');
    return controlsWorked;
  }

  async runAllTests() {
    this.log('🚀 Starting comprehensive interaction tests...');
    
    const results = {
      hover: await this.testHoverInteraction(),
      manualScroll: await this.testManualScroll(),
      layerChange: await this.testLayerChange(),
      controls: await this.testControlChanges()
    };
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    this.log(`🏁 Test Results: ${passedTests}/${totalTests} passed`);
    
    Object.entries(results).forEach(([test, passed]) => {
      this.log(`  ${test}: ${passed ? 'PASSED' : 'FAILED'}`, passed ? 'success' : 'error');
    });
    
    if (passedTests === totalTests) {
      this.log('🎉 All tests passed! Gallery is working correctly.', 'success');
    } else {
      this.log('⚠️ Some tests failed. Check the logs above for details.', 'warning');
    }
    
    return results;
  }
}

// Auto-run tests
setTimeout(() => {
  const tester = new InteractionTester();
  tester.runAllTests();
}, 1000);

console.log('✅ Interaction test script loaded and will run in 1 second...');
