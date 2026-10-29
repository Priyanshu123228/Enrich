import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Lock,
  ExternalLink,
  PhoneCall,
  HeartHandshake,
  Check
} from 'lucide-react';
import { inquiryService } from '../services/inquiry.service';
import { SALON_CONFIG } from '../config/salonConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { trackContactAction } from '../utils/analytics';
import SEO from '../components/common/SEO';

function WhatsAppIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.971.53 1.77.813 2.796.813h.005c3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.773-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.693.075-2.09-.493-1.637-.665-2.73-2.317-2.813-2.427-.082-.11-1.002-1.332-1.002-2.54 0-1.209.636-1.803.86-2.048.225-.246.491-.307.655-.307.164 0 .328.003.47.01.15.008.351-.057.55.421.205.492.697 1.701.758 1.824.061.123.102.266.02.43-.082.163-.123.266-.246.409-.123.143-.258.32-.369.43-.123.122-.251.255-.108.5.144.246.638 1.053 1.37 1.705.942.84 1.737 1.1 1.983 1.223.246.123.389.102.533-.061.143-.164.614-.716.778-.962.164-.246.327-.205.55-.123.224.082 1.413.666 1.659.789.245.123.409.184.47.287.062.102.062.593-.082.998zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
    </svg>
  );
}

export default function Contact() {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [formStartTime, setFormStartTime] = useState(Date.now());

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    hp_website: '' // Anti-bot honeypot
  });

  useEffect(() => {
    setFormStartTime(Date.now());
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user]);

  const validateForm = () => {
    const errors = {};

    // Name Validation
    if (!formData.name.trim()) {
      errors.name = 'Kripya apna naam likhein (Please enter your name)';
    }

    // Phone Validation (Primary for local town customers)
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Kripya apna 10-digit mobile number likhein';
    } else if (cleanPhone.length < 10) {
      errors.phone = 'Mobile number 10 digits ka hona chahiye';
    }

    // Email is OPTIONAL for small town customers
    if (formData.email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Kripya sahi email address likhein';
      }
    }

    // Message Validation
    if (!formData.message.trim()) {
      errors.message = 'Kripya batayein aapko kya jankari chahiye (Please write your message)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    // Anti-bot time check
    const timeSpentMs = Date.now() - formStartTime;
    if (timeSpentMs < 1000 && !formData.hp_website) {
      await new Promise((r) => setTimeout(r, 600));
    }

    if (formData.hp_website) {
      setFormSubmitted(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // If customer left email empty, generate a fallback so backend schema succeeds
      const customerEmail = formData.email.trim()
        ? formData.email.trim().toLowerCase()
        : `guest_${formData.phone.replace(/\D/g, '') || Date.now()}@enrichparlour.local`;

      const payload = {
        name: formData.name.trim(),
        email: customerEmail,
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        hp_website: formData.hp_website
      };

      const res = await inquiryService.createInquiry(payload);

      if (res && res.success !== false) {
        setSubmittedData({ ...formData });
        setFormSubmitted(true);
        toast.success('Aapka message mil gaya hai! Hum jaldi hi aapse sampark karenge.');
        trackContactAction('contact_form_success');
      } else {
        const err = res?.message || 'Message bhejne mein dikkat aayi. Kripya direct call ya WhatsApp karein.';
        setErrorMessage(err);
        toast.error(err);
      }
    } catch (err) {
      const errTxt = err?.response?.data?.message || err?.message || 'Failed to submit. Kripya direct WhatsApp ya call karein.';
      setErrorMessage(errTxt);
      toast.error(errTxt);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsAppWithTopic = (topic) => {
    trackContactAction('whatsapp');
    const msg = `Namaste Enrich Salon! Mujhe ${topic} ke baare mein poochna hai.`;
    const url = `https://wa.me/919667900313?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 sm:py-14">
      <SEO
        title="Contact & Visit Us | Enrich Ladies Beauty Parlor Sikar"
        description="1-Tap Contact with Enrich Ladies Beauty Parlor at Sharda Heights, Chandpol, Sikar. Call: +91 96679 00313 or Chat on WhatsApp. No forms required!"
        url="/contact"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        
        {/* =========================================================================
            1. TOP HEADER: 1-Tap First, Forms Second Announcement
            ========================================================================= */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-emerald-800 uppercase bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>⚡ 1-Tap Turant Sampark (Direct Contact)</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Baat Karein Ya Sidhe Aayein
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            Kisi lambe form ko bharne ki zaroorat nahi hai! Niche diye 1-tap buttons se turant WhatsApp par baat karein ya direct phone milayein.
          </p>
        </div>

        {/* =========================================================================
            2. THE 3 DOMINANT 1-TAP CONTACT CARDS (WhatsApp, Call, Maps)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: WhatsApp Chat (Highlighted Emerald) */}
          <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-7 shadow-lg shadow-emerald-950/15 flex flex-col justify-between space-y-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                  <WhatsAppIcon className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  Online Desk
                </span>
              </div>

              <div>
                <h2 className="text-lg font-serif font-bold text-white">
                  Chat on WhatsApp
                </h2>
                <p className="text-xs text-emerald-100 font-light mt-0.5">
                  Sabse aasan tareeka! Photo bhejein, rate poochein aur booking karein.
                </p>
              </div>

              {/* Quick Topic Chips */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                  Tap Karke Sidhe Poochein:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Bridal Makeup Rates',
                    'Facial & Skin Care',
                    'Hair Smoothening / Spa',
                    'Dukaan Ka Rasta'
                  ].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => openWhatsAppWithTopic(topic)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white text-white hover:text-emerald-900 backdrop-blur-xs transition-colors cursor-pointer text-left"
                    >
                      + {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <a
              href="https://wa.me/919667900313?text=Namaste%20Enrich%20Salon!%20Mujhe%20appointment%20aur%20services%20ke%20bare%20mein%20puchna%20hai."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer relative z-10"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-600" />
              <span>Start WhatsApp Chat</span>
            </a>
          </div>

          {/* Card 2: Direct Phone Call (Luxury Dark Stone) */}
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg shadow-stone-950/20 flex flex-col justify-between space-y-5 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-rose-300">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-stone-400">
                  9:30 AM – 7:30 PM
                </span>
              </div>

              <div>
                <h2 className="text-lg font-serif font-bold text-white">
                  Direct Phone Call
                </h2>
                <p className="text-xs text-stone-400 font-light mt-0.5">
                  Owner didi se direct phone par baat karein aur slot confirm karein.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                  Official Salon Helpline
                </span>
                <p className="text-base sm:text-lg font-bold text-white font-mono">
                  +91 96679 00313
                </p>
                <p className="text-[11px] text-stone-400">
                  Daily Open (All 7 Days: 9:30 AM – 7:30 PM)
                </p>
              </div>
            </div>

            <a
              href="tel:+919667900313"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-950/20 transition-all active:scale-95 cursor-pointer relative z-10"
            >
              <Phone className="w-4 h-4 text-white" />
              <span>Call: 96679 00313</span>
            </a>
          </div>

          {/* Card 3: Google Maps Landmark & Directions */}
          <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                  Chandpol, Sikar
                </span>
              </div>

              <div>
                <h2 className="text-lg font-serif font-bold text-stone-900">
                  Dukaan Ka Rasta (Visit Us)
                </h2>
                <p className="text-xs text-stone-600 font-light mt-0.5">
                  Main market mein asani se milne wala landmark.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1 text-xs text-stone-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                  Exact Address & Landmark
                </span>
                <p className="font-semibold text-stone-900 text-xs leading-relaxed">
                  First Floor, Sharda Heights, Near Ramlila Maidan / Parshuram Park, Chandpol, Sikar
                </p>
                <p className="text-[11px] text-stone-500 pt-0.5">
                  📍 Pehchan: State Bank ke theek paas 1st floor par.
                </p>
              </div>
            </div>

            <a
              href={SALON_CONFIG.location?.googleMapsUrl || "https://maps.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs border border-stone-300 transition-all active:scale-95 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-rose-700" />
              <span>Google Maps Me Rasta Dekhein</span>
            </a>
          </div>

        </div>

        {/* =========================================================================
            3. LOCAL CUSTOMER TRUST & PRIVACY GUARANTEE BADGES
            ========================================================================= */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs">
          <div className="text-center max-w-md mx-auto space-y-1 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Hamari Guarantee • Hamara Vaada
            </span>
            <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
              Khas Mahilaon Aur Betiyon Ki Suvidha
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
              <span className="text-xl">🌸</span>
              <p className="text-xs font-bold text-stone-900">100% Female Staff</p>
              <p className="text-[10px] text-stone-500">Sirf mahila staff dwara service</p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
              <span className="text-xl">🚪</span>
              <p className="text-xs font-bold text-stone-900">Private AC Bridal Suite</p>
              <p className="text-[10px] text-stone-500">Alag private room puri privacy ke sath</p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
              <span className="text-xl">💄</span>
              <p className="text-xs font-bold text-stone-900">Original Branded Products</p>
              <p className="text-[10px] text-stone-500">L'Oreal, MAC, Kryolan, O3+ genuine</p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-1">
              <span className="text-xl">🧼</span>
              <p className="text-xs font-bold text-stone-900">Fresh Sanitized Kits</p>
              <p className="text-[10px] text-stone-500">Disposable bed sheets & safe tools</p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. SECONDARY: OPTIONAL ONLINE MESSAGE FORM (Forms Second)
            ========================================================================= */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-6 shadow-xs max-w-3xl mx-auto">
          
          <div className="border-b border-stone-100 pb-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                Optional Written Request
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                Ya Phir Online Message Chhodein
              </h2>
              <p className="text-xs text-stone-500 font-light mt-0.5">
                Agar aap call ya WhatsApp nahi karna chahte, toh yahan apna naam aur phone number chhod dein. Hum aapko call kar lenge.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 shrink-0">
              Email Zaroori Nahi Hai
            </span>
          </div>

          {formSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Dhanyawad {submittedData?.name || ''}!
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                  Aapka message Enrich Salon ko mil gaya hai. Hamari team aapke number <strong>{submittedData?.phone}</strong> par jaldi hi sampark karegi.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`https://wa.me/919667900313?text=${encodeURIComponent(
                    `Namaste! Maine website par message choda tha (${submittedData?.name || ''}). Please check karein.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs inline-flex items-center gap-2"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Par Bhi Alert Bhejein</span>
                </a>

                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', message: '', hp_website: '' });
                  }}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs"
                >
                  Naya Message Likhien
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Anti-Bot Honeypot */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <label htmlFor="hp_website">Leave this field blank</label>
                <input
                  type="text"
                  id="hp_website"
                  name="hp_website"
                  value={formData.hp_website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-800 block">
                    Aapka Naam (Your Full Name) <span className="text-rose-700">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Jaise: Sunita Sharma"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none transition-all ${
                      formErrors.name ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-stone-200 focus:border-rose-700'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] font-medium text-rose-700">{formErrors.name}</p>
                  )}
                </div>

                {/* Mobile Phone (Required) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-800 block">
                    Mobile Number (Phone Number) <span className="text-rose-700">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Jaise: 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none transition-all ${
                      formErrors.phone ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-stone-200 focus:border-rose-700'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] font-medium text-rose-700">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Email (Explicitly Optional for small towns) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                  <span>Email Address</span>
                  <span className="text-[10px] text-stone-400 font-normal">(Optional - Agar ho toh likhein)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com (agar ho toh bharein)"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none transition-all ${
                    formErrors.email ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-stone-200 focus:border-rose-700'
                  }`}
                />
                {formErrors.email && (
                  <p className="text-[11px] font-medium text-rose-700">{formErrors.email}</p>
                )}
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 block">
                  Aapko kya poochna hai? (Your Message) <span className="text-rose-700">*</span>
                </label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Jaise: Mujhe bridal makeup packages ke bare mein janna hai..."
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-none transition-all resize-none ${
                    formErrors.message ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-stone-200 focus:border-rose-700'
                  }`}
                />
                {formErrors.message && (
                  <p className="text-[11px] font-medium text-rose-700">{formErrors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Message Bheja Ja Raha Hai...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Message Bhejein (Submit Inquiry)</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-stone-400 text-center font-light">
                💡 Tip: Turant jawab ke liye upar diye WhatsApp button se baat karein.
              </p>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
