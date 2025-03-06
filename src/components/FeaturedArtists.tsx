import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { Star, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeaturedArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artistsCollection = collection(db, "artists");
        const snapshot = await getDocs(artistsCollection);
        const artistsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArtists(artistsList);
      } catch (error) {
        console.error("Error fetching artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <section className="py-20 bg-glamour-light">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-4xl md:text-5xl text-glamour-dark text-center mb-6 drop-shadow-md">
          Featured Artists
        </h2>
        <p className="font-sans text-lg md:text-xl text-glamour-dark/70 text-center mb-16">
          Discover our hand-picked selection of elite makeup artists
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="group relative bg-white/90 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-glamour-gold/20"
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={artist.image || "https://via.placeholder.com/300"}
                  alt={`${artist.name}'s work`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-gradient-glamour hover:text-white transition-all duration-300">
                  <Heart
                    className="w-6 h-6 fill-glamour-dark group-hover:fill-white"
                  />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-glamour-red/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-6 bg-gradient-to-b from-transparent via-white/95 to-white">
                <h3 className="font-serif text-2xl text-glamour-dark mb-2 drop-shadow">
                  {artist.name}
                </h3>
                <p className="font-sans text-sm text-glamour-dark/70 mb-4">
                  {artist.specialty}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-glamour-gold text-glamour-gold drop-shadow" />
                    <span className="font-sans text-sm text-glamour-dark">
                      {artist.rating} ({artist.reviews} reviews)
                    </span>
                  </div>
                  <button
                    className="font-sans text-sm bg-glamour-gold/20 text-white px-4 py-2 rounded-full hover:bg-gradient-glamour transition-all duration-300"
                    onClick={() => navigate(`/artistviewprofile/${artist.id}`)}
                  >
                    View Profile →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;
