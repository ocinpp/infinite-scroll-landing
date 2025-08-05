<script setup lang="ts">
import InfiniteScrollGallery from "./components/InfiniteScrollGallery.vue";
import imageData from "./data/images.json";
import type { ImageItem } from "./types/images";

// Load images from external JSON file for easy maintenance
const allImages: ImageItem[] = (imageData as any).images;
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900"
  >
    <InfiniteScrollGallery :images="allImages" />
  </div>
</template>
