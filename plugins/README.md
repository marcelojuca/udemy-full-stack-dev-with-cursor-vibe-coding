# Figma Plugins Directory

This directory contains all Figma plugins for this project.

## 📦 Available Plugins

### Image Resizer Pro
- **Directory**: `image-resizer/`
- **Description**: A powerful Figma plugin for resizing images with advanced options
- **Status**: Active
- **Build**: `cd image-resizer && npm run build`
- **Watch**: `cd image-resizer && npm run watch`

For detailed information about the Image Resizer Pro plugin, see [Image Resizer README](./image-resizer/README.md).

## 🆕 Adding a New Plugin

To add a new plugin to this directory:

1. **Create the plugin directory**:
   ```bash
   mkdir plugins/your-plugin-name
   cd plugins/your-plugin-name
   ```

2. **Initialize the plugin** (use create-figma-plugin or copy from existing):
   ```bash
   npx @create-figma-plugin/cli@latest
   ```
   OR copy the structure from an existing plugin and customize

3. **Configure files**:
   - `manifest.json` - Plugin metadata and permissions
   - `package.json` - Dependencies and build scripts
   - `tsconfig.json` - TypeScript configuration
   - `tailwind.config.js` - Tailwind CSS configuration (if using)

4. **Update root README.md** to include your new plugin

## 📋 Plugin Structure

Each plugin should follow this structure:

```
plugin-name/
├── src/
│   ├── main.ts          # Plugin main code
│   ├── ui.tsx           # UI code
│   ├── components/      # Reusable UI components (optional)
│   ├── utils/           # Utility functions (optional)
│   ├── input.css        # Tailwind input file
│   └── output.css       # Compiled CSS (generated)
├── build/               # Build output (generated)
├── docs/                # Plugin documentation
├── manifest.json        # Plugin configuration
├── package.json         # Dependencies
├── package-lock.json    # Locked versions
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind config
├── .gitignore          # Git ignore rules
└── README.md           # Plugin documentation
```

## 🔨 Development Workflow

### Install Dependencies
```bash
cd plugins/image-resizer
npm install
```

### Development Mode (Watch)
```bash
npm run watch
```

### Build for Production
```bash
npm run build
```

### Clean Build
```bash
npm run build
```

## ✅ Best Practices

1. **Isolation**: Keep each plugin's dependencies in its own `node_modules`
2. **Versioning**: Update plugin versions independently in `package.json`
3. **Documentation**: Maintain a README.md in each plugin directory
4. **Build Artifacts**: Add `build/` to `.gitignore` - never commit built files
5. **Dependencies**: Use consistent versions of core packages across plugins when possible
6. **Naming**: Use descriptive plugin names that reflect their functionality

## 🚀 Publishing a Plugin

Refer to individual plugin documentation for publishing instructions. Generally:

1. Build the plugin: `npm run build`
2. Follow [Figma Plugin Publishing Guide](https://www.figma.com/developers/docs/plugins/setup/publishing-plugins)
3. Submit to [Figma Community](https://www.figma.com/community/plugins)

## 📞 Support

For plugin-specific issues, refer to the individual plugin's documentation.
