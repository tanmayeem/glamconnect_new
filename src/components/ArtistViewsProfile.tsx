import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Star, Calendar, Clock, Camera, Users, Heart, Instagram } from "lucide-react";

interface ArtistData {
  name: string;
  bio?: string; // Not in the database, but keeping for compatibility
  location: string;
  specialties: string; // Updated to match database field name
  experience?: string; // Not in the database, but keeping for compatibility
  rate?: number; // Not in the database, but keeping for compatibility
  profilePicture?: string; // Updated to match database field name
  portfolio?: string[];
  phone?: string;
  instagram?: string;
}

interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  comment: string;
}

const ArtistViewProfile = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [artistData, setArtistData] = useState<ArtistData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!artistId) return;

      try {
        // Fetch artist data
        const artistRef = doc(db, "artists", artistId);
        const artistSnap = await getDoc(artistRef);

        if (artistSnap.exists()) {
          setArtistData(artistSnap.data() as ArtistData);
        } else {
          console.error("No artist found with this ID");
        }

        // Fetch reviews from subcollection
        const reviewsRef = collection(db, "artists", artistId, "reviews");
        const reviewsSnap = await getDocs(reviewsRef);
        const reviewsData = reviewsSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "Anonymous",
          date: doc.data().date?.toDate().toLocaleDateString() || "Unknown Date",
          rating: doc.data().rating || 0,
          comment: doc.data().comment || "",
        }));

        setReviews(reviewsData);

        // Calculate average rating
        if (reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(Number((totalRating / reviewsData.length).toFixed(1)));
        }
      } catch (error) {
        console.error("Error fetching artist data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

  const handleBookNow = () => {
    navigate(`/booking/${artistId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-glamour-light flex items-center justify-center">
        <div className="animate-pulse text-glamour-dark text-lg">Loading artist profile...</div>
      </div>
    );
  }

  if (!artistData) {
    return (
      <div className="min-h-screen bg-glamour-light flex items-center justify-center">
        <div className="text-glamour-dark text-lg">Artist not found</div>
      </div>
    );
  }

  // Fallback portfolio images if none exist in the database
  const portfolioImages = artistData.portfolio && artistData.portfolio.length > 0
    ? artistData.portfolio
    : [
        "https://images.unsplash.com/photo-1560577260-78457c7dc4a4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        "https://images.unsplash.com/photo-1576239088113-85cdef3b2c58?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        "https://images.unsplash.com/photo-1566312922674-2e341ea3817f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      ];

  return (
    <div className="min-h-screen bg-glamour-light">
      <Navigation />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Artist Header */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="h-48 bg-gradient-to-r from-glamour-red to-glamour-gold relative" />
            
            <div className="flex flex-col md:flex-row p-6 pt-8">
              <div className="md:w-1/3 flex justify-center md:justify-start">
                <Avatar className="h-32 w-32 border-4 border-glamour-light -mt-16 md:-mt-24">
                  <AvatarImage src={artistData.profilePicture || "/placeholder.svg"} />
                  <AvatarFallback className="bg-glamour-gold/20 text-glamour-dark">
                    {artistData.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="md:w-2/3 mt-4 md:mt-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h1 className="font-serif text-3xl text-glamour-dark">{artistData.name}</h1>
                    <p className="text-glamour-dark/60 flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-glamour-gold" /> {artistData.location}
                    </p>
                    <div className="flex items-center gap-1 text-glamour-gold mt-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{averageRating || "No reviews yet"} ({reviews.length} reviews)</span>
                    </div>
                    {artistData.instagram && (
                      <a
                        href={artistData.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-glamour-dark/60 flex items-center gap-2 mt-1 hover:text-glamour-gold transition-colors"
                      >
                        <Instagram className="w-4 h-4" /> Instagram
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button variant="outline" className="border-glamour-gold/50 text-glamour-dark hover:bg-glamour-gold/20">
                      <Heart className="w-4 h-4 mr-2 text-glamour-red" /> Favorite
                    </Button>
                    <Button 
                      className="bg-gradient-glamour text-white hover:opacity-90"
                      onClick={handleBookNow}
                    >
                      <Calendar className="w-4 h-4 mr-2" /> Book Now
                    </Button>
                  </div>
                </div>
                
                <p className="text-glamour-dark/80">{artistData.bio || "No bio available."}</p>
              </div>
            </div>
          </div>
          
          {/* Professional Info & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="col-span-1 border-glamour-gold/20">
              <CardHeader>
                <h2 className="font-serif text-xl text-glamour-dark">Specialization</h2>
              </CardHeader>
              <CardContent>
                <p className="text-glamour-dark/80">{artistData.specialties}</p>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 border-glamour-gold/20">
              <CardHeader>
                <h2 className="font-serif text-xl text-glamour-dark">Experience</h2>
              </CardHeader>
              <CardContent>
                <p className="text-glamour-dark/80">{artistData.experience || "Not specified"} years</p>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 border-glamour-gold/20">
              <CardHeader>
                <h2 className="font-serif text-xl text-glamour-dark">Contact</h2>
              </CardHeader>
              <CardContent>
                <p className="text-glamour-dark/80">{artistData.phone || "Not specified"}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Artist Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-glamour-gold/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-glamour-gold" />
                  <div className="text-2xl font-serif text-glamour-dark">{averageRating || "N/A"}</div>
                  <p className="text-sm text-glamour-dark/60">Average Rating</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-glamour-gold/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-glamour-red" />
                  <div className="text-2xl font-serif text-glamour-dark">{reviews.length * 10}+</div>
                  <p className="text-sm text-glamour-dark/60">Clients Served</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-glamour-gold/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-glamour-dark" />
                  <div className="text-2xl font-serif text-glamour-dark">Quick</div>
                  <p className="text-sm text-glamour-dark/60">Response Time</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Portfolio */}
          <div className="mb-12">
            <h2 className="font-serif text-2xl text-glamour-dark mb-6 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-glamour-gold" /> Portfolio
            </h2>
            
            <Carousel className="w-full">
              <CarouselContent>
                {portfolioImages.map((image, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="border-glamour-gold/20">
                        <CardContent className="flex aspect-square items-center justify-center p-0 overflow-hidden rounded-lg">
                          <img 
                            src={image} 
                            alt={`Portfolio image ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = "/placeholder.svg")} // Fallback for broken images
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 bg-glamour-gold/50 hover:bg-glamour-gold/80 text-white" />
              <CarouselNext className="right-0 bg-glamour-gold/50 hover:bg-glamour-gold/80 text-white" />
            </Carousel>
          </div>
          
          {/* Reviews */}
          <div className="mb-12">
            <h2 className="font-serif text-2xl text-glamour-dark mb-6 flex items-center">
              <Star className="w-5 h-5 mr-2 text-glamour-gold" /> Reviews
            </h2>
            
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <Card key={review.id} className="border-glamour-gold/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-glamour-gold/20 text-glamour-dark">
                            {review.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium text-glamour-dark">{review.name}</h3>
                            <p className="text-sm text-glamour-dark/60">{review.date}</p>
                          </div>
                          <div className="flex text-glamour-gold mb-2">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? "fill-current" : ""}`}
                                />
                              ))}
                          </div>
                          <p className="text-glamour-dark/80">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-glamour-dark/60 text-center">No reviews yet.</p>
            )}
            
            {reviews.length > 2 && (
              <div className="mt-6 text-center">
                <Button variant="outline" className="border-glamour-gold/50 text-glamour-dark hover:bg-glamour-gold/20">
                  See All Reviews
                </Button>
              </div>
            )}
          </div>
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-glamour-red to-glamour-gold p-8 rounded-xl text-white text-center mb-12">
            <h2 className="font-serif text-2xl mb-4">Ready to Book {artistData.name}?</h2>
            <p className="mb-6 max-w-xl mx-auto">
              Secure your appointment with {artistData.name} today and transform your look with professional makeup services.
            </p>
            <Button 
              className="bg-white text-glamour-dark hover:bg-white/90"
              size="lg"
              onClick={handleBookNow}
            >
              <Calendar className="w-4 h-4 mr-2" /> Book an Appointment
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArtistViewProfile;