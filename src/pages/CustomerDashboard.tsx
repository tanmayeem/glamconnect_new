import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Calendar, CreditCard, Heart, Star } from "lucide-react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/Authcontext";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebaseconfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { format } from "date-fns";
import ReviewForm from "@/components/ReviewForm";

const CustomerDashboard = () => {
  const [Username, setUsername] = useState("Loading...");
  const [nextBooking, setNextBooking] = useState(null);
  const [pastBookings, setPastBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [openReviewFormFor, setOpenReviewFormFor] = useState<string | null>(null);
  const [savedArtists, setSavedArtists] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      if (!currentUser) return;
      try {
        const customerDoc = doc(db, "customers", currentUser.uid);
        const snapshot = await getDoc(customerDoc);
        if (snapshot.exists()) {
          setUsername(snapshot.data().name);
        } else {
          setUsername("Unknown Customer");
        }
      } catch (error) {
        console.log("Error in fetching username", error);
        setUsername("Error Loading");
      }
    };
    fetchUsername();
  }, [currentUser]);

  useEffect(() => {
    const fetchNextBooking = async () => {
      if (!currentUser) return;
      try {
        const nowISO = new Date().toISOString();
        const bookingsRef = collection(db, "bookings");
        const q = query(
          bookingsRef,
          where("customerId", "==", currentUser.uid),
          where("date", ">=", nowISO),
          orderBy("date", "asc")
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const bookingData = querySnapshot.docs[0].data();
          setNextBooking(bookingData);
        } else {
          setNextBooking(null);
        }
      } catch (error) {
        console.error("Error fetching next booking: ", error);
      }
    };
    fetchNextBooking();
  }, [currentUser]);

  useEffect(() => {
    const fetchPastBookings = async () => {
      if (!currentUser) return;
      try {
        const nowISO = new Date().toISOString();
        const bookingsRef = collection(db, "bookings");
        const q = query(
          bookingsRef,
          where("customerId", "==", currentUser.uid),
          where("date", "<", nowISO),
          orderBy("date", "desc")
        );
        const querySnapshot = await getDocs(q);
        const pastBookingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPastBookings(pastBookingsData);
      } catch (error) {
        console.error("Error fetching past bookings: ", error);
      }
    };
    fetchPastBookings();
  }, [currentUser]);

  // Fetch reviews written by the current user
  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser) return;
      try {
        const reviewsRef = collection(db, "reviews");
        const q = query(
          reviewsRef,
          where("customerId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const reviewsData = querySnapshot.docs.map((doc) => doc.data());
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews: ", error);
      }
    };
    fetchReviews();
  }, [currentUser]);

  // Fetch saved artists for the current customer
  useEffect(() => {
    const fetchSavedArtists = async () => {
      if (!currentUser) return;
      try {
        const savedArtistsRef = collection(db, "savedArtists");
        const q = query(
          savedArtistsRef,
          where("customerId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const savedArtistsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSavedArtists(savedArtistsData);
      } catch (error) {
        console.error("Error fetching saved artists: ", error);
      }
    };
    fetchSavedArtists();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-glamour-light">
      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-4xl text-glamour-dark mb-2">
                Welcome Back, {Username || "Customer"}
              </h1>
              <p className="text-glamour-dark/60">
                Manage your bookings and explore new beauty experiences
              </p>
            </div>
            <Button className="bg-gradient-glamour hover:opacity-90"
            onClick={() => navigate("/CustomerProfile")} >
              Profile
            </Button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Next Appointment Card */}
            <Card className="border-glamour-gold/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-xl text-glamour-dark flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-glamour-pink" />
                  Next Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nextBooking ? (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-glamour-pink/5 to-glamour-gold/5">
                    <h3 className="font-medium text-glamour-dark">
                      Appointment with {nextBooking.artistName}
                    </h3>
                    <p className="text-sm text-glamour-dark/60 mt-1">
                      {format(new Date(nextBooking.date), "PPP")} at{" "}
                      {nextBooking.time}
                    </p>
                    {nextBooking.note && (
                      <p className="text-sm text-glamour-dark/80 mt-1">
                        Note: {nextBooking.note}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-gray-100">
                    <p className="text-sm text-gray-600">
                      You have no upcoming appointments.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Experience Card (Past Bookings with Review functionality) */}
            <Card className="border-glamour-gold/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-xl text-glamour-dark flex items-center gap-2">
                  <Star className="w-5 h-5 text-glamour-pink" />
                  Recent Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pastBookings.length > 0 ? (
                  pastBookings.map((booking) => {
                    const existingReview = reviews.find(
                      (r) => r.bookingId === booking.id
                    );
                    return (
                      <div
                        key={booking.id}
                        className="p-4 border-b border-gray-200 last:border-none"
                      >
                        <h3 className="font-medium text-glamour-dark">
                          Appointment with {booking.artistName}
                        </h3>
                        <p className="text-sm text-glamour-dark/60 mt-1">
                          {format(new Date(booking.date), "PPP")} at {booking.time}
                        </p>
                        {existingReview ? (
                          <>
                            <div className="flex mt-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-xl ${
                                    i < existingReview.rating
                                      ? "text-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            {existingReview.reviewText && (
                              <p className="text-sm text-glamour-dark/60 mt-1">
                                {existingReview.reviewText}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {format(
                                new Date(
                                  existingReview.createdAt?.toDate
                                    ? existingReview.createdAt.toDate()
                                    : existingReview.createdAt
                                ),
                                "PPP"
                              )}
                            </p>
                          </>
                        ) : (
                          <>
                            {openReviewFormFor === booking.id ? (
                              <ReviewForm
                                artistId={booking.artistId}
                                bookingId={booking.id}
                                onReviewSubmitted={() => {
                                  setOpenReviewFormFor(null);
                                }}
                              />
                            ) : (
                              <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => setOpenReviewFormFor(booking.id)}
                              >
                                Leave a Review
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-lg bg-gray-100">
                    <p className="text-sm text-gray-600">
                      You have not had any appointments to review yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Artists Card (Dynamic) */}
            <Card className="border-glamour-gold/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-xl text-glamour-dark flex items-center gap-2">
                  <Heart className="w-5 h-5 text-glamour-pink" />
                  Saved Artists
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedArtists.length > 0 ? (
                  <div className="space-y-3">
                    {savedArtists.map((artist) => (
                      <div key={artist.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          {artist.profilePicture ? (
                            <img
                              src={artist.profilePicture}
                              alt={artist.artistName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-glamour" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-glamour-dark text-sm">
                            {artist.artistName}
                          </h3>
                          <p className="text-xs text-glamour-dark/60">
                            {artist.specialties}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-gray-100">
                    <p className="text-sm text-gray-600">
                      You have no saved artists.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Past Appointments (Static sample) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-glamour-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-glamour-dark flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-glamour-pink" />
                  Past Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pastBookings.length > 0 ? (
                  pastBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 rounded-lg border border-glamour-gold/20 hover:border-glamour-gold/40 transition-colors"
                    >
                      <h3 className="font-medium text-glamour-dark">
                        Appointment with {booking.artistName}
                      </h3>
                      <p className="text-sm text-glamour-dark/60">
                        {format(new Date(booking.date), "PPP")} at {booking.time}
                      </p>
                      {booking.note && (
                        <p className="text-sm text-glamour-dark/80 mt-1">
                          Note: {booking.note}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-lg bg-gray-100">
                    <p className="text-sm text-gray-600">
                      You have no past bookings.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions (Static sample) */}
            <Card className="border-glamour-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-glamour-dark flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-glamour-pink" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "Bridal Makeup Session",
                    date: "June 1, 2024",
                    amount: "$150.00",
                  },
                  {
                    title: "Masterclass: Advanced Bridal",
                    date: "May 28, 2024",
                    amount: "$75.00",
                  },
                ].map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-glamour-gold/20 hover:border-glamour-gold/40 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-glamour-dark">
                        {transaction.title}
                      </h3>
                      <p className="text-sm text-glamour-dark/60">
                        {transaction.date}
                      </p>
                    </div>
                    <span className="font-medium text-glamour-dark">
                      {transaction.amount}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerDashboard;