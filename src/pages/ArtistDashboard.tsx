import { useEffect, useState, useMemo } from "react";
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
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<"schedule" | "messages">("schedule");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  interface Message {
    id: string;
    customerName: string;
    customerId: string;
    date: string;
    time: string;
    createdAt: string;
  }

  useEffect(() => {
    const fetchArtistName = async () => {
      if (!currentUser) return;
      try {
        const artistDoc = doc(db, "artists", currentUser.uid);
        const snapshot = await getDoc(artistDoc);
        setArtistName(snapshot.exists() ? snapshot.data().name : "Unknown Artist");
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
        const messagesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          customerName: doc.data().customerName,
          customerId: doc.data().customerId,
          date: doc.data().date,
          time: doc.data().time,
          createdAt: doc.data().createdAt,
        }));
        const messagesWithNames = await Promise.all(
          messagesData.map(async (msg) => {
            if (!msg.customerName && msg.customerId) {
              const customerDocRef = doc(db, "customers", msg.customerId);
              const custSnapshot = await getDoc(customerDocRef);
              if (custSnapshot.exists()) {
                return { ...msg, customerName: custSnapshot.data().name };
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

  const stats = useMemo(
    () => [
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
    ],
    []
  );

  const schedule = useMemo(
    () => [
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
    ],
    []
  );

  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-glamour-gold/20 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-glamour-red/10 to-glamour-gold/10 rounded-2xl blur-xl" />
        <div className="relative flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl bg-gradient-to-r from-glamour-red to-glamour-gold bg-clip-text text-transparent">
              Welcome, {artistName}
            </h1>
            <p className="text-sm text-glamour-dark/70">Your artistry shines bright</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-gradient-glamour text-white hover:opacity-90 rounded-lg px-4 py-2"
              onClick={() => navigate("/update-schedule")}
              aria-label="Update Availability"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Update
            </Button>
            <Button
              className="bg-gradient-glamour text-white hover:opacity-90 rounded-lg px-4 py-2"
              onClick={() => navigate("/create-masterclass")}
              aria-label="Create Masterclass"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Masterclass
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white/90 rounded-lg"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-glamour-gold text-xs bg-glamour-gold/10 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-glamour-dark">{stat.title}</h3>
              <p className="text-xl font-bold bg-gradient-to-r from-glamour-red to-glamour-gold bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-xs text-glamour-dark/70">{stat.subtext}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabbed Schedule & Messages */}
      <Card className="border-0 shadow-lg bg-white/90 rounded-lg">
        <CardHeader className="border-b border-glamour-gold/20">
          <div className="flex gap-4">
            <Button
              variant={activeTab === "schedule" ? "default" : "outline"}
              className="bg-gradient-glamour text-white hover:opacity-90 rounded-lg"
              onClick={() => setActiveTab("schedule")}
              aria-label="View Schedule"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
            <Button
              variant={activeTab === "messages" ? "default" : "outline"}
              className="bg-gradient-glamour text-white hover:opacity-90 rounded-lg"
              onClick={() => setActiveTab("messages")}
              aria-label="View Messages"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {activeTab === "schedule" ? (
            <div className="space-y-4">
              {schedule.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg border border-glamour-gold/20 hover:border-glamour-red transition-all"
                >
                  <div className="w-2 h-12 bg-glamour-red rounded-full" />
                  <div className="flex-1">
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
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentMessages.length > 0 ? (
                recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-glamour-gold/20 hover:border-glamour-red transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-glamour-gold/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-glamour-dark">
                        {msg.customerName ? msg.customerName[0] : "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-glamour-dark">
                        {msg.customerName || "Unknown Customer"}
                      </h3>
                      <p className="text-sm text-glamour-dark/70">
                        Booked on {format(new Date(msg.date), "PPP")} at {msg.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-glamour-dark/70">No recent bookings.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-glamour-light flex">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-white/95 p-4 border-r border-glamour-gold/20">
        <div className="space-y-4">
          <Button
            onClick={() => setActiveSection("dashboard")}
            variant={activeSection === "dashboard" ? "default" : "outline"}
            className="w-full bg-gradient-glamour text-white hover:opacity-90 rounded-lg justify-start"
            aria-label="Dashboard"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            onClick={() => navigate("/artist-profile/:artistId")}
            variant={activeSection === "profile" ? "default" : "outline"}
            className="w-full bg-gradient-glamour text-white hover:opacity-90 rounded-lg justify-start"
            aria-label="Profile"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button
            onClick={() => navigate("/create-masterclass")}
            className="w-full bg-gradient-glamour text-white hover:opacity-90 rounded-lg justify-start"
            aria-label="Create Masterclass"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Masterclass
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <Navigation />
        <main className="container mx-auto px-4 pt-20 pb-12">
          {activeSection === "dashboard" && renderDashboardContent()}
        </main>
        <Footer />
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 border-t border-glamour-gold/20 p-2 flex justify-around">
        <Button
          onClick={() => setActiveSection("dashboard")}
          className="bg-gradient-glamour text-white hover:opacity-90 rounded-lg"
          aria-label="Dashboard"
        >
          <Calendar className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => navigate("/artist-profile/:artistId")}
          className="bg-gradient-glamour text-white hover:opacity-90 rounded-lg"
          aria-label="Profile"
        >
          <User className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => navigate("/create-masterclass")}
          className="bg-gradient-glamour text-white hover:opacity-90 rounded-lg"
          aria-label="Create Masterclass"
        >
          <BookOpen className="h-5 w-5" />
        </Button>
      </nav>
    </div>
  );
};

export default ArtistDashboard;