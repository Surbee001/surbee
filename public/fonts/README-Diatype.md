# Diatype Font Setup

## Current Status
The landing page is currently using **Epilogue Variable** as a temporary substitute for Diatype Variable font.

## ✅ Current Implementation
- **Variable Font**: Using `Epilogue-Variable.woff2` with weight range 100-900
- **Clean Layout**: Text displays as a proper sentence: "Craft exceptional, survey experiences"
- **Responsive**: Uses `clamp()` for responsive font sizing
- **Centered**: Hero text is perfectly centered in the viewport
- **Interactive**: Maintains the gradient hover effect

## To Add Actual Diatype Variable Font

When you have the Diatype Variable font file, follow these steps:

1. **Add Diatype Variable font file to this directory** (`public/fonts/`):
   - `Diatype-Variable.woff2` (supports weight range 100-900)

2. **Update the font configuration** in `src/app/landing/page.tsx`:
   ```typescript
   const diatype = localFont({
     src: [
       {
         path: "../../../public/fonts/Diatype-Variable.woff2",
         weight: "100 900",
         style: "normal",
       },
       {
         path: "../../../public/fonts/Diatype-VariableItalic.woff2",
         weight: "100 900",
         style: "italic",
       },
     ],
     variable: "--font-diatype",
     display: "swap",
   });
   ```

3. **Update the comment** in the code to remove the "TODO" note.

## ✅ What's Working Now
- ✅ **Variable Font**: Full weight range (100-900) support
- ✅ **Clean Typography**: Proper sentence layout without overlapping text
- ✅ **Responsive Design**: Font scales beautifully across all screen sizes
- ✅ **Interactive Effects**: Mouse hover reveals colorful gradient
- ✅ **Performance**: Optimized with font-display: swap
- ✅ **Accessibility**: Proper semantic markup and fallbacks

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
