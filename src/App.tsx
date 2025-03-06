import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/Authcontext";

// Components
import Navigation from "./components/Navigation";
import Booking from "./components/BookingSession";
import UpdateSchedule from "./components/UpdateSchedule";
import MasterclassDetails from "./components/MasterclassDetails";
import ArtistViewsProfile from "./components/ArtistViewsProfile";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchArtists from "./pages/SearchArtists";
import ArtistProfile from "./pages/ArtistProfile";
import Masterclasses from "./pages/Masterclasses";
import CreateMasterclass from "./pages/CreateMasterclass";
import CustomerDashboard from "./pages/CustomerDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import CustomerSignup from "./pages/CustomerSignup";
import ArtistSignup from "./pages/ArtistSignup";
import Login from "./pages/Login";
import CustomerProfile from "./pages/CustomerProfile";

// Initialize Query Client
const queryClient = new QueryClient();

// Simple Error Boundary Component
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("ErrorBoundary caught an error", event.error, event.message);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <h1 className="text-center text-glamour-red mt-10">
        Something went wrong. Please try again later.
      </h1>
    );
  }

  return children;
};

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-glamour-light text-glamour-dark">
          <BrowserRouter>
            <Navigation />
            <ErrorBoundary>
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/artistviewprofile/:artistId" element={<ArtistViewsProfile />} />
                <Route path="/customer-profile" element={<CustomerProfile />} />
                <Route path="/search" element={<SearchArtists />} />
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                <Route path="/artist-profile/:artistId" element={<ArtistProfile />} />
                <Route path="/booking/:artistId" element={<Booking />} />
                <Route path="/update-schedule" element={<UpdateSchedule />} />
                <Route path="/masterclasses" element={<Masterclasses />} />
                <Route path="/masterclasses/:id" element={<MasterclassDetails />} />
                <Route path="/create-masterclass" element={<CreateMasterclass />} />
                <Route path="/dashboard/artist" element={<ArtistDashboard />} />
                <Route path="/dashboard/customer" element={<CustomerDashboard />} />
                <Route path="/signup/customer" element={<CustomerSignup />} />
                <Route path="/signup/artist" element={<ArtistSignup />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
