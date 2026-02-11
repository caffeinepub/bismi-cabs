/**
 * Maps backend error messages (including trap messages) to user-friendly English strings.
 * Returns both the friendly message and the raw error for logging.
 */
export interface MappedError {
  userMessage: string;
  rawError: string;
}

export function mapBackendError(error: any): MappedError {
  const rawError = error?.message || error?.toString() || 'Unknown error';
  
  // Check for authorization/permission errors
  if (
    rawError.includes('Unauthorized') ||
    rawError.includes('permission') ||
    rawError.includes('not authorized') ||
    rawError.includes('access denied')
  ) {
    return {
      userMessage: 'You do not have permission to perform this action. Please sign in or contact an administrator.',
      rawError,
    };
  }

  // Check for profile not found errors
  if (
    rawError.includes('profile not found') ||
    rawError.includes('User profile not found')
  ) {
    return {
      userMessage: 'Your profile needs to be initialized before uploading a display picture.',
      rawError,
    };
  }

  // Check for file size/type errors
  if (rawError.includes('file size') || rawError.includes('too large')) {
    return {
      userMessage: 'The file is too large. Please select a file smaller than 5MB.',
      rawError,
    };
  }

  if (rawError.includes('file type') || rawError.includes('invalid format')) {
    return {
      userMessage: 'Invalid file format. Please select a PNG or JPEG image.',
      rawError,
    };
  }

  // Check for network/connection errors
  if (
    rawError.includes('network') ||
    rawError.includes('connection') ||
    rawError.includes('timeout')
  ) {
    return {
      userMessage: 'Network error. Please check your connection and try again.',
      rawError,
    };
  }

  // Generic fallback
  return {
    userMessage: 'An error occurred. Please try again.',
    rawError,
  };
}
