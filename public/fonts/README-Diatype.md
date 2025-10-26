# Diatype Font Setup

## ✅ Current Status
The landing page is now using the **ABC Diatype Variable** font with full weight range (100-900).

## Font Location
- **Font Directory**: `public/fonts/ABC Diatype Variable/`
- **Font File**: `ABCDiatypeVariable-Trial.woff2`
- **Variable Font**: Supports weights 100-900

## Implementation
The font is configured as a variable font in `src/app/landing/page.tsx`:

```typescript
const diatype = localFont({
  src: "../../../public/fonts/ABC Diatype Variable/ABCDiatypeVariable-Trial.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-diatype",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});
```

## ✅ What's Working Now
- ✅ **Variable Font**: Full weight range (100-900) support
- ✅ **Clean Typography**: Proper two-line layout with space between lines
- ✅ **Responsive Design**: Font scales beautifully across all screen sizes
- ✅ **Interactive Effects**: Mouse hover reveals colorful gradient
- ✅ **Performance**: Optimized with font-display: swap
- ✅ **Accessibility**: Proper semantic markup and fallbacks
- ✅ **Centered Layout**: Both text and announcement badge properly centered

## Alternative: Use System Font
If Diatype is installed on your system, you can use it directly:
```typescript
const diatype = localFont({
  src: "local('Diatype')",
  variable: "--font-diatype",
  display: "swap",
});
```

## Current Hero Section
The hero text "Craft exceptional, survey experiences" is:
- ✅ Centered in the hero section
- ✅ Using the configured font (currently Epilogue)
- ✅ Description text has been removed
- ✅ Responsive and optimized
