# Image Support in Surbee Workflow V2

## Overview

Surbee Workflow V2 now supports **multi-modal inputs** including images alongside text. This enables users to:
- Upload visual mockups or designs
- Share screenshots of desired layouts
- Provide branding assets
- Show examples from other surveys
- Reference UI/UX patterns visually

The AI models can analyze these images and incorporate visual elements into survey generation and planning.

---

## Supported Image Formats

### 1. Base64-Encoded Images

```typescript
const response = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input_as_text: 'Create a survey matching this design',
    images: [
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    ]
  })
});
```

### 2. Data URLs

```typescript
const response = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input_as_text: 'Build a survey with this color scheme',
    images: [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    ]
  })
});
```

### 3. HTTP(S) URLs

```typescript
const response = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input_as_text: 'Create a survey inspired by this example',
    images: [
      'https://example.com/mockup.png',
      'https://cdn.example.com/branding/logo.png'
    ]
  })
});
```

### 4. Binary Data (Server-side only)

```typescript
import fs from 'fs';

// Using Buffer
const imageBuffer = fs.readFileSync('./mockup.png');

// Using ArrayBuffer
const imageArrayBuffer = fs.readFileSync('./mockup.png').buffer;

// Using Uint8Array
const imageUint8 = new Uint8Array(fs.readFileSync('./mockup.png'));
```

---

## How Images Are Processed

### Workflow Integration

Images are incorporated at **every stage** of the workflow:

```
User Input + Images
        ↓
1. Prompt Optimization
   → AI analyzes images and describes visual elements
   → Enhanced prompt includes visual details
        ↓
2. Guardrails Check
   → Same safety checks applied
        ↓
3. Intent Categorization
   → Visual mockups → BUILD mode
   → Example surveys → BUILD mode
   → General visuals → ASK/BUILD based on text
        ↓
4A. Build Planning (BUILD mode)
   → AI analyzes:
     • Color schemes and branding
     • Layout patterns
     • Component styles
     • Typography
     • Visual hierarchy
   → Plan includes visual specifications
        ↓
5A. Survey Building
   → AI replicates visual design
   → Matches colors, spacing, layout
   → Uses shadcn/ui components to match style
        ↓
4B. Planning Mode (ASK mode)
   → AI references visual examples
   → Provides recommendations based on images
   → Discusses design patterns shown
```

---

## API Usage Examples

### Example 1: Build Survey from Mockup

```typescript
// User uploads a Figma export or screenshot
const mockupImage = await convertToBase64(file);

const response = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input_as_text: 'Create a survey that matches this mockup exactly',
    images: [mockupImage]
  })
});

const result = await response.json();
console.log(result.stage); // "build"
console.log(result.source_files); // Generated React components matching the design
```

### Example 2: Get Design Recommendations

```typescript
const response = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input_as_text: 'What do you think of this survey design? How can I improve it?',
    images: ['https://example.com/current-survey.png']
  })
});

const result = await response.json();
console.log(result.stage); // "plan"
console.log(result.output_text); // Detailed critique and recommendations
```

### Example 3: Multiple Images (Branding + Layout)

```typescript
const response = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input_as_text: 'Create a customer satisfaction survey using our brand colors and this layout structure',
    images: [
      'https://company.com/brand-guide.png',  // Brand colors
      'https://company.com/layout.png'        // Layout example
    ]
  })
});
```

### Example 4: Image with Chat History

```typescript
const response = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input_as_text: 'Now add a rating section like shown in this image',
    images: ['https://example.com/rating-example.png'],
    context: {
      chatHistory: [
        {
          role: 'user',
          content: 'Create a feedback survey'
        },
        {
          role: 'assistant',
          content: 'I created a basic feedback survey with text questions.'
        }
      ],
      html: '<div class="survey">...</div>' // Current survey
    }
  })
});
```

---

## Client-Side Implementation

### React Component with Image Upload

```typescript
'use client';

import { useState } from 'react';

export default function SurveyCreator() {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      const base64 = await fileToBase64(file);
      newImages.push(base64);
    }

    setImages([...images, ...newImages]);
  };

  // Submit to workflow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/agents/surbee-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_as_text: input,
          images: images.length > 0 ? images : undefined,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your survey..."
        />

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
        />

        {images.length > 0 && (
          <div>
            <p>{images.length} image(s) attached</p>
            {images.map((img, i) => (
              <img key={i} src={img} alt={`Upload ${i}`} style={{ width: 100 }} />
            ))}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Create Survey'}
        </button>
      </form>

      {result && (
        <div>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## Advanced Use Cases

### 1. Brand Consistency Enforcement

```typescript
// Upload brand guidelines once, reference in context
const response = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  body: JSON.stringify({
    input_as_text: 'Create a new employee onboarding survey',
    context: {
      images: ['https://company.com/brand-guidelines.pdf'] // Stored in context
    }
  })
});
```

### 2. Iterative Design Refinement

```typescript
// Iteration 1: Initial design
const v1 = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  body: JSON.stringify({
    input_as_text: 'Create a customer feedback survey',
    images: ['https://company.com/sketch.png']
  })
});

// Iteration 2: Show AI the generated result, ask for changes
const v1Screenshot = await captureScreenshot(v1.result.html);

const v2 = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  body: JSON.stringify({
    input_as_text: 'Make the buttons larger and add more spacing between questions',
    images: [v1Screenshot], // Screenshot of v1
    context: {
      html: v1.result.source_files['src/Survey.tsx']
    }
  })
});
```

### 3. Competitive Analysis

```typescript
const response = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  body: JSON.stringify({
    input_as_text: 'Analyze these competitor surveys and create something better',
    images: [
      'https://competitor1.com/survey-screenshot.png',
      'https://competitor2.com/survey-screenshot.png',
      'https://competitor3.com/survey-screenshot.png'
    ]
  })
});
```

### 4. Accessibility Review

```typescript
const response = await fetch('/api/agents/surbee-v2', {
  method: 'POST',
  body: JSON.stringify({
    input_as_text: 'Review this survey design for accessibility issues',
    images: ['https://example.com/current-design.png']
  })
});
```

---

## Image Processing Details

### What the AI Sees

When you provide images, the AI can analyze:

**Visual Design:**
- Color palettes and schemes
- Typography (font families, sizes, weights)
- Spacing and padding patterns
- Border radius and shadows
- Layout structure and grid systems

**UI Components:**
- Button styles and states
- Input field designs
- Card/container styles
- Navigation patterns
- Icons and imagery

**UX Patterns:**
- Question flow and progression
- Form validation styles
- Error messaging design
- Success states
- Loading indicators

**Branding:**
- Logo placement and sizing
- Brand colors
- Custom graphics
- Illustration style
- Photo treatments

### What the AI Cannot Do

❌ **Cannot access:**
- Private URLs without authentication
- Local file paths from client
- Dynamically generated images without URL

❌ **Cannot guarantee:**
- Pixel-perfect replication (uses component library constraints)
- Exact font matching if font not available
- Custom graphics creation (will use alternatives)

✅ **Can approximate:**
- Overall visual style and feel
- Color schemes and spacing
- Layout patterns
- Component structures

---

## Performance Considerations

### Image Size Limits

- **Recommended:** < 5MB per image
- **Maximum:** 20MB per image
- **Multiple images:** Up to 10 images per request

### Optimization Tips

```typescript
// Compress images before sending
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Resize if too large
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as JPEG at 80% quality
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    };
  });
}
```

---

## Testing Image Support

### Test 1: Simple Image URL

```bash
curl -X POST http://localhost:3000/api/agents/surbee-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "input_as_text": "What colors are in this image?",
    "images": ["https://via.placeholder.com/300/FF0000/FFFFFF?text=Red"]
  }'
```

### Test 2: Base64 Image

```bash
curl -X POST http://localhost:3000/api/agents/surbee-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "input_as_text": "Create a survey matching this design",
    "images": ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="]
  }'
```

### Test 3: Multiple Images

```bash
curl -X POST http://localhost:3000/api/agents/surbee-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "input_as_text": "Compare these two survey designs",
    "images": [
      "https://example.com/design-a.png",
      "https://example.com/design-b.png"
    ]
  }'
```

---

## Error Handling

### Invalid Image Format

```json
{
  "error": "Invalid input: images must be an array",
  "stage": "error",
  "metadata": {
    "duration": 5,
    "timestamp": "2025-10-28T18:30:00.000Z",
    "version": "v2"
  }
}
```

### Image Load Failure

If an image URL fails to load, the AI will:
1. Log a warning
2. Continue processing with available images
3. Note in the response that some images were unavailable

---

## Best Practices

### 1. Provide Context with Images

**❌ Bad:**
```json
{
  "input_as_text": "Build this",
  "images": ["https://example.com/mockup.png"]
}
```

**✅ Good:**
```json
{
  "input_as_text": "Build a customer satisfaction survey that matches this mockup. Focus on the color scheme (blue/white) and the card-based layout with rounded corners.",
  "images": ["https://example.com/mockup.png"]
}
```

### 2. Use High-Quality Images

- Clear, high-resolution images
- Good lighting and contrast
- Relevant portions cropped
- Annotated if needed

### 3. Limit Image Count

- 1-3 images: Optimal
- 4-6 images: Acceptable
- 7+ images: May dilute focus

### 4. Combine with Text Instructions

Images + clear text instructions = best results

```json
{
  "input_as_text": "Create a survey with:\n- 5 rating questions\n- Blue color scheme from the brand guide\n- Card-based layout like the example\n- Mobile-responsive design",
  "images": [
    "https://company.com/brand-colors.png",
    "https://company.com/layout-example.png"
  ]
}
```

---

## Future Enhancements

### Planned Features

- [ ] PDF support for design documents
- [ ] Video frame extraction for demos
- [ ] Sketch/Figma file imports
- [ ] Image annotation overlay
- [ ] Design diff comparison
- [ ] Style guide extraction

---

## Summary

✅ **Multi-modal support** for text + images
✅ **Multiple formats** (base64, URLs, data URIs, binary)
✅ **Integrated throughout workflow** (optimization → building)
✅ **Visual design replication** with shadcn/ui components
✅ **Design analysis** for planning and recommendations
✅ **Flexible API** supporting various use cases

**Ready to use!** Simply include `images` array in your API requests.

---

*Image support added in Surbee Workflow V2*
*Documentation updated: 2025-10-28* 🎨
