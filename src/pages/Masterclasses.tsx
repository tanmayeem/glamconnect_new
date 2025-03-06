import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseconfig";  
import Navigation from "@/components/Navigation";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { format } from "date-fns";

const Masterclasses = () => {
  const [masterclasses, setMasterclasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMasterclasses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "masterclasses"));
        const masterclassesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMasterclasses(masterclassesData);
      } catch (error) {
        console.error("Error fetching masterclasses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMasterclasses();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Loading masterclasses...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-glamour-light">
      <Navigation />
      
      <main className="container mx-auto px-4 py-20 p-10">
        <h1 className="font-serif text-4xl text-glamour-dark text-center mb-12">
          Masterclasses
        </h1>

        {masterclasses.length === 0 ? (
          <p className="text-center text-glamour-dark/60">
            No masterclasses available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {masterclasses.map((masterclass) => (
              <div
                key={masterclass.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/masterclasses/${masterclass.id}`)}
              >
                <div className="relative h-48">
                  {masterclass.coverImageUrl ? (
                    <img
                      src={masterclass.coverImageUrl}
                      alt={masterclass.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full bg-gray-300 flex items-center justify-center text-gray-600">
                      No Cover Image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Masterclass Details */}
                <div className="p-6">
                  <h3 className="font-serif text-xl text-glamour-dark mb-2">
                    {masterclass.title}
                  </h3>
                  <p className="text-sm text-glamour-dark/60 mb-4">
                    {masterclass.description.length > 80
                      ? `${masterclass.description.substring(0, 80)}...`
                      : masterclass.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-glamour-pink" />
                      <span className="text-sm">
                        {masterclass.date ? format(masterclass.date.toDate(), "PPP") : "Date TBD"}
                      </span>
                    </div>
                    <Button className="bg-gradient-glamour text-white" onClick={() => navigate(`/masterclasses/${masterclass.id}`)} >
                      Join Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Masterclasses;
