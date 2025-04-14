import Navigation from "@/components/Navigation";
import { Book, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { db } from "../../firebaseconfig";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../context/Authcontext";

const Booking = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const { currentUser } = useAuth();
  const [artistName, setArtistName] = useState<string>("");
  const [availability, setAvailability] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Redirect to login if user is not logged in
  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "🔒 Login Required",
        description: "Please log in to book an appointment.",
        className: "bg-glamour-red text-white border-glamour-gold/50",
      });
      navigate("/login");
    }
  }, [currentUser, navigate, toast]);

  const currentDate = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(currentDate.getDate() + i);
    return date;
  });

  const times = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

  // Fetch artist data and availability
  useEffect(() => {
    const fetchArtist = async () => {
      if (artistId) {
        try {
          const artistDocRef = doc(db, "artists", artistId);
          const artistDocSnap = await getDoc(artistDocRef);
          if (artistDocSnap.exists()) {
            const data = artistDocSnap.data();
            setArtistName(data.name || "Unknown Artist");
            setAvailability(data.availability || {});
          }
        } catch (error) {
          console.error("Error fetching artist data: ", error);
        }
      }
    };

    fetchArtist();
  }, [artistId]);

  const handleBooking = async () => {
    if (selectedDate === null || !selectedTime) return;

    if (!currentUser) {
      toast({
        title: "🔒 Login Required",
        description: "Please log in to book an appointment.",
        className: "bg-glamour-red text-white border-glamour-gold/50",
      });
      navigate("/login");
      return;
    }

    const bookingDate = dates[selectedDate];
    const localDate = bookingDate.toLocaleDateString("en-CA"); // Format: YYYY-MM-DD

    // Check availability
    if (availability[localDate] === "unavailable") {
      toast({
        title: "⛔ Unavailable Date",
        description: `The artist is not available on ${format(bookingDate, "PPP")}. Please select another date.`,
        className: "bg-glamour-red text-white border-glamour-gold/50",
      });
      return;
    }

    const bookingData = {
      artistName,
      date: bookingDate.toISOString(),
      time: selectedTime,
      note,
      createdAt: new Date().toISOString(),
      artistId: artistId || null,
      customerId: currentUser.uid,
    };

    try {
      await addDoc(collection(db, "bookings"), bookingData);
      toast({
        title: "✨ Booking Confirmed!",
        description: `Your glamorous session with ${artistName} on ${format(bookingDate, "PPP")} at ${selectedTime} has been confirmed.`,
        className: "bg-glamour-light border-glamour-gold/50 text-glamour-dark",
      });
      setSelectedDate(null);
      setSelectedTime(null);
      setNote("");
      setTimeout(() => {
        navigate(`/artist-profile/${artistId}`);
      }, 2000);
    } catch (error) {
      console.error("Error saving booking: ", error);
      toast({
        title: "Booking Error",
        description: "There was an error saving your booking. Please try again.",
        variant: "destructive",
        className: "bg-glamour-red text-white border-glamour-gold/50",
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-glamour-light flex items-center justify-center">
        <div className="text-glamour-dark text-lg">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-glamour-light relative overflow-hidden">
      {/* Decorative Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-glamour-red/10 to-glamour-gold/10 opacity-50 -z-10" />

      <Navigation />
      <main className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-glamour-gold/20 bg-gradient-to-r from-glamour-red to-glamour-gold text-white">
                  <h1 className="font-serif text-2xl md:text-3xl flex items-center">
                    <Calendar className="w-6 h-6 mr-2" /> Book Your Glam Session
                  </h1>
                  <p className="text-sm mt-2">
                    Schedule with {artistName || "a talented artist"}
                  </p>
                </div>

                <div className="p-6 space-y-8">
                  {/* Date Selection */}
                  <div>
                    <label className="block font-serif text-lg mb-4 flex items-center gap-2 text-glamour-dark">
                      <Calendar className="w-5 h-5 text-glamour-gold" />
                      Select Date
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {dates.map((date, i) => {
                        const localDate = date.toLocaleDateString("en-CA");
                        const isUnavailable = availability[localDate] === "unavailable";
                        return (
                          <button
                            key={i}
                            onClick={() => !isUnavailable && setSelectedDate(i)}
                            className={`
                              aspect-square rounded-lg border-2 transition-all duration-300 flex flex-col 
                              items-center justify-center relative group
                              ${
                                isUnavailable
                                  ? "border-glamour-red/30 bg-glamour-red/10 opacity-60 cursor-not-allowed"
                                  : selectedDate === i
                                  ? "border-glamour-gold bg-glamour-gold/10 ring-2 ring-glamour-gold/50"
                                  : "border-glamour-gold/20 hover:border-glamour-gold hover:bg-glamour-gold/10"
                              }
                            `}
                            disabled={isUnavailable}
                          >
                            <span className="text-xs text-glamour-dark/60">
                              {format(date, "EEE")}
                            </span>
                            <span className="text-base font-serif text-glamour-dark">
                              {format(date, "d")}
                            </span>
                            {isUnavailable && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <AlertCircle className="h-5 w-5 text-glamour-red" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block font-serif text-lg mb-4 flex items-center gap-2 text-glamour-dark">
                      <Clock className="w-5 h-5 text-glamour-gold" />
                      Select Time
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {times.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`
                            py-3 px-4 rounded-lg border-2 hover:border-glamour-gold 
                            hover:bg-glamour-gold/10 transition-all duration-300 text-center
                            ${
                              selectedTime === time
                                ? "border-glamour-gold bg-glamour-gold/10 ring-2 ring-glamour-gold/50"
                                : "border-glamour-gold/20"
                            }
                          `}
                        >
                          <span className="text-sm font-medium text-glamour-dark">{time}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note Field */}
                  <div>
                    <label className="block font-serif text-lg mb-4 text-glamour-dark">
                      Special Requests
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add any notes or makeup preferences..."
                      className="w-full p-4 border border-glamour-gold/20 rounded-lg focus:ring-2 focus:ring-glamour-gold/50 focus:border-glamour-gold transition-all duration-300 bg-white text-glamour-dark placeholder-glamour-dark/50 resize-none"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleBooking}
                    className="w-full bg-gradient-glamour text-white py-3 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center disabled:bg-glamour-gold/50 disabled:cursor-not-allowed"
                    disabled={selectedDate === null || selectedTime === null}
                  >
                    <Book className="w-5 h-5 mr-2" />
                    Confirm Glam Booking
                  </Button>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col justify-between border border-glamour-gold/20">
                <div>
                  <h2 className="font-serif text-xl md:text-2xl text-glamour-dark mb-4">
                    Booking Preview
                  </h2>
                  <div className="space-y-3 text-glamour-dark/80">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-glamour-gold" />
                      Date: {selectedDate !== null ? format(dates[selectedDate], "PPP") : "Not selected"}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-glamour-gold" />
                      Time: {selectedTime || "Not selected"}
                    </p>
                    <p className="flex items-center gap-2">
                      Artist: <span className="font-medium text-glamour-dark">{artistName || "Unknown Artist"}</span>
                    </p>
                    {note && (
                      <p className="flex items-start gap-2">
                        <span>Note:</span>
                        <span className="italic text-glamour-dark/70">{note}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full border-glamour-gold/50 text-glamour-dark hover:bg-glamour-gold/20 py-3 rounded-lg"
                    onClick={() => {
                      setSelectedDate(null);
                      setSelectedTime(null);
                      setNote("");
                    }}
                    disabled={selectedDate === null && selectedTime === null && !note}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Animation CSS (Add this to your global CSS file or a style block)
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.6s ease-in-out;
  }
`;

export default Booking;