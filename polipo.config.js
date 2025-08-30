module.exports = {
  // Figma file URL - replace with your actual Figma file URL
  figmaUrl: 'https://www.figma.com/file/YOUR_FILE_ID/YOUR_FILE_NAME',
  
  // Output directory for generated components
  outputDir: './src/components/figma',
  
  // Component generation settings
  components: {
    // Generate TypeScript components
    typescript: true,
    
    // Use shadcn/ui styling
    styling: 'shadcn',
    
    // Component naming convention
    naming: 'pascal',
    
    // Include CSS variables for theming
    cssVariables: true,
  },
  
  // Design tokens configuration
  tokens: {
    // Extract colors, typography, spacing, etc.
    colors: true,
    typography: true,
    spacing: true,
    borderRadius: true,
    shadows: true,
  },
  
  // Export settings
  export: {
    // Export as individual files
    format: 'individual',
    
    // Include component documentation
    documentation: true,
    
    // Generate storybook stories
    stories: false,
  },
  
  // Development settings
  dev: {
    // Watch for changes in Figma
    watch: true,
    
    // Auto-reload on changes
    reload: true,
    
    // Development server port
    port: 3001,
  },
  
  // Custom transformations
  transforms: {
    // Convert Figma components to React components
    component: (node) => {
      // Custom component transformation logic
      return node;
    },
    
    // Convert Figma styles to CSS
    style: (style) => {
      // Custom style transformation logic
      return style;
    },
  },
}; 