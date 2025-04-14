import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex items-center bg-glamour-light">
      {/* Background Image with Red-Gold Gradient Overlay */}
      <div
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(135deg, rgba(163, 29, 29, 0.6), rgba(230, 185, 128, 0.6)),
            url('https://images.unsplash.com/photo-1533562389935-457b1ae48a39?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')
          `,
        }}
      />

      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight drop-shadow-lg">
            Glamour Unleashed,<br />Perfection Booked
          </h1>

          <p className="font-sans text-lg md:text-xl text-white/90 mb-8 drop-shadow-md">
            Connect with top-tier makeup artists for a look that dazzles. Your beauty, their craft.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              aria-label="Find a makeup artist"
              className="bg-gradient-glamour text-white px-8 py-4 rounded-full font-sans hover:opacity-85 transition-opacity animate-shimmer shadow-lg"
              onClick={() => navigate("/signup/customer")}
            >
              Find Your Artist
            </button>
            <button
              aria-label="Join as a makeup artist"
              className="border-2 border-glamour-gold bg-glamour-gold/20 text-white px-8 py-4 rounded-full font-sans hover:bg-glamour-gold/40 transition-colors shadow-lg"
              onClick={() => navigate("/signup/artist")}
            >
              Become an Artist
            </button>
          </div>

        
        </div>
      </div>
    </div>
  );
};

export default Hero;