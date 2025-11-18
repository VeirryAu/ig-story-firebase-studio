import html2canvas from 'html2canvas';

/**
 * Screenshot Utilities
 * Functions to capture screenshots of the current slide
 */

const DEFAULT_EXCLUDE_SELECTORS = [
  'button[aria-label="Previous Story"]',
  'button[aria-label="Next Story"]',
  'button[aria-label="Close stories"]',
  'button[aria-label*="Mute"]',
  'button[aria-label*="Unmute"]',
  '[aria-label="Previous slide"]',
  '[aria-label="Next slide"]',
  '.story-progress-bar',
  '.share-button-container',
  '[data-share-exclude="true"]',
];

interface HiddenElementState {
  element: HTMLElement;
  previousVisibility: string;
}

function hideElements(targetElement: HTMLElement, selectors: string[]): HiddenElementState[] {
  const hiddenElements: HiddenElementState[] = [];

  selectors.forEach((selector) => {
    const elements = targetElement.querySelectorAll<HTMLElement>(selector);
    elements.forEach((element) => {
      // Avoid duplicates
      const alreadyHidden = hiddenElements.find((entry) => entry.element === element);
      if (alreadyHidden) {
        return;
      }

      hiddenElements.push({
        element,
        previousVisibility: element.style.visibility,
      });

      element.style.visibility = 'hidden';
    });
  });

  return hiddenElements;
}

function restoreElements(hiddenElements: HiddenElementState[]) {
  hiddenElements.forEach(({ element, previousVisibility }) => {
    element.style.visibility = previousVisibility;
  });
}

/**
 * Captures a screenshot of a specific element, excluding navigation buttons
 * @param element - The element to capture (defaults to story viewer container)
 * @param excludeSelectors - CSS selectors for elements to exclude from screenshot
 * @returns Promise<string> - Base64 data URL of the screenshot
 */
export async function captureScreenshot(
  element?: HTMLElement,
  excludeSelectors: string[] = DEFAULT_EXCLUDE_SELECTORS
): Promise<string> {
  const targetElement = element || (document.querySelector('.story-viewer-container') as HTMLElement | null);

  if (!targetElement) {
    throw new Error('Target element not found');
  }

  const selectors = Array.from(new Set([...DEFAULT_EXCLUDE_SELECTORS, ...excludeSelectors]));
  const hiddenElements = hideElements(targetElement, selectors);

  try {
    const pixelRatio =
      typeof window !== 'undefined' ? Math.min(Math.max(window.devicePixelRatio || 1, 2), 3) : 2;

    const canvas = await html2canvas(targetElement, {
      backgroundColor: '#000000',
      scale: pixelRatio,
      useCORS: true,
      logging: false,
      removeContainer: true,
    });

    return canvas.toDataURL('image/png', 1.0);
  } finally {
    restoreElements(hiddenElements);
  }
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

