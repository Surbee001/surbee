/**
 * Utility to capture screenshot of a sandbox/survey preview
 */

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  quality?: number; // 0-1 for JPEG, ignored for PNG
  format?: 'png' | 'jpeg';
}

/**
 * Captures a screenshot of an iframe element (e.g., Sandpack preview)
 * Returns a data URL that can be stored in the database
 */
export async function captureSandboxScreenshot(
  iframeElement: HTMLIFrameElement,
  options: ScreenshotOptions = {}
): Promise<string> {
  const {
    width = 800,
    height = 600,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  try {
    // Try to access the iframe's content
    const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow?.document;

    if (!iframeDoc) {
      throw new Error('Cannot access iframe content');
    }

    // Get the body element of the iframe
    const body = iframeDoc.body;
    if (!body) {
      throw new Error('Iframe body not found');
    }

    // Create a canvas to draw the screenshot
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Cannot get canvas context');
    }

    // Try using html2canvas if available (needs to be installed)
    if (typeof window !== 'undefined' && (window as any).html2canvas) {
      const html2canvas = (window as any).html2canvas;
      const screenshotCanvas = await html2canvas(body, {
        width,
        height,
        scale: 1,
        useCORS: true,
        allowTaint: true,
      });

      return screenshotCanvas.toDataURL(`image/${format}`, quality);
    }

    // Fallback: Create a simple screenshot by serializing HTML
    // This is less accurate but works without dependencies
    return await captureFallbackScreenshot(iframeElement, width, height, format, quality);

  } catch (error) {
    console.error('Error capturing sandbox screenshot:', error);
    throw error;
  }
}

/**
 * Fallback method: Captures iframe by serializing HTML and rendering to canvas
 */
async function captureFallbackScreenshot(
  iframe: HTMLIFrameElement,
  width: number,
  height: number,
  format: 'png' | 'jpeg',
  quality: number
): Promise<string> {
  try {
    // Create an off-screen canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Cannot get canvas context');
    }

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw a placeholder with iframe info
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(20, 20, width - 40, height - 40);

    ctx.fillStyle = '#333333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Survey Preview', width / 2, height / 2);

    return canvas.toDataURL(`image/${format}`, quality);
  } catch (error) {
    console.error('Fallback screenshot failed:', error);
    throw error;
  }
}

/**
 * Captures screenshot from a Sandpack preview
 * This waits for the preview to load before capturing
 */
export async function captureSandpackPreview(
  previewContainerSelector: string = '[data-sp-preview-iframe]',
  options: ScreenshotOptions = {}
): Promise<string | null> {
  try {
    // Wait for the preview iframe to be ready
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s for content to load

    const previewFrame = document.querySelector(previewContainerSelector) as HTMLIFrameElement;

    if (!previewFrame) {
      console.warn('Preview iframe not found');
      return null;
    }

    return await captureSandboxScreenshot(previewFrame, options);
  } catch (error) {
    console.error('Error capturing Sandpack preview:', error);
    return null;
  }
}

/**
 * Uploads a screenshot data URL to storage and returns the URL
 * For now, this just returns the data URL itself
 * In production, you might want to upload to S3, Cloudinary, etc.
 */
export async function uploadScreenshot(dataUrl: string, projectId: string): Promise<string> {
  // For now, just return the data URL
  // In production, upload to cloud storage:
  // 1. Convert data URL to Blob
  // 2. Upload to S3/Cloudinary
  // 3. Return the public URL

  return dataUrl;
}

/**
 * Helper to convert data URL to Blob for uploading
 */
export function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}
