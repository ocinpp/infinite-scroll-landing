<script setup lang="ts">
import InfiniteScrollGallery, {
  type GalleryConfig,
} from "./components/InfiniteScrollGallery.vue";
import imageData from "./data/images.json";
import type { ImageItem } from "./types/images";

// Load images from external JSON file for easy maintenance
const allImages: ImageItem[] = (imageData as any).images;

// Gallery configuration with images and settings
const galleryConfig: GalleryConfig = {
  images: allImages,
  // Optional: Customize settings
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
    <!-- Gallery with configuration -->
    <InfiniteScrollGallery :config="galleryConfig" />

    <!-- Advanced usage with custom config -->
    <!-- <InfiniteScrollGallery :config="{ images: allImages, scrollDirection: 'vertical', autoplay: false }" /> -->
  </div>
</template>
