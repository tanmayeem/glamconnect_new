import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseconfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/Authcontext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, Save, Loader } from "lucide-react";
import Navigation from "@/components/Navigation";

const ArtistProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    experience: "",
    specialties: "",
    phone: "",
    email: "",
    profilePicture: "",
    uid: "",
    portfolio: [] as string[],
  });

  const profileInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const artistDoc = doc(db, "artists", currentUser.uid);
        const snapshot = await getDoc(artistDoc);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setProfile({
            name: data.name || "",
            experience: data.experience || "",
            specialties: data.specialties || "",
            phone: data.phone || "",
            email: data.email || "",
            profilePicture: data.profilePicture || "",
            uid: data.uid || "",
            portfolio: data.portfolio || [],
          });
        } else {
          console.log("No artist profile found.");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const artistDoc = doc(db, "artists", currentUser.uid);
      await updateDoc(artistDoc, {
        name: profile.name,
        experience: profile.experience,
        specialties: profile.specialties,
        phone: profile.phone,
        profilePicture: profile.profilePicture,
        // Note: Portfolio images are updated separately
      });

      toast({
        title: "Profile Updated!",
        description: "Your changes have been saved successfully.",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  // Upload profile image to Cloudinary and update Firestore
  const uploadImageToCloudinary = async (file: File) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Display_picture");
    formData.append("cloud_name", "dznft1m2s");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dznft1m2s/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (!data.secure_url) throw new Error("Upload failed");

      if (currentUser) {
        const artistDoc = doc(db, "artists", currentUser.uid);
        await updateDoc(artistDoc, { profilePicture: data.secure_url });
      }

      setProfile((prev) => ({ ...prev, profilePicture: data.secure_url }));

      toast({
        title: "Profile Picture Updated!",
        description: "Your new profile picture has been saved.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your image. Try again.",
        variant: "destructive",
      });
    }
    setUploadingImage(false);
  };

  const uploadPortfolioImageToCloudinary = async (file: File) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "portfolio");
    formData.append("cloud_name", "dznft1m2s");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dznft1m2s/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (!data.secure_url) throw new Error("Upload failed");

      const updatedPortfolio = profile.portfolio
        ? [...profile.portfolio, data.secure_url]
        : [data.secure_url];

      if (updatedPortfolio.length > 5) {
        toast({
          title: "Upload Failed",
          description: "You can upload up to 5 images only.",
          variant: "destructive",
        });
        setUploadingImage(false);
        return;
      }

      if (currentUser) {
        const artistDoc = doc(db, "artists", currentUser.uid);
        await updateDoc(artistDoc, { portfolio: updatedPortfolio });
      }

      setProfile((prev) => ({ ...prev, portfolio: updatedPortfolio }));

      toast({
        title: "Portfolio Image Uploaded!",
        description: "Your portfolio image has been saved.",
      });
    } catch (error) {
      console.error("Error uploading portfolio image:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your portfolio image. Try again.",
        variant: "destructive",
      });
    }
    setUploadingImage(false);
  };

  const handleProfileImageClick = () => {
    profileInputRef.current?.click();
  };

  // Trigger file input for portfolio image
  const handlePortfolioImageClick = () => {
    if (profile.portfolio.length >= 5) {
      toast({
        title: "Limit Reached",
        description: "You can upload a maximum of 5 portfolio images.",
        variant: "destructive",
      });
      return;
    }
    portfolioInputRef.current?.click();
  };

  // Handle portfolio file input change
  const handlePortfolioImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadPortfolioImageToCloudinary(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Artist Profile</h1>
          <Button
            onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : isEditing ? (
              <Save className="mr-2 h-4 w-4" />
            ) : (
              "Edit Profile"
            )}
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading profile...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Picture Section */}
              <div className="space-y-4">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.profilePicture || ""} />
                    <AvatarFallback>{profile.name ? profile.name[0] : "A"}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div>
                      <input
                        type="file"
                        ref={profileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            uploadImageToCloudinary(e.target.files[0]);
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={handleProfileImageClick}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="mr-2 h-4 w-4" />
                        )}
                        {uploadingImage ? "Uploading..." : "Upload"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Name</Label>
                {isEditing ? (
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-lg font-medium">{profile.name}</p>
                )}

                <Label>Experience</Label>
                {isEditing ? (
                  <Textarea
                    value={profile.experience}
                    onChange={(e) =>
                      setProfile({ ...profile, experience: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-gray-600">{profile.experience}</p>
                )}

                <Label>Specialties</Label>
                {isEditing ? (
                  <Input
                    value={profile.specialties}
                    onChange={(e) =>
                      setProfile({ ...profile, specialties: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-gray-600">{profile.specialties}</p>
                )}

                <Label>Phone</Label>
                {isEditing ? (
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-gray-600">{profile.phone}</p>
                )}

                <Label>Email</Label>
                <p className="text-gray-600">{profile.email}</p>
              </div>
            </div>

            <div className="mt-8">
              <Label>Portfolio</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {profile.portfolio &&
                  profile.portfolio.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Portfolio ${index + 1}`}
                        className="object-cover h-32 w-full rounded"
                      />
                    </div>
                  ))}
                {isEditing && profile.portfolio.length < 5 && (
                  <div className="flex items-center justify-center border border-dashed rounded h-32 w-full">
                    <input
                      type="file"
                      ref={portfolioInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handlePortfolioImageChange}
                    />
                    <Button
                      variant="outline"
                      onClick={handlePortfolioImageClick}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="mr-2 h-4 w-4" />
                      )}
                      {uploadingImage ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ArtistProfile;