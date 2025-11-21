# Survey Preview & Screenshot Setup

This guide explains how the survey preview and screenshot functionality works in Surbee.

## Database Changes

Two new columns have been added to the `projects` table:

1. **`preview_image`** (TEXT): Stores a screenshot of the survey (data URL or cloud storage URL)
2. **`sandbox_bundle`** (JSONB): Stores the sandbox files and configuration for rendering the survey

### Running the Migration

To apply these changes to your database:

```bash
# If using Supabase CLI
supabase migration up

# Or apply the SQL directly in your Supabase dashboard
# Run the contents of: supabase/migrations/20250112_add_preview_and_sandbox.sql
```

## How It Works

### 1. Preview Image Capture

The preview image is automatically generated from the sandbox when:
- A survey is created or updated
- A project is published

The capture happens using the `captureSandboxScreenshot()` utility from `src/lib/capture-sandbox-screenshot.ts`.

### 2. Displaying Preview Images

Preview images are displayed in:

#### Project Cards (`src/components/project-card/ProjectCard.tsx`)
The `previewImage` prop shows the screenshot instead of a placeholder.

#### Analytics Page (`src/app/dashboard/projects/[id]/analytics/page.tsx`)
Shows a "Survey Preview" card with the screenshot and a link to view the live survey.

### 3. Updating Preview Images

To update a project's preview image, use the API endpoint:

```typescript
POST /api/projects/[id]/preview

Body: {
  userId: string,
  previewImage: string,  // Data URL or cloud URL
  sandboxBundle?: any     // Optional: sandbox configuration
}
```

## Implementation Guide

### For the Project Page

To automatically capture screenshots when the survey is updated:

```typescript
import { captureSandpackPreview, uploadScreenshot } from '@/lib/capture-sandbox-screenshot';

// After the sandbox/survey is rendered and loaded
const captureAndSavePreview = async (projectId: string, userId: string) => {
  try {
    // Wait for sandbox to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Capture screenshot
    const screenshot = await captureSandpackPreview();

    if (screenshot) {
      // Upload (currently just returns the data URL)
      const imageUrl = await uploadScreenshot(screenshot, projectId);

      // Save to database
      await fetch(`/api/projects/${projectId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          previewImage: imageUrl,
          sandboxBundle: getCurrentSandboxBundle() // Your sandbox state
        })
      });
    }
  } catch (error) {
    console.error('Failed to capture preview:', error);
  }
};
```

### For Production: Upload to Cloud Storage

The current implementation stores screenshots as data URLs in the database. For production, you should:

1. Convert data URL to Blob:
```typescript
import { dataURLtoBlob } from '@/lib/capture-sandbox-screenshot';

const blob = dataURLtoBlob(screenshot);
```

2. Upload to S3/Cloudinary/etc:
```typescript
// Example with Cloudinary
const formData = new FormData();
formData.append('file', blob);
formData.append('upload_preset', 'your_preset');

const response = await fetch('https://api.cloudinary.com/v1_1/your-cloud/image/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
const imageUrl = data.secure_url;
```

3. Save the cloud URL instead of data URL.

## Troubleshooting

### Screenshot is blank or shows placeholder

- Make sure the sandbox iframe has loaded before capturing
- Increase the wait time in `captureSandpackPreview()`
- Check browser console for CORS errors

### Screenshots are too large

- Data URLs can be large (~500KB for a typical screenshot)
- Consider uploading to cloud storage instead
- Reduce screenshot dimensions in options:
  ```typescript
  await captureSandpackPreview('selector', {
    width: 600,
    height: 400,
    quality: 0.7,
    format: 'jpeg' // JPEG is smaller than PNG
  });
  ```

### Preview not showing in analytics page

- Verify the project has a `preview_image` value in the database
- Check that the project is published (has `published_url`)
- Ensure the image URL or data URL is valid

## Next Steps

1. **Install html2canvas (optional)**: For better screenshot quality
   ```bash
   npm install html2canvas
   ```

2. **Set up cloud storage**: Configure S3, Cloudinary, or similar service

3. **Add automatic capture**: Integrate screenshot capture into your publish workflow

4. **Add manual capture button**: Let users manually refresh the preview image
