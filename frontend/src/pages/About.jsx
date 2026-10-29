import { Link } from 'react-router-dom';
import { Award, Users, MapPin, Phone, Clock, ShieldCheck, MessageCircle } from 'lucide-react';
import SEO from '../components/common/SEO';
import { SALON_CONFIG } from '../config/salonConfig';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      <SEO
        title="About Enrich Beauty Parlour & Cosmetic Clinic | Sikar"
        description="Learn about Enrich Salon Sikar. Founded by Anu Saini with specialized clinical skincare, HD bridal makeup, and verified hygiene standards."
      />

      {/* Header Banner: Crisp and punchy */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-rose-700 uppercase bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
          About Our Salon
        </span>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Enrich Beauty Parlour & Clinic
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
          Founded under the personal direction of Lead Cosmetologist <strong>Anu Saini</strong>, Enrich unites clinical skincare therapies with contemporary hair styling and royal Rajasthani bridal artistry in Sikar.
        </p>
      </div>

      {/* 3 Simple Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
          <div className="w-10 h-10 mx-auto rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="text-base font-serif font-bold text-stone-900">Certified Cosmetologists</h2>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            All treatments are performed by trained, certified aesthetic specialists using premium products.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
          <div className="w-10 h-10 mx-auto rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-base font-serif font-bold text-stone-900">Personal Consultation</h2>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            1-on-1 skin and hair analysis before every service to achieve your ideal personalized look.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
          <div className="w-10 h-10 mx-auto rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base font-serif font-bold text-stone-900">Medical-Grade Hygiene</h2>
          <p className="text-xs text-stone-600 leading-relaxed font-light">
            Sterilized equipment, single-use disposables, and 100% genuine dermatologically tested cosmetics.
          </p>
        </div>
      </div>

      {/* Salon Location & Action Strip */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-4 h-4" />
            <span>Visit Enrich in Sikar</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            First Floor, Sharda Heights, Chandpol, Sikar
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 font-light">
            Near Ramlila Maidan / Parshuram Park, Rajasthan 332001. Open daily 9:30 AM – 7:30 PM.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href="https://wa.me/919667900313?text=Hi%20Enrich%20Salon,%20I%20would%20like%20to%20book%20an%20appointment."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Book on WhatsApp</span>
          </a>

          <a
            href={SALON_CONFIG.contact.phoneTel}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 transition-colors"
          >
            <Phone className="w-4 h-4 text-stone-700" />
            <span>Call +91 96679 00313</span>
          </a>

          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold border border-stone-200 transition-colors"
          >
            <span>Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
}
