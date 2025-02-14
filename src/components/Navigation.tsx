import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "../context/Authcontext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig"; // Ensure Firestore is properly imported

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const [userType, setUserType] = useState<"artist" | "customer" | null>(null);
  const navigate = useNavigate();

  // 🔥 Fetch user type from Firestore
  useEffect(() => {
    if (currentUser) {
      const fetchUserType = async () => {
        try {
          const artistRef = doc(db, "artists", currentUser.uid);
          const customerRef = doc(db, "customers", currentUser.uid);

          const artistSnap = await getDoc(artistRef);
          if (artistSnap.exists()) {
            setUserType("artist");
            return;
          }

          const customerSnap = await getDoc(customerRef);
          if (customerSnap.exists()) {
            setUserType("customer");
            return;
          }
        } catch (error) {
          console.error("Error fetching user type:", error);
        }
      };

      fetchUserType();
    }
  }, [currentUser]);

  // 🔥 Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");  
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const homeRedirect = currentUser
    ? userType === "artist"
      ? "/dashboard"
      : userType === "customer"
      ? "/CustomerDashboard"
      : "/"
    : "/";

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-glamour-gold/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to={homeRedirect} className="font-serif text-2xl text-glamour-dark">
              GlamConnect
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to={homeRedirect} className="font-sans text-glamour-dark hover:text-glamour-pink transition-colors">
              Home
            </Link>
            <Link to="/search" className="font-sans text-glamour-dark hover:text-glamour-pink transition-colors">
              Book Artists
            </Link>
            <Link to="/masterclasses" className="font-sans text-glamour-dark hover:text-glamour-pink transition-colors">
              Masterclasses
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-4">
                <Link to={`/artist/${currentUser.uid}`} className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    {currentUser.photoURL ? (
                      <AvatarImage src={currentUser.photoURL} alt="User Avatar" />
                    ) : (
                      <AvatarFallback className="bg-glamour-pink/10 text-glamour-pink">
                        <User size={18} />
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Link>
                <button onClick={handleLogout} className="font-sans text-glamour-dark hover:text-glamour-pink">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 rounded-full font-sans transition-all duration-300">
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-glamour-dark hover:text-glamour-pink">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <Link to={homeRedirect} className="block px-3 py-2 text-glamour-dark hover:text-glamour-pink font-sans">
              Home
            </Link>
            <Link to="/search" className="block px-3 py-2 text-glamour-dark hover:text-glamour-pink font-sans">
              Book Artists
            </Link>
            <Link to="/masterclasses" className="block px-3 py-2 text-glamour-dark hover:text-glamour-pink font-sans">
              Masterclasses
            </Link>

            {currentUser ? (
              <div className="mt-4 space-y-2">
                <Link to={`/artist/${currentUser.uid}`} className="block px-3 py-2 text-glamour-dark hover:text-glamour-pink font-sans">
                  Profile
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-glamour-dark hover:text-glamour-pink font-sans">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="block w-full mt-4 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-2 rounded-full font-sans text-center">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;