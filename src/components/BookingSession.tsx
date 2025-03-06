import Navigation from "@/components/Navigation";
import { Book, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { db } from "../../firebaseconfig";
import { useParams } from "react-router-dom";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../context/Authcontext";

const Booking = () => {
  const { artistId } = useParams<{ artistId: string }>();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const { currentUser } = useAuth();
  const [artistName, setArtistName] = useState<string>("");

  const { toast } = useToast();

  const currentDate = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(currentDate.getDate() + i);
    return date;
  });

  const times = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  // Fetch artist data using the artistId from URL params
  useEffect(() => {
    const fetchArtist = async () => {
      if (artistId) {
        try {
          const artistDocRef = doc(db, "artists", artistId);
          const artistDocSnap = await getDoc(artistDocRef);
          if (artistDocSnap.exists()) {
            const data = artistDocSnap.data();
            setArtistName(data.name || "Unknown Artist");
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

    const bookingDate = dates[selectedDate];
    const bookingData = {
      artistName,
      date: bookingDate.toISOString(),
      time: selectedTime,
      note,
      createdAt: new Date().toISOString(),
      artistId: artistId || null,
      customerId: currentUser ? currentUser.uid : null,
    };

    try {
      await addDoc(collection(db, "bookings"), bookingData);
      toast({
        title: "✅ Booking Successful",
        description: "Your booking has been confirmed.",
      });
      setSelectedDate(null);
      setSelectedTime(null);
      setNote("");
    } catch (error) {
      console.error("Error saving booking: ", error);
      toast({
        title: "Booking Error",
        description: "There was an error saving your booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-glamour-light">
      <Navigation />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-glamour-gold/20">
                  <h1 className="font-serif text-3xl text-glamour-dark mb-2">
                    Book Your Session
                  </h1>
                  <p className="text-glamour-dark/60">
                    Select your preferred date and time
                  </p>
                  {artistName && (
                    <p className="text-lg font-serif text-glamour-dark mt-2">
                      Booking with:{" "}
                      <span className="font-bold">{artistName}</span>
                    </p>
                  )}
                </div>

                <div className="p-6 space-y-8">
                  {/* Date Selection */}
                  <div>
                    <label className="block font-serif text-lg mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-glamour-gold" />
                      Select Date
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {dates.map((date, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedDate(i)}
                          className={`
                            aspect-square rounded-lg border-2 hover:border-glamour-gold 
                            hover:bg-glamour-gold/10 transition-colors flex flex-col 
                            items-center justify-center
                            ${
                              selectedDate === i 
                                ? "border-glamour-gold bg-glamour-gold/10" 
                                : "border-glamour-gold/20"
                            }
                          `}
                        >
                          <span className="text-sm text-glamour-dark/60">
                            {format(date, "EEE")}
                          </span>
                          <span className="text-lg font-serif text-glamour-dark">
                            {format(date, "d")}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-serif text-lg mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-glamour-gold" />
                      Select Time
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {times.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`
                            py-3 px-4 rounded-lg border-2 hover:border-glamour-gold 
                            hover:bg-glamour-gold/10 transition-colors text-center
                            ${
                              selectedTime === time 
                                ? "border-glamour-gold bg-glamour-gold/10" 
                                : "border-glamour-gold/20"
                            }
                          `}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note Field */}
                  <div>
                    <label className="block font-serif text-lg mb-4">
                      Note  
                    </label>
                    <textarea 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add any notes or requirements here..."
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={handleBooking}
                    className="w-full bg-gradient-glamour text-white"
                    disabled={selectedDate === null || selectedTime === null}
                  >
                    <Book className="w-4 h-4 mr-2" />
                    Book Now
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

export default Booking;