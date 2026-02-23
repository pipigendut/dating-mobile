import { userService } from '../../../services/api/user';
import axios from 'axios';

/**
 * Uploads a file directly to S3 using a presigned URL.
 * 
 * @param fileUri Local URI of the file from image picker
 * @returns The S3 file key if successful
 */
export const uploadProfileImage = async (fileUri: string): Promise<string> => {
  try {
    // 1. Get presigned URL from backend using centralized userService
    const responseData = await userService.getUploadUrl();

    const { upload_url, file_key } = responseData.data;


    // 2. Upload file to S3 via PUT
    // We use a separate axios call for S3 to avoid backend-specific interceptors (like Auth headers)
    const response = await fetch(fileUri);
    const blob = await response.blob();

    await axios.put(upload_url, blob, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    return file_key;
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error('Failed to upload image to S3');
  }
};
