# Image Resizer - Figma Plugin

A simple Figma plugin to resize images and frames to specific dimensions.

## Features

- **Resize any image or frame** to custom width and height
- **Preserve aspect ratio** option to maintain proportions
- **Auto-detect current size** from selected node
- **Real-time selection updates** - automatically detects when you select a different node

## How to Use

### Installation

1. Build the plugin:
   ```bash
   npm run build
   ```

2. In Figma Desktop:
   - Open a Figma document
   - Go to **Plugins** → **Development** → **Import plugin from manifest...**
   - Select the `manifest.json` file from the `build/` directory

### Usage

1. **Select an image or frame** in your Figma document
2. **Run the plugin** from the Plugins menu
3. **Enter new dimensions**:
   - Width: Enter the desired width in pixels
   - Height: Enter the desired height in pixels
4. **Choose options**:
   - Check "Preserve aspect ratio" to maintain the original proportions
   - Click "Use Current Size" to fill in the current dimensions
5. **Click "Resize Image"** to apply the changes

### Preserve Aspect Ratio

When enabled, the plugin will:
- Calculate the aspect ratio from the original dimensions
- Fit the image within the specified width/height bounds
- Maintain the original proportions

Example:
- Original: 200×300 (aspect ratio 2:3)
- New size: 400×400
- With aspect ratio preserved: 266.67×400 (fits within 400×400, maintains 2:3 ratio)

## Development

### Build

```bash
npm run build
```

### Watch Mode (Auto-rebuild)

```bash
npm run watch
```

### Project Structure

```
image-resizer/
├── src/
│   ├── main.ts          # Plugin logic (resize operations)
│   ├── ui.tsx           # UI component (Preact)
│   └── input.css        # Tailwind CSS
├── build/               # Compiled output
│   ├── main.js
│   ├── ui.js
│   └── manifest.json
└── package.json
```

## Requirements

- Node.js v22 or higher
- Figma Desktop app

## License

MIT
