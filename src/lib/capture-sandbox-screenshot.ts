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
  // Higher resolution for better quality
  const {
    width = 800,
    height = 600,
    quality = 0.92,
    format = 'png'
  } = options;

  const canvas = document.createElement('canvas');
  // Use 2x resolution for retina displays
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Cannot get canvas context');
  }

  // Scale for retina
  ctx.scale(dpr, dpr);

  // Beautiful gradient background - mimicking a modern survey interface
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#0a0a0a');
  bgGradient.addColorStop(0.5, '#111111');
  bgGradient.addColorStop(1, '#0d0d0d');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let i = 0; i < width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for (let i = 0; i < height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  // Main card container with subtle glow
  const cardX = 40;
  const cardY = 40;
  const cardWidth = width - 80;
  const cardHeight = height - 80;

  // Card shadow/glow
  ctx.shadowColor = 'rgba(255, 255, 255, 0.05)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Card background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 16);
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Card border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 16);
  ctx.stroke();

  // Progress bar at top
  const progressY = cardY + 24;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  roundRect(ctx, cardX + 32, progressY, cardWidth - 64, 4, 2);
  ctx.fill();

  // Progress fill (show ~30%)
  const progressGradient = ctx.createLinearGradient(cardX + 32, 0, cardX + 32 + (cardWidth - 64) * 0.3, 0);
  progressGradient.addColorStop(0, 'rgba(134, 239, 172, 0.8)');
  progressGradient.addColorStop(1, 'rgba(134, 239, 172, 0.4)');
  ctx.fillStyle = progressGradient;
  roundRect(ctx, cardX + 32, progressY, (cardWidth - 64) * 0.3, 4, 2);
  ctx.fill();

  // Draw questions with modern styling
  let yOffset = cardY + 60;
  const maxQuestions = Math.min(questions.length, 4);
  const questionSpacing = (cardHeight - 120) / Math.max(maxQuestions, 1);

  for (let i = 0; i < maxQuestions; i++) {
    const q = questions[i];
    const isActive = i === 0; // First question highlighted

    // Question container
    if (isActive) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      roundRect(ctx, cardX + 24, yOffset - 12, cardWidth - 48, questionSpacing - 16, 12);
      ctx.fill();
    }

    // Question number
    const numberBg = isActive ? 'rgba(134, 239, 172, 0.2)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fillStyle = numberBg;
    ctx.beginPath();
    ctx.arc(cardX + 56, yOffset + 20, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isActive ? 'rgba(134, 239, 172, 1)' : 'rgba(255, 255, 255, 0.6)';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${i + 1}`, cardX + 56, yOffset + 25);

    // Question text
    ctx.fillStyle = isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)';
    ctx.font = `${isActive ? '600' : '500'} 16px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'left';
    const questionText = truncateText(q.question_text, 50);
    ctx.fillText(questionText, cardX + 88, yOffset + 26);

    // Input field placeholder for active question
    if (isActive) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      roundRect(ctx, cardX + 88, yOffset + 44, Math.min(400, cardWidth - 140), 44, 8);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      roundRect(ctx, cardX + 88, yOffset + 44, Math.min(400, cardWidth - 140), 44, 8);
      ctx.stroke();

      // Placeholder text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '400 14px system-ui, -apple-system, sans-serif';
      ctx.fillText('Type your answer...', cardX + 104, yOffset + 72);
    }

    yOffset += questionSpacing;
  }

  // More questions indicator
  if (questions.length > maxQuestions) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '500 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`+ ${questions.length - maxQuestions} more questions`, width / 2, height - 60);
  }

  // Navigation buttons at bottom
  const btnY = height - 80;

  // Back button
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  roundRect(ctx, cardX + 32, btnY, 100, 40, 8);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '500 14px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Back', cardX + 82, btnY + 26);

  // Next/Submit button
  const nextBtnGradient = ctx.createLinearGradient(cardX + cardWidth - 132, btnY, cardX + cardWidth - 32, btnY);
  nextBtnGradient.addColorStop(0, 'rgba(134, 239, 172, 0.9)');
  nextBtnGradient.addColorStop(1, 'rgba(134, 239, 172, 0.7)');
  ctx.fillStyle = nextBtnGradient;
  roundRect(ctx, cardX + cardWidth - 132, btnY, 100, 40, 8);
  ctx.fill();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.font = '600 14px system-ui, -apple-system, sans-serif';
  ctx.fillText('Next', cardX + cardWidth - 82, btnY + 26);

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
  // Use 2x resolution for retina displays
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Cannot get canvas context');
  }

  ctx.scale(dpr, dpr);

  // Beautiful gradient background
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#0a0a0a');
  bgGradient.addColorStop(0.5, '#111111');
  bgGradient.addColorStop(1, '#0d0d0d');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let i = 0; i < width; i += 30) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for (let i = 0; i < height; i += 30) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  // Main card
  const cardX = 24;
  const cardY = 24;
  const cardWidth = width - 48;
  const cardHeight = height - 48;

  ctx.shadowColor = 'rgba(255, 255, 255, 0.03)';
  ctx.shadowBlur = 30;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 12);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 12);
  ctx.stroke();

  // Progress bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  roundRect(ctx, cardX + 20, cardY + 20, cardWidth - 40, 3, 1.5);
  ctx.fill();

  const progressGradient = ctx.createLinearGradient(cardX + 20, 0, cardX + 20 + (cardWidth - 40) * 0.3, 0);
  progressGradient.addColorStop(0, 'rgba(134, 239, 172, 0.8)');
  progressGradient.addColorStop(1, 'rgba(134, 239, 172, 0.4)');
  ctx.fillStyle = progressGradient;
  roundRect(ctx, cardX + 20, cardY + 20, (cardWidth - 40) * 0.3, 3, 1.5);
  ctx.fill();

  // Placeholder content lines
  const contentY = cardY + 50;
  const lineHeight = 24;

  // Active question area
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  roundRect(ctx, cardX + 16, contentY, cardWidth - 32, 80, 8);
  ctx.fill();

  // Question number
  ctx.fillStyle = 'rgba(134, 239, 172, 0.2)';
  ctx.beginPath();
  ctx.arc(cardX + 40, contentY + 24, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(134, 239, 172, 0.9)';
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('1', cardX + 40, contentY + 28);

  // Question text placeholder
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  roundRect(ctx, cardX + 64, contentY + 14, cardWidth - 100, 20, 4);
  ctx.fill();

  // Input field
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  roundRect(ctx, cardX + 64, contentY + 44, cardWidth - 100, 28, 6);
  ctx.fill();

  // Other question lines
  for (let i = 0; i < 2; i++) {
    const y = contentY + 100 + i * lineHeight;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(cardX + 40, y + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    roundRect(ctx, cardX + 64, y + 4, cardWidth - 100, 12, 3);
    ctx.fill();
  }

  // Buttons at bottom
  const btnY = cardY + cardHeight - 44;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  roundRect(ctx, cardX + 20, btnY, 70, 28, 6);
  ctx.fill();

  const nextGradient = ctx.createLinearGradient(cardX + cardWidth - 90, btnY, cardX + cardWidth - 20, btnY);
  nextGradient.addColorStop(0, 'rgba(134, 239, 172, 0.9)');
  nextGradient.addColorStop(1, 'rgba(134, 239, 172, 0.7)');
  ctx.fillStyle = nextGradient;
  roundRect(ctx, cardX + cardWidth - 90, btnY, 70, 28, 6);
  ctx.fill();

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
