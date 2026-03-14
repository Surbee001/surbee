/**
 * Capture a real screenshot of the first page card in the block editor.
 * Uses html-to-image to render the DOM element to a PNG data URL.
 */

let capturePromise: Promise<string | null> | null = null

export async function capturePageScreenshot(): Promise<string | null> {
  // Prevent concurrent captures
  if (capturePromise) return capturePromise

  capturePromise = (async () => {
    try {
      const { toPng } = await import('html-to-image')

      // Find the first page card in the editor
      const card = document.querySelector('[data-page-id]') as HTMLElement
      if (!card) return null

      const dataUrl = await toPng(card, {
        quality: 0.8,
        pixelRatio: 1, // 1x for smaller file size
        cacheBust: true,
        style: {
          // Remove any selection outlines for clean screenshot
          outline: 'none',
          boxShadow: 'none',
          border: 'none',
          borderRadius: '8px',
        },
      })

      return dataUrl
    } catch (err) {
      console.error('[Thumbnail] Screenshot failed:', err)
      return null
    } finally {
      capturePromise = null
    }
  })()

  return capturePromise
}
