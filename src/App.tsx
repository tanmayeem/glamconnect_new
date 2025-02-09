import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchArtists from "./pages/SearchArtists";
import ArtistProfile from "./pages/ArtistProfile";
import Booking from "./pages/Booking";
import Masterclasses from "./pages/Masterclasses";
import CreateMasterclass from "./pages/CreateMasterclass";
import CustomerDashboard from "./pages/CustomerDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
import CustomerSignup from "./pages/CustomerSignup";
import ArtistSignup from "./pages/ArtistSignup";
import Login from "./pages/Login";
import { AuthProvider } from "./context/Authcontext";
import UpdateSchedule from "./components/UpdateSchedule";
import MasterclassDetails from "./components/MasterclassDetails";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<SearchArtists />} />
          <Route path="/CustomerDashboard" element={<CustomerDashboard />} />
          <Route path="/artist-profile/:artistId" element={<ArtistProfile />} />
          <Route path="/booking/:artistId" element={<Booking />} />
          <Route path="/UpdateSchedule" element={<UpdateSchedule />} />
          <Route path="/masterclasses" element={<Masterclasses />} />
          <Route path="/masterclasses/:id" element={<MasterclassDetails />} />
          <Route path="/create-masterclass" element={<CreateMasterclass />} />
          <Route path="/dashboard" element={<ArtistDashboard />} />
          <Route path="/masterclasses/create" element={<CreateMasterclass />} />
          <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          <Route path="/dashboard/artist" element={<ArtistDashboard />} />
          <Route path="/signup/customer" element={<CustomerSignup />} />
          <Route path="/signup/artist" element={<ArtistSignup />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AuthProvider>
);

export default App;