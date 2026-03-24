import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

interface CompressOptions {
  maxWidth?: number;
  quality?: number; // 0 to 1
  maxSizeMB?: number; // Max allowed original size
  targetSizeMB?: number; // Target max size after compression
}

export const compressImage = async (
  uri: string,
  options: CompressOptions = {}
): Promise<string> => {
  try {
    const { 
      maxWidth = 1080, 
      quality = 0.8, 
      maxSizeMB = 10, 
      targetSizeMB = 0.5 
    } = options;

    // 1. Check original file size limit
    const originalSize = await getFileSizeInMB(uri);
    if (originalSize > maxSizeMB) {
      throw new Error(`File is too large (${originalSize.toFixed(1)}MB). Maximum allowed size is ${maxSizeMB}MB.`);
    }

    // 2. Adaptive compression loop
    let currentQuality = quality;
    let currentUri = uri;
    let currentWidth = maxWidth;
    let isTargetReached = false;
    let attempt = 0;

    while (!isTargetReached && attempt < 3) {
      const result = await ImageManipulator.manipulateAsync(
        currentUri,
        [{ resize: { width: currentWidth } }],
        { compress: currentQuality, format: ImageManipulator.SaveFormat.JPEG }
      );

      const newSize = await getFileSizeInMB(result.uri);
      
      // Target reached or we reached the lowest acceptable quality threshold
      if (newSize <= targetSizeMB || currentQuality <= 0.4) {
        currentUri = result.uri;
        isTargetReached = true;
      } else {
        // Not enough reduction, reduce parameters for the next iteration
        currentQuality -= 0.2;
        currentWidth = Math.floor(currentWidth * 0.85); 
        currentUri = result.uri;
        attempt++;
      }
    }

    return currentUri;
  } catch (error) {
    console.error('Error in compressImage:', error);
    throw error; // Throw so UI logic can catch and display the error
  }
};

export const getFileSizeInMB = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) return 0;
    return fileInfo.size / (1024 * 1024);
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};
