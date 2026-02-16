/**
 * Image Upload Utilities
 * 
 * Handles image validation, processing, and file operations
 */

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Allowed image MIME types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Maximum file size in bytes (5MB)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Disk directory for uploads - using local disk directory
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "disk", "uploads");

/**
 * Validate image file
 */
export function validateImage(
  file: File
): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Generate unique filename
 */
export function generateImageFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const uuid = uuidv4();
  const timestamp = Date.now();
  return `img_${timestamp}_${uuid}${ext}`;
}

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir(): Promise<void> {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
    console.error("Error creating upload directory:", error);
  }
}

/**
 * Save image to disk
 */
export async function saveImage(
  buffer: Buffer,
  filename: string
): Promise<string> {
  await ensureUploadDir();
  
  const filepath = path.join(UPLOAD_DIR, filename);
  await writeFile(filepath, buffer);
  
  // Return the API route path for serving the image
  return `/api/uploads/${filename}`;
}

/**
 * Delete image from disk
 */
export async function deleteImage(filename: string): Promise<boolean> {
  try {
    const filepath = path.join(UPLOAD_DIR, path.basename(filename));
    await unlink(filepath);
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

// Need to import unlink
import { unlink } from "fs/promises";

/**
 * Get full path to uploaded image
 */
export function getImagePath(filename: string): string {
  return path.join(UPLOAD_DIR, path.basename(filename));
}

/**
 * Check if image exists
 */
export async function imageExists(filename: string): Promise<boolean> {
  try {
    const filepath = path.join(UPLOAD_DIR, path.basename(filename));
    await import("fs/promises").then(fs => fs.access(filepath));
    return true;
  } catch {
    return false;
  }
}
