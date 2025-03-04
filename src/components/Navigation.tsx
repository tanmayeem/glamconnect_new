import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "../context/Authcontext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig"; // Ensure Firestore is properly imported
import { Button } from "@/components/ui/button"; // Ensure Button component is imported

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const [userType, setUserType] = useState<"artist" | "customer" | null>(null);
  const navigate = useNavigate();

  // Fetch user type from Firestore
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

  // Handle Logout
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
          >
            GlamConnect
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/search"
              className="text-glamour-dark hover:text-glamour-gold transition-colors font-sans text-lg"
            >
              Find Artists
            </Link>
            <Link
              to="/masterclasses"
              className="text-glamour-dark hover:text-glamour-gold transition-colors font-sans text-lg"
            >
              Masterclasses
            </Link>
            <Link
              to="/about"
              className="text-glamour-dark hover:text-glamour-gold transition-colors font-sans text-lg"
            >
              About
            </Link>

            {/* Auth Buttons */}
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Avatar className="w-10 h-10 border-2 border-glamour-gold hover:border-glamour-red transition-colors">
                  <AvatarImage
                    src={currentUser.photoURL || ""}
                    alt={currentUser.displayName || "User"}
                  />
                  <AvatarFallback>
                    <User className="w-6 h-6 text-glamour-dark" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  onClick={handleLogout}
                  className="bg-glamour-red text-white hover:bg-glamour-gold transition-all px-6 py-2 rounded-full shadow-md"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/signup/artist">
                  <Button className="bg-glamour-gold/20 text-glamour-dark hover:bg-glamour-gold hover:text-white transition-all px-6 py-2 rounded-full shadow-md">
                    Register as Artist
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    className="bg-gradient-glamour text-white hover:opacity-90 transition-all px-6 py-2 rounded-full shadow-md"
                    onClick={() =>
                      navigate("/login", { state: { preselectedRole: "artist" } })
                    }
                  >
                    Login as Artist
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-glamour-dark hover:text-glamour-gold transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-6 bg-white/95 backdrop-blur-md rounded-lg shadow-lg">
            <div className="flex flex-col space-y-4">
              <Link
                to="/search"
                className="text-glamour-dark hover:text-glamour-gold transition-colors font-sans text-lg px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Find Artists
              </Link>
              <Link
                to="/masterclasses"
                className="text-glamour-dark hover:text-glamour-gold transition-colors font-sans text-lg px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                Masterclasses
              </Link>
              <Link
                to="/about"
                className="text-glamour-dark hover:text-glamour-gold transition-colors font-sans text-lg px-4 py-2"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>

              {currentUser ? (
                <div className="px-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-10 h-10 border-2 border-glamour-gold">
                      <AvatarImage
                        src={currentUser.photoURL || ""}
                        alt={currentUser.displayName || "User"}
                      />
                      <AvatarFallback>
                        <User className="w-6 h-6 text-glamour-dark" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <Button
                    onClick={handleLogout}
                    className="bg-glamour-red text-white hover:bg-glamour-gold w-full transition-all px-6 py-2 rounded-full shadow-md"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/signup/artist">
                    <Button className="bg-glamour-gold/20 text-glamour-dark hover:bg-glamour-gold hover:text-white w-full transition-all px-6 py-2 rounded-full shadow-md">
                      Register as Artist
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      className="bg-gradient-glamour text-white hover:opacity-90 w-full transition-all px-6 py-2 rounded-full shadow-md"
                      onClick={() =>
                        navigate("/login", {
                          state: { preselectedRole: "artist" },
                        })
                      }
                    >
                      Login as Artist
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;