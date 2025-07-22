const CLOUDINARY_CLOUD_NAME = 'dq5a07o4q';
const CLOUDINARY_UPLOAD_PRESET = 'nabihs'; // This is the default unsigned upload preset

export const uploadToCloudinary = async (file) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.mimeType || 'application/octet-stream',
      name: file.name || 'file'
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          
        },
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}; 