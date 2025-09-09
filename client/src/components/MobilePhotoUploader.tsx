import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Camera, ImagePlus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MobilePhotoUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onUploadComplete?: (urls: string[]) => void;
  existingPhotos?: string[];
}

export function MobilePhotoUploader({
  maxNumberOfFiles = 5,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onUploadComplete,
  existingPhotos = [],
}: MobilePhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return false;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return false;
    }

    if (existingPhotos.length >= maxNumberOfFiles) {
      toast({
        title: "Too many photos",
        description: `Maximum ${maxNumberOfFiles} photos allowed`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Get upload URL from backend
      const uploadParams = await onGetUploadParameters();
      
      // Upload file directly to S3
      const response = await fetch(uploadParams.url, {
        method: uploadParams.method,
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      // Return the URL without query parameters
      const url = new URL(uploadParams.url);
      return `${url.origin}${url.pathname}`;
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(validateFile);
    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setUploadProgress(((i + 1) / validFiles.length) * 100);
      
      const url = await uploadFile(file);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    setUploading(false);
    setUploadProgress(0);

    if (uploadedUrls.length > 0) {
      onUploadComplete?.(uploadedUrls);
      toast({
        title: "Upload successful",
        description: `${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''} uploaded`,
      });
    }

    // Clear input values
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  const handleChooseFromGallery = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || existingPhotos.length >= maxNumberOfFiles}
      />
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || existingPhotos.length >= maxNumberOfFiles}
      />

      {/* Upload buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleTakePhoto}
          disabled={uploading || existingPhotos.length >= maxNumberOfFiles}
          className="h-auto py-4 flex flex-col space-y-2"
        >
          <Camera className="w-6 h-6" />
          <span className="text-xs">Take Photo</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleChooseFromGallery}
          disabled={uploading || existingPhotos.length >= maxNumberOfFiles}
          className="h-auto py-4 flex flex-col space-y-2"
        >
          <ImagePlus className="w-6 h-6" />
          <span className="text-xs">Choose from Gallery</span>
        </Button>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
            <span className="font-medium">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Photo limit indicator */}
      {existingPhotos.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {existingPhotos.length} of {maxNumberOfFiles} photos added
        </p>
      )}
    </div>
  );
}