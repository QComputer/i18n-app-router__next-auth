"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop, type PercentCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Upload, X, RotateCw, RotateCcw, ZoomIn, ZoomOut, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

// Utility function to center crop
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  aspectRatio?: number;
  maxSize?: number;
  label?: string;
  disabled?: boolean;
}

// Default crop configuration
const defaultCrop: Crop = {
  unit: "%",
  width: 80,
  height: 80,
  x: 10,
  y: 10,
};

export function ImageUploadWithCrop({
  value,
  onChange,
  aspectRatio = 1,
  maxSize = 500,
  label = "Upload Image",
  disabled = false,
}: ImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [src, setSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PercentCrop>();
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle file selection
  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB for editing)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB");
      return;
    }

    setError("");

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(reader.result as string);
      setIsOpen(true);
      // Reset adjustments
      setCrop(undefined);
      setRotation(0);
      setZoom(1);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle crop complete
  const onCropComplete = useCallback((_: Crop, percentCrop: PercentCrop) => {
    setCompletedCrop(percentCrop);
  }, []);

  // Generate cropped image
  const getCroppedImage = useCallback(async (): Promise<string | null> => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Calculate scaled dimensions
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to maxSize
    canvas.width = maxSize;
    canvas.height = maxSize;

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw the cropped image
    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      maxSize,
      maxSize
    );

    // Return as base64 data URL
    return canvas.toDataURL("image/jpeg", 0.9);
  }, [completedCrop, rotation, zoom, maxSize]);

  // Handle save
  const onSave = async () => {
    if (!src) return;

    setIsUploading(true);
    try {
      // Get cropped image
      const croppedImage = await getCroppedImage();
      if (!croppedImage) {
        setError("Failed to process image");
        return;
      }

      // Convert base64 to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append("file", blob, "profile-image.jpg");

      // Upload to server
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload");
      }

      const data = await uploadResponse.json();
      
      // Call onChange with the URL
      onChange(data.url);
      
      // Close dialog
      setIsOpen(false);
      setSrc("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle remove
  const handleRemove = () => {
    onChange("");
  };

  // Update crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
  }, [aspectRatio]);

  return (
    <div className="space-y-4">
      {/* Current image preview */}
      {value ? (
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-muted">
          <img
            src={value}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Open file dialog
                  document.getElementById("image-upload-input")?.click();
                }}
                className="text-white"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center w-32 h-32 rounded-full border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-muted-foreground/50 transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onSelectFile}
            disabled={disabled}
          />
        </label>
      )}

      {/* Remove button */}
      {value && !disabled && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemove}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Remove
        </Button>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Crop modal */}
      <Modal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Crop Image"
        size="lg"
      >
        <div className="space-y-4">
          {/* Image cropper */}
          {src && (
            <div className="flex justify-center bg-muted p-4 rounded-lg">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={onCropComplete}
                aspect={aspectRatio}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={src}
                  onLoad={onImageLoad}
                  className="max-h-[400px] object-contain"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  }}
                  alt="Crop preview"
                />
              </ReactCrop>
            </div>
          )}

          {/* Adjustment controls */}
          <div className="space-y-4">
            {/* Zoom control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Zoom</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Slider
                value={[zoom]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={([value]: number[]) => setZoom(value)}
              />
            </div>

            {/* Rotation control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Rotation</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRotation((rotation - 90) % 360)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <span className="text-sm w-12 text-center">{rotation}°</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRotation((rotation + 90) % 360)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setSrc("");
              }}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
