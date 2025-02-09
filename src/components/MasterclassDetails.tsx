import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Calendar, User, MapPin, DollarSign, Users, Clock , Contact} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface Masterclass {
  id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  date: Timestamp;
  duration: number;
  price: number;
  capacity: number;
  location: string;
  createby?: string;
  requirements?: string;
}

const MasterclassDetails = () => {
  const [masterclass, setMasterclass] = useState<Masterclass | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchMasterclass = async () => {
      try {
        if (!id) return;
        const docRef = doc(db, "masterclasses", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setMasterclass({
            id: docSnap.id,
            ...docSnap.data(),
          } as Masterclass);
        }
      } catch (error) {
        console.error("Error fetching masterclass:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMasterclass();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Loading masterclass details...
      </div>
    );
  }

  if (!masterclass) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Masterclass not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-glamour-light">
      <Navigation />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Cover Image */}
          <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
            {masterclass.coverImageUrl ? (
              <img
                src={masterclass.coverImageUrl}
                alt={masterclass.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                No Cover Image
              </div>
            )}
          </div>

          {/* Masterclass Details */}
          <div className="mb-8">
            <h1 className="font-serif text-4xl text-glamour-dark mb-4">
              {masterclass.title}
            </h1>
            <p className="text-glamour-dark/80 text-lg">
              {masterclass.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              {/* Creator (Artist) Info */}
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-glamour-pink" />
                <span className="text-glamour-dark">
                  {masterclass.createby || "Artist name not provided"}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-glamour-pink" />
                <span className="text-glamour-dark">
                  {masterclass.date ? format(masterclass.date.toDate(), "PPP") : "Date TBD"}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-glamour-pink" />
                <span className="text-glamour-dark">{masterclass.location}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Price */}
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-glamour-pink" />
                <span className="text-glamour-dark">${masterclass.price}</span>
              </div>

              {/* Capacity */}
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-glamour-pink" />
                <span className="text-glamour-dark">{masterclass.capacity} spots available</span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-glamour-pink" />
                <span className="text-glamour-dark">{masterclass.duration} minutes</span>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {masterclass.requirements && (
            <div className="mb-8">
              <h2 className="font-serif text-2xl text-glamour-dark mb-3">
                Requirements
              </h2>
              <p className="text-glamour-dark/80">
                {masterclass.requirements}
              </p>
            </div>
          )}

          {/* Action Button */}
          <Button className="w-50 bg-gradient-glamour text-white py-6 text-lg flex align-iterms-center">
            <Contact/>
            Contact Now 
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MasterclassDetails;
