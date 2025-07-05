/**
 * Test script for improved mobile touch scrolling
 * Tests both tap-to-open-modal and swipe-to-scroll functionality
 * Location: testing/improved-mobile-touch-test.js
 */

console.log('📱 Testing Improved Mobile Touch Functionality...');

function testImprovedMobileTouch() {
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

  setTimeout(() => {
    console.log('📊 Current state:');
    console.log(`  - Autoplay: ${app.setupState.autoplay.value}`);
    console.log(`  - Modal open: ${app.setupState.isModalOpen.value}`);
    console.log(`  - Controls open: ${app.setupState.showControls.value}`);

    // Test 1: Test tap on image (should open modal)
    console.log('🔄 Test 1: Testing tap on image...');
    
    const imageCards = document.querySelectorAll('.image-card');
    console.log(`📊 Found ${imageCards.length} image cards`);

    if (imageCards.length > 0) {
      const firstCard = imageCards[0];
      const cardRect = firstCard.getBoundingClientRect();
      
      console.log(`📊 First card position: ${Math.round(cardRect.left)}, ${Math.round(cardRect.top)}`);
      
      // Simulate a tap (short touch without movement)
      const tapStartEvent = new TouchEvent('touchstart', {
        touches: [{ 
          clientX: cardRect.left + cardRect.width / 2,
          clientY: cardRect.top + cardRect.height / 2
        }],
        bubbles: true,
        cancelable: true
      });
      
      const tapEndEvent = new TouchEvent('touchend', {
        changedTouches: [{ 
          clientX: cardRect.left + cardRect.width / 2,
          clientY: cardRect.top + cardRect.height / 2
        }],
        bubbles: true,
        cancelable: true
      });

      // Dispatch tap events
      firstCard.dispatchEvent(tapStartEvent);
      
      setTimeout(() => {
        firstCard.dispatchEvent(tapEndEvent);
        
        // Also dispatch click event (since tap should trigger click)
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: cardRect.left + cardRect.width / 2,
          clientY: cardRect.top + cardRect.height / 2
        });
        firstCard.dispatchEvent(clickEvent);
        
        setTimeout(() => {
          const modalOpened = app.setupState.isModalOpen.value;
          console.log(`📊 Modal opened by tap: ${modalOpened}`);
          
          if (modalOpened) {
            console.log('✅ Tap to open modal works!');
            
            // Close modal for next test
            app.setupState.isModalOpen.value = false;
            
            // Test 2: Test swipe for scrolling
            setTimeout(() => {
              console.log('🔄 Test 2: Testing swipe for scrolling...');
              
              const initialPositions = [...app.setupState.scrollPositions.value];
              console.log('📊 Initial positions:', initialPositions.map(p => Math.round(p)));
              
              // Simulate a swipe (touch with significant movement)
              const swipeStartEvent = new TouchEvent('touchstart', {
                touches: [{ 
                  clientX: cardRect.left + cardRect.width / 2,
                  clientY: cardRect.top + cardRect.height / 2
                }],
                bubbles: true,
                cancelable: true
              });
              
              const swipeMoveEvent = new TouchEvent('touchmove', {
                touches: [{ 
                  clientX: cardRect.left + cardRect.width / 2,
                  clientY: cardRect.top + cardRect.height / 2 - 50 // Move up 50px
                }],
                bubbles: true,
                cancelable: true
              });
              
              const swipeEndEvent = new TouchEvent('touchend', {
                changedTouches: [{ 
                  clientX: cardRect.left + cardRect.width / 2,
                  clientY: cardRect.top + cardRect.height / 2 - 50
                }],
                bubbles: true,
                cancelable: true
              });

              // Dispatch swipe events
              firstCard.dispatchEvent(swipeStartEvent);
              
              setTimeout(() => {
                firstCard.dispatchEvent(swipeMoveEvent);
                
                setTimeout(() => {
                  firstCard.dispatchEvent(swipeEndEvent);
                  
                  setTimeout(() => {
                    const newPositions = [...app.setupState.scrollPositions.value];
                    console.log('📊 Positions after swipe:', newPositions.map(p => Math.round(p)));
                    
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
                    
                    const hasMomentum = app.setupState.globalMomentum.value > 0;
                    const isAnimating = app.setupState.momentumAnimationId.value !== null;
                    
                    console.log(`📊 Has momentum: ${hasMomentum} (${app.setupState.globalMomentum.value.toFixed(2)})`);
                    console.log(`📊 Is animating: ${isAnimating}`);
                    
                    if (movedContainers === app.setupState.numberOfContainers.value) {
                      console.log('✅ Swipe scrolling works!');
                      
                      // Test 3: Test swipe on gallery background
                      setTimeout(() => {
                        console.log('🔄 Test 3: Testing swipe on gallery background...');
                        
                        const galleryElement = document.querySelector('.infinite-scroll-gallery');
                        
                        if (galleryElement) {
                          const galleryRect = galleryElement.getBoundingClientRect();
                          
                          // Find an empty area (not on a card)
                          const backgroundX = galleryRect.left + 50;
                          const backgroundY = galleryRect.top + 50;
                          
                          const bgInitialPositions = [...app.setupState.scrollPositions.value];
                          
                          // Simulate background swipe
                          const bgSwipeStart = new TouchEvent('touchstart', {
                            touches: [{ clientX: backgroundX, clientY: backgroundY }],
                            bubbles: true,
                            cancelable: true
                          });
                          
                          const bgSwipeMove = new TouchEvent('touchmove', {
                            touches: [{ clientX: backgroundX, clientY: backgroundY + 60 }],
                            bubbles: true,
                            cancelable: true
                          });
                          
                          const bgSwipeEnd = new TouchEvent('touchend', {
                            changedTouches: [{ clientX: backgroundX, clientY: backgroundY + 60 }],
                            bubbles: true,
                            cancelable: true
                          });

                          window.dispatchEvent(bgSwipeStart);
                          
                          setTimeout(() => {
                            window.dispatchEvent(bgSwipeMove);
                            
                            setTimeout(() => {
                              window.dispatchEvent(bgSwipeEnd);
                              
                              setTimeout(() => {
                                const bgNewPositions = [...app.setupState.scrollPositions.value];
                                
                                let bgMovedContainers = 0;
                                for (let i = 0; i < app.setupState.numberOfContainers.value; i++) {
                                  const movement = Math.abs(bgNewPositions[i] - bgInitialPositions[i]);
                                  if (movement > 10) {
                                    bgMovedContainers++;
                                  }
                                }
                                
                                console.log(`📊 Background swipe moved containers: ${bgMovedContainers}/${app.setupState.numberOfContainers.value}`);
                                
                                if (bgMovedContainers === app.setupState.numberOfContainers.value) {
                                  console.log('✅ Background swipe scrolling works!');
                                  console.log('🎉 All improved mobile touch tests passed!');
                                  console.log('');
                                  console.log('📋 Summary:');
                                  console.log('  ✅ Tap on images opens modal');
                                  console.log('  ✅ Swipe on images scrolls gallery');
                                  console.log('  ✅ Swipe on background scrolls gallery');
                                  console.log('  ✅ Touch scrolling is now easily accessible!');
                                } else {
                                  console.log('⚠️ Background swipe not working optimally');
                                }
                              }, 500);
                            }, 50);
                          }, 50);
                          
                        } else {
                          console.log('❌ Gallery element not found');
                        }
                      }, 1000);
                      
                    } else {
                      console.log('❌ Swipe scrolling not working properly');
                      
                      if (movedContainers === 0) {
                        console.log('  - No containers moved - swipe not detected');
                      } else {
                        console.log(`  - Only ${movedContainers} containers moved - synchronization issue`);
                      }
                    }
                  }, 500);
                }, 50);
              }, 50);
              
            }, 500);
            
          } else {
            console.log('❌ Tap to open modal not working');
            
            // Debug info
            console.log('🔍 Debug info:');
            console.log(`  - Touch moved: ${app.setupState.touchMoved.value}`);
            console.log(`  - Is touching: ${app.setupState.isTouching.value}`);
            console.log(`  - Modal open: ${app.setupState.isModalOpen.value}`);
          }
        }, 300);
      }, 50);
      
    } else {
      console.log('❌ No image cards found');
    }
  }, 1000);
}

// Auto-run test
setTimeout(testImprovedMobileTouch, 1000);

console.log('✅ Improved mobile touch test script loaded and will run in 1 second...');
