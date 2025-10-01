# Cofounder Landing Page - TSX Replica

## Overview

This is a **pixel-perfect, production-ready TSX replica** of the Cofounder.co landing page, converted from the original HTML/CSS.

## Files Structure

```
components/landing/
├── CofounderLanding.tsx        # Main component
├── cofounder-landing.css       # Original Cofounder CSS (Tailwind-based)
├── cofounder-globals.css       # Global CSS variables and utilities
└── README.md                   # This file
```

## Features

### Implemented Components

- ✅ **Fixed Sidebar Navigation** (desktop only, hidden on mobile)
- ✅ **Responsive Top Navigation** with logo, pricing link, login/signup buttons
- ✅ **Hero Section** with animated headline and description
- ✅ **Hero Animation Section** with interactive prompt box
- ✅ **Use Cases Grid** with hover effects and tool icons
- ✅ **Mobile Menu** (hamburger navigation)
- ✅ **Smooth Scroll Animations**
- ✅ **Hover States & Transitions**

### Technologies & Patterns

- **Next.js 14+** with App Router
- **TypeScript** with strict typing
- **Tailwind CSS** for utility-first styling
- **Next/Image** for optimized image loading
- **CSS Custom Properties** for theming
- **Responsive Design** (mobile-first approach)

## Installation & Usage

### 1. Copy Files

```bash
# Copy component files
cp -r components/landing surbee-lyra/components/

# Or move them to your desired location
```

### 2. Import Global Styles

Add to your **root layout** (`app/layout.tsx`):

```tsx
import '@/components/landing/cofounder-globals.css';
import '@/components/landing/cofounder-landing.css';
```

### 3. Use the Component

```tsx
import CofounderLanding from '@/components/landing/CofounderLanding';

export default function Page() {
  return <CofounderLanding />;
}
```

### 4. Add Required Fonts

Place font files in `public/fonts/`:
- `af-normal.woff2` (AF Foundry font)
- `mondwest.woff2` (PP Mondwest font)

### 5. Add Required Images

Place images in `public/images/`:
- `cofunder-logo-flower.avif`
- `hero-anim-bg-2.png`
- `other-tool.avif`
- `linear.avif`
- `slack.avif`

## Customization

### Color Palette

Edit `cofounder-globals.css` to customize colors:

```css
:root {
  --color-neutral-900: #2c2c2c;  /* Primary text */
  --color-neutral-700: #646464;  /* Secondary text */
  --color-neutral-50: #fefffc;   /* Background */
  /* ... more colors */
}
```

### Sidebar Width

```css
:root {
  --sidebar-width: 240px;  /* Adjust as needed */
}
```

### Typography

Custom tracking (letter-spacing) utilities:

```css
.tracking-15 { letter-spacing: -0.15px; }
.tracking-24 { letter-spacing: -0.24px; }
/* Add more as needed */
```

## Component Structure

### Main Sections

1. **Sidebar** (`lg:flex hidden`)
   - Logo
   - Navigation links (Cofounder, Use cases, Product, Agents, Integrations, Results, Blog)
   - Context menu for logo actions

2. **Top Navigation** (`fixed top-0`)
   - Cofounder wordmark
   - Pricing link
   - Login/Signup buttons

3. **Hero Header**
   - Large headline with responsive sizing
   - Description text

4. **Hero Animation Section**
   - Background image
   - Interactive prompt box with cursor animation
   - Tooltip on hover

5. **Use Cases Grid**
   - 3-column grid (responsive: 1 col mobile → 2 col tablet → 3 col desktop)
   - Cards with tool icons
   - "See it work" button on hover

### Helper Components

#### `UseCaseCard`

```tsx
<UseCaseCard 
  href="https://app.cofounder.co/replay/..."
  title="Card Title"
  description="Card description text"
  toolIcons={['/images/tool1.avif', '/images/tool2.avif']}
/>
```

**Props:**
- `href` (string): External link URL
- `title` (string): Card heading
- `description` (string): Card body text
- `toolIcons` (string[]): Array of image paths for tool icons

## Responsive Breakpoints

```css
2xs: 25rem   /* 400px */
sm:  40rem   /* 640px */
md:  48rem   /* 768px */
lg:  64rem   /* 1024px */
xl:  80rem   /* 1280px */
2xl: 96rem   /* 1536px */
3xl: 120rem  /* 1920px */
4xl: 137.5rem /* 2200px */
```

## Animations & Interactions

### Fade-in on Mount

```tsx
useEffect(() => {
  const fadeElements = document.querySelectorAll('.opacity-0');
  fadeElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.remove('opacity-0');
    }, 100 * index);
  });
}, []);
```

### Cursor Pulse Animation

```css
@keyframes cursor-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

### Hover Effects

- **Use Case Cards**: Shadow expansion + "See it work" button fade-in
- **Navigation Links**: Color change on hover
- **Buttons**: Background gradient overlay

## Performance Optimizations

1. **Image Optimization**
   - Using Next.js `Image` component
   - AVIF format for logos/icons
   - Lazy loading with `loading="lazy"`

2. **CSS Splitting**
   - Separated global variables
   - Component-specific styles
   - Minimal runtime CSS-in-JS

3. **Font Loading**
   - `font-display: swap` for FOUT prevention
   - Preloaded fonts in `<head>`

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **CSS Features**: CSS Grid, Custom Properties, Backdrop Filter
- **JavaScript**: ES2020+ (arrow functions, optional chaining, etc.)

## Known Limitations

1. **Full HTML Conversion**: This component covers the **hero and use cases sections**. Additional sections from the original HTML can be added following the same pattern.

2. **Font Files**: You'll need to source the AF Foundry and PP Mondwest fonts separately (not included due to licensing).

3. **Dynamic Content**: The use case cards are currently hardcoded. For a CMS, convert to data-driven rendering:

```tsx
{useCases.map(useCase => (
  <UseCaseCard key={useCase.id} {...useCase} />
))}
```

## Extending the Component

### Adding More Sections

Follow this pattern for additional sections:

```tsx
<div className="w-full">
  <section id="your-section" className="pb-[180px] pt-[140px] px-4 w-full max-w-[1920px] mx-auto opacity-0">
    {/* Your section content */}
  </section>
</div>
```

### Adding Animation Variants

Use Framer Motion for advanced animations:

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

## Troubleshooting

### Issue: Fonts not loading

**Solution**: Check that font files exist in `/public/fonts/` and paths match in `cofounder-globals.css`

### Issue: CSS variables not working

**Solution**: Ensure `cofounder-globals.css` is imported before `cofounder-landing.css` in your layout

### Issue: Images broken

**Solution**: Verify images exist in `/public/images/` and use correct Next.js image paths

### Issue: Sidebar not showing

**Solution**: Sidebar is hidden below `lg` breakpoint (1024px). View on desktop or adjust breakpoint.

## License

This replica is provided as-is for educational and development purposes. The original design and branding belong to Cofounder.co.

## Credits

**Original Design**: Cofounder.co  
**TSX Conversion**: Surbee Development Team  
**Date**: October 2025

---

For questions or improvements, please refer to the project documentation or submit a pull request.

