import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Lock } from "lucide-react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseconfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;

      const artistDocRef = doc(db, "artists", uid);
      const artistDoc = await getDoc(artistDocRef);

      if (artistDoc.exists()) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.email}! Redirecting to Artist Dashboard.`,
        });
        navigate("/dashboard/artist");
        return;
      }

      const customerDocRef = doc(db, "customers", uid);
      const customerDoc = await getDoc(customerDocRef);

      if (customerDoc.exists()) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.email}! Redirecting to Customer Dashboard.`,
        });
        navigate("/dashboard/customer");
        return;
      }

      toast({
        title: "Login Successful",
        description: "Redirecting to default dashboard.",
      });
      navigate("/dashboard/customer");
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

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
      });
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Reset Email Sent",
        description: "A password reset email has been sent to your email address.",
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to send reset email.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-glamour-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-glamour-gold/20">
          <div className="text-center mb-10">
            <h1 className="font-serif text-4xl text-glamour-dark mb-3 drop-shadow-md">
              Welcome Back
            </h1>
            <p className="font-sans text-lg text-glamour-dark/70">
              Sign in to unlock your beauty experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-glamour-dark">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-glamour-gold/60" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 pr-4 py-2 border-glamour-gold/30 focus:border-glamour-gold focus:ring-glamour-gold"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-glamour-dark">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-glamour-gold/60" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 pr-4 py-2 border-glamour-gold/30 focus:border-glamour-gold focus:ring-glamour-gold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-glamour text-white hover:opacity-90 transition-all py-3 rounded-xl shadow-md"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-glamour-dark/70">
              Don't have an account?{" "}
              <Link
                to="/signup/customer"
                className="text-glamour-gold hover:text-glamour-red font-medium"
              >
                Sign up as Customer
              </Link>
            </p>
            <p className="text-sm text-glamour-dark/70">
              Are you an artist?{" "}
              <Link
                to="/signup/artist"
                className="text-glamour-gold hover:text-glamour-red font-medium"
              >
                Sign up as Artist
              </Link>
            </p>
            <p className="text-sm text-glamour-dark/70">
              Forgot your password?{" "}
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-glamour-gold hover:text-glamour-red font-medium"
              >
                {resetLoading ? "Sending..." : "Reset Password"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 