// Utility functions for extracting EXIF data from images

interface ExifData {
  latitude?: number;
  longitude?: number;
  heading?: number;
  fieldOfView?: number;
  timestamp?: Date;
}

export async function extractExifData(file: File): Promise<ExifData> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const dataView = new DataView(arrayBuffer);
      
      // Check for JPEG
      if (dataView.getUint16(0) !== 0xFFD8) {
        resolve({});
        return;
      }
      
      // Simple EXIF parser - look for GPS and orientation data
      const exifData: ExifData = {};
      
      // Search for EXIF marker (0xFFE1)
      let offset = 2;
      let marker = dataView.getUint16(offset);
      
      while (marker !== 0xFFE1 && offset < arrayBuffer.byteLength - 2) {
        offset += 2 + dataView.getUint16(offset + 2);
        marker = dataView.getUint16(offset);
      }
      
      if (marker === 0xFFE1) {
        // Found EXIF data
        const exifLength = dataView.getUint16(offset + 2);
        const tiffOffset = offset + 10; // Skip EXIF header
        
        // Check for TIFF header
        const byteOrder = dataView.getUint16(tiffOffset);
        const littleEndian = byteOrder === 0x4949;
        
        // Parse IFD entries for GPS data
        const ifdOffset = tiffOffset + dataView.getUint32(tiffOffset + 4, littleEndian);
        const numEntries = dataView.getUint16(ifdOffset, littleEndian);
        
        for (let i = 0; i < numEntries; i++) {
          const entryOffset = ifdOffset + 2 + (i * 12);
          const tag = dataView.getUint16(entryOffset, littleEndian);
          
          // GPS IFD Pointer (0x8825)
          if (tag === 0x8825) {
            const gpsOffset = tiffOffset + dataView.getUint32(entryOffset + 8, littleEndian);
            const gpsEntries = dataView.getUint16(gpsOffset, littleEndian);
            
            for (let j = 0; j < gpsEntries; j++) {
              const gpsEntryOffset = gpsOffset + 2 + (j * 12);
              const gpsTag = dataView.getUint16(gpsEntryOffset, littleEndian);
              
              // GPS Image Direction (0x0011)
              if (gpsTag === 0x0011) {
                const valueOffset = tiffOffset + dataView.getUint32(gpsEntryOffset + 8, littleEndian);
                const numerator = dataView.getUint32(valueOffset, littleEndian);
                const denominator = dataView.getUint32(valueOffset + 4, littleEndian);
                exifData.heading = numerator / denominator;
              }
            }
          }
        }
      }
      
      resolve(exifData);
    };
    
    reader.readAsArrayBuffer(file.slice(0, 128 * 1024)); // Read first 128KB
  });
}

// Simpler alternative using browser's native Image API
export async function getImageOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      // Try to get orientation from image metadata
      // Default to 0 if not available
      const orientation = (img as any).orientation || 0;
      URL.revokeObjectURL(url);
      resolve(orientation);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    
    img.src = url;
  });
}