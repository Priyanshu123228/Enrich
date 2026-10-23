import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scissors,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  ExternalLink,
  CalendarCheck
} from 'lucide-react';
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
        // Silently fallback to default social links
      }
    };
    fetchSocial();
    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate live salon opening status based on IST (Asia/Kolkata)
  const getSalonStatus = () => {
    try {
      const now = new Date();
      const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const day = istTime.getDay(); // 0 is Sunday, 1-6 Mon-Sat
      const minutes = istTime.getHours() * 60 + istTime.getMinutes();

      if (day === 0) {
        // Sunday: 10:00 AM (600) to 5:00 PM (1020)
        if (minutes >= 600 && minutes < 1020) {
          return { isOpen: true, label: 'Open Now • Closes 5:00 PM' };
        }
        return { isOpen: false, label: minutes < 600 ? 'Opens Today 10:00 AM' : 'Closed • Opens Mon 9:00 AM' };
      } else {
        // Mon - Sat: 9:00 AM (540) to 8:00 PM (1200)
        if (minutes >= 540 && minutes < 1200) {
          return { isOpen: true, label: 'Open Now • Closes 8:00 PM' };
        }
        return { isOpen: false, label: minutes < 540 ? 'Opens Today 9:00 AM' : 'Closed • Opens Tomorrow 9:00 AM' };
      }
    } catch (_) {
      return { isOpen: true, label: 'Open Mon–Sat 9AM–8PM' };
    }
  };

  const status = getSalonStatus();

  return (
    <footer className="relative bg-[#FAF7F2] text-stone-700 border-t border-stone-200/80 pt-14 pb-24 md:pb-10 overflow-hidden">
      
      {/* Decorative Subtle Warm Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-100/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-stone-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* =========================================================================
            MAIN 4-COLUMN FOOTER GRID
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Heritage (4 Cols on LG) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-700 text-white flex items-center justify-center shadow-xs">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-stone-900 font-serif leading-none block">
                  Enrich <span className="text-rose-700 font-serif italic">Beauty</span>
                </span>
                <span className="text-[11px] font-medium tracking-wide text-stone-500 uppercase">
                  Parlour &amp; Cosmetic Clinic
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              Premier beauty atelier &amp; cosmetic clinic in Sikar, Rajasthan. Specializing in advanced hair styling, clinical skincare rituals, bridal artistry, and luxury salon retail.
            </p>

            {/* Badges - Unified Cohesive Styling */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white text-stone-700 border border-stone-200/80 shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                4.9★ Google Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white text-stone-700 border border-stone-200/80 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                Est. 2018 • Sikar
              </span>
            </div>

            {/* Social Media Links - Unified Palette */}
            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold tracking-wider text-stone-900 uppercase">
                Connect Online
              </p>
              <div className="flex flex-wrap gap-2">
                {socialLinks && socialLinks.length > 0 ? (
                  socialLinks.map((link) => (
                    <a
                      key={link._id || link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200/80 hover:border-rose-300 flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-2xs"
                      title={`${link.displayName} - ${link.handle || link.url}`}
                    >
                      <SocialIcon platform={link.platform} className="w-4 h-4" />
                    </a>
                  ))
                ) : (
                  <>
                    <a
                      href={SALON_CONFIG.contact.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200/80 hover:border-rose-300 flex items-center justify-center transition-all hover:scale-105 shadow-2xs"
                      title="Instagram"
                    >
                      <SocialIcon platform="instagram" className="w-4 h-4" />
                    </a>
                    <a
                      href={SALON_CONFIG.contact.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200/80 hover:border-rose-300 flex items-center justify-center transition-all hover:scale-105 shadow-2xs"
                      title="WhatsApp"
                    >
                      <SocialIcon platform="whatsapp" className="w-4 h-4" />
                    </a>
                    <a
                      href={SALON_CONFIG.contact.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200/80 hover:border-rose-300 flex items-center justify-center transition-all hover:scale-105 shadow-2xs"
                      title="Facebook"
                    >
                      <SocialIcon platform="facebook" className="w-4 h-4" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links (2.5 Cols on LG) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-stone-900 tracking-wider uppercase">
              Quick Navigation
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              {[
                { name: 'Home', path: '/' },
                { name: 'Services', path: '/services' },
                { name: 'Bridal Artistry', path: '/#bridal' },
                { name: 'Cosmetics & Retail', path: '/cosmetics' },
                { name: 'Salon Gallery & Media', path: '/gallery' },
                { name: 'About Our Studio', path: '/about' },
                { name: 'Contact Us', path: '/contact' }
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="group inline-flex items-center text-stone-600 hover:text-rose-700 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300 group-hover:bg-rose-600 mr-2 transition-colors shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Opening Hours & Live Status (3 Cols on LG) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-stone-900 tracking-wider uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-700" />
                Salon Hours
              </h3>
            </div>

            {/* Live Status Pill - Harmonized with overall palette */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white text-stone-700 border border-stone-200/80 shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${status.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <span className="font-semibold text-stone-800">{status.label}</span>
            </div>

            {/* Timings Card */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-2.5 shadow-2xs text-xs sm:text-sm">
              <div className="flex justify-between items-center text-stone-700 pb-2 border-b border-stone-100">
                <span className="font-semibold text-stone-900">Mon – Fri</span>
                <span className="font-medium text-stone-600">{SALON_CONFIG.hours.weekday}</span>
              </div>
              <div className="flex justify-between items-center text-stone-700 pb-2 border-b border-stone-100">
                <span className="font-semibold text-stone-900">Saturday</span>
                <span className="font-medium text-stone-600">{SALON_CONFIG.hours.saturday}</span>
              </div>
              <div className="flex justify-between items-center text-stone-700">
                <span className="font-semibold text-stone-900">Sunday</span>
                <span className="font-medium text-stone-600">{SALON_CONFIG.hours.sunday}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 font-light flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Walk-ins &amp; scheduled appointments welcome</span>
            </p>
          </div>

          {/* Column 4: Salon Location & Concierge (3 Cols on LG) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold text-stone-900 tracking-wider uppercase">
              Salon Location
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-rose-700 border border-stone-200/80 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-stone-700 leading-snug font-medium">
                    {SALON_CONFIG.contact.address}
                  </p>
                  <a
                    href={SALON_CONFIG.contact.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-rose-700 hover:text-rose-800 transition-colors pt-0.5"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5 pt-1">
                <div className="w-8 h-8 rounded-xl bg-white text-rose-700 border border-stone-200/80 shadow-2xs flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <a
                  href={SALON_CONFIG.contact.phoneTel}
                  className="font-semibold text-stone-900 hover:text-rose-700 transition-colors"
                >
                  {SALON_CONFIG.contact.phone}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-rose-700 border border-stone-200/80 shadow-2xs flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <a
                  href={SALON_CONFIG.contact.emailMailto}
                  className="text-stone-700 hover:text-rose-700 font-medium truncate transition-colors"
                >
                  {SALON_CONFIG.contact.email}
                </a>
              </div>
            </div>

            {/* Quick Action Button - Solid Rose-700 Anchor */}
            <div className="pt-2">
              <Link
                to="/book"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs tracking-wide shadow-sm shadow-rose-950/10 hover:shadow-md transition-all duration-200"
              >
                <span>Book Appointment Online</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* =========================================================================
            BOTTOM BAR
            ========================================================================= */}
        <div className="pt-8 border-t border-stone-200/80 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500 lg:pr-40 sm:pr-32">
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} {SALON_CONFIG.business.name}. All rights reserved.
            </p>
            <span className="hidden sm:inline text-stone-300">•</span>
            <div className="flex items-center gap-3">
              <Link to="/privacy-policy" className="hover:text-rose-700 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link to="/terms-and-conditions" className="hover:text-rose-700 transition-colors">
                Terms &amp; Conditions
              </Link>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-stone-600 font-medium">
            <span>Appointments &amp; Walk-ins Welcome</span>
            <span>•</span>
            <span className="font-semibold text-stone-800">Chandpol, Sikar</span>
          </p>

        </div>

      </div>
    </footer>
  );
}
