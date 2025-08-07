# Infinite Scroll Gallery

A sophisticated infinite scrolling image gallery built with Vue 3, TypeScript, and Vite. Features multiple synchronized layers, smooth animations, manual scroll controls, and comprehensive testing.

## ✨ Features

### 🎨 Visual Design
- **Multi-layer infinite scrolling** with alternating directions
- **Dual orientation support** - horizontal and vertical scrolling modes
- **Responsive card layouts** that adapt to layer count and scroll direction
- **Smooth animations** with configurable speed and direction
- **Modal image viewer** with navigation controls
- **Tilt effects** for visual depth (works in both orientations)
- **Customizable spacing** between layers
- **Intelligent image distribution** - all layers show complete image set in different orders

### 🎮 Interactive Controls
- **Scroll direction toggle** - switch between horizontal and vertical scrolling
- **Autoplay toggle** with forward/reverse direction
- **Manual scroll** with momentum-based deceleration
- **Hover to pause** functionality
- **Dynamic layer adjustment** (1-5 layers)
- **Speed control** (5-100 units)
- **Layer spacing control** (0-20rem)

### 🖱️ Manual Scrolling
- **Desktop**: Mouse wheel and trackpad support with immediate feedback
- **Mobile**: Touch swipe gestures with velocity detection
- **Momentum-based deceleration** for natural feel on all devices
- **Synchronized movement** across all layers
- **Intensity-based scrolling** (harder scroll/swipe = more movement)
- **Smooth gradual stopping** instead of abrupt halts
- **Cross-platform compatibility** (desktop and mobile)

### 🔧 Technical Features
- **Type-safe TypeScript** implementation
- **Reactive Vue 3 Composition API**
- **Prop-based architecture** - images passed as props for maximum flexibility
- **Efficient animation loops** with requestAnimationFrame
- **Automatic container registration** and initialization
- **Robust error handling** and state management
- **Hot module replacement** for development
- **External image data management** with JSON configuration
- **Deterministic shuffling** for consistent variety across layers

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd infinite-scroll-landing

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development
```bash
# Start dev server (usually http://localhost:5173)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🎯 Usage

### Basic Setup
The gallery automatically initializes with default settings:
- 3 layers of infinite scrolling
- Autoplay enabled at medium speed
- Hover to pause enabled
- Forward direction scrolling

### Controls
- **Toggle Controls**: Click the gear icon (bottom-left) to show/hide controls
- **Scroll Direction**: Switch between horizontal and vertical scrolling modes
- **Autoplay**: Toggle automatic scrolling on/off
- **Direction**: Switch between forward/reverse scrolling
- **Speed**: Adjust animation speed (5-100)
- **Layers**: Change number of scrolling layers (1-5)
- **Spacing**: Adjust spacing between layers (0-20rem)
- **Tilt Angle**: Adjust container tilt (0-45°)
- **Tilt Direction**: Switch tilt between left and right
- **Pause on Hover**: Enable/disable hover pause functionality

### Scroll Orientations

#### Horizontal Mode (Default)
- **Layout**: Cards arranged horizontally in rows
- **Movement**: Layers scroll left/right with alternating directions
- **Spacing**: Vertical spacing between layers
- **Cards**: Optimized for landscape viewing

#### Vertical Mode
- **Layout**: Cards arranged vertically in columns
- **Movement**: Layers scroll up/down with alternating directions
- **Spacing**: Horizontal spacing between layers
- **Cards**: Wider cards optimized for portrait stacking
- **Tilt**: Works seamlessly with vertical orientation

### Manual Scrolling
When autoplay is disabled:

#### Desktop
- **Mouse wheel**: Scroll up/down to move gallery (works in both orientations)
- **Trackpad**: Use two-finger scroll gestures
- **Momentum**: Multiple rapid scrolls build momentum for longer gliding

#### Mobile
- **Smart gesture detection**: Tap to open modal, swipe to scroll
- **Touch swipes**: Swipe up/down anywhere to move gallery (works in both orientations)
- **Velocity detection**: Faster swipes create more momentum
- **Natural feel**: Touch direction matches scroll direction
- **Easy access**: Swipe works on images, cards, and background areas

#### All Devices
- **Momentum building**: Multiple rapid inputs build momentum for longer gliding
- **Deceleration**: Smooth gradual slowdown instead of abrupt stopping
- **Synchronized movement**: All layers move together perfectly
- **Orientation aware**: Same controls work for both horizontal and vertical modes

### Image Modal
- **Click any image** to open in modal view
- **Navigation**: Use arrow buttons or keyboard arrows
- **Close**: Click X, press Escape, or click outside modal

## 🖼️ Image Management

### Component Usage
The `InfiniteScrollGallery` component accepts images and optional configuration as props:

```vue
<template>
  <!-- Basic usage with default settings -->
  <InfiniteScrollGallery :images="myImages" />

  <!-- Advanced usage with custom configuration -->
  <InfiniteScrollGallery :images="myImages" :config="customConfig" />
</template>

<script setup lang="ts">
import InfiniteScrollGallery, { type GalleryConfig } from './components/InfiniteScrollGallery.vue'
import type { ImageItem } from './types/images'

// Images can come from any source
const myImages: ImageItem[] = [
  {
    id: 1,
    url: "https://example.com/image.jpg",
    title: "Image Title",
    description: "Image description text"
  }
  // ... more images
]

// Optional: Customize default settings
const customConfig: GalleryConfig = {
  scrollDirection: 'vertical',
  autoplay: false,
  numberOfContainers: 5,
  scrollSpeed: 30,
  tiltDegree: 25,
  layerSpacing: 20
}

// Or from an API
const apiImages = await fetch('/api/images').then(r => r.json())

// Or conditionally
const galleryImages = computed(() =>
  showNature.value ? natureImages : cityImages
)

// Dynamic configuration
const dynamicConfig = computed(() => ({
  scrollDirection: isMobile.value ? 'vertical' : 'horizontal',
  numberOfContainers: screenSize.value === 'large' ? 5 : 3
}))
</script>
```

### Configuration Options
All control settings can be customized via the `config` prop:

```typescript
interface GalleryConfig {
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
```

**Benefits:**
- **Flexible defaults**: Set different defaults for different use cases
- **Type safety**: Full TypeScript support with autocomplete
- **Partial configuration**: Only specify the settings you want to change
- **Dynamic configuration**: Use computed properties for responsive settings

### Image Data Structure
Images are stored in `src/data/images.json` for easy maintenance:

```json
{
  "images": [
    {
      "id": 1,
      "url": "https://example.com/image.jpg",
      "title": "Image Title",
      "description": "Image description text"
    }
  ]
}
```

### Adding/Editing Images
1. **Edit** `src/data/images.json`
2. **Add new images** to the `images` array
3. **Update existing images** by modifying their properties
4. **Remove images** by deleting entries from the array

### Image Distribution
- **All containers show the same complete set** of images
- **Different shuffled orders** for visual variety across layers
- **Deterministic shuffling** ensures consistent patterns
- **Seamless infinite scrolling** with tripled image sets

## 🧪 Testing

The project includes comprehensive testing scripts in the `testing/` folder:

### Test Scripts
```bash
# All test scripts are located in testing/ folder
testing/
├── README.md                     # Testing documentation
├── animation-debug.js            # Animation monitoring
├── comprehensive-test.js         # Full automated test suite
├── debug-layer-change.js         # Layer change debugging
├── improved-mobile-touch-test.js # Improved mobile touch (tap + swipe) tests
├── interaction-test.js           # User interaction tests
├── layer-change-test.js          # Layer change specific tests
├── mobile-controls-test.js       # Mobile controls functionality tests
├── mobile-touch-test.js          # Mobile touch scrolling tests
├── modal-manual-scroll-test.js   # Modal opening in manual scroll mode
├── momentum-deceleration-test.js # Momentum physics tests
├── responsive-scroll-test.js     # Manual scroll responsiveness
└── synchronized-scroll-test.js   # Container synchronization tests
```

### Running Tests
1. **Start the development server**: `npm run dev`
2. **Open browser console** (F12)
3. **Copy and paste** any test script from `testing/` folder
4. **Watch results** in console output

### Key Test Categories
- **Animation System**: Verifies autoplay start/stop cycles
- **Layer Changes**: Tests dynamic layer adjustment and autoplay resumption
- **Manual Scrolling**: Validates wheel/trackpad responsiveness and momentum
- **Mobile Touch**: Tests touch swipe gestures and velocity detection
- **Hover Interactions**: Confirms pause/resume functionality
- **Synchronization**: Ensures all containers move together
- **Performance**: Monitors frame rates and memory usage

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── InfiniteScrollGallery.vue    # Main gallery component
│   └── ImageModal.vue               # Modal component for image viewing
├── data/
│   └── images.json                  # Image data (URLs, titles, descriptions)
├── types/
│   ├── images.d.ts                  # TypeScript interfaces for image data
│   └── json.d.ts                    # JSON module declarations
├── style.css                        # Global styles
└── main.ts                          # Application entry point
```

### Key Systems

#### Animation System
- **Autoplay Loop**: Continuous scrolling with configurable speed/direction
- **Manual Scroll**: Momentum-based user-controlled movement
- **State Management**: Proper start/stop/pause handling

#### Container Management
- **Dynamic Registration**: Containers register themselves on mount
- **Initialization Tracking**: Ensures all containers ready before starting
- **Position Synchronization**: Maintains consistent scroll positions

#### Image Management
- **External Data**: Images loaded from JSON configuration file
- **Type Safety**: Full TypeScript support for image data
- **Deterministic Shuffling**: Consistent variety across containers
- **Complete Coverage**: All containers show all images in different orders

#### Responsive Design
- **Card Sizing**: Automatic adjustment based on layer count
- **Container Heights**: Dynamic calculation for optimal spacing
- **Mobile Support**: Touch-friendly controls and gestures

## ⚙️ Configuration

### Default Settings
```typescript
const scrollDirection = ref("horizontal"); // Scroll orientation (horizontal/vertical)
const autoplay = ref(true);               // Auto-scrolling enabled
const autoplayDirection = ref("forward");  // Scroll direction (forward/reverse)
const pauseOnHover = ref(true);           // Pause on mouse hover
const scrollSpeed = ref(20);              // Animation speed (1-50)
const numberOfContainers = ref(3);        // Number of layers (1-5)
const layerSpacing = ref(14);             // Spacing between layers (0-20rem)
const tiltDegree = ref(15);               // Tilt angle (0-45°)
const tiltDirection = ref("right");       // Tilt direction (left/right)
```

### Customization
All settings can be adjusted via the control panel or by modifying the default values in the component.

## 🐛 Troubleshooting

### Common Issues

#### "Loading containers... Please wait"
- **Cause**: Containers not fully registered
- **Solution**: Wait 2-3 seconds, or check console for registration errors

#### Manual scroll not working
- **Cause**: Autoplay is enabled
- **Solution**: Turn off autoplay in controls to enable manual scrolling

#### Layers not synchronized
- **Cause**: Container registration timing issues
- **Solution**: Refresh page or check browser console for errors

#### Performance issues
- **Cause**: Too many layers or high speed settings
- **Solution**: Reduce layer count or lower animation speed

### Debug Mode
Enable detailed logging by opening browser console - the gallery provides extensive debug information about:
- Container registration status
- Animation start/stop events
- Position updates and wrapping
- User interaction handling

## 🔧 Development

### Tech Stack
- **Vue 3**: Reactive framework with Composition API
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS v4**: Utility-first styling
- **Vue Motion**: Smooth animations and transitions

### Code Style
- **ES Modules**: Modern import/export syntax
- **Composition API**: Vue 3 reactive patterns
- **TypeScript**: Full type coverage
- **Pointer Events**: Modern event handling (not mouse/touch)

### Performance Optimizations
- **RequestAnimationFrame**: Smooth 60fps animations
- **Efficient DOM Updates**: Minimal reflows and repaints
- **Memory Management**: Proper cleanup of event listeners and timers
- **Lazy Loading**: Images loaded as needed

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or contributions, please:
1. Check the troubleshooting section above
2. Run the test scripts to identify specific issues
3. Open an issue with detailed reproduction steps
4. Include browser console output and system information
