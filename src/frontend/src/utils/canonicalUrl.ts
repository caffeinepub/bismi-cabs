import { getPersistedUrlParameter } from './urlParams';

/**
 * Computes the canonical shareable URL for the application
 * This URL is guaranteed to work when shared with customers
 * 
 * @returns The canonical URL that can be shared
 */
export function getCanonicalUrl(): string {
  // Get the base URL from the current location
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Construct base URL
  let baseUrl = `${protocol}//${hostname}`;
  if (port && port !== '80' && port !== '443') {
    baseUrl += `:${port}`;
  }
  
  // Check if we have a canisterId parameter (either in URL or session)
  const canisterId = getPersistedUrlParameter('canisterId');
  
  // If we have a canisterId, include it in the URL for reliable routing
  if (canisterId) {
    return `${baseUrl}/?canisterId=${canisterId}`;
  }
  
  // Otherwise return the base URL
  return baseUrl;
}

/**
 * Copies the canonical URL to the clipboard
 * 
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyCanonicalUrlToClipboard(): Promise<boolean> {
  try {
    const url = getCanonicalUrl();
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error);
    return false;
  }
}
