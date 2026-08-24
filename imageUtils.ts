/**
 * NEMDAN Image Upload & Processing Utility
 * Handles client-side validation, dimension checks, and high-efficiency canvas compression.
 */

export interface ProcessedImage {
  id: string;
  name: string;
  dataUrl: string;
  fileSize: number;
  width: number;
  height: number;
  mimeType: string;
  progress?: number;
  uploading?: boolean;
  uploadedUrl?: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  const isMimeValid = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase()) ||
    file.name.match(/\.(jpe?g|png|webp)$/i);

  if (!isMimeValid) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported format. Please upload JPG, PNG, or WEBP images.`
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `"${file.name}" (${sizeMb}MB) exceeds the 15MB limit. Please choose a smaller photo.`
    };
  }

  return { valid: true };
}

/**
 * Compresses and resizes an image on the client side using HTML5 Canvas
 * preserving high visual fidelity while reducing upload payload size.
 */
export async function processAndCompressImage(
  file: File,
  maxWidth = 2048,
  maxHeight = 2048,
  quality = 0.88
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`));

    reader.onload = (event) => {
      const img = new Image();

      img.onerror = () => reject(new Error(`Failed to load image "${file.name}"`));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original dataUrl if canvas 2D context is unavailable
          resolve({
            id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            dataUrl: event.target?.result as string,
            fileSize: file.size,
            width: img.width,
            height: img.height,
            mimeType: file.type || 'image/jpeg'
          });
          return;
        }

        // Use high quality image rendering on canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Determine target output format
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(outputMime, quality);

        resolve({
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          dataUrl: compressedDataUrl,
          fileSize: Math.round((compressedDataUrl.length * 3) / 4), // Approximate byte size from base64
          width,
          height,
          mimeType: outputMime
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
