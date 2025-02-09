import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { auth, db } from "../../firebaseconfig"; // Ensure you import the Firestore `db`

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDocRef = doc(db, "users", user.uid); // Assuming you store users in Firestore
      const userDoc = await getDoc(userDocRef);

      let role = "customer"; // Default to customer if role is not found
      if (userDoc.exists()) {
        role = userDoc.data().role; // Fetch role from Firestore document
      }

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.email}!`,
      });

      // Redirect user based on role
      if (role === "artist") {
        navigate("/dashboard/artist");
      } else {
        navigate("/dashboard/customer");
      }
    } catch (error: unknown) {
      let errorMessage = "An error occurred during login.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null && "code" in error) {
        switch ((error as { code: string }).code) {
          case "auth/invalid-email":
            errorMessage = "Invalid email format.";
            break;
          case "auth/user-not-found":
            errorMessage = "User not found. Please check your email.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed attempts. Try again later.";
            break;
          default:
            errorMessage = "Failed to log in. Please try again.";
        }
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl text-glamour-dark mb-2">
              Welcome Back
            </h1>
            <p className="text-glamour-dark/60">
              Sign in to continue your beauty journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-glamour-dark/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-glamour-dark/40" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-glamour-dark/60">
              Don't have an account?{" "}
              <Link
                to="/signup/customer"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Sign up as Customer
              </Link>
            </p>
            <p className="text-sm text-glamour-dark/60">
              Are you an artist?{" "}
              <Link
                to="/signup/artist"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Sign up as Artist
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
