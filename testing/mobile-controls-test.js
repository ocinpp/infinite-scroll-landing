/**
 * Test script for mobile controls functionality
 * Run this in browser console to test controls modal on mobile
 * Location: testing/mobile-controls-test.js
 */

console.log('📱 Testing Mobile Controls Functionality...');

function testMobileControls() {
  const app = document.querySelector('#app').__vueParentComponent;
  if (!app) {
    console.log('❌ Vue app not found');
    return;
  }

  console.log('✅ Vue app found');

  // Test 1: Check if controls can be opened
  console.log('🔄 Test 1: Opening controls...');
  
  const initialControlsState = app.setupState.showControls.value;
  console.log(`📊 Initial controls state: ${initialControlsState}`);
  
  // Open controls
  app.setupState.showControls.value = true;
  
  setTimeout(() => {
    const controlsOpen = app.setupState.showControls.value;
    console.log(`📊 Controls opened: ${controlsOpen}`);
    
    if (controlsOpen) {
      console.log('✅ Controls can be opened');
      
      // Test 2: Check if close button exists and is properly sized
      console.log('🔄 Test 2: Checking close button...');
      
      const closeButton = document.querySelector('.control-panel button[data-controls]') || 
                         document.querySelector('.control-panel button');
      
      if (closeButton) {
        const buttonRect = closeButton.getBoundingClientRect();
        const buttonSize = Math.min(buttonRect.width, buttonRect.height);
        
        console.log(`📊 Close button found: ${buttonSize}px (min recommended: 44px)`);
        
        if (buttonSize >= 44) {
          console.log('✅ Close button is properly sized for mobile');
        } else {
          console.log('⚠️ Close button may be too small for mobile touch');
        }
        
        // Test 3: Simulate close button click
        console.log('🔄 Test 3: Testing close button click...');
        
        closeButton.click();
        
        setTimeout(() => {
          const controlsClosedByButton = !app.setupState.showControls.value;
          console.log(`📊 Controls closed by button: ${controlsClosedByButton}`);
          
          if (controlsClosedByButton) {
            console.log('✅ Close button works correctly');
            
            // Test 4: Test click outside to close
            console.log('🔄 Test 4: Testing click outside to close...');
            
            // Open controls again
            app.setupState.showControls.value = true;
            
            setTimeout(() => {
              // Simulate click outside controls
              const outsideClickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                clientX: 100,
                clientY: 100
              });
              
              // Click on gallery area (not controls)
              const galleryArea = document.querySelector('.infinite-scroll-gallery') || document.body;
              galleryArea.dispatchEvent(outsideClickEvent);
              
              setTimeout(() => {
                const controlsClosedByOutside = !app.setupState.showControls.value;
                console.log(`📊 Controls closed by outside click: ${controlsClosedByOutside}`);
                
                if (controlsClosedByOutside) {
                  console.log('✅ Click outside to close works');
                  
                  // Test 5: Test touch event interference
                  console.log('🔄 Test 5: Testing touch event interference...');
                  
                  // Open controls
                  app.setupState.showControls.value = true;
                  
                  setTimeout(() => {
                    // Simulate touch on controls area
                    const controlsPanel = document.querySelector('.control-panel');
                    
                    if (controlsPanel) {
                      const touchStartEvent = new TouchEvent('touchstart', {
                        touches: [{ clientX: 200, clientY: 400 }],
                        bubbles: true,
                        cancelable: true
                      });
                      
                      controlsPanel.dispatchEvent(touchStartEvent);
                      
                      setTimeout(() => {
                        const controlsStillOpen = app.setupState.showControls.value;
                        const touchingState = app.setupState.isTouching.value;
                        
                        console.log(`📊 Controls still open after touch: ${controlsStillOpen}`);
                        console.log(`📊 Touch scrolling activated: ${touchingState}`);
                        
                        if (controlsStillOpen && !touchingState) {
                          console.log('✅ Touch events don\'t interfere with controls');
                          console.log('🎉 All mobile controls tests passed!');
                          
                          // Clean up
                          app.setupState.showControls.value = false;
                          
                        } else {
                          console.log('❌ Touch events interfering with controls');
                          if (!controlsStillOpen) {
                            console.log('  - Controls closed unexpectedly');
                          }
                          if (touchingState) {
                            console.log('  - Touch scrolling activated on controls area');
                          }
                        }
                      }, 200);
                      
                    } else {
                      console.log('❌ Controls panel not found for touch test');
                    }
                  }, 200);
                  
                } else {
                  console.log('❌ Click outside to close not working');
                }
              }, 200);
              
            }, 200);
            
          } else {
            console.log('❌ Close button not working');
          }
        }, 200);
        
      } else {
        console.log('❌ Close button not found');
      }
      
    } else {
      console.log('❌ Controls cannot be opened');
    }
  }, 200);
}

// Test toggle button accessibility
function testToggleButton() {
  console.log('🔄 Testing toggle button...');
  
  const toggleButton = document.querySelector('[data-controls]');
  
  if (toggleButton) {
    const buttonRect = toggleButton.getBoundingClientRect();
    const buttonSize = Math.min(buttonRect.width, buttonRect.height);
    
    console.log(`📊 Toggle button size: ${buttonSize}px (min recommended: 44px)`);
    
    if (buttonSize >= 44) {
      console.log('✅ Toggle button is properly sized for mobile');
    } else {
      console.log('⚠️ Toggle button may be too small for mobile touch');
    }
    
    // Test if button is accessible
    const isVisible = buttonRect.width > 0 && buttonRect.height > 0;
    const hasClickHandler = toggleButton.onclick || toggleButton.getAttribute('@click');
    
    console.log(`📊 Toggle button visible: ${isVisible}`);
    console.log(`📊 Toggle button has click handler: ${!!hasClickHandler}`);
    
    if (isVisible && hasClickHandler) {
      console.log('✅ Toggle button is accessible');
    } else {
      console.log('❌ Toggle button accessibility issues');
    }
    
  } else {
    console.log('❌ Toggle button not found');
  }
}

// Auto-run tests
setTimeout(() => {
  testToggleButton();
  setTimeout(() => {
    testMobileControls();
  }, 1000);
}, 1000);

console.log('✅ Mobile controls test script loaded and will run in 1 second...');
