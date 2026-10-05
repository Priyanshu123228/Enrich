import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, Loader2, MessageSquare, Compass, Lock, UserCheck } from 'lucide-react';
import { inquiryService } from '../services/inquiry.service';
import { SALON_CONFIG } from '../config/salonConfig';
import { useAuth } from '../context/AuthContext';

export default function Contact() {
  const { user, isAuthenticated } = useAuth();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedData, setSubmittedData] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMessage('Please sign in to your account to submit an inquiry.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await inquiryService.submitInquiry(formData);
      setSubmittedData({ ...formData });
      setFormSubmitted(true);
      setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', message: '' });
    } catch (err) {
      console.error('Inquiry submission error:', err);
      const apiErrMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit inquiry. Please make sure you are signed in and try again.';
      setErrorMessage(apiErrMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
          Connect With Us
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          Salon Location & Concierge
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Have questions regarding treatments, custom bridal packages, or scheduling inquiries? Contact our front desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Information & Hours */}
        <div className="lg:col-span-5 space-y-8 bg-white p-8 rounded-3xl border border-stone-200/90 shadow-xs">
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Salon Concierge
          </h2>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm font-serif">Location</h4>
                <p className="text-sm text-stone-600 mt-0.5">
                  {SALON_CONFIG.contact.address}<br />
                  <span className="text-xs text-stone-500">({SALON_CONFIG.contact.directionsHint})</span>
                </p>
                <div className="mt-2">
                  <a
                    href={SALON_CONFIG.location.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-bold text-rose-700 hover:text-rose-800"
                  >
                    <Compass className="w-3.5 h-3.5 mr-1 text-rose-600" />
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm font-serif">Direct Phone</h4>
                <a href={SALON_CONFIG.contact.phoneTel} className="text-sm text-stone-800 hover:text-rose-700 font-semibold mt-0.5 block">
                  {SALON_CONFIG.contact.phone}
                </a>
                <p className="text-xs text-stone-400">Front desk & appointment assistance</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm font-serif">Email Inquiries</h4>
                <a href={SALON_CONFIG.contact.emailMailto} className="text-sm text-stone-800 hover:text-rose-700 font-semibold mt-0.5 block">
                  {SALON_CONFIG.contact.email}
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm font-serif">Salon Timings</h4>
                <p className="text-sm text-stone-600 mt-0.5">{SALON_CONFIG.hours.weekday}</p>
                <p className="text-sm text-stone-600">{SALON_CONFIG.hours.sunday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                Send an Inquiry
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Receive prompt consultation answers from our specialist team.
              </p>
            </div>
            {isAuthenticated && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Account</span>
              </span>
            )}
          </div>

          {!isAuthenticated ? (
            /* Gated Sign-In Prompt */
            <div className="py-12 px-6 sm:px-10 text-center bg-gradient-to-b from-[#FAF7F2] to-[#F5EFE6] rounded-3xl border border-stone-200 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-xs border border-rose-200">
                <Lock className="w-7 h-7 text-rose-700" />
              </div>
              
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Sign In to Send an Inquiry
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                  To protect client communication and ensure priority follow-up from our dermatologists and senior stylists, please sign in to your Enrich account.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3.5">
                <Link
                  to="/login?redirect=/contact"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-500 shadow-md shadow-rose-900/20 transition-all cursor-pointer active:scale-95"
                >
                  Sign In to Continue
                </Link>
                <Link
                  to="/signup?redirect=/contact"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  Create an Account
                </Link>
              </div>
            </div>
          ) : formSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-900 font-serif">Inquiry Submitted Successfully</h3>
              <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto">
                Thank you, <strong>{submittedData?.name}</strong>. Our front desk concierge has received your request and will follow up shortly at <strong>{submittedData?.email}</strong>.
              </p>
              <button
                onClick={() => setFormSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center text-xs text-rose-700 space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Priyanshu Saini"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-xs text-stone-900 bg-stone-50/50"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="enrichparlour1212@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-xs text-stone-900 bg-stone-50/50"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="96679 00313"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-xs text-stone-900 bg-stone-50/50"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Your Message or Question *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about the services, bridal styling, or skincare package you are interested in..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-xs text-stone-900 bg-stone-50/50"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-500 text-white font-bold text-xs tracking-wide shadow-md shadow-rose-900/20 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Inquiry...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Inquiry Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
            </div>

      {/* Studio Location Live Map Section */}
      <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs">
        <div className="p-6 sm:p-8 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
              Live Map & Directions
            </span>
            <h3 className="text-xl font-serif font-bold text-stone-900">
              Find Us at Sharda Heights, Sikar
            </h3>
            <p className="text-xs text-stone-500 font-light">
              {SALON_CONFIG.contact.address}
            </p>
          </div>
          <a
            href={SALON_CONFIG.location.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 mr-1.5" />
            Navigate on Google Maps
          </a>
        </div>
        <div className="w-full h-80 sm:h-96 relative">
          <iframe
            title="Enrich Salon Location Map"
            src={SALON_CONFIG.location.mapEmbedUrl || 'https://maps.google.com/maps?q=Sharda+Heights,+near+Ramlila+Maidan,+Chandpol,+Sikar,+Rajasthan+332001&t=&z=16&ie=UTF8&iwloc=&output=embed'}
            className="w-full h-full border-0"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
