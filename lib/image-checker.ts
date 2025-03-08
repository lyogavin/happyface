/**
 * Utility for validating image files before processing
 */

// Maximum allowed file size in bytes (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Supported image formats and their extensions
const SUPPORTED_FORMATS = [
  // Fully supported formats
  '.bmp', '.dib', '.gif', '.jpg', '.jpeg', '.jpe', '.png', '.webp', '.tiff', //'.tif',
  // Common formats
  '.ico', '.ppm', '.pgm', '.pbm', '.pnm', '.tga', '.pcx', '.xbm',
  // Additional formats
  //'.svg', '.heic', '.heif'
];

/**
 * Checks if an image file is valid based on format and size
 * @param file The file to validate
 * @returns An object with validation result and error message if any
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the maximum allowed size of 50MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const fileExt = fileName.substring(fileName.lastIndexOf('.'));
  
  if (!SUPPORTED_FORMATS.includes(fileExt)) {
    return {
      valid: false,
      error: `Unsupported file format: ${fileExt}. Supported formats include: ${SUPPORTED_FORMATS.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Checks if a file is an image based on its MIME type
 * @param file The file to check
 * @returns True if the file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
