import { getPersistedUrlParameter, storeSessionParameter } from './urlParams';

/**
 * Application mode types
 * - customer: Shows booking functionality, hides leads
 * - owner: Shows leads functionality, hides booking
 */
export type AppMode = 'customer' | 'owner';

const MODE_STORAGE_KEY = 'appMode';

/**
 * Gets the current application mode from URL or session storage
 * Defaults to 'customer' if not specified
 * 
 * @returns The current app mode
 */
export function getAppMode(): AppMode {
  const mode = getPersistedUrlParameter('mode', MODE_STORAGE_KEY);
  
  if (mode === 'owner') {
    return 'owner';
  }
  
  // Default to customer mode
  return 'customer';
}

/**
 * Checks if the current mode is customer mode
 */
export function isCustomerMode(): boolean {
  return getAppMode() === 'customer';
}

/**
 * Checks if the current mode is owner mode
 */
export function isOwnerMode(): boolean {
  return getAppMode() === 'owner';
}

/**
 * Sets the application mode and persists it
 * 
 * @param mode - The mode to set
 */
export function setAppMode(mode: AppMode): void {
  storeSessionParameter(MODE_STORAGE_KEY, mode);
}
