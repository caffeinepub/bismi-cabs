export function downloadFile(bytes: Uint8Array, filename: string, contentType: string): void {
  // Create a new Uint8Array to ensure proper type compatibility
  const uint8Array = new Uint8Array(bytes);
  const blob = new Blob([uint8Array], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
