import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { useAuth } from "@/context/Authcontext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { useToast } from "@/components/ui/use-toast";

// Helper function to compute initials from a name
const getInitials = (name: string): string => {
  if (!name) return "";
  const names = name.trim().split(" ");
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (
    names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase()
  );
};

const CustomerProfile = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    uid: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch the customer's profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const profileDocRef = doc(db, "customers", currentUser.uid);
        const snapshot = await getDoc(profileDocRef);
        if (snapshot.exists()) {
          setProfile(snapshot.data() as typeof profile);
        } else {
          console.log("No customer profile found");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to fetch profile",
          variant: "destructive",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [currentUser, toast]);

  // Handle saving updates to the customer's profile
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const profileDocRef = doc(db, "customers", currentUser.uid);
      await updateDoc(profileDocRef, {
        name: profile.name,
        phone: profile.phone,
      });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Customer Profile
        </h1>
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader className="animate-spin h-8 w-8" />
            <p>Loading Profile...</p>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
            {/* Avatar using initials */}
            <div className="mb-6">
              <Label>Avatar</Label>
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {getInitials(profile.name)}
                </span>
              </div>
            </div>
            <div className="mb-6">
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="mt-1"
                />
              ) : (
                <p className="text-lg">{profile.name}</p>
              )}
            </div>
            <div className="mb-6">
              <Label htmlFor="phone">Phone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="mt-1"
                />
              ) : (
                <p className="text-lg">{profile.phone}</p>
              )}
            </div>
            <div className="mb-6">
              <Label>Email</Label>
              <p className="text-lg">{profile.email}</p>
            </div>
            <div>
              {isEditing ? (
                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CustomerProfile;