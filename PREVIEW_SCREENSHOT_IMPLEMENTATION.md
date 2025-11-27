# Preview Screenshot & Survey Questions Implementation

## Overview
Implemented automatic screenshot capture of generated surveys and fixed the missing `survey_questions` table error. Project cards now display preview images of surveys.

---

## Issues Fixed

### ✅ Issue 1: Missing survey_questions Table
**Error:** `Could not find the table 'public.survey_questions' in the schema cache`

**Solution:** Created complete `survey_questions` table with RLS policies

### ✅ Issue 2: No Project Preview Screenshots
**Request:** "After every prompt that generates something, the system needs to screenshot the most recent preview, and have that be the preview of that project"

**Solution:** Implemented automatic screenshot capture and storage system

---

## Implementation Details

### 1. Database Migrations

#### **Migration 1: survey_questions Table** (`20250121_add_survey_questions.sql`)

```sql
CREATE TABLE public.survey_questions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  project_id TEXT NOT NULL REFERENCES projects(id),

  -- Question details
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'text_input', 'rating', 'yes_no')),
  order_index INTEGER NOT NULL,
  options TEXT[], -- For multiple_choice questions
  required BOOLEAN DEFAULT false,

  CONSTRAINT survey_questions_project_order UNIQUE (project_id, order_index)
);

-- Indexes + RLS Policies for security
```

**Features:**
- ✅ Full CRUD RLS policies
- ✅ Users can only access questions for their own projects
- ✅ Unique constraint on (project_id, order_index) to prevent duplicates
- ✅ Indexes for performance

#### **Migration 2: Project Preview Columns** (`20250121_add_project_preview.sql`)

```sql
ALTER TABLE projects
ADD COLUMN preview_image_url TEXT,
ADD COLUMN last_preview_generated_at TIMESTAMPTZ;

-- Indexes for filtering/sorting by preview
CREATE INDEX idx_projects_preview_url ON projects(preview_image_url)
WHERE preview_image_url IS NOT NULL;

CREATE INDEX idx_projects_last_preview ON projects(last_preview_generated_at DESC NULLS LAST);
```

**Features:**
- ✅ `preview_image_url` - Stores screenshot data URL or CDN URL
- ✅ `last_preview_generated_at` - Timestamp for tracking freshness
- ✅ Optimized indexes for queries

---

### 2. Screenshot Capture System

#### **Existing Utility** (`src/lib/capture-sandbox-screenshot.ts`)

Already had a screenshot utility that:
- ✅ Captures iframe content
- ✅ Supports html2canvas (if installed)
- ✅ Fallback placeholder generation
- ✅ Returns data URL for storage

**Functions:**
- `captureSandboxScreenshot()` - Main capture function
- `captureSandpackPreview()` - Capture from Sandpack iframe
- `uploadScreenshot()` - Upload handler (currently returns data URL)
- `dataURLtoBlob()` - Convert data URL to Blob for cloud upload

#### **New: Auto-Capture After Survey Generation** (`src/app/project/[id]/page.tsx`)

Added effect that triggers after `sandboxBundle` changes:

```typescript
useEffect(() => {
  if (!sandboxBundle || !projectId || !user?.id || isSandboxPreview) return;

  const capturePreview = async () => {
    // Wait for sandbox to render
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Find Sandpack preview iframe
    const previewFrame = document.querySelector('[data-sp-preview-iframe]');

    // Capture screenshot (800x600, JPEG, 0.8 quality)
    const screenshotDataUrl = await captureSandboxScreenshot(previewFrame, {
      width: 800,
      height: 600,
      quality: 0.8,
      format: 'jpeg'
    });

    // Save to database
    await fetch(`/api/projects/${projectId}/preview`, {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        previewImage: screenshotDataUrl,
        sandboxBundle: sandboxBundle,
      }),
    });

    console.log('✅ Preview screenshot saved');
  };

  capturePreview();
}, [sandboxBundle, projectId, user?.id, isSandboxPreview]);
```

**How It Works:**
1. Detects when `sandboxBundle` changes (new survey generated)
2. Waits 3 seconds for sandbox to fully render
3. Finds the Sandpack preview iframe
4. Captures screenshot as JPEG data URL
5. Saves to database via API
6. Logs success

**Skips When:**
- ✅ No sandbox bundle (no survey yet)
- ✅ `isSandboxPreview` mode (viewing preview in manage page)
- ✅ No user ID (not logged in)

---

### 3. API Endpoint Updates

#### **Updated** (`src/app/api/projects/[id]/preview/route.ts`)

Changed to use new column names:

```typescript
// Before
preview_image: previewImage || null,

// After
preview_image_url: previewImage || null,
last_preview_generated_at: previewImage ? new Date().toISOString() : null,
```

**Endpoints:**
- **POST** `/api/projects/[id]/preview` - Save screenshot + sandbox bundle
- Verifies user owns project
- Updates both preview URL and timestamp
- Returns updated project

---

### 4. Project Cards with Previews

#### **Updated** (`src/components/my-projects/project-card.tsx`)

Changed from hardcoded image to dynamic preview:

```typescript
// Before
<div
  className="..."
  style={{
    backgroundImage: 'url("https://endlesstools.io/embeds/4.png")',
  }}
/>

// After
<div
  className="..."
  style={{
    backgroundImage: project.preview_image_url
      ? `url("${project.preview_image_url}")`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }}
>
  {!project.preview_image_url && (
    <div className="...">
      <p>No preview yet</p>
    </div>
  )}
</div>
```

**Features:**
- ✅ Shows actual survey screenshot if available
- ✅ Shows gradient + "No preview yet" text if not available
- ✅ Maintains aspect ratio (210:119)
- ✅ Smooth hover effects

#### **Type Updates** (`src/types/index.ts`)

```typescript
export interface Project {
  title: string;
  html: string;
  prompts: string[];
  user_id: string;
  space_id: string;
  preview_image_url?: string;        // NEW
  last_preview_generated_at?: Date;  // NEW
  // ...
}
```

---

## User Flow

### Scenario: User Creates Survey

```
1. User chats with AI to generate survey
   ↓
2. AI generates survey code (sandbox bundle)
   ↓
3. Sandbox bundle saved to state
   ↓
4. Screenshot effect triggers
   ↓
5. Wait 3 seconds for sandbox to render
   ↓
6. Capture screenshot of preview iframe (800x600 JPEG)
   ↓
7. POST screenshot + bundle to /api/projects/[id]/preview
   ↓
8. Database updates:
      - preview_image_url = data:image/jpeg;base64,...
      - last_preview_generated_at = 2025-01-21T...
      - sandbox_bundle = {...}
   ↓
9. User navigates to dashboard
   ↓
10. Project cards fetch projects with preview_image_url
   ↓
11. Cards display screenshot thumbnails
```

**Result:** Every project card shows actual survey preview! 🎉

---

## Files Modified/Created

### **New Migration Files:**
1. ✅ `supabase/migrations/20250121_add_survey_questions.sql`
2. ✅ `supabase/migrations/20250121_add_project_preview.sql`

### **Modified Files:**
1. ✅ `src/app/api/projects/[id]/preview/route.ts`
   - Updated to use `preview_image_url` and `last_preview_generated_at`

2. ✅ `src/app/project/[id]/page.tsx`
   - Added auto-capture effect after sandbox bundle creation

3. ✅ `src/components/my-projects/project-card.tsx`
   - Display actual preview images or placeholder

4. ✅ `src/types/index.ts`
   - Added `preview_image_url` and `last_preview_generated_at` to Project type

### **Documentation:**
5. ✅ `PREVIEW_SCREENSHOT_IMPLEMENTATION.md` (this file)

---

## How to Apply Database Migrations

### **Option 1: Manual (Supabase Dashboard)**

1. Go to your Supabase Dashboard → SQL Editor
2. Copy content from `supabase/migrations/20250121_add_survey_questions.sql`
3. Run the SQL
4. Repeat for `supabase/migrations/20250121_add_project_preview.sql`

### **Option 2: Using Supabase CLI**

```bash
# If you've already linked your project
npm run db:push

# First time? Link your project first:
./supabase-cli link --project-ref <your-project-ref>
npm run db:push
```

---

## Testing Steps

### Test 1: Survey Questions Table
```sql
-- After applying migration, check table exists
SELECT * FROM public.survey_questions LIMIT 1;

-- Should return: (no rows) or existing data

-- Try inserting test data
INSERT INTO public.survey_questions (project_id, question_text, question_type, order_index)
VALUES ('test-project-id', 'How satisfied are you?', 'rating', 1);

-- Should succeed if you own the project
```

### Test 2: Project Preview Columns
```sql
-- Check columns exist
SELECT preview_image_url, last_preview_generated_at
FROM public.projects
LIMIT 1;

-- Should return: NULL values (until screenshots are captured)
```

### Test 3: Screenshot Capture
1. Open project page: `/project/{projectId}`
2. Chat with AI to generate a survey
3. Wait for sandbox to render
4. Open browser DevTools → Console
5. Look for: `✅ Preview screenshot saved successfully`
6. Check Network tab for POST to `/api/projects/{id}/preview`

### Test 4: Project Cards
1. Navigate to dashboard: `/dashboard`
2. Look at project cards
3. **If survey generated:** Should show screenshot thumbnail
4. **If no survey yet:** Should show gradient + "No preview yet"

### Test 5: Insights Page
1. Navigate to project manage: `/project/{id}/manage`
2. Click "Insights" tab
3. **Before migration:** Error: `Could not find table 'public.survey_questions'`
4. **After migration:** ✅ Insights page loads (may be empty if no questions)

---

## Screenshot Storage Options

### **Current: Data URLs** (Implemented)

**Pros:**
- ✅ No external service needed
- ✅ No additional costs
- ✅ Works immediately
- ✅ Simple implementation

**Cons:**
- ⚠️ Large database rows (base64 encoded images ~1-2MB each)
- ⚠️ Slower database queries
- ⚠️ Not ideal for high-traffic apps

### **Future: Cloud Storage** (Recommended for Production)

**Upgrade to Cloudinary/AWS S3/Supabase Storage:**

```typescript
// In capture-sandbox-screenshot.ts
export async function uploadScreenshot(dataUrl: string, projectId: string): Promise<string> {
  // Convert data URL to Blob
  const blob = dataURLtoBlob(dataUrl);

  // Upload to Supabase Storage
  const { data, error } = await supabaseClient.storage
    .from('project-previews')
    .upload(`${projectId}/preview.jpg`, blob, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabaseClient.storage
    .from('project-previews')
    .getPublicUrl(`${projectId}/preview.jpg`);

  return urlData.publicUrl;
}
```

**Benefits:**
- ✅ Smaller database rows (just store URL string)
- ✅ Faster queries
- ✅ CDN delivery for images
- ✅ Image optimization/transformation
- ✅ Better scalability

---

## Screenshot Quality Settings

Current settings (configurable):

```typescript
{
  width: 800,        // Screenshot width
  height: 600,       // Screenshot height
  quality: 0.8,      // JPEG quality (0.0 - 1.0)
  format: 'jpeg'     // 'jpeg' or 'png'
}
```

**Recommendations:**
- **JPEG (0.7-0.8)**: Smaller file size, good for dashboards (Current)
- **PNG**: Lossless, larger size, better for detailed surveys
- **Lower quality (0.6)**: Faster upload, smaller storage
- **Higher resolution (1200x900)**: Better for high-DPI displays

---

## Benefits

### ✅ For Users
- **Visual Project Library:** See survey previews at a glance
- **Quick Identification:** Find projects by appearance
- **Professional Look:** Dashboard looks polished and modern
- **No Manual Work:** Screenshots captured automatically

### ✅ For Development
- **Audit Trail:** Visual history of survey generations
- **Debugging:** See exact survey appearance
- **Analytics:** Track when surveys were last updated
- **Marketing:** Use previews in promotional materials

### ✅ For Insights Page
- **No More Errors:** `survey_questions` table now exists
- **Future Analytics:** Can query questions for insights
- **Survey Structure:** Can analyze question types and order

---

## Future Enhancements

### 1. **Cloud Storage Integration**
- Upload to Supabase Storage/S3/Cloudinary
- Reduce database size
- Enable CDN delivery

### 2. **Screenshot Variations**
- Thumbnail (200x150) for cards
- Full size (1600x1200) for detail view
- Mobile preview (375x667)

### 3. **Manual Re-Capture**
- Button to regenerate screenshot
- Useful after survey edits
- Update preview without generating new survey

### 4. **Preview Gallery**
- Show all versions of a survey
- Compare changes over time
- Restore previous versions

### 5. **Social Sharing**
- Share survey preview on Twitter/LinkedIn
- Generate OG images for links
- Create survey templates library

### 6. **Question Analytics** (Now Possible!)
- Most common question types
- Average questions per survey
- Question completion rates
- Popular response options

---

## Troubleshooting

### Issue: Screenshots Not Captured

**Symptoms:** `Console.warn('Preview iframe not found for screenshot')`

**Solutions:**
1. Check if sandbox is actually rendering
2. Increase wait time (change 3000ms to 5000ms)
3. Verify Sandpack is using correct iframe selector
4. Check browser console for errors

### Issue: Large Database Rows

**Symptoms:** Slow project queries, large database size

**Solutions:**
1. Reduce screenshot quality (0.8 → 0.6)
2. Reduce dimensions (800x600 → 640x480)
3. Use PNG for transparency, JPEG for solid backgrounds
4. Upgrade to cloud storage (recommended)

### Issue: Insights Page Still Errors

**Symptoms:** After migration, still getting "table not found"

**Solutions:**
1. Verify migration ran successfully:
   ```sql
   SELECT * FROM supabase_migrations WHERE name LIKE '%survey_questions%';
   ```
2. Check table exists:
   ```sql
   \dt public.survey_questions
   ```
3. Re-run migration if needed
4. Clear Supabase cache (Dashboard → Settings → Clear Cache)

### Issue: Preview Shows "No preview yet" Even After Generation

**Symptoms:** Survey generated but card shows placeholder

**Solutions:**
1. Check browser console for screenshot capture errors
2. Verify POST to `/api/projects/{id}/preview` succeeded
3. Check database:
   ```sql
   SELECT id, preview_image_url FROM projects WHERE id = 'your-project-id';
   ```
4. Ensure preview_image_url is not NULL
5. Reload dashboard to fetch latest data

---

## Security Considerations

### ✅ RLS Policies
- Users can only access their own survey questions
- Users can only update their own project previews
- All queries filtered by `auth.uid() = user_id`

### ✅ Data Validation
- Screenshot format validated (JPEG/PNG only)
- File size implicitly limited by base64 encoding
- User must own project to update preview

### ✅ CORS & Iframe Security
- Screenshot capture respects same-origin policy
- Falls back to placeholder if iframe inaccessible
- No sensitive data exposed in screenshots

---

## Performance Impact

### ✅ Minimal Impact on User Experience
- Screenshot capture runs asynchronously
- Doesn't block UI rendering
- 3-second delay after survey generation (acceptable)

### ⚠️ Database Considerations
- Base64 encoded images: ~1-2MB per screenshot
- Consider cloud storage for >1000 projects
- Indexes optimize query performance

### 🎯 Optimization Tips
1. Use JPEG at 0.7 quality for 30% smaller files
2. Implement lazy loading for project cards
3. Cache preview URLs in browser
4. Upgrade to cloud storage at scale

---

## Migration Status

### ✅ Ready to Apply
- `20250121_add_survey_questions.sql`
- `20250121_add_project_preview.sql`

### ⏳ Pending
- Apply migrations via Supabase Dashboard or CLI

### ✅ Code Deployed
- All code changes implemented
- TypeScript compiles successfully
- Ready for testing once migrations applied

---

**Version**: 1.0
**Date**: 2025-01-21
**Status**: Fully Implemented ✅
**Migrations Required**: Yes (2 files)
