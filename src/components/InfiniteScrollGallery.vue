<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import ImageModal from "./ImageModal.vue";
import type { ImageItem } from "../types/images";

// Configuration interface for default settings
export interface GalleryConfig {
  /** Scroll orientation - horizontal or vertical */
  scrollDirection?: "horizontal" | "vertical";
  /** Tilt angle in degrees (0-45) */
  tiltDegree?: number;
  /** Tilt direction - left or right */
  tiltDirection?: "left" | "right";
  /** Enable autoplay */
  autoplay?: boolean;
  /** Autoplay direction - forward or reverse */
  autoplayDirection?: "forward" | "reverse";
  /** Pause animation on hover */
  pauseOnHover?: boolean;
  /** Animation speed (1-50) */
  scrollSpeed?: number;
  /** Number of scroll layers (1-5) */
  numberOfContainers?: number;
  /** Spacing between layers in rem (0-40) */
  layerSpacing?: number;
}

// Props
interface Props {
  /**
   * Array of images to display in the infinite scroll gallery
   * @example
   * const images = [
   *   { id: 1, url: 'image1.jpg', title: 'Title', description: 'Description' },
   *   { id: 2, url: 'image2.jpg', title: 'Title', description: 'Description' }
   * ]
   */
  images: ImageItem[];

  /**
   * Configuration object for default gallery settings
   * @example
   * const config = {
   *   scrollDirection: 'vertical',
   *   autoplay: false,
   *   numberOfContainers: 5,
   *   scrollSpeed: 30
   * }
   */
  config?: GalleryConfig;
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
});

// Use images from props
const allImages = computed(() => props.images);

// Default configuration values
const defaultConfig: Required<GalleryConfig> = {
  scrollDirection: "horizontal",
  tiltDegree: 15,
  tiltDirection: "right",
  autoplay: true,
  autoplayDirection: "forward",
  pauseOnHover: true,
  scrollSpeed: 20,
  numberOfContainers: 3,
  layerSpacing: 14,
};

// Merge props config with defaults
const finalConfig = computed(() => ({
  ...defaultConfig,
  ...props.config,
}));

// Reactive state initialized with config values
const tiltDegree = ref(finalConfig.value.tiltDegree);
const tiltDirection = ref<"left" | "right">(finalConfig.value.tiltDirection);
const autoplay = ref(finalConfig.value.autoplay);
const autoplayDirection = ref<"forward" | "reverse">(
  finalConfig.value.autoplayDirection
);
const pauseOnHover = ref(finalConfig.value.pauseOnHover);
const scrollSpeed = ref(finalConfig.value.scrollSpeed);
const numberOfContainers = ref(finalConfig.value.numberOfContainers);
const layerSpacing = ref(finalConfig.value.layerSpacing);
const scrollDirection = ref<"horizontal" | "vertical">(
  finalConfig.value.scrollDirection
);
const selectedImage = ref<ImageItem | null>(null);
const isModalOpen = ref(false);
const isPaused = ref(false);
const showControls = ref(false);
const isManualScrolling = ref(false);

// Simple momentum for gradual deceleration
const globalMomentum = ref(0);
const momentumDirection = ref<"forward" | "reverse">("forward");
const momentumAnimationId = ref<number | null>(null);

// Touch handling for mobile
const touchStartY = ref(0);
const touchStartTime = ref(0);
const isTouching = ref(false);
const touchStartX = ref(0);
const touchMoved = ref(false);

// Computed property for visible container indices
const visibleContainerIndices = computed(() => {
  const indices = [];
  for (let i = 1; i <= numberOfContainers.value; i++) {
    indices.push(i);
  }
  return indices;
});

// Fixed number of containers - always create 5, show/hide based on numberOfContainers
const MAX_CONTAINERS = 5;
const scrollContainers = ref<HTMLElement[]>(Array(MAX_CONTAINERS).fill(null));
const animationId = ref<number | null>(null);
const scrollPositions = ref<number[]>(Array(MAX_CONTAINERS).fill(0));
const isInitialized = ref(false);

// Simple debug function
const debugSystemState = () => {
  console.log("🔍 System State Debug:");
  console.log(`  - isInitialized: ${isInitialized.value}`);
  console.log(`  - numberOfContainers: ${numberOfContainers.value}`);
  console.log(`  - autoplay: ${autoplay.value}`);
  console.log(`  - animationId: ${animationId.value}`);

  for (let i = 0; i < numberOfContainers.value; i++) {
    const container = scrollContainers.value[i];
    const position = scrollPositions.value[i];
    console.log(
      `  - Container ${i}: ${
        container ? "registered" : "missing"
      }, position: ${position}, scrollWidth: ${container?.scrollWidth || "N/A"}`
    );
  }
};

// Computed properties
const containerTiltStyle = computed(() => {
  const degree =
    tiltDirection.value === "left"
      ? -Math.abs(tiltDegree.value)
      : Math.abs(tiltDegree.value);
  return {
    transform: `rotate(${degree}deg)`,
    transformOrigin: "center center",
  };
});

// Stable card sizing based on number of containers and scroll direction
const cardSizeClasses = computed(() => {
  let sizeClass = "";
  if (scrollDirection.value === "vertical") {
    // For vertical scrolling, use wider cards that work well stacked
    if (numberOfContainers.value >= 4) {
      sizeClass = "w-80 h-56";
    } else if (numberOfContainers.value === 3) {
      sizeClass = "w-96 h-64";
    } else {
      sizeClass = "w-[28rem] h-72";
    }
  } else {
    // Original horizontal sizing
    if (numberOfContainers.value >= 4) {
      sizeClass = "w-64 h-72";
    } else if (numberOfContainers.value === 3) {
      sizeClass = "w-72 h-80";
    } else {
      sizeClass = "w-80 h-96";
    }
  }

  console.log(
    `🎨 Card size updated: ${sizeClass} (containers: ${numberOfContainers.value}, direction: ${scrollDirection.value})`
  );
  return sizeClass;
});

// Layout classes for containers based on scroll direction
const containerLayoutClasses = computed(() => {
  if (scrollDirection.value === "vertical") {
    return "flex flex-col justify-center items-center";
  } else {
    return "flex items-center";
  }
});

// Layout classes for card containers based on scroll direction
const cardContainerLayoutClasses = computed(() => {
  if (scrollDirection.value === "vertical") {
    return "flex flex-col gap-6 will-change-transform";
  } else {
    return "flex gap-6 will-change-transform";
  }
});

// Calculate container height to fill the page maximally, accounting for spacing
const containerHeight = computed(() => {
  if (scrollDirection.value === "vertical") {
    // For vertical scrolling, use full width and distribute height
    return 100; // Full viewport height divided by containers
  }

  // Original horizontal logic
  // Calculate total spacing needed between containers
  const totalSpacingRem = (numberOfContainers.value - 1) * layerSpacing.value;

  // Convert rem to vh with better scaling for larger values
  // 1rem ≈ 16px, typical viewport height ≈ 800-1200px
  const totalSpacingVh = totalSpacingRem * 2; // More accurate conversion for larger spacing

  // Available height after accounting for spacing
  const availableHeight = Math.max(100 - totalSpacingVh, 30); // Minimum 30vh available

  // Base height per container
  const baseHeight = availableHeight / numberOfContainers.value;

  // Add extra height based on tilt to ensure full coverage (reduced bonus)
  const tiltBonus = Math.abs(tiltDegree.value) * 0.2; // Further reduced for better spacing

  const finalHeight = Math.max(baseHeight + tiltBonus, 8); // Minimum 8dvh per container

  console.log(
    `📏 Container height: ${finalHeight}dvh (spacing: ${layerSpacing.value}rem, containers: ${numberOfContainers.value})`
  );

  return finalHeight;
});

// Calculate container width for vertical scrolling
const containerWidth = computed(() => {
  if (scrollDirection.value === "horizontal") {
    return 100; // Full width for horizontal
  }

  // For vertical scrolling, distribute width among containers
  const totalSpacingRem = (numberOfContainers.value - 1) * layerSpacing.value;
  const totalSpacingVw = totalSpacingRem * 1.5; // Convert rem to vw approximation
  const availableWidth = Math.max(100 - totalSpacingVw, 20); // Minimum 20vw available
  const baseWidth = availableWidth / numberOfContainers.value;
  const finalWidth = Math.max(baseWidth, 15); // Minimum 15vw per container

  console.log(
    `📏 Container width: ${finalWidth}vw (spacing: ${layerSpacing.value}rem, containers: ${numberOfContainers.value})`
  );

  return finalWidth;
});

// Create different image sets for each container - same images, different order
const getImagesForContainer = (containerIndex: number) => {
  // Create a copy of all images to avoid mutating the original array
  const containerImages = [...allImages.value];

  // Create a deterministic but different shuffle for each container
  // Using container index as seed for consistent results
  const seed = containerIndex + 1;

  // Simple deterministic shuffle based on container index
  for (let i = containerImages.length - 1; i > 0; i--) {
    // Use container-specific pseudo-random index
    const j = (seed * i * 7 + containerIndex * 13) % (i + 1);
    [containerImages[i], containerImages[j]] = [
      containerImages[j],
      containerImages[i],
    ];
  }

  // Triple for seamless scrolling
  return [...containerImages, ...containerImages, ...containerImages];
};

// Simple container registration
const registerContainer = (el: HTMLElement | null, index: number) => {
  if (el && index >= 1 && index <= MAX_CONTAINERS) {
    const arrayIndex = index - 1; // Convert to 0-based

    // Prevent duplicate registration
    if (scrollContainers.value[arrayIndex] === el) {
      console.log(`⏭️ Container ${index} already registered, skipping`);
      return;
    }

    scrollContainers.value[arrayIndex] = el;
    console.log(`✅ Container ${index} registered`);

    // Simple initialization - just set initial position
    const isEvenContainer = arrayIndex % 2 === 0;
    const shouldReverse = autoplayDirection.value === "reverse";

    let initialPosition = 0;
    if (
      (isEvenContainer && shouldReverse) ||
      (!isEvenContainer && !shouldReverse)
    ) {
      // Wait for element to have content, then set position
      setTimeout(() => {
        if (scrollDirection.value === "vertical") {
          const height = el.scrollHeight || 2400; // fallback height for vertical
          initialPosition = -height / 3;
          scrollPositions.value[arrayIndex] = initialPosition;
          el.style.transform = `translateY(${initialPosition}px)`;
          console.log(
            `✅ Container ${index} (vertical) initialized at ${initialPosition}px`
          );
        } else {
          const width = el.scrollWidth || 2400; // fallback width for horizontal
          initialPosition = -width / 3;
          scrollPositions.value[arrayIndex] = initialPosition;
          el.style.transform = `translateX(${initialPosition}px)`;
          console.log(
            `✅ Container ${index} (horizontal) initialized at ${initialPosition}px`
          );
        }

        // Check if all containers are ready
        checkIfAllReady();
      }, 100);
    } else {
      scrollPositions.value[arrayIndex] = 0;
      if (scrollDirection.value === "vertical") {
        el.style.transform = `translateY(0px)`;
        console.log(`✅ Container ${index} (vertical) initialized at 0px`);
      } else {
        el.style.transform = `translateX(0px)`;
        console.log(`✅ Container ${index} (horizontal) initialized at 0px`);
      }
      checkIfAllReady();
    }
  }
};

// Simple check if all containers are ready
const checkIfAllReady = () => {
  // Capture values at the same time to avoid race conditions and ensure number type
  const currentContainerCount = Number(numberOfContainers.value);
  let readyCount = 0;

  for (let i = 0; i < currentContainerCount; i++) {
    if (scrollContainers.value[i]) {
      readyCount++;
    }
  }

  console.log(
    `📊 Ready containers: ${readyCount}/${currentContainerCount} (isInitialized: ${isInitialized.value}, autoplay: ${autoplay.value}, animationId: ${animationId.value})`
  );

  console.log(
    `🔍 Condition check: readyCount(${readyCount}) === currentContainerCount(${currentContainerCount}) = ${
      readyCount === currentContainerCount
    }`
  );

  // Always check if we should start, regardless of isInitialized state
  if (readyCount === currentContainerCount) {
    console.log(`✅ All containers ready! Checking what to do...`);

    if (!isInitialized.value) {
      console.log(`🚀 Setting initialized=true and starting animation...`);
      isInitialized.value = true;
      console.log(`🎉 All containers ready! Starting autoplay...`);
      if (autoplay.value) {
        startAnimation();
      }
    } else if (autoplay.value && !animationId.value) {
      // If already initialized but animation stopped, restart it
      console.log(`🔄 Restarting autoplay...`);
      startAnimation();
    } else if (isInitialized.value && autoplay.value && animationId.value) {
      console.log(`✅ System already running properly, no action needed`);
    } else {
      console.log(
        `⚠️ Unexpected state: initialized=${isInitialized.value}, autoplay=${autoplay.value}, animationId=${animationId.value}`
      );
    }
  } else {
    console.log(
      `⏳ Not all containers ready yet: ${readyCount}/${currentContainerCount}`
    );
  }
};

// Methods
const openModal = (image: ImageItem) => {
  selectedImage.value = image;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedImage.value = null;
};

const toggleControls = () => {
  showControls.value = !showControls.value;
};

// Handle clicks outside controls to close on mobile
const handleDocumentClick = (event: Event) => {
  if (showControls.value) {
    const target = event.target as HTMLElement;
    const isControlsArea =
      target.closest(".control-panel") || target.closest("[data-controls]");

    // Don't close controls when clicking on controls area
    if (!isControlsArea) {
      showControls.value = false;
    }
  }
};

const handleMouseEnter = () => {
  if (pauseOnHover.value) {
    isPaused.value = true;
  }
};

const handleMouseLeave = () => {
  if (pauseOnHover.value) {
    isPaused.value = false;
  }
};

// Manual scroll with momentum for gradual deceleration
const manualScroll = (
  direction: "forward" | "reverse",
  scrollIntensity: number = 1
) => {
  if (!autoplay.value && !isModalOpen.value && isInitialized.value) {
    // Add to momentum instead of direct position change
    const baseMomentum = 4; // Base momentum amount
    const momentumToAdd = baseMomentum * scrollIntensity;

    // Set direction for momentum
    momentumDirection.value = direction;

    // Add to existing momentum (allows building up speed)
    globalMomentum.value += momentumToAdd;

    // Cap maximum momentum to prevent excessive speed
    const maxMomentum = 20;
    if (globalMomentum.value > maxMomentum) {
      globalMomentum.value = maxMomentum;
    }

    // Start momentum animation if not already running
    if (!momentumAnimationId.value) {
      momentumAnimationId.value = requestAnimationFrame(animateMomentum);
    }
  }
};

// Handle wheel events for manual scrolling
const handleWheel = (event: WheelEvent) => {
  if (!autoplay.value && !isModalOpen.value) {
    event.preventDefault();

    // Very minimal throttle for maximum responsiveness
    if (isManualScrolling.value) return;

    isManualScrolling.value = true;

    // Calculate scroll intensity based on wheel delta with better scaling for trackpads
    const deltaY = Math.abs(event.deltaY);
    // Better scaling for both mouse wheels (larger deltas) and trackpads (smaller deltas)
    const scrollIntensity = Math.min(Math.max(deltaY / 80, 0.3), 2.5); // Scale between 0.3x and 2.5x

    // Determine direction based on wheel delta
    const direction = event.deltaY > 0 ? "forward" : "reverse";
    manualScroll(direction, scrollIntensity);

    // Very short throttle for ultra-smooth experience
    setTimeout(() => {
      isManualScrolling.value = false;
    }, 10); // Reduced to 10ms for maximum responsiveness
  }
};

// Handle touch events for mobile manual scrolling
const handleTouchStart = (event: TouchEvent) => {
  if (!autoplay.value && !isModalOpen.value) {
    // Check if touch is on controls area - if so, don't handle for scrolling
    const target = event.target as HTMLElement;
    const isControlsArea =
      target.closest(".control-panel") || target.closest("[data-controls]");

    if (!isControlsArea) {
      isTouching.value = true;
      touchStartY.value = event.touches[0].clientY;
      touchStartX.value = event.touches[0].clientX;
      touchStartTime.value = Date.now();
      touchMoved.value = false;
    }
  }
};

const handleTouchMove = (event: TouchEvent) => {
  if (!autoplay.value && !isModalOpen.value && isTouching.value) {
    const currentY = event.touches[0].clientY;
    const currentX = event.touches[0].clientX;

    // Calculate movement distance
    const deltaY = Math.abs(currentY - touchStartY.value);
    const deltaX = Math.abs(currentX - touchStartX.value);
    const totalMovement = Math.sqrt(deltaY * deltaY + deltaX * deltaX);

    // If movement is significant, mark as moved and prevent default
    if (totalMovement > 10) {
      touchMoved.value = true;
      event.preventDefault(); // Prevent page scrolling
    }
  }
};

const handleTouchEnd = (event: TouchEvent) => {
  if (!autoplay.value && !isModalOpen.value && isTouching.value) {
    const touchEndY = event.changedTouches[0].clientY;
    const touchEndTime = Date.now();

    const deltaY = touchStartY.value - touchEndY;
    const deltaTime = touchEndTime - touchStartTime.value;

    // If this was a significant movement, treat as scroll gesture
    if (touchMoved.value) {
      event.preventDefault();

      // Calculate velocity and intensity
      const distance = Math.abs(deltaY);
      const velocity = distance / Math.max(deltaTime, 1); // pixels per ms

      // Only trigger if significant movement (> 20px) and reasonable time (< 500ms)
      if (distance > 20 && deltaTime < 500) {
        // Calculate scroll intensity based on velocity and distance
        const baseIntensity = Math.min(distance / 100, 2); // Distance-based intensity
        const velocityBonus = Math.min(velocity / 2, 1); // Velocity bonus
        const scrollIntensity = Math.max(baseIntensity + velocityBonus, 0.5);

        // Determine direction (opposite of touch movement for natural feel)
        const direction = deltaY > 0 ? "forward" : "reverse";

        manualScroll(direction, scrollIntensity);
      }
    }
    // If no significant movement, this was a tap - let click events handle it

    // Reset touch state
    isTouching.value = false;
    touchStartY.value = 0;
    touchStartX.value = 0;
    touchStartTime.value = 0;
    touchMoved.value = false;
  }
};

// Robust animation system
const startAnimation = () => {
  if (animationId.value) {
    console.log(
      `⚠️ Animation already running (ID: ${animationId.value}), not starting new one`
    );
    return;
  }
  animationId.value = requestAnimationFrame(animate);
  console.log(`🎬 Animation started with ID: ${animationId.value}`);
};

const stopAnimation = () => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
    animationId.value = null;
    console.log(`⏹️ Animation stopped`);
  }
};

// Stop momentum animation
const stopMomentum = () => {
  if (momentumAnimationId.value) {
    cancelAnimationFrame(momentumAnimationId.value);
    momentumAnimationId.value = null;
  }
  globalMomentum.value = 0;
};

// Momentum animation loop - applies same movement to all containers
const animateMomentum = () => {
  if (Math.abs(globalMomentum.value) < 0.5) {
    // Momentum too small, stop animation
    stopMomentum();
    return;
  }

  // Apply the same momentum to all containers synchronously
  for (let index = 0; index < numberOfContainers.value; index++) {
    const container = scrollContainers.value[index];
    const containerSize =
      scrollDirection.value === "vertical"
        ? container?.scrollHeight || 0
        : container?.scrollWidth || 0;

    if (!container || containerSize === 0) continue;

    // Determine direction for each container (same logic as manual scroll)
    const isEvenContainer = index % 2 === 0;
    const baseDirection = momentumDirection.value === "forward" ? -1 : 1;
    const actualDirection = isEvenContainer ? baseDirection : -baseDirection;

    // Apply momentum to position
    scrollPositions.value[index] += globalMomentum.value * actualDirection;

    // Handle wrapping
    const containerBoundary = containerSize / 3;
    if (actualDirection < 0) {
      if (scrollPositions.value[index] <= -containerBoundary) {
        scrollPositions.value[index] = 0;
      }
    } else {
      if (scrollPositions.value[index] >= 0) {
        scrollPositions.value[index] = -containerBoundary;
      }
    }

    // Apply position immediately with correct transform
    if (scrollDirection.value === "vertical") {
      container.style.transform = `translateY(${scrollPositions.value[index]}px)`;
    } else {
      container.style.transform = `translateX(${scrollPositions.value[index]}px)`;
    }
  }

  // Gradually reduce momentum (smooth deceleration)
  globalMomentum.value *= 0.94; // Adjust this value to control deceleration rate

  // Continue animation
  momentumAnimationId.value = requestAnimationFrame(animateMomentum);
};

// Seamless infinite scroll animation
const animate = () => {
  if (!autoplay.value || isPaused.value || !isInitialized.value) {
    // Stop animation if conditions not met
    console.log(
      `⏹️ Stopping animation: autoplay=${autoplay.value}, paused=${isPaused.value}, initialized=${isInitialized.value}`
    );
    stopAnimation();
    return;
  }

  const pixelsPerSecond = 50;
  const speedMultiplier = scrollSpeed.value / 10;
  const actualSpeed = (pixelsPerSecond * speedMultiplier) / 60;

  // Only animate visible containers that are properly loaded
  for (let index = 0; index < numberOfContainers.value; index++) {
    const container = scrollContainers.value[index];
    if (!container) {
      continue;
    }

    // Check container size based on scroll direction
    const containerSize =
      scrollDirection.value === "vertical"
        ? container.scrollHeight
        : container.scrollWidth;

    // If container has no size, try to use fallback calculation
    if (containerSize === 0) {
      // Use fallback size calculation for animation
      const cardSize =
        scrollDirection.value === "vertical"
          ? numberOfContainers.value >= 4
            ? 224
            : numberOfContainers.value === 3
            ? 256
            : 288 // height
          : numberOfContainers.value >= 4
          ? 256
          : numberOfContainers.value === 3
          ? 288
          : 320; // width
      const gap = 24;
      const cardsPerSet = 8;
      const fallbackSize = (cardSize + gap) * cardsPerSet * 3;

      // Use fallback size for animation calculations
      const isEvenContainer = index % 2 === 0;
      const baseDirection = autoplayDirection.value === "forward" ? -1 : 1;
      const direction = isEvenContainer ? baseDirection : -baseDirection;

      scrollPositions.value[index] += actualSpeed * direction;

      const containerBoundary = fallbackSize / 3;

      if (direction < 0) {
        if (scrollPositions.value[index] <= -containerBoundary) {
          scrollPositions.value[index] = 0;
        }
      } else {
        if (scrollPositions.value[index] >= 0) {
          scrollPositions.value[index] = -containerBoundary;
        }
      }

      // Apply correct transform based on scroll direction
      if (scrollDirection.value === "vertical") {
        container.style.transform = `translateY(${scrollPositions.value[index]}px)`;
      } else {
        container.style.transform = `translateX(${scrollPositions.value[index]}px)`;
      }
      continue;
    }

    // Alternate direction for each container
    const isEvenContainer = index % 2 === 0;
    const baseDirection = autoplayDirection.value === "forward" ? -1 : 1;
    const direction = isEvenContainer ? baseDirection : -baseDirection;

    scrollPositions.value[index] += actualSpeed * direction;

    // Get container boundary to calculate when to reset
    const containerBoundary = containerSize / 3;

    if (direction < 0) {
      if (scrollPositions.value[index] <= -containerBoundary) {
        scrollPositions.value[index] = 0;
      }
    } else {
      if (scrollPositions.value[index] >= 0) {
        scrollPositions.value[index] = -containerBoundary;
      }
    }

    // Apply correct transform based on scroll direction
    if (scrollDirection.value === "vertical") {
      container.style.transform = `translateY(${scrollPositions.value[index]}px)`;
    } else {
      container.style.transform = `translateX(${scrollPositions.value[index]}px)`;
    }
  }

  animationId.value = requestAnimationFrame(animate);
};

// Complete system reset and initialization
const resetScrollSystem = async () => {
  console.log(
    `🔄 Resetting scroll system for ${numberOfContainers.value} containers`
  );

  // Stop current animation
  stopAnimation();

  // Mark as not initialized
  isInitialized.value = false;

  // Clear all container references and positions
  scrollContainers.value = Array(MAX_CONTAINERS).fill(null);
  scrollPositions.value = Array(MAX_CONTAINERS).fill(0);

  console.log(`🚫 Cleared all container data`);

  // Wait for DOM updates
  await nextTick();

  // Wait for containers to be re-registered and content loaded
  const waitForAllContainers = (attempts = 0) => {
    if (attempts > 150) {
      // Max 15 seconds
      console.warn(
        `⚠️ Some containers failed to load after 15 seconds, proceeding anyway`
      );
      isInitialized.value = true;
      if (autoplay.value) {
        startAnimation();
      }
      return;
    }

    // Check if all visible containers are loaded with images
    let allLoaded = true;
    for (let i = 0; i < numberOfContainers.value; i++) {
      const container = scrollContainers.value[i];
      if (!container) {
        allLoaded = false;
        break;
      }

      // Check if container has images and they're loaded
      const images = container.querySelectorAll("img");
      if (images.length === 0) {
        allLoaded = false;
        break;
      }

      let containerImagesLoaded = true;
      images.forEach((img) => {
        if (!img.complete || img.naturalHeight === 0) {
          containerImagesLoaded = false;
        }
      });

      const containerSize =
        scrollDirection.value === "vertical"
          ? container.scrollHeight
          : container.scrollWidth;

      if (!containerImagesLoaded || containerSize === 0) {
        allLoaded = false;
        break;
      }
    }

    if (allLoaded) {
      isInitialized.value = true;
      if (autoplay.value) {
        startAnimation();
      }
      console.log(
        `✅ All ${numberOfContainers.value} containers loaded and ready`
      );
    } else {
      // Wait 100ms and check again
      setTimeout(() => waitForAllContainers(attempts + 1), 100);
    }
  };

  // Start waiting for all containers
  setTimeout(() => waitForAllContainers(), 300);
};

// Simple watcher for layer changes
watch(numberOfContainers, async (newValue, oldValue) => {
  console.log(`🔄 Container count changed: ${oldValue} → ${newValue}`);

  // Stop animation
  stopAnimation();

  // Clear all container references and positions
  scrollContainers.value = Array(MAX_CONTAINERS).fill(null);
  scrollPositions.value = Array(MAX_CONTAINERS).fill(0);

  // Stop and clear momentum
  stopMomentum();

  // Reset initialization state
  isInitialized.value = false;

  // Wait for DOM update
  await nextTick();

  console.log(`🔄 Waiting for ${newValue} containers to register...`);

  // Give containers time to register and check readiness
  setTimeout(() => {
    console.log(`🔍 Checking if all ${newValue} containers are ready...`);
    checkIfAllReady();
  }, 500);
});

// Watcher for scroll direction changes
watch(scrollDirection, async (newValue, oldValue) => {
  console.log(`🔄 Scroll direction changed: ${oldValue} → ${newValue}`);

  // Stop animation
  stopAnimation();

  // Clear all container references and positions
  scrollContainers.value = Array(MAX_CONTAINERS).fill(null);
  scrollPositions.value = Array(MAX_CONTAINERS).fill(0);

  // Stop and clear momentum
  stopMomentum();

  // Reset initialization state
  isInitialized.value = false;

  // Wait for DOM update
  await nextTick();

  console.log(
    `🔄 Waiting for containers to register with ${newValue} direction...`
  );

  // Give containers time to register and check readiness
  setTimeout(() => {
    console.log(
      `🔍 Checking if all containers are ready for ${newValue} scrolling...`
    );
    checkIfAllReady();
  }, 500);

  // Fallback check in case containers take longer
  setTimeout(() => {
    if (!isInitialized.value) {
      console.log(`⚠️ Fallback: Force checking readiness after 2 seconds`);
      checkIfAllReady();
    }
  }, 2000);
});

watch(autoplayDirection, async () => {
  console.log(`🔄 Autoplay direction changed: ${autoplayDirection.value}`);
  await resetScrollSystem();
});

// Watch for autoplay changes to ensure animation restarts properly
watch(autoplay, (newValue) => {
  console.log(`🔄 Autoplay changed: ${newValue}`);
  if (newValue) {
    // Start animation when autoplay is enabled
    startAnimation();
  } else {
    // Stop animation when autoplay is disabled
    stopAnimation();
  }
});

// Watch for spacing changes to ensure proper layout
watch(layerSpacing, async (newValue, oldValue) => {
  console.log(`🔄 Layer spacing changed: ${oldValue}rem → ${newValue}rem`);
  await nextTick();
  // No need to force re-render, Vue's reactivity will handle it
});

// Watch for speed changes to ensure they take effect immediately
watch(scrollSpeed, (newValue) => {
  console.log(`🔄 Scroll speed changed: ${newValue}`);
});

// Watch for pause on hover changes
watch(pauseOnHover, (newValue) => {
  console.log(`🔄 Pause on hover changed: ${newValue}`);
  // Reset pause state when this setting changes
  if (!newValue) {
    isPaused.value = false;
  }
});

// Watch for pause state changes to restart animation
watch(isPaused, (newValue, oldValue) => {
  console.log(`🔄 Pause state changed: ${oldValue} → ${newValue}`);
  if (
    !newValue &&
    autoplay.value &&
    isInitialized.value &&
    !animationId.value
  ) {
    console.log(`🔄 Restarting animation after unpause`);
    startAnimation();
  }
});

// Watch for tilt changes - simplified
watch([tiltDegree, tiltDirection], () => {
  console.log(`🔄 Tilt changed: ${tiltDegree.value}° ${tiltDirection.value}`);
  // Tilt changes don't need to reset the scroll system, just update styles
});

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    if (isModalOpen.value) {
      closeModal();
    } else if (showControls.value) {
      showControls.value = false;
    }
  }
};

onMounted(async () => {
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("wheel", handleWheel, { passive: false });

  // Add touch event listeners for mobile support
  window.addEventListener("touchstart", handleTouchStart, { passive: false });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd, { passive: false });

  // Add click outside to close controls
  document.addEventListener("click", handleDocumentClick);

  await nextTick();

  // Use the proper initialization system instead of forcing it
  console.log(
    `🚀 Application mounted, waiting for containers to initialize...`
  );

  // Simple initialization - just wait for containers to register
  console.log(`🚀 Application mounted, containers will auto-initialize...`);

  // Expose debug function for development
  if (typeof window !== "undefined") {
    (window as any).debugGalleryState = debugSystemState;
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("wheel", handleWheel);

  // Remove touch event listeners
  window.removeEventListener("touchstart", handleTouchStart);
  window.removeEventListener("touchmove", handleTouchMove);
  window.removeEventListener("touchend", handleTouchEnd);

  // Remove click outside listener
  document.removeEventListener("click", handleDocumentClick);

  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }
});
</script>

<template>
  <div
    class="max-h-dvh h-dvh relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900"
  >
    <!-- Header - Transparent overlay that content can go under -->
    <header
      class="absolute top-0 left-0 right-0 z-50 p-6 text-center bg-gradient-to-b from-black/60 via-black/30 to-transparent backdrop-blur-sm"
    >
      <h1
        class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent drop-shadow-lg"
      >
        Infinite Gallery
      </h1>
      <p class="mt-4 text-gray-300 text-lg drop-shadow-md">
        Immersive scrolling experience with customizable effects
      </p>
    </header>

    <!-- Control Toggle Button -->
    <button
      @click="toggleControls"
      data-controls
      class="fixed bottom-6 left-6 z-50 p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg min-w-[56px] min-h-[56px] flex items-center justify-center"
      :class="{ 'bg-blue-600/80 hover:bg-blue-600': showControls }"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
        />
      </svg>
    </button>

    <!-- Control Panel -->
    <div
      class="control-panel fixed bottom-20 left-6 z-99 p-3 rounded-lg shadow-2xl w-72 max-w-[calc(100vw-2rem)] transition-all duration-300 transform bg-black/85 backdrop-blur-md border border-white/20"
      :class="{
        'translate-y-0 opacity-100': showControls,
        'translate-y-full opacity-0 pointer-events-none': !showControls,
      }"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-white font-medium text-sm">Controls</h3>
        <button
          @click="toggleControls"
          class="text-gray-400 hover:text-white transition-colors p-2 -m-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="space-y-3">
        <!-- Number of Containers -->
        <div>
          <label class="block text-xs text-gray-300 mb-1"
            >Scroll Layers: {{ numberOfContainers }}</label
          >
          <input
            v-model.number="numberOfContainers"
            type="range"
            min="1"
            max="5"
            class="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div class="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>1</span>
            <span>5</span>
          </div>
        </div>

        <!-- Scroll Direction -->
        <div>
          <label class="block text-xs text-gray-300 mb-1"
            >Scroll Direction</label
          >
          <select
            v-model="scrollDirection"
            class="w-full p-1.5 bg-gray-700 border border-gray-600 rounded text-white text-xs"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>

        <!-- NEW: Spacing Between Layers -->
        <div>
          <label class="block text-xs text-gray-300 mb-1"
            >Layer Spacing: {{ layerSpacing }}rem</label
          >
          <input
            v-model.number="layerSpacing"
            type="range"
            min="0"
            max="40"
            step="0.1"
            class="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div class="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>0</span>
            <span>40</span>
          </div>
        </div>

        <!-- Tilt Degree -->
        <div>
          <label class="block text-xs text-gray-300 mb-1"
            >Tilt Angle: {{ tiltDegree }}°</label
          >
          <input
            v-model.number="tiltDegree"
            type="range"
            min="0"
            max="45"
            class="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div class="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>0°</span>
            <span>45°</span>
          </div>
        </div>

        <!-- Tilt Direction -->
        <div>
          <label class="block text-xs text-gray-300 mb-1">Tilt Direction</label>
          <select
            v-model="tiltDirection"
            class="w-full p-1.5 bg-gray-700 text-white rounded border border-gray-600 text-xs"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <!-- Autoplay -->
        <div>
          <label class="flex items-center cursor-pointer">
            <input v-model="autoplay" type="checkbox" class="mr-2 scale-75" />
            <span class="text-xs text-gray-300">Autoplay</span>
          </label>
          <div
            v-if="!autoplay"
            class="mt-1 p-1.5 bg-blue-900/20 rounded border border-blue-700/30"
          >
            <p class="text-xs text-blue-300">
              💡 Manual scroll: Use wheel/trackpad
            </p>
          </div>
          <div
            v-if="!isInitialized"
            class="mt-1 p-1.5 bg-yellow-900/20 rounded border border-yellow-700/30"
          >
            <p class="text-xs text-yellow-300">⏳ Loading...</p>
          </div>
        </div>

        <!-- Autoplay Direction -->
        <div v-if="autoplay">
          <label class="block text-xs text-gray-300 mb-1">Direction</label>
          <select
            v-model="autoplayDirection"
            class="w-full p-1.5 bg-gray-700 text-white rounded border border-gray-600 text-xs"
          >
            <option value="forward">Forward</option>
            <option value="reverse">Reverse</option>
          </select>
        </div>

        <!-- Pause on Hover -->
        <div>
          <label class="flex items-center cursor-pointer">
            <input
              v-model="pauseOnHover"
              type="checkbox"
              class="mr-2 scale-75"
            />
            <span class="text-xs text-gray-300">Pause on Hover</span>
          </label>
        </div>

        <!-- Speed -->
        <div>
          <label class="block text-xs text-gray-300 mb-1"
            >Speed: {{ scrollSpeed }}</label
          >
          <input
            v-model.number="scrollSpeed"
            type="range"
            min="5"
            max="50"
            class="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div class="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Gallery Container - Maximum page fill, content can go under header -->
    <div
      class="w-full h-dvh transition-all duration-500 ease-out"
      :class="
        scrollDirection === 'vertical' ? 'flex flex-row' : 'flex flex-col'
      "
    >
      <!-- Multiple Scrolling Gallery Containers -->
      <div
        v-for="containerIndex in visibleContainerIndices"
        :key="`container-${containerIndex}`"
        class="transition-all duration-500 ease-out will-change-transform flex-shrink-0"
        :class="containerLayoutClasses"
        :style="{
          ...containerTiltStyle,
          ...(scrollDirection === 'vertical'
            ? {
                width: `${containerWidth}vw`,
                marginRight: `${layerSpacing}rem`,
              }
            : {
                height: `${containerHeight}dvh`,
                marginBottom: `${layerSpacing}rem`,
              }),
          zIndex: MAX_CONTAINERS - containerIndex + 1,
        }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div
          :ref="el => registerContainer(el as HTMLElement, containerIndex)"
          :class="cardContainerLayoutClasses"
        >
          <div
            v-for="(image, imageIndex) in getImagesForContainer(
              containerIndex - 1
            )"
            :key="`${containerIndex}-${image.id}-${imageIndex}`"
            class="image-card relative group cursor-pointer rounded-lg overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 flex-shrink-0"
            :class="cardSizeClasses"
            @click="openModal(image)"
            v-motion
            :initial="{ opacity: 0, y: 50 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { delay: (imageIndex % 8) * 50 },
            }"
            :hover="{ scale: 1.05 }"
          >
            <img
              :src="image.url"
              :alt="image.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div class="absolute bottom-4 left-4 right-4">
                <h3 class="text-white font-semibold text-lg">
                  {{ image.title }}
                </h3>
                <p class="text-gray-300 text-sm mt-1 line-clamp-2">
                  {{ image.description }}
                </p>
              </div>
            </div>

            <!-- Container indicator -->
            <!-- <div
              class="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded"
            >
              Layer {{ containerIndex }}
            </div> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Background Effects -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20 pointer-events-none z-0"
    ></div>

    <!-- Modal -->
    <ImageModal
      v-if="isModalOpen && selectedImage"
      :image="selectedImage"
      @close="closeModal"
    />
  </div>
</template>
