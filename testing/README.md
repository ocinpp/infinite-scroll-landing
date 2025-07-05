# Testing Scripts for Infinite Gallery

## Overview
This folder contains automated testing scripts to verify the infinite gallery functionality.

## Scripts

### 1. `animation-debug.js`
Monitors animation start/stop cycles and identifies issues with autoplay.

### 2. `layer-change-test.js` 
Tests layer changes and verifies autoplay resumes correctly.

### 3. `interaction-test.js`
Tests user interactions like hover, manual scroll, and control changes.

### 4. `comprehensive-test.js`
Runs all tests automatically with detailed reporting.

## Usage

1. Open the application: http://localhost:5174
2. Open browser console (F12)
3. Copy and paste any test script
4. Watch the results in console

## Expected Results

- ✅ Autoplay starts automatically on page load
- ✅ Autoplay resumes after layer changes
- ✅ Hover pauses/resumes animation correctly
- ✅ Manual scroll works when autoplay is off
- ✅ No console errors or infinite loops

## Troubleshooting

If tests fail, check:
- Container registration logs
- Animation start/stop messages
- System state changes
- Error messages in console
