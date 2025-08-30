# Lyra Atoms - Flexible Form Builder System

Lyra Atoms is a comprehensive form builder system that replaces SurveyJS with a more flexible, AI-driven approach. It provides a library of atomic form components that can be intelligently combined to create any type of form or survey.

## 🚀 Features

### Core Components
- **LyraFormBuilder**: Main WYSIWYG form builder interface
- **LyraAIGenerator**: AI-powered form generation from natural language
- **AtomRenderer**: Dynamic component renderer for all atom types
- **Lyra Atoms**: Individual form components (TextInput, Rating, Select, etc.)

### Key Capabilities
- **No Hardcoded Forms**: Every form is dynamically generated from atoms
- **AI-Driven Design**: Generate forms from natural language prompts
- **Real-time Editing**: WYSIWYG interface for form customization
- **Flexible Styling**: Comprehensive styling system with responsive design
- **Validation System**: Built-in validation with custom rules
- **Export/Import**: JSON-based form export and import

## 🧩 Atom Types

### Input Atoms
- `text-input`: Single line text input with various types (text, email, password, etc.)
- `text-area`: Multi-line text input
- `select`: Dropdown selection with single or multiple options
- `date-picker`: Date and time selection
- `file-upload`: File upload with size and type restrictions

### Selection Atoms
- `radio-group`: Single choice from multiple options
- `checkbox-group`: Multiple choice selection
- `rating`: Star/heart/thumbs rating system
- `slider`: Range slider with custom min/max values

### Content Atoms
- `heading`: Text headings (H1-H6)
- `paragraph`: Text content blocks
- `image`: Image display with responsive sizing
- `video`: Video player with controls
- `divider`: Visual separators
- `spacer`: Vertical spacing

### Layout Atoms
- `container`: Group atoms with layout options (vertical, horizontal, grid)
- `card`: Styled container with shadow and padding
- `button`: Action buttons with various styles
- `progress`: Progress indicators

## 📝 Usage

### Basic Form Builder
```tsx
import { LyraFormBuilder } from '@/components/survey-builder/LyraFormBuilder';
import type { LyraForm } from '@/components/survey-builder/atoms/types';

const form: LyraForm = {
  id: 'my-form',
  title: 'Contact Form',
  atoms: [
    {
      id: 'email',
      type: 'text-input',
      label: 'Email Address',
      required: true,
      inputType: 'email',
      validation: [
        { type: 'required', message: 'Email is required' },
        { type: 'email', message: 'Please enter a valid email' }
      ]
    }
  ],
  theme: {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff'
  }
};

function MyFormBuilder() {
  const [currentForm, setCurrentForm] = useState(form);
  
  return (
    <LyraFormBuilder
      form={currentForm}
      onFormChange={setCurrentForm}
      isEditing={true}
    />
  );
}
```

### AI Form Generation
```tsx
import { LyraAIGenerator } from '@/components/survey-builder/LyraAIGenerator';

function MyAIGenerator() {
  const handleFormGenerated = (form: LyraForm) => {
    console.log('AI generated form:', form);
    // Use the generated form
  };
  
  return (
    <LyraAIGenerator
      onFormGenerated={handleFormGenerated}
    />
  );
}
```

### Custom Atom Component
```tsx
import { TextInputAtom } from '@/components/survey-builder/atoms/TextInputAtom';

const myAtom = {
  id: 'custom-input',
  type: 'text-input',
  label: 'Custom Field',
  placeholder: 'Enter value...',
  required: true,
  styling: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  }
};

function MyCustomComponent() {
  return (
    <TextInputAtom
      atom={myAtom}
      value=""
      onChange={(value) => console.log(value)}
      onValidation={(isValid, errors) => console.log(errors)}
    />
  );
}
```

## 🎨 Styling System

Each atom supports comprehensive styling options:

```tsx
const styledAtom = {
  id: 'styled-input',
  type: 'text-input',
  label: 'Styled Input',
  styling: {
    // Layout
    width: '100%',
    height: '48px',
    margin: '16px 0',
    padding: '12px 16px',
    display: 'block',
    
    // Colors
    backgroundColor: '#ffffff',
    color: '#1f2937',
    borderColor: '#d1d5db',
    
    // Typography
    fontSize: '16px',
    fontWeight: '500',
    fontFamily: 'DM Sans',
    textAlign: 'left',
    
    // Borders
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    
    // Effects
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    opacity: 1,
    
    // Responsive
    responsive: {
      mobile: {
        fontSize: '14px',
        padding: '8px 12px'
      },
      tablet: {
        fontSize: '15px'
      },
      desktop: {
        fontSize: '16px'
      }
    }
  }
};
```

## 🔧 Validation System

Atoms support multiple validation types:

```tsx
const validatedAtom = {
  id: 'validated-input',
  type: 'text-input',
  label: 'Validated Field',
  validation: [
    { type: 'required', message: 'This field is required' },
    { type: 'email', message: 'Please enter a valid email' },
    { type: 'min', value: 3, message: 'Minimum 3 characters' },
    { type: 'max', value: 50, message: 'Maximum 50 characters' },
    { type: 'pattern', value: '^[a-zA-Z]+$', message: 'Letters only' },
    { type: 'custom', value: 'customValidation', message: 'Custom error' }
  ]
};
```

## 🤖 AI Integration

The AI generator can create forms from natural language:

```tsx
// Example prompts that work with the AI generator:
// "Create a user satisfaction survey with rating questions"
// "Build a contact form with email and phone fields"
// "Make a registration form with username and password"
// "Design a feedback form with text areas and ratings"
```

## 📊 Form Structure

```tsx
interface LyraForm {
  id: string;
  title: string;
  description?: string;
  atoms: AnyAtom[];
  layout: 'single' | 'multi-step' | 'wizard';
  theme: FormTheme;
  settings: FormSettings;
}
```

## 🎯 Benefits Over SurveyJS

1. **No Dependencies**: No external library dependencies
2. **Full Control**: Complete control over styling and behavior
3. **AI Integration**: Native AI-powered form generation
4. **Flexible Architecture**: Easy to extend with new atom types
5. **Better Performance**: Lighter weight and faster rendering
6. **Modern UI**: Built with modern React patterns and Tailwind CSS
7. **Type Safety**: Full TypeScript support with strict typing

## 🔮 Future Enhancements

- [ ] Advanced logic and conditional fields
- [ ] Multi-step form wizard
- [ ] Form templates library
- [ ] Advanced styling themes
- [ ] Real-time collaboration
- [ ] Form analytics and insights
- [ ] Integration with external APIs
- [ ] Mobile-optimized builder
- [ ] Accessibility improvements
- [ ] Internationalization support

## 📚 API Reference

See the individual component files for detailed API documentation:
- `types.ts` - Type definitions
- `LyraFormBuilder.tsx` - Main builder component
- `LyraAIGenerator.tsx` - AI generation component
- `AtomRenderer.tsx` - Dynamic atom renderer
- Individual atom components (TextInputAtom, RatingAtom, etc.) 