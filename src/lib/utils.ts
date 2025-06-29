// src/lib/utils.ts

// ... (keep the existing cn function from shadcn)
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- ADD THIS NEW FUNCTION ---
export function triggerDownload(content: string, fileName: string, mimeType: string) {
  // Create a blob from the content
  const blob = new Blob([content], { type: mimeType });
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element to trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  
  // Programmatically click the anchor and then remove it
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Revoke the temporary URL to free up memory
  URL.revokeObjectURL(url);
}