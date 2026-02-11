import { getPersistedUrlParameter } from './urlParams';

export type AppMode = 'customer' | 'owner';

/**
 * Computes the canonical shareable URL for the application
 * This URL is guaranteed to work when shared with customers
 * 
 * @param mode - Optional mode parameter to include in the URL
 * @param deepLink - Optional deep-link parameter (e.g., 'booking' or 'profile')
 * @returns The canonical URL that can be shared
 */
export function getCanonicalUrl(mode?: AppMode, deepLink?: string): string {
  // Get the base URL from the current location
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Construct base URL
  let baseUrl = `${protocol}//${hostname}`;
  if (port && port !== '80' && port !== '443') {
    baseUrl += `:${port}`;
  }
  
  // Build query parameters
  const params = new URLSearchParams();
  
  // Check if we have a canisterId parameter (either in URL or session)
  const canisterId = getPersistedUrlParameter('canisterId');
  if (canisterId) {
    params.set('canisterId', canisterId);
  }
  
  // Add mode parameter if specified
  if (mode) {
    params.set('mode', mode);
  }
  
  // Add deep-link parameter if specified
  if (deepLink) {
    params.set('page', deepLink);
  }
  
  // Return URL with parameters if any exist
  const queryString = params.toString();
  return queryString ? `${baseUrl}/?${queryString}` : baseUrl;
}

/**
 * Copies a canonical URL to the clipboard
 * 
 * @param mode - Optional mode parameter to include in the URL
 * @param deepLink - Optional deep-link parameter (e.g., 'booking' or 'profile')
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyCanonicalUrlToClipboard(mode?: AppMode, deepLink?: string): Promise<boolean> {
  try {
    const url = getCanonicalUrl(mode, deepLink);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error);
    return false;
  }
}
