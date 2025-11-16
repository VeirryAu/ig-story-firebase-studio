/**
 * Screenshot Utilities
 * Functions to capture screenshots of the current slide
 */

/**
 * Captures a screenshot of a specific element, excluding navigation buttons
 * @param element - The element to capture (defaults to story viewer container)
 * @param excludeSelectors - CSS selectors for elements to exclude from screenshot
 * @returns Promise<string> - Base64 data URL of the screenshot
 */
export async function captureScreenshot(
  element?: HTMLElement,
  excludeSelectors: string[] = [
    'button[aria-label="Previous Story"]',
    'button[aria-label="Next Story"]',
    'button[aria-label="Close stories"]',
    'button[aria-label*="Mute"]',
    'button[aria-label*="Unmute"]',
    '[aria-label="Previous slide"]',
    '[aria-label="Next slide"]',
    '.story-progress-bar', // Progress bar
  ]
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Find the story viewer container if not provided
      const targetElement = element || document.querySelector('.story-viewer-container') as HTMLElement;
      
      if (!targetElement) {
        reject(new Error('Target element not found'));
        return;
      }

      // Hide navigation elements temporarily
      const hiddenElements: HTMLElement[] = [];
      excludeSelectors.forEach(selector => {
        const elements = targetElement.querySelectorAll(selector);
        elements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style.display !== 'none') {
            htmlEl.style.visibility = 'hidden';
            hiddenElements.push(htmlEl);
          }
        });
      });

      // Use html2canvas if available, otherwise use native canvas
      if (typeof window !== 'undefined' && (window as any).html2canvas) {
        (window as any).html2canvas(targetElement, {
          backgroundColor: null,
          scale: 2, // Higher quality
          useCORS: true,
          logging: false,
        }).then((canvas: HTMLCanvasElement) => {
          // Restore hidden elements
          hiddenElements.forEach(el => {
            el.style.visibility = '';
          });
          
          const dataUrl = canvas.toDataURL('image/png');
          resolve(dataUrl);
        }).catch((error: Error) => {
          // Restore hidden elements on error
          hiddenElements.forEach(el => {
            el.style.visibility = '';
          });
          reject(error);
        });
      } else {
        // Fallback: Use native canvas API (limited functionality)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          hiddenElements.forEach(el => {
            el.style.visibility = '';
          });
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = targetElement.offsetWidth;
        canvas.height = targetElement.offsetHeight;

        // Note: This fallback method has limitations and may not capture all content
        // For production, html2canvas library should be used
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Restore hidden elements
        hiddenElements.forEach(el => {
          el.style.visibility = '';
        });

        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Captures screenshot and converts to blob URL for sharing
 * @param element - The element to capture
 * @returns Promise<string> - Blob URL of the screenshot
 */
export async function captureScreenshotAsBlobUrl(
  element?: HTMLElement
): Promise<string> {
  const dataUrl = await captureScreenshot(element);
  
  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  
  return blobUrl;
}

