export const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "audiTechUploads");
    formData.append("resource_type", "auto");
  
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dbsrqtfpo/auto/upload",
      {
        method: "POST",
        body: formData,
      }
    );
  
    const data = await response.json();
  
    if (!response.ok) {
      throw new Error(data.error?.message || "Upload failed");
    }
  
    return data.secure_url;
  };
  