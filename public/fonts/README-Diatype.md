# Diatype Font Setup

## Current Status
The landing page is currently using **Epilogue** as a temporary substitute for Diatype font.

## To Add Actual Diatype Font

When you have the Diatype font files, follow these steps:

1. **Add Diatype font files to this directory** (`public/fonts/`):
   - `Diatype-Regular.woff2` (weight: 400)
   - `Diatype-Medium.woff2` (weight: 500)
   - `Diatype-Bold.woff2` (weight: 700)

2. **Update the font configuration** in `src/app/landing/page.tsx`:
   ```typescript
   const diatype = localFont({
     src: [
       {
         path: "../../../public/fonts/Diatype-Regular.woff2",
         weight: "400",
         style: "normal",
       },
       {
         path: "../../../public/fonts/Diatype-Medium.woff2",
         weight: "500",
         style: "normal",
       },
       {
         path: "../../../public/fonts/Diatype-Bold.woff2",
         weight: "700",
         style: "normal",
       },
     ],
     variable: "--font-diatype",
     display: "swap",
   });
   ```

3. **Update the comment** in the code to remove the "TODO" note.

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
