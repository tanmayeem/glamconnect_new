import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex items-center bg-glamour-light">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158')] bg-cover bg-center opacity-10" />
      
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          <h1 className="font-serif text-5xl md:text-7xl text-glamour-dark mb-6 leading-tight">
            Discover Glamour,<br />Book Perfection
          </h1>
          
          <p className="font-sans text-lg md:text-xl text-glamour-dark/80 mb-8">
            Connect with elite makeup artists who transform your vision into reality.
            Your perfect look is just a booking away.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-gradient-glamour text-white px-8 py-4 rounded-full font-sans hover:opacity-90 transition-opacity animate-shimmer"
            onClick={() => navigate("/signup/customer")} >
              Book an Artist
            </button>
            <button className="border-2 border-glamour-gold text-glamour-dark px-8 py-4 rounded-full font-sans hover:bg-glamour-gold/10 transition-colors"
            onClick={() => navigate("/signup/artist")}>
              Join as an Artist
            </button>
          </div>
          
          <div className="mt-12 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-2 border-white bg-gradient-glamour"
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-glamour-gold text-glamour-gold" />
                <Star className="w-5 h-5 fill-glamour-gold text-glamour-gold" />
                <Star className="w-5 h-5 fill-glamour-gold text-glamour-gold" />
                <Star className="w-5 h-5 fill-glamour-gold text-glamour-gold" />
                <Star className="w-5 h-5 fill-glamour-gold text-glamour-gold" />
              </div>
              <p className="font-sans text-sm text-glamour-dark/80">
                Trusted by 10,000+ happy clients
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;