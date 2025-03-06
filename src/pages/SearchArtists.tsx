import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Search, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/Authcontext";
import { useToast } from "@/components/ui/use-toast";

interface Artist {
  uid: string;
  name: string;
  specialties: string;
  rate?: number;
  profilePicture?: string;
  location?: string;
}

const SearchArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedArtistIds, setSavedArtistIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "artists"));
        const artistsData: Artist[] = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...(doc.data() as Omit<Artist, "uid">),
        }));
        setArtists(artistsData);
      } catch (error) {
        console.error("Error fetching artists: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  useEffect(() => {
    const fetchSavedArtists = async () => {
      if (!currentUser) return;
      try {
        const savedArtistsRef = collection(db, "savedArtists");
        const querySnapshot = await getDocs(savedArtistsRef);
        const savedIds = querySnapshot.docs
          .map((doc) => doc.data())
          .filter((data) => data.customerId === currentUser.uid)
          .map((data) => data.artistId);
        setSavedArtistIds(savedIds);
      } catch (error) {
        console.error("Error fetching saved artists: ", error);
      }
    };

    fetchSavedArtists();
  }, [currentUser]);

  const filteredArtists = artists.filter((artist) => {
    const matchesName = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = artist.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesName || matchesLocation;
  });

  const toggleSaveArtist = async (artist: Artist) => {
    if (!currentUser) {
      toast({
        title: "Not Authenticated",
        description: "You need to be logged in to save artists.",
        variant: "destructive",
      });
      return;
    }

    const savedArtistDocId = `${currentUser.uid}_${artist.uid}`;
    const artistDocRef = doc(db, "savedArtists", savedArtistDocId);

    if (savedArtistIds.includes(artist.uid)) {
      try {
        await deleteDoc(artistDocRef);
        setSavedArtistIds((prev) => prev.filter((id) => id !== artist.uid));
        toast({
          title: "Artist Removed",
          description: `${artist.name} has been removed from your saved artists.`,
        });
      } catch (error) {
        console.error("Error removing saved artist: ", error);
        toast({
          title: "Error",
          description: "Failed to remove the artist. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      try {
        await setDoc(artistDocRef, {
          customerId: currentUser.uid,
          artistId: artist.uid,
          artistName: artist.name,
          createdAt: new Date().toISOString(),
          profilePicture: artist.profilePicture,
          specialties: artist.specialties,
        });
        setSavedArtistIds((prev) => [...prev, artist.uid]);
        toast({
          title: "Artist Saved",
          description: `${artist.name} has been added to your saved artists.`,
        });
      } catch (error) {
        console.error("Error saving artist: ", error);
        toast({
          title: "Error",
          description: "Failed to save the artist. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-glamour-light">
      <Navigation />
      <main className="container mx-auto px-4 py-20 ">
        <div className="max-w-4xl mx-auto p-5">
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Find Your Perfect Makeup Artist (Name or Location)"
              className="w-full h-14 pl-12 pr-4 rounded-full border-2 border-glamour-gold/20 focus:border-glamour-gold focus:outline-none font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-glamour-dark/40" />
          </div>
          {loading ? (
            <p>Loading artists...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtists.map((artist) => (
                <div key={artist.uid} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="h-48">
                    {artist.profilePicture ? (
                      <img
                        src={artist.profilePicture}
                        alt={`${artist.name} Profile`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-glamour" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-serif text-xl text-glamour-dark">
                        {artist.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => toggleSaveArtist(artist)}
                        className="focus:outline-none"
                      >
                        <Heart
                          className={`w-6 h-6 transition-colors ${
                            savedArtistIds.includes(artist.uid)
                              ? "fill-red-500"
                              : "fill-white"
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-glamour-dark/60 mb-4">
                      {artist.specialties}
                    </p>
                    {artist.location && (
                      <p className="text-sm text-glamour-dark/60 mb-4">
                        Location: {artist.location}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">
                        ${artist.rate ? artist.rate : 150}/session
                      </span>
                      <Button
                        variant="outline"
                        className="border-glamour-gold text-glamour-dark hover:bg-glamour-gold/10"
                        onClick={() => navigate(`/booking/${artist.uid}`)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchArtists;
