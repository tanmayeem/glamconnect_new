import { v2 as cloudinary } from 'cloudinary';

(async function() {

    cloudinary.config({ 
        cloud_name: 'dznft1m2s', 
        api_key: '944929254282914', 
        api_secret: '0vy-6tipERGSdtfKcx1lga4MHYY'  
    });
    
    const uploadImageToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "profolio");  
        formData.append("cloud_name", "dznft1m2s");  
    
        try {
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/dznft1m2s/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );
    
          const data = await response.json();
          return data.secure_url;  
        } catch (error) {
          console.error("Error uploading image to Cloudinary:", error);
          return null;
        }
      };
    
    console.log(uploadImageToCloudinary);
    
    const optimizeUrl = cloudinary.url('', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    
    console.log(autoCropUrl);    
})();