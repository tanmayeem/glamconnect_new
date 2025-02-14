import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseconfig";  

interface Artist {
  uid: string;
  name: string;
  specialties: string;
  rate?: number;  
  profilePicture?: string;
}

const SearchArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-glamour-light">
      <Navigation />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Find Your Perfect Makeup Artist"
              className="w-full h-14 pl-12 pr-4 rounded-full border-2 border-glamour-gold/20 focus:border-glamour-gold focus:outline-none font-sans"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-glamour-dark/40" />
          </div>

          {loading ? (
            <p>Loading artists...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
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
                  <h3 className="font-serif text-xl text-glamour-dark mb-2">
                    {artist.name}
                  </h3>
                  <p className="text-sm text-glamour-dark/60 mb-4">
                    {artist.specialties}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">
                      ${artist.rate ? artist.rate : 150}/session
                    </span>
                    <Button
                      variant="outline"
                      className="border-glamour-gold text-glamour-dark hover:bg-glamour-gold/10"
                    >
                      Book Now
                      <a href={`//artist-profile/${artist.uid}`}></a>
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