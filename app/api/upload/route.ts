/**
 * Image Upload API Route
 * 
 * Handles image uploads with validation and processing
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  validateImage,
  generateImageFilename,
  saveImage,
  MAX_IMAGE_SIZE,
} from "@/lib/images/upload";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate image
    const validation = validateImage(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const filename = generateImageFilename(file.name);

    // Save to disk
    const publicUrl = await saveImage(buffer, filename);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: buffer.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// Configure max body size
export const runtime = "nodejs";
export const maxBodySize = MAX_IMAGE_SIZE;
