import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, Loader2, MessageSquare, Compass, ShieldCheck, PenLine } from 'lucide-react';
import { inquiryService } from '../services/inquiry.service';
import { SALON_CONFIG } from '../config/salonConfig';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/common/SEO';

export default function Contact() {
  const { user, isAuthenticated } = useAuth();
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
      setFormData(prev => ({
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
      errors.name = 'Please enter your full name';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Email Validation (RFC compliant)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email address';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com)';
    }

    // Indian Phone Validation (Optional or 10 digits)
    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(cleanPhone.slice(-10))) {
        errors.phone = 'Please enter a valid 10-digit mobile number';
      }
    }

    // Message Validation
    if (!formData.message.trim()) {
      errors.message = 'Please enter your inquiry or treatment questions';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Client-Side Validation
    if (!validateForm()) {
      return;
    }

    // 2. Anti-Bot Time Check (Humans take at least 1.5s to fill out)
    const timeSpentMs = Date.now() - formStartTime;
    if (timeSpentMs < 1200 && !formData.hp_website) {
      // Fast submission simulation delay
      await new Promise(r => setTimeout(r, 600));
    }

    // 3. Honeypot Check
    if (formData.hp_website) {
      // Silently succeed for bots
      setFormSubmitted(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        hp_website: formData.hp_website
      };

      const res = await inquiryService.createInquiry(payload);

      if (res && (res.success || res.statusCode === 201 || res.statusCode === 200)) {
        setSubmittedData({ ...formData });
        setFormSubmitted(true);
      } else {
        setErrorMessage(res?.message || 'Unable to submit inquiry. Please try again.');
      }
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to submit inquiry. Please call our salon directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 sm:py-16">
      <SEO
        title="Contact & Visit Us | Enrich Ladies Beauty Parlor Sikar"
        description="Get in touch with Enrich Ladies Beauty Parlor at Sharda Heights, Chandpol, Sikar. Phone: +91 96679 00313. Book consultations & bridal inquiries online."
        url="/contact"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-widest text-rose-800 uppercase bg-rose-50 px-3.5 py-1 rounded-full border border-rose-200">
            Salon Concierge
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Get in Touch with Enrich
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            Have questions regarding our bridal packages, hydrafacials, or hair transformations? Our team in Sikar is ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Information Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Salon Information
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-stone-700">
                {/* Address */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-stone-900 block text-xs uppercase tracking-wider">Address</span>
                    <p className="text-stone-700 leading-relaxed text-xs">
                      {SALON_CONFIG.contact.address}
                    </p>
                    <a
                      href={SALON_CONFIG.location?.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 hover:text-rose-900 underline pt-0.5"
                    >
                      <span>Open in Google Maps →</span>
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-900 block text-xs uppercase tracking-wider">Phone & WhatsApp</span>
                    <a href={SALON_CONFIG.contact.phoneTel} className="text-stone-900 font-bold hover:text-rose-800 text-xs">
                      {SALON_CONFIG.contact.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-stone-900 block text-xs uppercase tracking-wider">Email Concierge</span>
                    <a href={SALON_CONFIG.contact.emailMailto} className="text-stone-900 font-semibold hover:text-rose-800 text-xs">
                      {SALON_CONFIG.contact.email}
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70">
                  <div className="w-9 h-9 rounded-xl bg-stone-200 text-stone-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-stone-900 block uppercase tracking-wider">Opening Hours</span>
                    <p className="text-stone-700">Mon – Sat: <strong>9:00 AM – 8:00 PM</strong></p>
                    <p className="text-stone-700">Sunday: <strong>10:00 AM – 5:00 PM</strong></p>
                  </div>
                </div>
              </div>

              {/* Direct Review Link */}
              <div className="pt-2 border-t border-stone-100">
                <a
                  href="https://search.google.com/local/writereview?placeid=ChIJU0FX87GlbDkR-rHj5cW-riU"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors border border-stone-200"
                >
                  <PenLine className="w-3.5 h-3.5 text-rose-700" />
                  <span>Write a Review on Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiries & Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-10 shadow-xs space-y-6">
              
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Send Us a Message
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 font-light">
                  Fill out the form below and our salon concierge will respond within 24 hours.
                </p>
              </div>

              {formSubmitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-lg text-emerald-950">
                      Message Received, {submittedData?.name ? submittedData.name.split(' ')[0] : 'Valued Client'}!
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-light max-w-md mx-auto">
                      Thank you for contacting Enrich Ladies Beauty Parlor. We have sent a confirmation email to <strong>{submittedData?.email}</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', message: '', hp_website: '' });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  
                  {/* Anti-Bot Honeypot Field (Hidden from humans) */}
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

                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      Your Full Name <span className="text-rose-700">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Sunita Meena"
                      value={formData.name}
                      onChange={handleChange}
                      aria-invalid={!!formErrors.name}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-hidden transition-all ${
                        formErrors.name ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-stone-200 focus:border-rose-700 focus:ring-1 focus:ring-rose-700'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-[11px] font-medium text-rose-700">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800 block">
                        Email Address <span className="text-rose-700">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="e.g. sunita@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        aria-invalid={!!formErrors.email}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-hidden transition-all ${
                          formErrors.email ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-stone-200 focus:border-rose-700 focus:ring-1 focus:ring-rose-700'
                        }`}
                      />
                      {formErrors.email && (
                        <p className="text-[11px] font-medium text-rose-700">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-800 block">
                        Mobile Number <span className="text-stone-500 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        aria-invalid={!!formErrors.phone}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-hidden transition-all ${
                          formErrors.phone ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-stone-200 focus:border-rose-700 focus:ring-1 focus:ring-rose-700'
                        }`}
                      />
                      {formErrors.phone && (
                        <p className="text-[11px] font-medium text-rose-700">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 block">
                      Message / Treatment Inquiries <span className="text-rose-700">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Please let us know which treatments or dates you're interested in..."
                      value={formData.message}
                      onChange={handleChange}
                      aria-invalid={!!formErrors.message}
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50/50 focus:bg-white focus:outline-hidden transition-all resize-none ${
                        formErrors.message ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-stone-200 focus:border-rose-700 focus:ring-1 focus:ring-rose-700'
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
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-900/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message to Concierge</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-stone-500 text-center font-light">
                    Protected by reCAPTCHA & SSL encryption. Your information is strictly confidential.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
