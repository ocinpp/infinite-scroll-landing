<script setup lang="ts">
import InfiniteScrollGallery, {
  type GalleryConfig,
} from "./components/InfiniteScrollGallery.vue";
import imageData from "./data/images.json";
import type { ImageItem } from "./types/images";

// Load images from external JSON file for easy maintenance
const allImages: ImageItem[] = (imageData as any).images;

// Optional: Customize default settings
const customConfig: GalleryConfig = {
  // scrollDirection: 'vertical',
  // autoplay: false,
  // numberOfContainers: 5,
  // scrollSpeed: 30,
  // tiltDegree: 25
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900"
  >
    <!-- Basic usage with default settings -->
    <InfiniteScrollGallery :images="allImages" :config="customConfig" />

    <!-- Advanced usage with custom config -->
    <!-- <InfiniteScrollGallery :images="allImages" :config="customConfig" /> -->
  </div>
</template>
