import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-glamour-dark to-glamour-red/80 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-serif text-2xl md:text-3xl mb-4 bg-gradient-to-r from-glamour-gold to-glamour-red bg-clip-text text-transparent drop-shadow-md">
              GlamConnect
            </h3>
            <p className="font-sans text-sm md:text-base text-white/70">
              Connecting beauty enthusiasts with elite makeup artists.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg md:text-xl mb-4 text-glamour-gold drop-shadow">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/search"
                  className="font-sans text-sm md:text-base text-white/70 hover:text-glamour-gold transition-colors"
                >
                  Find Artists
                </a>
              </li>
              <li>
                <a
                  href="/masterclasses"
                  className="font-sans text-sm md:text-base text-white/70 hover:text-glamour-gold transition-colors"
                >
                  Masterclasses
                </a>
              </li>
              <li>
                <a
                  href="/signup/artist"
                  className="font-sans text-sm md:text-base text-white/70 hover:text-glamour-gold transition-colors"
                >
                  Join as Artist
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg md:text-xl mb-4 text-glamour-gold drop-shadow">
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#contact"
                  className="font-sans text-sm md:text-base text-white/70 hover:text-glamour-gold transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="font-sans text-sm md:text-base text-white/70 hover:text-glamour-gold transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="font-sans text-sm md:text-base text-white/70 hover:text-glamour-gold transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg md:text-xl mb-4 text-glamour-gold drop-shadow">
              Follow Us
            </h4>
            <div className="flex space-x-5">
              <a
                href="#instagram"
                className="text-white/70 hover:text-glamour-gold transition-colors hover:scale-110 transform duration-300"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#facebook"
                className="text-white/70 hover:text-glamour-gold transition-colors hover:scale-110 transform duration-300"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="#twitter"
                className="text-white/70 hover:text-glamour-gold transition-colors hover:scale-110 transform duration-300"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-glamour-gold/30">
          <p className="font-sans text-sm md:text-base text-white/70 text-center">
            © {new Date().getFullYear()}{" "}
            <span className="bg-gradient-to-r from-glamour-gold to-glamour-red bg-clip-text text-transparent">
              GlamConnect
            </span>{" "}
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;