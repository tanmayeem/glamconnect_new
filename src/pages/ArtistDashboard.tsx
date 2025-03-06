import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import {
  Award,
  IndianRupee,
  Users,
  Calendar,
  Star,
  User,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Clock,
} from "lucide-react";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useAuth } from "../context/Authcontext";

const ArtistDashboard = () => {
  const [activeSection, setActiveSection] = useState<"dashboard" | "profile">("dashboard");
  const [artistName, setArtistName] = useState("Loading...");
  interface Message {
    id: string;
    customerName: string;
    customerId: string;
    date: string;
    time: string;
    createdAt: string;
  }
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtistName = async () => {
      if (!currentUser) return;
      try {
        const artistDoc = doc(db, "artists", currentUser.uid);
        const snapshot = await getDoc(artistDoc);
        if (snapshot.exists()) {
          setArtistName(snapshot.data().name);
        } else {
          setArtistName("Unknown Artist");
        }
      } catch (error) {
        console.error("Error fetching artist:", error);
        setArtistName("Error Loading");
      }
    };

    fetchArtistName();
  }, [currentUser]);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      if (!currentUser) return;
      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(
          bookingsRef,
          where("artistId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        console.log("Recent messages count:", querySnapshot.size);
        const messagesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            customerName: data.customerName,
            customerId: data.customerId,
            date: data.date,
            time: data.time,
            createdAt: data.createdAt,
          };
        });
        const messagesWithNames = await Promise.all(
          messagesData.map(async (msg) => {
            if (!msg.customerName && msg.customerId) {
              try {
                const customerDocRef = doc(db, "customers", msg.customerId);
                const custSnapshot = await getDoc(customerDocRef);
                if (custSnapshot.exists()) {
                  return { ...msg, customerName: custSnapshot.data().name };
                }
              } catch (error) {
                console.error("Error fetching customer name for message", msg.id, error);
              }
            }
            return msg;
          })
        );
        setRecentMessages(messagesWithNames);
      } catch (error) {
        console.error("Error fetching recent messages:", error);
      }
    };

    fetchRecentMessages();
  }, [currentUser]);

  const renderDashboardContent = () => (
    <div className="space-y-12">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-glamour-red/10 to-glamour-gold/10 rounded-3xl blur-2xl" />
        <div className="relative bg-white/95 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-glamour-gold/20 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8">
            <div className="text-center md:text-left">
              <h1 className="font-serif text-3xl md:text-4xl bg-gradient-to-r from-glamour-red to-glamour-gold bg-clip-text text-transparent mb-2 drop-shadow-md">
                Welcome back, {artistName || "Unknown Artist"}
              </h1>
              <p className="font-sans text-sm md:text-base text-glamour-dark/70">
                Your artistry shines bright
              </p>
            </div>
            <Button
              className="mt-4 md:mt-0 bg-gradient-glamour text-white hover:opacity-90 shadow-md rounded-xl px-4 py-2"
              onClick={() => navigate("/UpdateSchedule")}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Update Availability
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: IndianRupee,
                title: "Today's Revenue",
                value: "₹450",
                subtext: "3 bookings completed",
                trend: "+12.5%",
                color: "from-glamour-red to-glamour-gold",
              },
              {
                icon: Users,
                title: "Active Clients",
                value: "128",
                subtext: "+12 this month",
                trend: "+5.2%",
                color: "from-glamour-gold to-glamour-red",
              },
              {
                icon: Star,
                title: "Rating",
                value: "4.9",
                subtext: "98 reviews",
                trend: "+0.2",
                color: "from-glamour-red to-glamour-gold",
              },
              {
                icon: Award,
                title: "Completion Rate",
                value: "98%",
                subtext: "Last 30 days",
                trend: "+2.1%",
                color: "from-glamour-gold to-glamour-red",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white/90 rounded-xl overflow-hidden"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white shadow-sm`}>
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="text-glamour-gold text-xs md:text-sm font-medium bg-glamour-gold/10 px-2 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm md:text-base font-medium text-glamour-dark">{stat.title}</h3>
                  <p className="text-xl md:text-2xl font-bold mt-1 bg-gradient-to-r from-glamour-red to-glamour-gold bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-glamour-dark/70 mt-1">{stat.subtext}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/90 rounded-xl">
          <CardHeader className="border-b border-glamour-gold/20 bg-gradient-to-r from-glamour-light to-glamour-red/5">
            <CardTitle className="font-serif text-xl md:text-2xl text-glamour-dark flex items-center gap-2">
              <Calendar className="w-5 h-5 md:w-6 h-6 text-glamour-red" />
              Today’s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            {[
              {
                title: "Bridal Makeup",
                time: "10:00 AM - 11:30 AM",
                client: "Sarah Johnson",
                status: "Confirmed",
              },
              {
                title: "Evening Makeup",
                time: "2:00 PM - 3:00 PM",
                client: "Emily Davis",
                status: "Confirmed",
              },
              {
                title: "Masterclass: Advanced Techniques",
                time: "4:00 PM - 6:00 PM",
                client: "15 attendees",
                status: "Upcoming",
              },
            ].map((appointment, index) => (
              <div
                key={index}
                className="p-3 md:p-4 rounded-xl border border-glamour-gold/20 hover:border-glamour-red hover:shadow-md transition-all bg-white"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-glamour-dark">{appointment.title}</h3>
                    <p className="text-sm text-glamour-dark/70 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {appointment.time}
                    </p>
                    <p className="text-sm text-glamour-dark/70 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {appointment.client}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === "Confirmed"
                        ? "bg-glamour-gold/20 text-glamour-gold"
                        : "bg-glamour-red/20 text-glamour-red"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/90 rounded-xl">
          <CardHeader className="border-b border-glamour-gold/20 bg-gradient-to-r from-glamour-light to-glamour-red/5">
            <CardTitle className="font-serif text-xl md:text-2xl text-glamour-dark flex items-center gap-2">
              <MessageSquare className="w-5 h-5 md:w-6 h-6 text-glamour-red" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            {recentMessages.length > 0 ? (
              recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-glamour-gold/20 hover:border-glamour-red hover:shadow-md transition-all bg-white"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-glamour-gold/10 flex items-center justify-center">
                    <span className="text-lg md:text-xl font-bold text-glamour-dark">
                      {msg.customerName ? msg.customerName[0] : "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-glamour-dark">
                      {msg.customerName || "Unknown Customer"}
                    </h3>
                    <p className="text-sm text-glamour-dark/70">
                      booked an appointment on {format(new Date(msg.date), "PPP")} at {msg.time}
                    </p>
                    <p className="text-xs text-glamour-dark/70 mt-1">
                      {msg.createdAt ? format(new Date(msg.createdAt), "PPP p") : ""}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-glamour-dark/70">No recent bookings.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-glamour-light">
      <Navigation />

      {/* Quick Links Section */}
      <div className="container mx-auto px-4 pt-24">
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => navigate("/artist-profile/:artistId")}
            variant={activeSection === "profile" ? "default" : "outline"}
            className="bg-gradient-glamour text-white hover:opacity-90 shadow-md rounded-lg px-4 py-2"
          >
            <User className="mr-2 h-5 w-5" />
            Profile
          </Button>
          <Button
            onClick={() => navigate("/create-masterclass")}
            className="bg-gradient-glamour text-white hover:opacity-90 shadow-md rounded-lg px-4 py-2"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Create Masterclass
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {activeSection === "dashboard" && renderDashboardContent()}
          {/* Add profile section here if needed */}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArtistDashboard;