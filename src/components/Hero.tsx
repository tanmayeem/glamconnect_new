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
            url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2940&auto=format&fit=crop')
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

          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <img
                  key={i}
                  src={`https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?crop=entropy&cs=tinysrgb&fit=crop&h=48&w=48`}
                  alt="Artist avatar"
                  className="w-12 h-12 rounded-full border-2 border-glamour-gold object-cover"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-glamour-gold text-glamour-gold drop-shadow" />
                ))}
              </div>
              <p className="font-sans text-sm text-white/90 drop-shadow">
                Trusted by 10,000+ glamorous clients
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;