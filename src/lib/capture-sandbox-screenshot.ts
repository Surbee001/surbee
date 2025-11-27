/**
 * Utility to capture/generate screenshot of a survey preview
 */

export interface ScreenshotOptions {
  width?: number;
  height?: number;
  quality?: number; // 0-1 for JPEG, ignored for PNG
  format?: 'png' | 'jpeg';
}

export interface SurveyQuestion {
  question_text: string;
  question_type: string;
  options?: string[];
}

/**
 * Generates a visual preview image from survey schema
 * This is more reliable than trying to capture cross-origin iframes
 */
export async function generateSurveyPreview(
  questions: SurveyQuestion[],
  options: ScreenshotOptions = {}
): Promise<string> {
  // Use smaller dimensions to keep the image under PostgreSQL limits
  const {
    width = 400,
    height = 300,
    quality = 0.5,
    format = 'jpeg'
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Cannot get canvas context');
  }

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a1a');
  gradient.addColorStop(1, '#0d0d0d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Scale factor for smaller canvas
  const scale = width / 800;

  // Draw card background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  roundRect(ctx, 20 * scale, 20 * scale, width - 40 * scale, height - 40 * scale, 8 * scale);
  ctx.fill();

  // Draw survey header
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = `bold ${Math.round(16 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('Survey Preview', 35 * scale, 50 * scale);

  // Draw divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35 * scale, 60 * scale);
  ctx.lineTo(width - 35 * scale, 60 * scale);
  ctx.stroke();

  // Draw questions - show fewer on smaller canvas
  let yOffset = 75 * scale;
  const maxQuestions = Math.min(questions.length, 3);

  for (let i = 0; i < maxQuestions; i++) {
    const q = questions[i];

    // Question number badge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(45 * scale, yOffset + 8 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `600 ${Math.round(10 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${i + 1}`, 45 * scale, yOffset + 11 * scale);

    // Question text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `500 ${Math.round(11 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    const questionText = truncateText(q.question_text, 40);
    ctx.fillText(questionText, 60 * scale, yOffset + 11 * scale);

    // Question type badge
    const typeLabel = getQuestionTypeLabel(q.question_type);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.font = `400 ${Math.round(9 * scale)}px system-ui, -apple-system, sans-serif`;
    const typeBadgeWidth = ctx.measureText(typeLabel).width + 10 * scale;
    roundRect(ctx, 60 * scale, yOffset + 16 * scale, typeBadgeWidth, 14 * scale, 3 * scale);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText(typeLabel, 65 * scale, yOffset + 26 * scale);

    yOffset += 55 * scale;
  }

  // Draw "more questions" indicator if there are more
  if (questions.length > maxQuestions) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = `400 ${Math.round(10 * scale)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`+ ${questions.length - maxQuestions} more questions`, width / 2, height - 25 * scale);
  }

  // Draw footer
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = `400 ${Math.round(8 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText('Powered by Surbee', width - 35 * scale, height - 12 * scale);

  return canvas.toDataURL(`image/${format}`, quality);
}

/**
 * Legacy function for backwards compatibility
 */
export async function captureSandboxScreenshot(
  iframeElement: HTMLIFrameElement,
  options: ScreenshotOptions = {}
): Promise<string> {
  // Use smaller dimensions to keep the image under PostgreSQL limits
  const {
    width = 400,
    height = 300,
    quality = 0.5,
    format = 'jpeg'
  } = options;

  // Sandpack iframes are cross-origin, so we can't access their content
  // Generate a stylized placeholder instead
  return generatePlaceholderPreview(width, height, format, quality);
}

/**
 * Generates a stylized placeholder preview when we can't capture the actual content
 */
function generatePlaceholderPreview(
  width: number,
  height: number,
  format: 'png' | 'jpeg',
  quality: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Cannot get canvas context');
  }

  // Scale factor for smaller canvas
  const scale = width / 800;

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a1a');
  gradient.addColorStop(1, '#0d0d0d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw card
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  roundRect(ctx, 30 * scale, 30 * scale, width - 60 * scale, height - 60 * scale, 8 * scale);
  ctx.fill();

  // Draw decorative elements
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  roundRect(ctx, 50 * scale, 50 * scale, width - 100 * scale, 25 * scale, 4 * scale);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  roundRect(ctx, 50 * scale, 85 * scale, width - 100 * scale, 40 * scale, 4 * scale);
  ctx.fill();

  roundRect(ctx, 50 * scale, 135 * scale, width - 100 * scale, 40 * scale, 4 * scale);
  ctx.fill();

  roundRect(ctx, 50 * scale, 185 * scale, (width - 100 * scale) * 0.6, 25 * scale, 4 * scale);
  ctx.fill();

  // Draw text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = `bold ${Math.round(12 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Survey Preview', width / 2, height - 40 * scale);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = `${Math.round(9 * scale)}px system-ui, -apple-system, sans-serif`;
  ctx.fillText('Click to view', width / 2, height - 25 * scale);

  return canvas.toDataURL(`image/${format}`, quality);
}

// Helper functions

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    text: 'Text Input',
    email: 'Email',
    textarea: 'Long Text',
    multiple_choice: 'Multiple Choice',
    checkbox: 'Checkboxes',
    radio: 'Single Choice',
    select: 'Dropdown',
    rating_scale: 'Rating Scale',
    nps: 'NPS',
    range: 'Slider',
    date: 'Date Picker',
    number: 'Number',
    matrix: 'Matrix',
    other: 'Custom'
  };
  return labels[type] || type;
}

function drawQuestionInput(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  maxWidth: number,
  options?: string[]
) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';

  switch (type) {
    case 'text':
    case 'email':
    case 'number':
      // Draw input field
      roundRect(ctx, x, y - 20, Math.min(maxWidth, 400), 32, 6);
      ctx.fill();
      break;

    case 'textarea':
      // Draw textarea
      roundRect(ctx, x, y - 20, Math.min(maxWidth, 500), 60, 6);
      ctx.fill();
      break;

    case 'multiple_choice':
    case 'radio':
      // Draw radio options
      const radioOpts = options?.slice(0, 3) || ['Option 1', 'Option 2', 'Option 3'];
      radioOpts.forEach((opt, i) => {
        // Radio circle
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x + 8, y - 10 + (i * 24), 6, 0, Math.PI * 2);
        ctx.stroke();

        // Option text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '400 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(truncateText(opt, 30), x + 22, y - 6 + (i * 24));
      });
      break;

    case 'checkbox':
      // Draw checkbox options
      const checkOpts = options?.slice(0, 3) || ['Option 1', 'Option 2', 'Option 3'];
      checkOpts.forEach((opt, i) => {
        // Checkbox square
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, x + 2, y - 16 + (i * 24), 12, 12, 2);
        ctx.stroke();

        // Option text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '400 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(truncateText(opt, 30), x + 22, y - 6 + (i * 24));
      });
      break;

    case 'rating_scale':
    case 'nps':
      // Draw rating circles
      const count = type === 'nps' ? 10 : 5;
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = i < 2 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.06)';
        ctx.beginPath();
        ctx.arc(x + 16 + (i * 32), y - 5, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '500 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${i + 1}`, x + 16 + (i * 32), y - 1);
      }
      break;

    case 'range':
      // Draw slider
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      roundRect(ctx, x, y - 12, Math.min(maxWidth, 300), 8, 4);
      ctx.fill();

      // Slider fill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      roundRect(ctx, x, y - 12, 120, 8, 4);
      ctx.fill();

      // Slider thumb
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x + 120, y - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'select':
      // Draw dropdown
      roundRect(ctx, x, y - 20, Math.min(maxWidth, 250), 32, 6);
      ctx.fill();

      // Dropdown arrow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      const arrowX = x + Math.min(maxWidth, 250) - 20;
      ctx.moveTo(arrowX - 4, y - 8);
      ctx.lineTo(arrowX + 4, y - 8);
      ctx.lineTo(arrowX, y - 2);
      ctx.closePath();
      ctx.fill();
      break;

    default:
      // Generic input
      roundRect(ctx, x, y - 20, Math.min(maxWidth, 400), 32, 6);
      ctx.fill();
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
    await new Promise(resolve => setTimeout(resolve, 2000));

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
