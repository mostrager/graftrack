import { useState, useRef } from "react";
import { X, MapPin, RefreshCw, Camera, Trash2 } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { useToast } from "@/hooks/use-toast";
import { extractExifData } from "@/lib/exif-utils";

interface AddLocationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPosition: { lat: number; lng: number };
  onSave: (locationData: any) => void;
  isLoading: boolean;
}

export default function AddLocationPanel({ 
  isOpen, 
  onClose, 
  currentPosition, 
  onSave, 
  isLoading 
}: AddLocationPanelProps) {
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [photoHeadings, setPhotoHeadings] = useState<number[]>([]);
  const { toast } = useToast();

  const predefinedTags = ["Street Art", "Mural", "Tag", "Stencil", "Throw-up", "Piece"];

  const handleGetUploadParameters = async () => {
    try {
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }
      
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("Error getting upload parameters:", error);
      toast({
        title: "Upload Error",
        description: "Failed to prepare photo upload",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const newPhotoUrls = result.successful.map(file => file.uploadURL as string);
      const newHeadings: number[] = [];
      
      // Try to extract EXIF heading from each photo
      for (const file of result.successful) {
        if (file.data instanceof File) {
          const exifData = await extractExifData(file.data as File);
          newHeadings.push(exifData.heading || 0);
        } else {
          newHeadings.push(0);
        }
      }
      
      setUploadedPhotos(prev => [...prev, ...newPhotoUrls]);
      setPhotoHeadings(prev => [...prev, ...newHeadings]);
      toast({
        title: "Success",
        description: `${result.successful.length} photo(s) uploaded successfully`,
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoHeadings(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag("");
    }
  };

  const handleSave = () => {
    console.log("=== SAVE BUTTON CLICKED ===");
    console.log("Title:", title);
    
    if (!title.trim()) {
      console.log("Title is empty, showing error");
      toast({
        title: "Title Required",
        description: "Please enter a title for this location",
        variant: "destructive",
      });
      return;
    }

    console.log("Saving location at:", currentPosition.lat, currentPosition.lng);
    
    const locationData = {
      latitude: currentPosition.lat,
      longitude: currentPosition.lng,
      title: title.trim(),
      city: city.trim() || undefined,
      description: description.trim() || undefined,
      tags: selectedTags,
      photos: uploadedPhotos,
      photoHeadings: photoHeadings.length > 0 ? photoHeadings : undefined,
    };

    console.log("Location data being saved:", locationData);
    onSave(locationData);
    
    // Reset form
    setTitle("");
    setCity("");
    setDescription("");
    setCustomTag("");
    setSelectedTags([]);
    setUploadedPhotos([]);
    setPhotoHeadings([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomTag();
    }
  };

  if (!isOpen) {
    console.log("AddLocationPanel: not open, returning null");
    return null;
  }
  
  console.log("AddLocationPanel: rendering panel");

  return (
    <div className={`fixed inset-0 z-50 flex items-end transition-opacity duration-300 ${
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`relative w-full bg-card rounded-t-2xl max-h-[85vh] overflow-hidden transform transition-transform duration-300 safe-bottom ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}>
        {/* Handle Bar */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 bg-border rounded-full" />
        </div>
        
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="heading font-bold text-xl">ADD SPOT</h3>
            <button 
              className="p-2 touch-target" 
              onClick={onClose}
              data-testid="button-close-add-panel"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>
      
        <div className="px-4 pb-4 overflow-y-auto max-h-[calc(85vh-120px)]">
        {/* Location Info */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm" data-testid="text-current-coordinates">
                {currentPosition ? `${currentPosition.lat.toFixed(4)}, ${currentPosition.lng.toFixed(4)}` : 'Loading...'}
              </p>
              <p className="text-xs text-muted-foreground">Current location</p>
            </div>
            <button className="min-h-11 min-w-11 p-2 text-accent">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Title *</label>
          <input 
            className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent" 
            placeholder="Enter a title for this location..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="input-title"
          />
        </div>

        {/* City Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">City</label>
          <input 
            className="w-full p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent" 
            placeholder="Enter the city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            data-testid="input-city"
          />
        </div>

        {/* Photo Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Photos (Optional)</label>
          
          <ObjectUploader
            maxNumberOfFiles={5}
            maxFileSize={10485760}
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleUploadComplete}
            buttonClassName="w-full"
          >
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
              <Camera className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium mb-1">Tap to take photo or select from gallery</p>
              <p className="text-xs text-muted-foreground">You can add multiple photos</p>
            </div>
          </ObjectUploader>

          {/* Photo Previews */}
          {uploadedPhotos.length > 0 && (
            <div className="mt-4 space-y-3">
              {uploadedPhotos.map((photoUrl, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg">
                  <div className="relative">
                    <img 
                      src={photoUrl} 
                      alt={`Uploaded photo ${index + 1}`}
                      className="w-16 h-16 rounded-lg object-cover"
                      data-testid={`img-photo-preview-${index}`}
                    />
                    {photoHeadings[index] && photoHeadings[index] > 0 && (
                      <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {Math.round(photoHeadings[index])}°
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Photo {index + 1}</p>
                    <p className="text-xs text-muted-foreground">Uploaded successfully</p>
                  </div>
                  <button 
                    className="min-h-11 min-w-11 p-2 text-destructive"
                    onClick={() => handleRemovePhoto(index)}
                    data-testid={`button-remove-photo-${index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Additional Information</label>
          <textarea 
            className="w-full p-3 border border-input rounded-lg bg-background resize-none focus:ring-2 focus:ring-ring focus:border-transparent" 
            rows={3}
            placeholder="Describe the graffiti, style, or any notable details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-testid="textarea-description"
          />
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">Tags</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {predefinedTags.map(tag => (
              <button
                key={tag}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={() => handleToggleTag(tag)}
                data-testid={`button-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex space-x-2">
            <input 
              type="text" 
              className="flex-1 p-3 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-transparent" 
              placeholder="Add custom tag..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={handleKeyPress}
              data-testid="input-custom-tag"
            />
            <button
              onClick={handleAddCustomTag}
              className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              data-testid="button-add-custom-tag"
            >
              Add
            </button>
          </div>
        </div>

        </div>
        
        {/* Bottom Actions */}
        <div className="p-4 border-t border-border bg-card">
          <button 
            className="w-full bg-accent text-accent-foreground font-bold py-4 px-4 rounded-xl flex items-center justify-center space-x-2 street-text text-lg touch-target disabled:opacity-50 active:scale-95 transition-transform"
            onClick={handleSave}
            disabled={isLoading}
            data-testid="button-save-location"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                <span>SAVE SPOT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
