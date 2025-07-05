/**
 * Test script for modal opening in manual scroll mode
 * Run this in browser console to test image modal functionality
 * Location: testing/modal-manual-scroll-test.js
 */

console.log('🖼️ Testing Modal Opening in Manual Scroll Mode...');

function testModalInManualMode() {
  const app = document.querySelector('#app').__vueParentComponent;
  if (!app) {
    console.log('❌ Vue app not found');
    return;
  }

  console.log('✅ Vue app found');

  // Ensure we're in manual scroll mode
  if (app.setupState.autoplay.value) {
    console.log('🔄 Turning off autoplay to enable manual scroll mode...');
    app.setupState.autoplay.value = false;
  }

  // Wait for autoplay to stop
  setTimeout(() => {
    console.log('📊 Current state:');
    console.log(`  - Autoplay: ${app.setupState.autoplay.value}`);
    console.log(`  - Modal open: ${app.setupState.isModalOpen.value}`);
    console.log(`  - Controls open: ${app.setupState.showControls.value}`);

    // Test 1: Find image cards
    console.log('🔄 Test 1: Finding image cards...');
    
    const imageCards = document.querySelectorAll('.image-card');
    console.log(`📊 Found ${imageCards.length} image cards`);

    if (imageCards.length > 0) {
      console.log('✅ Image cards found');
      
      // Test 2: Test click on first image
      console.log('🔄 Test 2: Testing image click...');
      
      const firstImage = imageCards[0];
      const imageRect = firstImage.getBoundingClientRect();
      
      console.log(`📊 First image position: ${Math.round(imageRect.left)}, ${Math.round(imageRect.top)}`);
      console.log(`📊 First image size: ${Math.round(imageRect.width)}x${Math.round(imageRect.height)}`);
      
      // Simulate click on image
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: imageRect.left + imageRect.width / 2,
        clientY: imageRect.top + imageRect.height / 2
      });
      
      firstImage.dispatchEvent(clickEvent);
      
      // Check if modal opened
      setTimeout(() => {
        const modalOpened = app.setupState.isModalOpen.value;
        const selectedImage = app.setupState.selectedImage.value;
        
        console.log(`📊 Modal opened: ${modalOpened}`);
        console.log(`📊 Selected image: ${selectedImage ? 'Yes' : 'No'}`);
        
        if (modalOpened && selectedImage) {
          console.log('✅ Image click works in manual scroll mode!');
          
          // Test 3: Test modal functionality
          console.log('🔄 Test 3: Testing modal functionality...');
          
          // Check if modal is visible in DOM
          const modalElement = document.querySelector('[data-testid="image-modal"]') || 
                              document.querySelector('.modal') ||
                              document.querySelector('[role="dialog"]');
          
          if (modalElement) {
            console.log('✅ Modal element found in DOM');
            
            // Test close modal
            console.log('🔄 Test 4: Testing modal close...');
            
            // Try closing with escape key
            const escapeEvent = new KeyboardEvent('keydown', {
              key: 'Escape',
              bubbles: true,
              cancelable: true
            });
            
            window.dispatchEvent(escapeEvent);
            
            setTimeout(() => {
              const modalClosed = !app.setupState.isModalOpen.value;
              console.log(`📊 Modal closed by Escape: ${modalClosed}`);
              
              if (modalClosed) {
                console.log('✅ Modal close works correctly');
                
                // Test 5: Test touch on image (mobile)
                console.log('🔄 Test 5: Testing touch on image...');
                
                // Open modal again first
                firstImage.dispatchEvent(clickEvent);
                
                setTimeout(() => {
                  const modalReopened = app.setupState.isModalOpen.value;
                  console.log(`📊 Modal reopened: ${modalReopened}`);
                  
                  if (modalReopened) {
                    // Test touch events don't interfere
                    const touchStartEvent = new TouchEvent('touchstart', {
                      touches: [{ 
                        clientX: imageRect.left + imageRect.width / 2,
                        clientY: imageRect.top + imageRect.height / 2
                      }],
                      bubbles: true,
                      cancelable: true
                    });
                    
                    firstImage.dispatchEvent(touchStartEvent);
                    
                    setTimeout(() => {
                      const touchingState = app.setupState.isTouching.value;
                      const modalStillOpen = app.setupState.isModalOpen.value;
                      
                      console.log(`📊 Touch scrolling activated on image: ${touchingState}`);
                      console.log(`📊 Modal still open after touch: ${modalStillOpen}`);
                      
                      if (!touchingState && modalStillOpen) {
                        console.log('✅ Touch events don\'t interfere with images');
                        console.log('🎉 All modal tests passed in manual scroll mode!');
                      } else {
                        console.log('⚠️ Touch event interference detected');
                        if (touchingState) {
                          console.log('  - Touch scrolling activated on image area');
                        }
                        if (!modalStillOpen) {
                          console.log('  - Modal closed unexpectedly');
                        }
                      }
                      
                      // Clean up - close modal
                      app.setupState.isModalOpen.value = false;
                      
                    }, 200);
                    
                  } else {
                    console.log('❌ Could not reopen modal for touch test');
                  }
                }, 200);
                
              } else {
                console.log('❌ Modal close not working');
              }
            }, 200);
            
          } else {
            console.log('❌ Modal element not found in DOM');
          }
          
        } else {
          console.log('❌ Image click not working in manual scroll mode');
          
          // Debug information
          console.log('🔍 Debug info:');
          console.log(`  - Autoplay: ${app.setupState.autoplay.value}`);
          console.log(`  - Modal open: ${app.setupState.isModalOpen.value}`);
          console.log(`  - Selected image: ${app.setupState.selectedImage.value}`);
          console.log(`  - Is touching: ${app.setupState.isTouching.value}`);
          console.log(`  - Manual scrolling: ${app.setupState.isManualScrolling.value}`);
          
          // Check if click event was prevented
          console.log('🔍 Checking event handling...');
          
          // Try direct function call
          if (app.setupState.openModal) {
            console.log('🔧 Trying direct modal open...');
            app.setupState.openModal({ id: 'test', url: 'test.jpg', title: 'Test Image' });
            
            setTimeout(() => {
              const directModalOpen = app.setupState.isModalOpen.value;
              console.log(`📊 Direct modal open worked: ${directModalOpen}`);
              
              if (directModalOpen) {
                console.log('✅ Modal function works, issue is with click handling');
                app.setupState.isModalOpen.value = false; // Clean up
              } else {
                console.log('❌ Modal function not working');
              }
            }, 100);
          }
        }
      }, 300);
      
    } else {
      console.log('❌ No image cards found');
      console.log('🔍 Checking if gallery is initialized...');
      console.log(`  - Initialized: ${app.setupState.isInitialized.value}`);
      console.log(`  - Container count: ${app.setupState.numberOfContainers.value}`);
      
      // Check for any images in DOM
      const allImages = document.querySelectorAll('img');
      console.log(`📊 Total images in DOM: ${allImages.length}`);
    }
  }, 1000);
}

// Auto-run test
setTimeout(testModalInManualMode, 1000);

console.log('✅ Modal manual scroll test script loaded and will run in 1 second...');
