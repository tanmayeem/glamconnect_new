import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/Authcontext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { useToast } from "@/components/ui/use-toast";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const [userType, setUserType] = useState<"artist" | "customer" | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUser) {
      setUserType(null);
      return;
    }

    const fetchUserType = async () => {
      try {
        console.log("Fetching user type for UID:", currentUser.uid);
        const artistRef = doc(db, "artists", currentUser.uid);
        const customerRef = doc(db, "customers", currentUser.uid);

        const artistSnap = await getDoc(artistRef);
        if (artistSnap.exists()) {
          console.log("User is artist");
          setUserType("artist");
          return;
        }

        const customerSnap = await getDoc(customerRef);
        if (customerSnap.exists()) {
          console.log("User is customer");
          setUserType("customer");
          return;
        }

        console.log("No user type found");
        setUserType(null);
        toast({
          title: "Role Not Found",
          description: "Please complete your profile to access your dashboard.",
          variant: "destructive",
        });
      } catch (error) {
        console.error("Error fetching user type:", error.code, error.message);
        toast({
          title: "Error",
          description: "Failed to load user profile. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchUserType();
  }, [currentUser, toast]);

  const handleLogout = async () => {
    try {
      console.log("Logging out user:", currentUser?.uid);
      await logout();
      setUserType(null);
      navigate("/");
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout failed:", error.code, error.message);
      toast({
        title: "Logout Failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
  });
    }
  };

  const handleAvatarClick = () => {
    if (userType === "artist") navigate("/dashboard/artist");
    else if (userType === "customer") navigate("/dashboard/customer");
  };

  const homeRedirect = currentUser
    ? userType === "artist"
      ? "/dashboard/artist"
      : userType === "customer"
      ? "/dashboard/customer"
      : "/"
    : "/";

  return (
    <nav className="fixed w-full bg-glamour-light/80 backdrop-blur-md z-50 shadow-lg border-b border-glamour-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link
            to={homeRedirect}
            className="font-serif text-3xl font-bold bg-gradient-to-r from-glamour-red to-glamour-gold bg-clip-text text-transparent transition-all hover:brightness-110"
            onClick={() => setIsOpen(false)}
          >
            GlamConnect
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="text-glamour-dark hover:text-glamour-gold transition-colors font-sans text-lg">Find Artists</Link>
            <Link to="/masterclasses" className="text-glamour-dark hover:text-glamour-gold transition-colors font-sans text-lg">Masterclasses</Link>

            {currentUser ? (
              <div className="flex items-center space-x-4">
                <button onClick={handleAvatarClick} aria-label="Go to Dashboard">
                  <Avatar className="w-10 h-10 border-2 border-glamour-gold hover:border-glamour-red transition-colors">
                    <AvatarImage src={currentUser.photoURL || ""} alt={currentUser.displayName || "User"} />
                    <AvatarFallback><User className="w-6 h-6 text-glamour-dark" /></AvatarFallback>
                  </Avatar>
                </button>
                <Button onClick={handleLogout} className="bg-glamour-red text-white hover:bg-glamour-gold transition-all px-6 py-2 rounded-full shadow-md" aria-label="Logout">Logout</Button>
              </div>
            ) : (
              <>
                <Link to="/signup/artist">
                  <Button className="bg-glamour-gold/20 text-glamour-dark hover:bg-glamour-gold hover:text-white transition-all px-6 py-2 rounded-full shadow-md" aria-label="Register as Artist">Register as Artist</Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-gradient-glamour text-white hover:opacity-90 transition-all px-6 py-2 rounded-full shadow-md" aria-label="Login">Login</Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-glamour-dark hover:text-glamour-gold transition-colors" onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? "Close menu" : "Open menu"}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-6 bg-white/95 backdrop-blur-md rounded-lg shadow-lg">
            <div className="flex flex-col space-y-4 px-4">
              <Link to="/search" className="text-glamour-dark hover:text-glamour-gold transition-colors font-sans text-lg py-2" onClick={() => setIsOpen(false)}>Find Artists</Link>
              <Link to="/masterclasses" className="text-glamour-dark hover:text-glamour-gold transition-colors font-sans text-lg py-2" onClick={() => setIsOpen(false)}>Masterclasses</Link>

              {currentUser ? (
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <button onClick={handleAvatarClick} aria-label="Go to Dashboard">
                      <Avatar className="w-10 h-10 border-2 border-glamour-gold">
                        <AvatarImage src={currentUser.photoURL || ""} alt={currentUser.displayName || "User"} />
                        <AvatarFallback><User className="w-6 h-6 text-glamour-dark" /></AvatarFallback>
                      </Avatar>
                    </button>
                  </div>
                  <Button onClick={handleLogout} className="bg-glamour-red text-white hover:bg-glamour-gold w-full transition-all px-6 py-2 rounded-full shadow-md" aria-label="Logout">Logout</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link to="/signup/artist" onClick={() => setIsOpen(false)}>
                    <Button className="bg-glamour-gold/20 text-glamour-dark hover:bg-glamour-gold hover:text-white w-full transition-all px-6 py-2 rounded-full shadow-md" aria-label="Register as Artist">Register as Artist</Button>
                  </Link>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button className="bg-gradient-glamour text-white hover:opacity-90 w-full transition-all px-6 py-2 rounded-full shadow-md" aria-label="Login">Login</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
