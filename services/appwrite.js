import { Client, Storage, ID } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('67bc33460027a4b1ecac');

export const storage = new Storage(client);
export { ID };

// Utility function to upload a file and get its preview URL
export async function uploadToAppwrite(file) {
  const bucketId = '687e44e2000e5b63aaab'; // 'nabih'
  try {
    const response = await storage.createFile(
      bucketId,
      ID.unique(),
      file,
      ['read("any")']
    );
    // Use getFileDownload for all files (images and PDFs)
    const url = storage.getFileDownload(bucketId, response.$id);
    return { fileId: response.$id, url };
  } catch (error) {
    console.error('Appwrite upload error:', error);
    throw error;
  }
}

export function getAppwriteFileUrl(fileId) {
  const bucketId = '687e44e2000e5b63aaab';
  return storage.getFileDownload(bucketId, fileId);
}
