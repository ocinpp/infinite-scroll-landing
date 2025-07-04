<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import ImageModal from "./ImageModal.vue";

interface ImageItem {
  id: number;
  url: string;
  title: string;
  description: string;
}

// Sample images from Pexels with working URLs
const images: ImageItem[] = [
  {
    id: 1,
    url: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Mountain Landscape",
    description:
      "Breathtaking mountain views with perfect lighting and stunning natural beauty that captures the essence of wilderness.",
  },
  {
    id: 2,
    url: "https://images.pexels.com/photos/1029604/pexels-photo-1029604.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Ocean Waves",
    description:
      "Powerful waves crashing against the shore with incredible force and mesmerizing patterns of foam and water.",
  },
  {
    id: 3,
    url: "https://images.pexels.com/photos/147411/italy-mountains-dawn-daybreak-147411.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Forest Path",
    description:
      "Mysterious forest path leading into the unknown depths of nature, surrounded by ancient trees and dappled sunlight.",
  },
  {
    id: 4,
    url: "https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "City Lights",
    description:
      "Urban nightscape with vibrant city lights creating a spectacular display of modern civilization and energy.",
  },
  {
    id: 5,
    url: "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Desert Dunes",
    description:
      "Golden sand dunes stretching to the horizon under an endless sky, showcasing the raw beauty of desert landscapes.",
  },
  {
    id: 6,
    url: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Arctic Ice",
    description:
      "Pristine arctic landscape with crystalline ice formations that reflect the pure essence of untouched wilderness.",
  },
  {
    id: 7,
    url: "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Sunset Beach",
    description:
      "Beautiful sunset over calm waters with warm colors painting the sky in magnificent hues of orange and pink.",
  },
  {
    id: 8,
    url: "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Urban Architecture",
    description:
      "Modern architectural masterpiece showcasing innovative design and the perfect blend of form and function.",
  },
];

// Additional images for variety in different containers
const additionalImages: ImageItem[] = [
  {
    id: 9,
    url: "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Tropical Paradise",
    description:
      "Crystal clear waters and pristine beaches that define the perfect tropical getaway destination.",
  },
  {
    id: 10,
    url: "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Urban Skyline",
    description:
      "Magnificent city skyline showcasing modern architecture and urban development at its finest.",
  },
  {
    id: 11,
    url: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Autumn Forest",
    description:
      "Golden autumn leaves creating a magical carpet through the peaceful forest pathway.",
  },
  {
    id: 12,
    url: "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Starry Night",
    description:
      "Breathtaking night sky filled with countless stars over a serene landscape.",
  },
];

// Reactive state
const tiltDegree = ref(15);
const tiltDirection = ref<"left" | "right">("right");
const autoplay = ref(true);
const autoplayDirection = ref<"forward" | "reverse">("forward");
const pauseOnHover = ref(true);
const scrollSpeed = ref(20);
const numberOfContainers = ref(3);
const layerSpacing = ref(1); // NEW: Spacing between layers in rem
const selectedImage = ref<ImageItem | null>(null);
const isModalOpen = ref(false);
const isPaused = ref(false);
const showControls = ref(false);
const isManualScrolling = ref(false);

// Fixed number of containers - always create 5, show/hide based on numberOfContainers
const MAX_CONTAINERS = 5;
const scrollContainers = ref<HTMLElement[]>(Array(MAX_CONTAINERS).fill(null));
const animationId = ref<number>();
const scrollPositions = ref<number[]>(Array(MAX_CONTAINERS).fill(0));

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

// Stable card sizing based on number of containers
const cardSizeClasses = computed(() => {
  if (numberOfContainers.value >= 4) {
    return "w-64 h-72";
  } else if (numberOfContainers.value === 3) {
    return "w-72 h-80";
  } else {
    return "w-80 h-96";
  }
});

// Calculate container height to fill the page maximally, accounting for spacing
const containerHeight = computed(() => {
  // Calculate total spacing needed between containers
  const totalSpacingRem = (numberOfContainers.value - 1) * layerSpacing.value;

  // Convert rem to vh (approximate conversion: 1rem ≈ 16px, 100vh ≈ viewport height)
  // Using a more conservative conversion factor
  const totalSpacingVh = totalSpacingRem * 1.5; // Slightly more conservative conversion

  // Available height after accounting for spacing
  const availableHeight = Math.max(100 - totalSpacingVh, 50); // Minimum 50vh available

  // Base height per container
  const baseHeight = availableHeight / numberOfContainers.value;

  // Add extra height based on tilt to ensure full coverage (reduced bonus)
  const tiltBonus = Math.abs(tiltDegree.value) * 0.3; // Reduced from 0.5 to 0.3

  return Math.max(baseHeight + tiltBonus, 10); // Minimum 10dvh per container
});

// Create different image sets for each container
const getImagesForContainer = (containerIndex: number) => {
  const allImages = [...images, ...additionalImages];
  const startIndex = (containerIndex * 4) % allImages.length;
  const containerImages = [];

  for (let i = 0; i < 8; i++) {
    containerImages.push(allImages[(startIndex + i) % allImages.length]);
  }

  // Triple for seamless scrolling
  return [...containerImages, ...containerImages, ...containerImages];
};

// Container registration function
const registerContainer = (el: HTMLElement | null, index: number) => {
  if (el && index >= 0 && index < MAX_CONTAINERS) {
    scrollContainers.value[index] = el;
    console.log(`✅ Container ${index} registered`);
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

// Manual scroll functionality
const manualScroll = (
  direction: "forward" | "reverse",
  scrollIntensity: number = 1
) => {
  if (!autoplay.value && !isModalOpen.value) {
    const baseScrollAmount = 60; // Reduced base amount for smoother movement
    const scrollAmount = baseScrollAmount * scrollIntensity; // Allow variable intensity

    // Only animate visible containers
    for (let index = 0; index < numberOfContainers.value; index++) {
      const container = scrollContainers.value[index];
      if (!container) continue;

      // Determine scroll direction based on user input and container alternation
      const isEvenContainer = index % 2 === 0;
      const baseDirection = direction === "forward" ? -1 : 1;
      const actualDirection = isEvenContainer ? baseDirection : -baseDirection;

      scrollPositions.value[index] += scrollAmount * actualDirection;

      // Get container width to calculate when to reset
      const containerWidth = container.scrollWidth / 3;

      if (actualDirection < 0) {
        if (scrollPositions.value[index] <= -containerWidth) {
          scrollPositions.value[index] = 0;
        }
      } else {
        if (scrollPositions.value[index] >= 0) {
          scrollPositions.value[index] = -containerWidth;
        }
      }

      // Add smooth transition for manual scrolling with better easing
      container.style.transition =
        "transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      container.style.transform = `translateX(${scrollPositions.value[index]}px)`;

      // Remove transition after animation to avoid interfering with other movements
      setTimeout(() => {
        container.style.transition = "";
      }, 150);
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

// Seamless infinite scroll animation
const animate = () => {
  if (!autoplay.value || isPaused.value) {
    animationId.value = requestAnimationFrame(animate);
    return;
  }

  const pixelsPerSecond = 50;
  const speedMultiplier = scrollSpeed.value / 10;
  const actualSpeed = (pixelsPerSecond * speedMultiplier) / 60;

  // Only animate visible containers
  for (let index = 0; index < numberOfContainers.value; index++) {
    const container = scrollContainers.value[index];
    if (!container) continue;

    // Alternate direction for each container
    const isEvenContainer = index % 2 === 0;
    const baseDirection = autoplayDirection.value === "forward" ? -1 : 1;
    const direction = isEvenContainer ? baseDirection : -baseDirection;

    scrollPositions.value[index] += actualSpeed * direction;

    // Get container width to calculate when to reset
    const containerWidth = container.scrollWidth / 3;

    if (direction < 0) {
      if (scrollPositions.value[index] <= -containerWidth) {
        scrollPositions.value[index] = 0;
      }
    } else {
      if (scrollPositions.value[index] >= 0) {
        scrollPositions.value[index] = -containerWidth;
      }
    }

    container.style.transform = `translateX(${scrollPositions.value[index]}px)`;
  }

  animationId.value = requestAnimationFrame(animate);
};

// Initialize scroll positions
const initializeScrollPositions = async () => {
  console.log(`🚀 Initializing ${numberOfContainers.value} containers`);

  await nextTick();

  for (let index = 0; index < numberOfContainers.value; index++) {
    const container = scrollContainers.value[index];
    if (!container) {
      console.log(`⚠️ Container ${index} not found`);
      continue;
    }

    const isEvenContainer = index % 2 === 0;
    const shouldReverse = autoplayDirection.value === "reverse";

    let initialPosition = 0;
    if (
      (isEvenContainer && shouldReverse) ||
      (!isEvenContainer && !shouldReverse)
    ) {
      initialPosition = -container.scrollWidth / 3;
    }

    scrollPositions.value[index] = initialPosition;
    container.style.transform = `translateX(${initialPosition}px)`;
    console.log(`✅ Container ${index} initialized at ${initialPosition}px`);
  }

  console.log(`🎉 Initialization complete`);
};

// Watch for changes
watch(numberOfContainers, async () => {
  await nextTick();
  initializeScrollPositions();
});

watch(autoplayDirection, () => {
  initializeScrollPositions();
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

  await nextTick();

  setTimeout(() => {
    initializeScrollPositions();
  }, 100);

  animate();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("wheel", handleWheel);
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }
});
</script>

<template>
  <div
    class="min-h-[100dvh] relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900"
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
      class="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
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
      class="control-panel fixed bottom-20 left-6 z-99 p-4 rounded-lg shadow-2xl w-80 max-w-[calc(100vw-2rem)] transition-all duration-300 transform"
      :class="{
        'translate-y-0 opacity-100': showControls,
        'translate-y-full opacity-0 pointer-events-none': !showControls,
      }"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-white font-semibold">Controls</h3>
        <button
          @click="toggleControls"
          class="text-gray-400 hover:text-white transition-colors p-1"
        >
          <svg
            class="w-5 h-5"
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

      <div class="space-y-4">
        <!-- Number of Containers -->
        <div>
          <label class="block text-sm text-gray-300 mb-2"
            >Scroll Layers: {{ numberOfContainers }}</label
          >
          <input
            v-model="numberOfContainers"
            type="range"
            min="1"
            max="5"
            class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>1</span>
            <span>5</span>
          </div>
        </div>

        <!-- NEW: Spacing Between Layers -->
        <div>
          <label class="block text-sm text-gray-300 mb-2"
            >Spacing Between Layers: {{ layerSpacing }}rem</label
          >
          <input
            v-model="layerSpacing"
            type="range"
            min="0"
            max="5"
            step="0.1"
            class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>0rem (Overlap)</span>
            <span>5rem (Wide)</span>
          </div>
        </div>

        <!-- Tilt Degree -->
        <div>
          <label class="block text-sm text-gray-300 mb-2"
            >Tilt Degree: {{ tiltDegree }}°</label
          >
          <input
            v-model="tiltDegree"
            type="range"
            min="0"
            max="45"
            class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        <!-- Tilt Direction -->
        <div>
          <label class="block text-sm text-gray-300 mb-2">Tilt Direction</label>
          <select
            v-model="tiltDirection"
            class="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <!-- Autoplay -->
        <div>
          <label class="flex items-center cursor-pointer">
            <input v-model="autoplay" type="checkbox" class="mr-2" />
            <span class="text-sm text-gray-300">Autoplay</span>
          </label>
          <div
            v-if="!autoplay"
            class="mt-2 p-2 bg-blue-900/20 rounded border border-blue-700/30"
          >
            <p class="text-xs text-blue-300">
              💡 Smooth manual scroll enabled: Use mouse wheel or trackpad to
              control movement
            </p>
          </div>
        </div>

        <!-- Autoplay Direction -->
        <div v-if="autoplay">
          <label class="block text-sm text-gray-300 mb-2">Direction</label>
          <select
            v-model="autoplayDirection"
            class="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            <option value="forward">Forward</option>
            <option value="reverse">Reverse</option>
          </select>
        </div>

        <!-- Pause on Hover -->
        <div>
          <label class="flex items-center cursor-pointer">
            <input v-model="pauseOnHover" type="checkbox" class="mr-2" />
            <span class="text-sm text-gray-300">Pause on Hover</span>
          </label>
        </div>

        <!-- Speed -->
        <div>
          <label class="block text-sm text-gray-300 mb-2"
            >Speed: {{ scrollSpeed }}</label
          >
          <input
            v-model="scrollSpeed"
            type="range"
            min="5"
            max="50"
            class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <div class="flex justify-between text-xs text-gray-400 mt-1">
            <span>Slow</span>
            <span>Fast</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Gallery Container - Maximum page fill, content can go under header -->
    <div class="w-full h-[100dvh] flex flex-col">
      <!-- Multiple Scrolling Gallery Containers -->
      <div
        v-for="containerIndex in MAX_CONTAINERS"
        :key="containerIndex"
        v-show="containerIndex <= numberOfContainers"
        class="flex items-center transition-all duration-500 ease-out will-change-transform flex-shrink-0"
        :style="{
          ...containerTiltStyle,
          height: `${containerHeight}dvh`,
          marginBottom: `${layerSpacing}rem`,
          zIndex: MAX_CONTAINERS - containerIndex + 1,
        }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div
          :ref="el => registerContainer(el as HTMLElement, containerIndex - 1)"
          class="flex gap-6 will-change-transform"
        >
          <div
            v-for="(image, imageIndex) in getImagesForContainer(
              containerIndex - 1
            )"
            :key="`container-${containerIndex}-${image.id}-${Math.floor(
              imageIndex / 8
            )}-${imageIndex % 8}`"
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
            <div
              class="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded"
            >
              Layer {{ containerIndex }}
            </div>
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
