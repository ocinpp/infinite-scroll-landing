<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";

interface ImageItem {
  id: number;
  url: string;
  title: string;
  description: string;
}

interface Props {
  image: ImageItem;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const modalRef = ref<HTMLElement>();
const isVisible = ref(false);
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

const handleClickOutside = (event: MouseEvent) => {
  if (modalRef.value && !modalRef.value.contains(event.target as Node)) {
    close();
  }
};

const close = () => {
  isVisible.value = false;
  setTimeout(() => {
    emit("close");
  }, 300);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    close();
  }
};

onMounted(async () => {
  checkMobile();
  window.addEventListener("resize", checkMobile);

  // Prevent body scroll when modal is open
  document.body.style.overflow = "hidden";

  // Wait for next tick to ensure DOM is ready
  await nextTick();

  // Add event listeners after a small delay
  setTimeout(() => {
    window.addEventListener("click", handleClickOutside);
    window.addEventListener("keydown", handleKeydown);
  }, 100);

  // Trigger animation after a small delay
  setTimeout(() => {
    isVisible.value = true;
  }, 50);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  window.removeEventListener("click", handleClickOutside);
  window.removeEventListener("keydown", handleKeydown);

  // Restore body scroll
  document.body.style.overflow = "auto";
});
</script>

<template>
  <div
    class="modal-overlay fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
    :class="{
      'opacity-100 backdrop-blur-md': isVisible,
      'opacity-0': !isVisible,
    }"
  >
    <!-- Desktop Modal - Slide from right (30% width) -->
    <div
      v-if="!isMobile"
      ref="modalRef"
      class="modal-content fixed right-0 top-0 h-full w-[30%] min-w-[400px] max-w-[500px] p-6 transform transition-all duration-500 ease-out overflow-y-auto"
      :class="{ 'translate-x-0': isVisible, 'translate-x-full': !isVisible }"
    >
      <button
        @click="close"
        class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 p-2 rounded-full hover:bg-gray-700/50"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div class="space-y-6 pt-4">
        <img
          :src="image.url"
          :alt="image.title"
          class="w-full h-64 object-cover rounded-lg shadow-lg"
        />

        <div>
          <h2 class="text-2xl font-bold text-white mb-3">{{ image.title }}</h2>
          <p class="text-gray-300 leading-relaxed text-sm">
            {{ image.description }}
          </p>
        </div>

        <div class="space-y-4">
          <div class="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <h3 class="text-lg font-semibold text-white mb-3">Image Details</h3>
            <div class="space-y-2 text-sm text-gray-300">
              <div class="flex justify-between">
                <span>ID:</span>
                <span class="text-white">{{ image.id }}</span>
              </div>
              <div class="flex justify-between">
                <span>Format:</span>
                <span class="text-white">JPEG</span>
              </div>
              <div class="flex justify-between">
                <span>Quality:</span>
                <span class="text-white">High Resolution</span>
              </div>
              <div class="flex justify-between">
                <span>Size:</span>
                <span class="text-white">400x600px</span>
              </div>
            </div>
          </div>

          <div class="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <h3 class="text-lg font-semibold text-blue-300 mb-2">
              Photography Tips
            </h3>
            <p class="text-sm text-gray-300">
              This type of composition works best during golden hour. Consider
              using a polarizing filter to enhance contrast and reduce
              reflections.
            </p>
          </div>

          <div class="flex gap-3">
            <button
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Download HD
            </button>
            <button
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Share
            </button>
          </div>

          <div class="flex gap-2">
            <button
              class="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-300 py-2 px-3 rounded-lg transition-colors text-sm border border-green-600/30"
            >
              Add to Collection
            </button>
            <button
              class="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 py-2 px-3 rounded-lg transition-colors text-sm border border-purple-600/30"
            >
              Set as Wallpaper
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Modal - Slide from bottom (70% height) -->
    <div
      v-else
      ref="modalRef"
      class="modal-content fixed bottom-0 left-0 right-0 h-[70%] p-6 transform transition-all duration-500 ease-out overflow-y-auto rounded-t-2xl"
      :class="{ 'translate-y-0': isVisible, 'translate-y-full': !isVisible }"
    >
      <div class="w-12 h-1 bg-gray-500 rounded-full mx-auto mb-4"></div>

      <button
        @click="close"
        class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 p-2 rounded-full hover:bg-gray-700/50"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div class="space-y-4">
        <img
          :src="image.url"
          :alt="image.title"
          class="w-full h-48 object-cover rounded-lg shadow-lg"
        />

        <div>
          <h2 class="text-xl font-bold text-white mb-2">{{ image.title }}</h2>
          <p class="text-gray-300 leading-relaxed text-sm">
            {{ image.description }}
          </p>
        </div>

        <div class="space-y-3">
          <div class="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <h3 class="text-lg font-semibold text-white mb-2">Image Details</h3>
            <div class="grid grid-cols-2 gap-2 text-sm text-gray-300">
              <div>
                ID: <span class="text-white">{{ image.id }}</span>
              </div>
              <div>Format: <span class="text-white">JPEG</span></div>
              <div>Quality: <span class="text-white">High Res</span></div>
              <div>Size: <span class="text-white">400x600px</span></div>
            </div>
          </div>

          <div class="flex gap-3">
            <button
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Download
            </button>
            <button
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Share
            </button>
          </div>

          <div class="flex gap-2">
            <button
              class="flex-1 bg-green-600/20 text-green-300 py-2 px-3 rounded-lg text-sm border border-green-600/30"
            >
              Save
            </button>
            <button
              class="flex-1 bg-purple-600/20 text-purple-300 py-2 px-3 rounded-lg text-sm border border-purple-600/30"
            >
              Wallpaper
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
