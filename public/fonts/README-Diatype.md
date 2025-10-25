# Diatype Font Setup

## ✅ Current Status
The landing page is using the **ABC Diatype Variable** font with a modern, clean styling approach matching the specified design system.

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

## ✅ Current Hero Section Implementation

### **Typography Styling**
The hero text uses the exact styling from the design system:

```typescript
<h1
  className="text-xl large md:max-w-200 max-w-83.75 text-center"
  style={{
    letterSpacing: "-0.029em",
    fontFamily: 'var(--font-diatype), "ABC Diatype", sans-serif',
    fontWeight: 400,
    lineHeight: 0.98,
    fontSize: "4.375rem",
    // Interactive gradient background
    background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ...)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }}
>
  Your mission control for software engineering projects and agents.
</h1>
```

### **CSS Classes Added**
- `.text-xl`: Base text size (1.25rem)
- `.large`: Hero text size (4.375rem) with line-height 0.98
- `.md:max-w-200`: Max width 50rem on medium screens
- `.max-w-83.75`: Max width 83.75rem fallback

### **Interactive Effects**
- ✅ **Mouse-Responsive Gradient**: Radial gradient follows cursor position
- ✅ **Colorful Gradient**: 9-stop gradient with vibrant colors
- ✅ **Smooth Transitions**: 0.3s ease transitions
- ✅ **Performance Optimized**: CSS-based animations

## ✅ What's Working Now
- ✅ **Exact Typography Match**: Matches provided design system
- ✅ **Interactive Gradient**: Mouse-following colorful gradient effect
- ✅ **Responsive Design**: Scales beautifully across all screen sizes
- ✅ **Performance**: Optimized with font-display: swap and CSS transitions
- ✅ **Accessibility**: Proper semantic markup and fallbacks
- ✅ **Centered Layout**: Text and badge properly centered

## Alternative: Use System Font
If Diatype is installed on your system, you can use it directly:
```typescript
const diatype = localFont({
  src: "local('Diatype')",
  variable: "--font-diatype",
  display: "swap",
});
```
