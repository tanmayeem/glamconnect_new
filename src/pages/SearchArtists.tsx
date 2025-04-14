import { useEffect, useState, useRef } from "react";
import Navigation from "@/components/Navigation";
import { Search, Heart, Filter, X } from "lucide-react";
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
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const filterRef = useRef<HTMLDivElement>(null);

  // Fetch artists and unique locations
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "artists"));
        const artistsData: Artist[] = querySnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...(doc.data() as Omit<Artist, "uid">),
        }));
        setArtists(artistsData);

        // Extract unique locations
        const uniqueLocations = [
          ...new Set(
            artistsData
              .map((artist) => artist.location)
              .filter((location): location is string => !!location)
          ),
        ];
        setLocations(uniqueLocations);
      } catch (error) {
        console.error("Error fetching artists: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Fetch saved artists
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

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter artists based on search query and selected location
  const filteredArtists = artists.filter((artist) => {
    const matchesName = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = artist.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = matchesName || matchesLocation;
    const matchesFilter = selectedLocation
      ? artist.location?.toLowerCase() === selectedLocation.toLowerCase()
      : true;
    return matchesSearch && matchesFilter;
  });

  const toggleSaveArtist = async (artist: Artist, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      toast({
        title: "Not Authenticated",
        description: "You need to be logged in to save artists.",
        variant: "destructive",
        className: "bg-glamour-red text-white border-glamour-gold/50",
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
          className: "bg-glamour-gold/20 text-glamour-dark",
        });
      } catch (error) {
        console.error("Error removing saved artist: ", error);
        toast({
          title: "Error",
          description: "Failed to remove the artist. Please try again.",
          variant: "destructive",
          className: "bg-glamour-red text-white border-glamour-gold/50",
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
          className: "bg-glamour-gold/20 text-glamour-dark",
        });
      } catch (error) {
        console.error("Error saving artist: ", error);
        toast({
          title: "Error",
          description: "Failed to save the artist. Please try again.",
          variant: "destructive",
          className: "bg-glamour-red text-white border-glamour-gold/50",
        });
      }
    }
  };

  const handleCardClick = (artistId: string) => {
    navigate(`/artist/${artistId}`);
  };

  const handleBookNow = (artistId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/booking/${artistId}`);
  };

  const handleLocationFilter = (location: string | null) => {
    setSelectedLocation(location);
    setIsFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-glamour-light">
      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Search Bar and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 pt-10">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by name or location"
                className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-glamour-gold/20 focus:border-glamour-gold focus:outline-none font-sans bg-white/95 shadow-md hover:shadow-lg transition-shadow text-glamour-dark placeholder-glamour-dark/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-glamour-dark/40 h-5 w-5" />
            </div>
            <div className="relative" ref={filterRef}>
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="h-12 px-4 rounded-full bg-gradient-glamour text-white hover:opacity-90 shadow-md flex items-center gap-2"
              >
                <Filter className="h-5 w-5" />
                {selectedLocation ? `Location: ${selectedLocation}` : "Filter by Location"}
              </Button>
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-glamour-gold/20 z-10 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => handleLocationFilter(null)}
                      className="w-full text-left px-4 py-2 text-glamour-dark hover:bg-glamour-gold/10 rounded-md flex items-center justify-between"
                    >
                      Clear Filter
                      {selectedLocation && <X className="h-4 w-4 text-glamour-red" />}
                    </button>
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => handleLocationFilter(location)}
                        className={`w-full text-left px-4 py-2 text-glamour-dark hover:bg-glamour-gold/10 rounded-md ${
                          selectedLocation === location ? "bg-glamour-gold/20" : ""
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Artist Grid */}
          {loading ? (
            <p className="text-center text-glamour-dark/70">Loading artists...</p>
          ) : filteredArtists.length === 0 ? (
            <div className="text-center text-glamour-dark/70">
              <p>No artists found.</p>
              <p className="text-sm mt-2">
                Try adjusting your search or filter settings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.uid}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => handleCardClick(artist.uid)}
                >
                  {/* Profile Picture */}
                  <div className="h-40 sm:h-48 relative">
                    {artist.profilePicture ? (
                      <img
                        src={artist.profilePicture}
                        alt={`${artist.name} Profile`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-glamour flex items-center justify-center">
                        <span className="text-white/70 font-serif text-lg">
                          {artist.name ? artist.name[0] : "A"}
                        </span>
                      </div>
                    )}
                    {/* Save Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleSaveArtist(artist, e)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          savedArtistIds.includes(artist.uid)
                            ? "fill-glamour-red text-glamour-red"
                            : "fill-glamour-light text-glamour-dark/40"
                        } transition-colors`}
                      />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <div className="mb-2">
                      <h3 className="font-serif text-xl bg-gradient-to-r from-glamour-red to-glamour-gold bg-clip-text text-transparent">
                        {artist.name}
                      </h3>
                    </div>
                    <p className="text-sm text-glamour-dark/70 mb-2 line-clamp-2">
                      {artist.specialties}
                    </p>
                    {artist.location && (
                      <p className="text-sm text-glamour-dark/70 mb-3">
                        Location: {artist.location}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-glamour-dark">
                        ${artist.rate ? artist.rate : 150}/session
                      </span>
                      <Button
                        variant="outline"
                        className="bg-gradient-glamour text-white hover:opacity-90 rounded-lg px-4 py-2"
                        onClick={(e) => handleBookNow(artist.uid, e)}
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