import { Link } from 'react-router-dom';
import { Award, Users, MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';
import SEO from '../components/common/SEO';
import { SALON_CONFIG } from '../config/salonConfig';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <SEO
        title="About Our Studio & Clinic | Enrich Salon Sikar"
        description="Learn about Enrich Salon & Cosmetic Clinic Sikar. Founded with an unwavering commitment to clinical skincare, bridal elegance, and international hygiene standards."
      />

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
          Our Heritage & Philosophy
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Where Medical Precision Meets Salon Artistry
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
          Enrich Beauty Parlour & Cosmetic Clinic is Sikar's premier beauty destination. We unite advanced dermatological therapies with modern hairdressing and couture bridal artistry under one luxurious roof.
        </p>
      </div>

      {/* Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Licensed Cosmetologists</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            All aesthetic and clinical hair services are administered by certified specialists with verified credentials and advanced training.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Customized Consultations</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            Every bridal look, skin therapy, or color transformation begins with an in-depth consultation tailored to your skin tone and hair profile.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Hospital-Grade Hygiene</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            Autoclaved instruments, sterilized treatment rooms, and 100% genuine luxury products dermatologically verified for safety.
          </p>
        </div>
      </div>

      {/* Salon Location & Verification Strip */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-bold tracking-widest uppercase">
            <MapPin className="w-4 h-4" />
            <span>Visit Our Studio & Clinic</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            First Floor, Sharda Heights, Sikar
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
            Near Ramlila Maidan / Parshuram Park, Chandpol, Sikar, Rajasthan 332001. Open 7 days a week for appointments, bridal trials, and walk-in skincare consultations.
          </p>
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>9:00 AM • 8:00 PM</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span>+91 96679 00313</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          <Link
            to="/book"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold uppercase tracking-wider transition-colors shadow-md text-center"
          >
            <span>Book Appointment</span>
          </Link>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-stone-700 hover:border-stone-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors text-center"
          >
            <span>Get Directions</span>
          </a>
        </div>
      </div>
    </div>
  );
}
