import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scissors, Phone, Mail, MapPin, Clock, Sparkles, Heart } from 'lucide-react';
import SocialIcon from '../common/SocialIcon';
import socialService from '../../services/social.service';
import { SALON_CONFIG } from '../../config/salonConfig';

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchSocial = async () => {
      try {
        const res = await socialService.getActiveSocialLinks();
        if (isMounted && res && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
          setSocialLinks(list);
        }
      } catch (e) {
        // Silently fallback
      }
    };
    fetchSocial();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer className="bg-gradient-to-b from-[#FAF7F2] via-[#F5EFE6] to-[#EFE7DC] text-stone-700 pt-16 pb-12 border-t border-stone-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-700 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-900/20">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-stone-900 font-serif">
                Enrich <span className="text-rose-700 font-serif italic">Beauty</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              Premier beauty boutique & cosmetic clinic in Sikar, Rajasthan. Specializing in advanced hair styling, clinical skincare rituals, bridal artistry, and luxury salon retail.
            </p>

            {/* Dynamic Active Social Icons */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500">
                  Connect Online
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {socialLinks.map((link) => (
                    <a
                      key={link._id || link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200/90 hover:border-rose-300 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xs"
                      title={`${link.displayName} - ${link.handle || link.url}`}
                    >
                      <SocialIcon platform={link.platform} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white text-stone-700 px-3 py-1.5 rounded-full border border-stone-200/90 shadow-2xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                Verified Salon & Aesthetic Clinic
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li>
                <Link to="/" className="text-stone-600 hover:text-rose-700 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-stone-600 hover:text-rose-700 transition-colors">
                  Services & Pricing
                </Link>
              </li>
              <li>
                <Link to="/cosmetics" className="text-stone-600 hover:text-rose-700 transition-colors">
                  Cosmetics & Retail
                </Link>
              </li>
              <li>
                <Link to="/staff" className="text-stone-600 hover:text-rose-700 transition-colors">
                  Our Stylists
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-stone-600 hover:text-rose-700 transition-colors">
                  Special Packages & Offers
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-stone-600 hover:text-rose-700 transition-colors">
                  Photo & Video Showcase
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest flex items-center">
              <Clock className="w-4 h-4 mr-2 text-rose-600" />
              Salon Hours
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-600">
              <li className="flex justify-between items-center p-2 rounded-xl bg-white/60 border border-stone-200/60">
                <span className="font-medium text-stone-800">Mon – Fri:</span>
                <span className="text-stone-600 font-semibold">{SALON_CONFIG.hours.weekday}</span>
              </li>
              <li className="flex justify-between items-center p-2 rounded-xl bg-white/60 border border-stone-200/60">
                <span className="font-medium text-stone-800">Saturday:</span>
                <span className="text-stone-600 font-semibold">{SALON_CONFIG.hours.saturday}</span>
              </li>
              <li className="flex justify-between items-center p-2 rounded-xl bg-white/60 border border-stone-200/60">
                <span className="font-medium text-stone-800">Sunday:</span>
                <span className="text-stone-600 font-semibold">{SALON_CONFIG.hours.sunday}</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-widest">
              Salon Location
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-600 font-light">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2.5 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {SALON_CONFIG.contact.address}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2.5 text-rose-600 shrink-0" />
                <a href={SALON_CONFIG.contact.phoneTel} className="text-stone-800 hover:text-rose-700 font-semibold transition-colors">
                  {SALON_CONFIG.contact.phone}
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2.5 text-rose-600 shrink-0" />
                <a href={SALON_CONFIG.contact.emailMailto} className="text-stone-800 hover:text-rose-700 font-semibold transition-colors">
                  {SALON_CONFIG.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-200/80 text-center text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} {SALON_CONFIG.business.name}. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-stone-600">
            <span>Appointments & Walk-ins Welcome</span>
            <span>•</span>
            <span className="font-semibold text-rose-700">Chandpol, Sikar</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
