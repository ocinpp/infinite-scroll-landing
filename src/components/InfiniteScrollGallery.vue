<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
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

// Reactive state
const tiltDegree = ref(15);
const tiltDirection = ref<"left" | "right">("right");
const autoplay = ref(true);
const autoplayDirection = ref<"forward" | "reverse">("forward");
const pauseOnHover = ref(true);
const scrollSpeed = ref(20);
const selectedImage = ref<ImageItem | null>(null);
const isModalOpen = ref(false);
const isPaused = ref(false);
const showControls = ref(false);

// Infinite scroll state
const scrollContainer = ref<HTMLElement>();
const animationId = ref<number>();
const scrollPosition = ref(0);

// Computed properties - Apply tilt to the entire scrolling container
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

// Create enough duplicates for seamless scrolling - we need at least 3 sets
const duplicatedImages = computed(() => {
  return [...images, ...images, ...images];
});

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

// True seamless infinite scroll using CSS transforms
const animate = () => {
  if (!autoplay.value || isPaused.value || !scrollContainer.value) {
    animationId.value = requestAnimationFrame(animate);
    return;
  }

  // Calculate speed in pixels per frame (assuming 60fps)
  const pixelsPerSecond = 50; // Base speed
  const speedMultiplier = scrollSpeed.value / 10; // Higher value = faster speed
  const actualSpeed = (pixelsPerSecond * speedMultiplier) / 60; // Convert to per-frame

  const direction = autoplayDirection.value === "forward" ? -1 : 1;
  scrollPosition.value += actualSpeed * direction;

  // Get container width to calculate when to reset
  const containerWidth = scrollContainer.value.scrollWidth / 3; // Divide by 3 because we have 3 sets

  if (autoplayDirection.value === "forward") {
    // Moving left - when we've scrolled one full set, reset
    if (scrollPosition.value <= -containerWidth) {
      scrollPosition.value = 0;
    }
  } else {
    // Moving right - when we've scrolled back one full set, reset
    if (scrollPosition.value >= 0) {
      scrollPosition.value = -containerWidth;
    }
  }

  // Apply the transform
  scrollContainer.value.style.transform = `translateX(${scrollPosition.value}px)`;

  animationId.value = requestAnimationFrame(animate);
};

// Initialize scroll position for reverse direction
const initializeScrollPosition = async () => {
  await nextTick();
  if (scrollContainer.value && autoplayDirection.value === "reverse") {
    const containerWidth = scrollContainer.value.scrollWidth / 3;
    scrollPosition.value = -containerWidth;
  }
};

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

  // Initialize scroll position
  await initializeScrollPosition();

  // Start the animation loop
  animate();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  if (animationId.value) {
    cancelAnimationFrame(animationId.value);
  }
});
</script>

<template>
  <div class="min-h-screen relative overflow-hidden">
    <!-- Header -->
    <header class="relative z-10 p-6 text-center">
      <h1
        class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent"
      >
        Infinite Gallery
      </h1>
      <p class="mt-4 text-gray-400 text-lg">
        Immersive scrolling experience with customizable effects
      </p>
    </header>

    <!-- Control Toggle Button -->
    <button
      @click="toggleControls"
      class="fixed bottom-6 left-6 z-30 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 shadow-lg"
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
      class="control-panel fixed bottom-20 left-6 z-20 p-4 rounded-lg shadow-2xl w-80 max-w-[calc(100vw-2rem)] transition-all duration-300 transform"
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

    <!-- Scrolling Gallery Container with Tilt -->
    <div class="relative mt-12 h-[60vh] overflow-hidden flex items-center">
      <div
        class="gallery-wrapper w-full h-full flex items-center transition-transform duration-300"
        :style="containerTiltStyle"
      >
        <div
          ref="scrollContainer"
          class="flex gap-8 will-change-transform"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        >
          <div
            v-for="(image, index) in duplicatedImages"
            :key="`${image.id}-${Math.floor(index / images.length)}-${
              index % images.length
            }`"
            class="image-card relative group cursor-pointer rounded-lg overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 flex-shrink-0"
            @click="openModal(image)"
            v-motion
            :initial="{ opacity: 0, y: 50 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { delay: (index % images.length) * 100 },
            }"
            :hover="{ scale: 1.05 }"
          >
            <img
              :src="image.url"
              :alt="image.title"
              class="w-80 h-96 object-cover"
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
          </div>
        </div>
      </div>
    </div>

    <!-- Background Effects -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/50 pointer-events-none"
    ></div>

    <!-- Modal -->
    <ImageModal
      v-if="isModalOpen && selectedImage"
      :image="selectedImage"
      @close="closeModal"
    />
  </div>
</template>
