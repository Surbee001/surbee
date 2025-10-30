# Figma Components

This directory contains components generated from Figma designs using Polipo.

## Setup Instructions

### 1. Configure Figma Access
1. Get your Figma file URL (e.g., `https://www.figma.com/file/YOUR_FILE_ID/YOUR_FILE_NAME`)
2. Update `polipo.config.js` with your Figma file URL
3. Ensure you have access to the Figma file

### 2. Install Polipo (if not already installed)
```bash
pnpm add -D polipo
```

### 3. Start Polipo Server
```bash
# Start Polipo server
pnpm polipo

# Or start in development mode with auto-reload
pnpm polipo:dev

# Or start in watch mode
pnpm polipo:watch
```

### 4. Generate Components
Polipo will automatically:
- Connect to your Figma file
- Extract design tokens (colors, typography, spacing)
- Generate React components with TypeScript
- Apply shadcn/ui styling conventions
- Create component documentation

### 5. Use Generated Components
```tsx
import { FigmaButton } from '@/components/figma/FigmaButton';
import { FigmaCard } from '@/components/figma/FigmaCard';

export default function MyPage() {
  return (
    <div>
      <FigmaButton>Click me</FigmaButton>
      <FigmaCard>Card content</FigmaCard>
    </div>
  );
}
```

## Configuration

Edit `polipo.config.js` to customize:
- Component generation settings
- Styling preferences
- Export formats
- Development options

## File Structure

```
src/components/figma/
├── README.md              # This file
├── tokens/               # Design tokens (colors, typography, etc.)
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
├── components/           # Generated React components
│   ├── FigmaButton.tsx
│   ├── FigmaCard.tsx
│   └── ...
└── styles/              # Generated styles
    ├── variables.css
    └── components.css
```

## Best Practices

1. **Keep Figma Updated**: Ensure your Figma designs are up-to-date
2. **Component Naming**: Use consistent naming conventions in Figma
3. **Design Tokens**: Organize colors, typography, and spacing in Figma
4. **Responsive Design**: Consider mobile and desktop variants
5. **Accessibility**: Include proper ARIA labels and semantic HTML

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Ensure you have access to the Figma file
   - Check your Figma API token

2. **Component Generation Fails**
   - Verify Figma file URL is correct
   - Check network connectivity
   - Review Polipo configuration

3. **Styling Issues**
   - Ensure shadcn/ui is properly configured
   - Check Tailwind CSS configuration
   - Verify component imports

### Getting Help

- Check Polipo documentation: https://github.com/getpolipo/polipo
- Review generated component code
- Check browser console for errors
- Verify Figma file permissions

## Development Workflow

1. **Design in Figma**: Create/update your designs
2. **Start Polipo**: Run `pnpm polipo:watch`
3. **Auto-Generate**: Components update automatically
4. **Import & Use**: Import generated components in your app
5. **Customize**: Modify components as needed for your use case

## Integration with Surbee Lyra

The generated components are designed to work seamlessly with:
- Next.js 15 App Router
- TypeScript strict mode
- Tailwind CSS 4
- shadcn/ui components
- React Hook Form
- Zod validation

All components follow the established patterns and conventions of the Surbee Lyra project. 