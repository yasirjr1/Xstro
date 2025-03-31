/**
 * Checks if the given text represents a valid file path pattern
 * @param text The text to validate
 * @returns boolean indicating if the text is a valid path
 */
export function isPath(text: string): boolean {
  // Regular expression to match common path patterns
  const pathRegex = /^\.{1,2}\/[a-zA-Z0-9_\-./]+(\.[a-zA-Z0-9]+)?$/;

  return pathRegex.test(text);
}

/**
 * Checks if the given text is plain text without buffer-like content
 * @param text The text to check
 * @returns boolean indicating if the text is plain text
 */
export function isText(text: string): boolean {
  const bufferPattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  return typeof text === 'string' && !bufferPattern.test(text);
}
