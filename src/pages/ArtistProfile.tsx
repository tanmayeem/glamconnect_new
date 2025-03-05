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
import { ImagePlus, Save, Loader, X, Instagram, Facebook, Globe } from "lucide-react";

interface Profile {
  name: string;
  experience: string;
  specialties: string;
  phone: string;
  email: string;
  profilePicture: string;
  uid: string;
  portfolio: string[];
  instagram: string;
  facebook: string;
  website: string;
}

const ArtistProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    experience: "",
    specialties: "",
    phone: "",
    email: "",
    profilePicture: "",
    uid: "",
    portfolio: [],
    instagram: "",
    facebook: "",
    website: "",
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
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            website: data.website || "",
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
        email: profile.email,
        profilePicture: profile.profilePicture,
        instagram: profile.instagram,
        facebook: profile.facebook,
        website: profile.website,
      });

      toast({
        title: "Profile Updated!",
        description: "Your changes have been saved successfully.",
        className: "bg-glamour-gold/20 text-glamour-dark",
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

  const handleCancelEdit = () => {
    setIsEditing(false);
    const fetchProfile = async () => {
      if (currentUser) {
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
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            website: data.website || "",
          });
        }
      }
    };
    fetchProfile();
  };

  const uploadImageToCloudinary = async (file: File, type: "profile" | "portfolio") => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", type === "profile" ? "Display_picture" : "portfolio");
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
        if (type === "profile") {
          await updateDoc(artistDoc, { profilePicture: data.secure_url });
          setProfile((prev) => ({ ...prev, profilePicture: data.secure_url }));
        } else {
          const updatedPortfolio = [...profile.portfolio, data.secure_url];
          if (updatedPortfolio.length > 5) {
            toast({
              title: "Upload Failed",
              description: "You can upload up to 5 images only.",
              variant: "destructive",
            });
            setUploadingImage(false);
            return;
          }
          await updateDoc(artistDoc, { portfolio: updatedPortfolio });
          setProfile((prev) => ({ ...prev, portfolio: updatedPortfolio }));
        }
      }

      toast({
        title: type === "profile" ? "Profile Picture Updated!" : "Portfolio Image Uploaded!",
        description: `Your ${type === "profile" ? "profile picture" : "portfolio image"} has been saved.`,
        className: "bg-glamour-gold/20 text-glamour-dark",
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

  const handleProfileImageClick = () => {
    profileInputRef.current?.click();
  };

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

  const handlePortfolioImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      uploadImageToCloudinary(e.target.files[0], "portfolio");
    }
  };

  return (
    <div className="min-h-screen bg-glamour-light p-6 md:p-12">
      <div className="max-w-4xl mx-auto p-7">
        <div className="bg-white rounded-2xl p-20 md:p-8 border border-glamour-gold/20 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="space-y-4 flex-shrink-0 p-10">
              {loading ? (
                <p className="text-center text-glamour-dark/70">Loading profile...</p>
              ) : (
                <div>
                  <div className="flex justify-end space-x-2 mb-7">
                    {isEditing && (
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="bg-glamour-light hover:bg-glamour-gold/20 text-glamour-dark border-glamour-gold/40 rounded-lg"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    )}
                    <Button
                      onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                      className="bg-gradient-glamour text-white hover:opacity-90 shadow-md rounded-lg px-4 py-2 transition-all"
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
                  <Avatar className="w-30 h-30 md:w-32 md:h-32 border-10 border-glamour-gold/40 hover:border-glamour-red transition-colors">
                    <AvatarImage
                      src={profile.profilePicture || "https://via.placeholder.com/150"}
                      alt={profile.name}
                    />
                    <AvatarFallback className="bg-glamour-gold/20 text-glamour-dark">
                      {profile.name ? profile.name[0] : "A"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="mt-4 p-5">
                      <input
                        type="file"
                        ref={profileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            uploadImageToCloudinary(e.target.files[0], "profile");
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={handleProfileImageClick}
                        disabled={uploadingImage}
                        className="bg-glamour-light hover:bg-glamour-gold/20 text-glamour-dark border-glamour-gold/40 w-full mt-2"
                      >
                        {uploadingImage ? (
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ImagePlus className="mr-2 h-4 w-4" />
                        )}
                        {uploadingImage ? "Uploading..." : "Change Photo"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-4 w-full">
              <div>
                <Label className="font-serif text-glamour-dark">Name</Label>
                {isEditing ? (
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="border-glamour-gold/20 focus:border-glamour-gold w-full"
                  />
                ) : (
                  <p className="text-xl font-medium text-glamour-dark">{profile.name}</p>
                )}
              </div>
              <div>
                <Label className="font-serif text-glamour-dark">Experience</Label>
                {isEditing ? (
                  <Textarea
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    className="border-glamour-gold/20 focus:border-glamour-gold min-h-[100px] w-full"
                  />
                ) : (
                  <p className="text-sm text-glamour-dark/70">{profile.experience}</p>
                )}
              </div>
              <div>
                <Label className="font-serif text-glamour-dark">Specialties</Label>
                {isEditing ? (
                  <Input
                    value={profile.specialties}
                    onChange={(e) => setProfile({ ...profile, specialties: e.target.value })}
                    className="border-glamour-gold/20 focus:border-glamour-gold w-full"
                  />
                ) : (
                  <p className="text-sm text-glamour-dark/70">{profile.specialties}</p>
                )}
              </div>
              <div>
                <Label className="font-serif text-glamour-dark">Phone</Label>
                {isEditing ? (
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="border-glamour-gold/20 focus:border-glamour-gold w-full"
                  />
                ) : (
                  <p className="text-sm text-glamour-dark/70">{profile.phone}</p>
                )}
              </div>
              <div>
                <Label className="font-serif text-glamour-dark">Email</Label>
                {isEditing ? (
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="border-glamour-gold/20 focus:border-glamour-gold w-full"
                  />
                ) : (
                  <p className="text-sm text-glamour-dark/70">{profile.email}</p>
                )}
              </div>
              <div>
                <Label className="font-serif text-glamour-dark">Instagram</Label>
                {isEditing ? (
                  <Input
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    className="border-glamour-gold/20 focus:border-glamour-gold w-full"
                  />
                ) : profile.instagram ? (
                  <a
                    href={profile.instagram.startsWith("http") ? profile.instagram : `https://${profile.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-glamour-dark/70 hover:text-glamour-gold flex items-center"
                  >
                    <Instagram className="mr-2 h-4 w-4" />
                    {profile.instagram}
                  </a>
                ) : (
                  <p className="text-sm text-glamour-dark/70">Not provided</p>
                )}
              </div>
              <div>
                <Label className="font-serif text-glamour-dark">Facebook</Label>
                {isEditing ? (
                  <Input
                    value={profile.facebook}
                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                    className="border-glamour-gold/20 focus:border-glamour-gold w-full"
                  />
                ) : profile.facebook ? (
                  <a
                    href={profile.facebook.startsWith("http") ? profile.facebook : `https://${profile.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-glamour-dark/70 hover:text-glamour-gold flex items-center"
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    {profile.facebook}
                  </a>
                ) : (
                  <p className="text-sm text-glamour-dark/70">Not provided</p>
                )}
              </div>
              <div>
                <Label className="font-serif text-glamour-dark">Website</Label>
                {isEditing ? (
                  <Input
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="border-glamour-gold/20 focus:border-glamour-gold w-full"
                  />
                ) : profile.website ? (
                  <a
                    href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-glamour-dark/70 hover:text-glamour-gold flex items-center"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    {profile.website}
                  </a>
                ) : (
                  <p className="text-sm text-glamour-dark/70">Not provided</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-glamour-gold/20 shadow-lg hover:shadow-xl transition-shadow mt-8">
          <div className="flex justify-between items-center mb-4">
            <Label className="font-serif text-2xl text-glamour-dark">Portfolio</Label>
            {isEditing && profile.portfolio.length < 5 && (
              <Button
                variant="outline"
                onClick={handlePortfolioImageClick}
                disabled={uploadingImage}
                className="bg-glamour-light hover:bg-glamour-gold/20 text-glamour-dark border-glamour-gold/40 rounded-lg"
              >
                {uploadingImage ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="mr-2 h-4 w-4" />
                )}
                {uploadingImage ? "Uploading..." : "Add Image"}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {profile.portfolio.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Portfolio ${index + 1}`}
                  className="object-cover h-48 w-full rounded-xl transition-transform duration-300 group-hover:scale-105 shadow-md border border-glamour-gold/20"
                />
              </div>
            ))}
            {isEditing && profile.portfolio.length < 5 && (
              <div className="flex items-center justify-center border-2 border-dashed border-glamour-gold/40 rounded-xl h-48 w-full bg-glamour-light/50 hover:bg-glamour-gold/10 transition-colors">
                <input
                  type="file"
                  ref={portfolioInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePortfolioImageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfile;