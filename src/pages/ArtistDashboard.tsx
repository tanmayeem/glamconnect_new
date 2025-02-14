import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom"; 
import { 
  Award, 
  DollarSign, 
  Users, 
  Calendar, 
  Star, 
  User,
  MessageSquare,
  BookOpen,
  TrendingUp,
  Clock
} from "lucide-react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { db } from "../../firebaseconfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/Authcontext";

const ArtistDashboard = () => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'profile'>('dashboard');
  const [artistName, setArtistName] = useState('Loading...');
  const { currentUser } = useAuth();
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchArtistName = async () => {
      if (!currentUser) return;
      try {
        const artistDoc = doc(db, "artists", currentUser?.uid); 
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


  const renderDashboardContent = () => (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl" />
        <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-3xl border border-purple-100 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Welcome back, {artistName || "Unknown Artist"}
              </h1>
              <p className="text-gray-600 font-light">
                Your artistry makes a difference
              </p>
            </div>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white shadow-lg" onClick={() => navigate("/UpdateSchedule")}>
              <Calendar className="mr-2 h-4 w-4" />
              Update Availability
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: DollarSign,
                title: "Today's Revenue",
                value: "$450",
                subtext: "3 bookings completed",
                trend: "+12.5%",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Users,
                title: "Active Clients",
                value: "128",
                subtext: "+12 this month",
                trend: "+5.2%",
                color: "from-pink-500 to-pink-600"
              },
              {
                icon: Star,
                title: "Rating",
                value: "4.9",
                subtext: "98 reviews",
                trend: "+0.2",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Award,
                title: "Completion Rate",
                value: "98%",
                subtext: "Last 30 days",
                trend: "+2.1%",
                color: "from-pink-500 to-purple-500"
              }
            ].map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-gray-50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-green-500 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-700">{stat.title}</h3>
                  <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow bg-white">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="font-serif text-2xl text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              {
                title: "Bridal Makeup",
                time: "10:00 AM - 11:30 AM",
                client: "Sarah Johnson",
                status: "Confirmed",
                type: "Makeup",
              },
              {
                title: "Evening Makeup",
                time: "2:00 PM - 3:00 PM",
                client: "Emily Davis",
                status: "Confirmed",
                type: "Makeup",
              },
              {
                title: "Masterclass: Advanced Techniques",
                time: "4:00 PM - 6:00 PM",
                client: "15 attendees",
                status: "Upcoming",
                type: "Masterclass",
              },
            ].map((appointment, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border border-purple-100 hover:border-purple-200 transition-all hover:shadow-md bg-white"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">{appointment.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {appointment.time}
                    </p>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {appointment.client}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      appointment.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow bg-white">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="font-serif text-2xl text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { label: "Booking Rate", value: "85%", color: "bg-purple-600" },
                  { label: "Client Satisfaction", value: "92%", color: "bg-pink-600" },
                  { label: "Revenue Growth", value: "23%", color: "bg-purple-500" }
                ].map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{metric.label}</span>
                      <span className="font-medium text-gray-900">{metric.value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div 
                        className={`h-full rounded-full ${metric.color}`}
                        style={{ width: metric.value }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-shadow bg-white">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="font-serif text-2xl text-gray-800 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                Recent Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                {
                  name: "Sarah Johnson",
                  message: "Looking forward to our session!",
                  time: "2 hours ago",
                },
                {
                  name: "Emily Davis",
                  message: "Thank you for the amazing work!",
                  time: "4 hours ago",
                },
              ].map((message, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl border border-purple-100 hover:border-purple-200 transition-all hover:shadow-md bg-white"
                >
                  <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/40?img=${index}`} />
                    <AvatarFallback>{message.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{message.name}</h3>
                    <p className="text-sm text-gray-600">{message.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Quick Links Section */}
      <div className="container mx-auto px-4 pt-24">
        <div className="flex gap-4 mb-8">
       
          <Button
            onClick={() => navigate('/artist-profile')}
            variant={activeSection === 'profile' ? 'default' : 'outline'}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white shadow-lg"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button
            onClick={() => navigate('/create-masterclass')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white shadow-lg"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Create Masterclass
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {activeSection === 'dashboard' && renderDashboardContent()}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArtistDashboard;