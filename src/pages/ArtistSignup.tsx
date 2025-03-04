import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  Mail,
  Lock,
  Phone,
  Briefcase,
  Eye,
  EyeOff,
} from "lucide-react";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../firebaseconfig";
import { specialties } from "@/components/constant";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";

const ArtistSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialties: "",
    experience: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    const capitalizedValue =
      name === "name"
        ? value
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ")
        : value;

    setFormData({ ...formData, [name]: capitalizedValue });
  };

  const handleSpecialtyChange = (e) => {
    setFormData({ ...formData, specialties: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
      });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      await sendEmailVerification(userCredential.user);

      await setDoc(doc(db, "artists", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialties: formData.specialties,
        experience: formData.experience,
        createdAt: new Date(),
      });

      toast({
        title: "Account Created!",
        description: "Your artist account has been created successfully.",
      });

      navigate("/dashboard/artist");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred during sign up.";
      toast({
        title: "Signup Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-glamour-light to-glamour-red/30 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8 backdrop-blur-md border border-glamour-gold/20">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl md:text-4xl text-glamour-dark mb-2 drop-shadow-lg">
              Join as an Artist
            </h1>
            <p className="font-sans text-sm md:text-base text-glamour-dark/70">
              Share your talent with our glamorous community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="name" className="font-serif text-glamour-dark">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-glamour-dark/40" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      className="pl-10 border-glamour-gold/20 focus:border-glamour-gold transition-colors"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="email" className="font-serif text-glamour-dark">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-glamour-dark/40" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 border-glamour-gold/20 focus:border-glamour-gold transition-colors"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="phone" className="font-serif text-glamour-dark">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-glamour-dark/40" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="pl-10 border-glamour-gold/20 focus:border-glamour-gold transition-colors"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="specialties" className="font-serif text-glamour-dark">
                    Specialties
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-5 w-5 text-glamour-dark/40" />
                    <select
                      id="specialties"
                      name="specialties"
                      className="w-full p-2 pl-10 border-glamour-gold/20 rounded-md focus:border-glamour-gold transition-colors bg-white"
                      value={formData.specialties}
                      onChange={handleSpecialtyChange}
                      required
                    >
                      <option value="" disabled>
                        Select your specialty
                      </option>
                      {specialties.map((specialty, index) => (
                        <option key={index} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="experience" className="font-serif text-glamour-dark">
                    Experience & Background
                  </Label>
                  <Textarea
                    id="experience"
                    name="experience"
                    placeholder="Tell us about your experience and background"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    className="min-h-[120px] border-glamour-gold/20 focus:border-glamour-gold transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password Fields */}
              <div className="space-y-6">
                <div className="space-y-4 relative">
                  <Label htmlFor="password" className="font-serif text-glamour-dark">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-glamour-dark/40" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pl-10 border-glamour-gold/20 focus:border-glamour-gold transition-colors"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-glamour-dark/40 hover:text-glamour-gold"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <PasswordStrengthIndicator password={formData.password} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4 relative">
                  <Label htmlFor="confirmPassword" className="font-serif text-glamour-dark">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-glamour-dark/40" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="pl-10 border-glamour-gold/20 focus:border-glamour-gold transition-colors"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-glamour text-white hover:opacity-90 transition-all py-6 rounded-xl shadow-lg font-serif text-lg"
            >
              {loading ? "Creating Account..." : "Create Artist Account"}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm md:text-base text-glamour-dark/70">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-glamour-gold hover:text-glamour-red font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtistSignup;