# SVG Support Setup Guide

## For Expo Managed Workflow with EAS Build

### 1. Install Dependencies

```bash
expo install react-native-svg
npm install -D react-native-svg-transformer
```

### 2. Configure Metro

Create or update `metro.config.js`:

```javascript
const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  return config;
})();
```

### 3. Usage

After setup, you can import SVG files as React components:

```tsx
import Logo from './assets/logo.svg';

// Use it like a component
<Logo width={40} height={40} />
```

## Notes

- This setup allows SVG files to be imported as React components
- SVG support works perfectly with EAS Build
- No additional configuration needed after initial setup
