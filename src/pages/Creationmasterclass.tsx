import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "../components/Footer";
import imageCompression from "browser-image-compression";

import { db } from "../../firebaseconfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const CreateMasterclass = () => {
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    duration: "",
    capacity: "",
    requirements: "",
    location: "",
    imageUrl: "",
    coverImageUrl: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "cover") => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);

        if (type === "image") {
          setImage(compressedFile);
          setImagePreview(URL.createObjectURL(compressedFile));
        } else {
          setCoverImage(compressedFile);
          setCoverImagePreview(URL.createObjectURL(compressedFile));
        }
      } catch (error) {
        console.error("Error compressing image:", error);
        toast({ title: "Error!", description: "Failed to compress the image. Please try again." });
      }
    }
  };

  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "profolio"); 
    formData.append("cloud_name", "dznft1m2s"); 

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dznft1m2s/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      return data.secure_url;  
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      toast({ title: "Error!", description: "Failed to upload image. Please try again." });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast({ title: "Error!", description: "Please select a date for the masterclass." });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      let coverImageUrl = formData.coverImageUrl;

      if (image) {
        imageUrl = await uploadImageToCloudinary(image);
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }

      if (coverImage) {
        coverImageUrl = await uploadImageToCloudinary(coverImage);
        if (!coverImageUrl) {
          setLoading(false);
          return;
        }
      }

      await addDoc(collection(db, "masterclasses"), {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        capacity: Number(formData.capacity),
        imageUrl,
        coverImageUrl,
        date: Timestamp.fromDate(date),
        createdAt: Timestamp.now(),
      });

      toast({ title: "Success!", description: "Your masterclass has been created successfully." });
      navigate("/masterclasses");
    } catch (error) {
      console.error("Error creating masterclass:", error);
      toast({ title: "Error!", description: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-glamour-light">
      <Navigation />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="font-serif text-3xl text-glamour-dark mb-2 text-center">
              Create a Masterclass
            </h1>
            <p className="text-glamour-dark/60 text-center mb-8">
              Share your expertise with the community
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Label htmlFor="title">Masterclass Title</Label>
              <Input id="title" name="title" placeholder="e.g., Advanced Bridal Makeup Techniques" value={formData.title} onChange={handleChange} required />

              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Describe what participants will learn..." value={formData.description} onChange={handleChange} className="min-h-[100px]" required />

                <Label>Upload Cover Photo</Label>
                  <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "cover")} className="w-full" />
                  {coverImagePreview && <img src={coverImagePreview} alt="Cover Preview" className="w-20 h-20 rounded-lg shadow-md" />}

                <Label>Upload Regular Image</Label>
                  <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "image")} className="w-full" />
                  {imagePreview && <img src={imagePreview} alt="Image Preview" className="w-20 h-20 rounded-lg shadow-md" />}

              {/* Date Picker */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Price Input */}
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" name="price" type="number" placeholder="e.g., 199" value={formData.price} onChange={handleChange} required />
              </div>

              {/* Requirements Input */}
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea id="requirements" name="requirements" placeholder="List any prerequisites or materials needed..." value={formData.requirements} onChange={handleChange} className="min-h-[100px]" />
              </div>

              {/* Location Input */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" placeholder="Enter the venue address" value={formData.location} onChange={handleChange} required />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-gradient-glamour hover:opacity-90" disabled={loading}>
                {loading ? "Creating..." : "Create Masterclass"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateMasterclass;