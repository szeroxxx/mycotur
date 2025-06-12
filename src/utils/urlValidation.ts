/**
 * Validates if a URL starts with http:// or https://
 * @param url - The URL string to validate
 * @returns Object with validation result and error message
 */
export function validateUrl(url: string): {
  isValid: boolean;
  errorMessage?: string;
} {
  if (!url || url.trim() === '') {
    return { isValid: true };
  }

  const trimmedUrl = url.trim();
  
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return {
      isValid: false,
      errorMessage: 'El enlace debe empezar por http:// o https://'
    };
  }

  return { isValid: true };
}
