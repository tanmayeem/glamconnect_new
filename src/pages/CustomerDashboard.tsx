import Navigation from "@/components/Navigation";
import { Calendar, CreditCard, Heart, Star } from "lucide-react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/context/Authcontext";
import { useNavigate } from "react-router-dom"; 


const CustomerDashboard = () => {
    const [artistName, setArtistName] = useState('Loading...');
    const { currentUser } = useAuth();
    const navigate = useNavigate(); 

  return (
    <div className="min-h-screen bg-glamour-light">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-4xl text-glamour-dark mb-2">
                Welcome Back, Sarah
              </h1>
              <p className="text-glamour-dark/60">
                Manage your bookings and explore new beauty experiences
              </p>
            </div>
            <Button className="bg-gradient-glamour hover:opacity-90">
              Book New Session
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="border-glamour-gold/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-xl text-glamour-dark flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-glamour-pink" />
                  Next Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-gradient-to-r from-glamour-pink/5 to-glamour-gold/5">
                  <h3 className="font-medium text-glamour-dark">Bridal Makeup Trial</h3>
                  <p className="text-sm text-glamour-dark/60 mt-1">Tomorrow, 10:00 AM</p>
                  <p className="text-sm text-glamour-dark/80 mt-1">with Emma Thompson</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-glamour-gold/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-xl text-glamour-dark flex items-center gap-2">
                  <Star className="w-5 h-5 text-glamour-pink" />
                  Recent Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-glamour" />
                    <div>
                      <h3 className="font-medium text-glamour-dark">Evening Makeup</h3>
                      <p className="text-sm text-glamour-dark/60">with Maria Garcia</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Leave Review
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-glamour-gold/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-xl text-glamour-dark flex items-center gap-2">
                  <Heart className="w-5 h-5 text-glamour-pink" />
                  Saved Artists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2].map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-glamour" />
                      <div className="flex-1">
                        <h3 className="font-medium text-glamour-dark text-sm">
                          {index === 0 ? "Sarah Johnson" : "Maria Garcia"}
                        </h3>
                        <p className="text-xs text-glamour-dark/60">
                          {index === 0 ? "Bridal & Editorial" : "Fashion & Beauty"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-glamour-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-glamour-dark flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-glamour-pink" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "Bridal Makeup Trial",
                    date: "June 15, 2024 - 10:00 AM",
                    artist: "Emma Thompson",
                  },
                  {
                    title: "Editorial Photoshoot",
                    date: "June 20, 2024 - 2:00 PM",
                    artist: "Sophie Chen",
                  },
                ].map((booking, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-glamour-gold/20 hover:border-glamour-gold/40 transition-colors"
                  >
                    <h3 className="font-medium text-glamour-dark">{booking.title}</h3>
                    <p className="text-sm text-glamour-dark/60">{booking.date}</p>
                    <p className="text-sm text-glamour-dark/80 mt-1">with {booking.artist}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

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
                      <h3 className="font-medium text-glamour-dark">{transaction.title}</h3>
                      <p className="text-sm text-glamour-dark/60">{transaction.date}</p>
                    </div>
                    <span className="font-medium text-glamour-dark">{transaction.amount}</span>
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