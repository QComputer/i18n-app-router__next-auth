/**
 * Serve Uploaded Images API Route
 * 
 * Handles serving user-uploaded images from external storage with security checks
 */

import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Disk directory for uploads - using external storage
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "disk", "uploads");

// Validate filename to prevent path traversal attacks
function isValidFilename(filename: string): boolean {
  // Allow only valid image filenames with expected patterns
  const validPattern = /^img_\d+_[a-f0-9-]+\.(jpeg|jpg|png|gif|webp)$/i;
  return validPattern.test(filename) && !filename.includes("..") && !filename.includes("/");
}

// Get content type from file extension
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypeMap: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
  };
  return contentTypeMap[ext] || "application/octet-stream";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Validate filename
    if (!isValidFilename(filename)) {
      console.warn("Invalid filename requested:", filename);
      return NextResponse.json(
        { error: "Invalid file request" },
        { status: 400 }
      );
    }

    // Construct file path
    const filepath = path.join(UPLOAD_DIR, filename);

    // Read file from disk
    const buffer = await readFile(filepath);

    // Determine content type
    const contentType = getContentType(filename);

    // Serve the file
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
