import { Link } from 'react-router-dom';
import { Scissors, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-stone-800 border border-stone-700 text-rose-300 flex items-center justify-center">
                <Scissors className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-serif">
                Luxe<span className="text-rose-400">Parlour</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Professional hair, skincare, bridal styling, and nail services located in Manhattan, New York.
            </p>
            <div className="flex items-center space-x-4 pt-1">
              <span className="text-xs bg-stone-800 text-stone-300 px-3 py-1 rounded-md border border-stone-700">
                Licensed NYC Beauty Studio
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-stone-100 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-rose-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-rose-400 transition-colors">
                  Services & Pricing
                </Link>
              </li>
              <li>
                <Link to="/staff" className="hover:text-rose-400 transition-colors">
                  Our Stylists
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-rose-400 transition-colors">
                  Current Offers
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-rose-400 transition-colors">
                  Photo & Video Gallery
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-rose-400 transition-colors">
                  Location & Hours
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-stone-100 uppercase tracking-wider flex items-center">
              <Clock className="w-4 h-4 mr-2 text-rose-400" />
              Salon Hours
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li className="flex justify-between">
                <span>Monday - Friday:</span>
                <span className="text-stone-200 font-medium">9:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-stone-200 font-medium">9:00 AM - 7:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-stone-200 font-medium">10:00 AM - 5:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-stone-100 uppercase tracking-wider">
              Salon Location
            </h3>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2.5 text-rose-400 shrink-0 mt-0.5" />
                <span>450 Fashion Avenue, Suite 1800<br />New York, NY 10018</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2.5 text-rose-400 shrink-0" />
                <span>(212) 555-0198</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2.5 text-rose-400 shrink-0" />
                <span>concierge@luxeparlour.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800 text-center text-xs text-stone-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} LuxeParlour LLC. All rights reserved.</p>
          <p className="text-stone-400">
            Appointments & Walk-ins Welcome
          </p>
        </div>
      </div>
    </footer>
  );
}
