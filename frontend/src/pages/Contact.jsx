import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, Loader2, MessageSquare, Compass } from 'lucide-react';
import { inquiryService } from '../services/inquiry.service';
import { SALON_CONFIG } from '../config/salonConfig';

export default function Contact() {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await inquiryService.submitInquiry(formData);
      setSubmittedData({ ...formData });
      setFormSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Inquiry submission error:', err);
      const apiErrMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit inquiry. Please try again or call our front desk directly.';
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
        <div className="lg:col-span-5 space-y-8 bg-white p-8 rounded-xl border border-stone-200 shadow-xs">
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            Salon Concierge
          </h2>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 text-rose-700 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Location</h4>
                <p className="text-sm text-stone-600">
                  {SALON_CONFIG.contact.address}<br />
                  <span className="text-xs text-stone-500">({SALON_CONFIG.contact.directionsHint})</span>
                </p>
                <div className="mt-2">
                  <a
                    href={SALON_CONFIG.location.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-rose-700 hover:text-rose-800 underline"
                  >
                    <Compass className="w-3.5 h-3.5 mr-1" />
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 text-rose-700 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Direct Phone</h4>
                <a href={SALON_CONFIG.contact.phoneTel} className="text-sm text-stone-800 hover:text-rose-700 font-medium">
                  {SALON_CONFIG.contact.phone}
                </a>
                <p className="text-xs text-stone-400">Front desk & appointment assistance</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 text-rose-700 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Email Inquiries</h4>
                <a href={SALON_CONFIG.contact.emailMailto} className="text-sm text-stone-800 hover:text-rose-700 font-medium">
                  {SALON_CONFIG.contact.email}
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 text-rose-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Salon Timings</h4>
                <p className="text-sm text-stone-600">{SALON_CONFIG.hours.weekday}</p>
                <p className="text-sm text-stone-600">{SALON_CONFIG.hours.sunday}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              Send an Inquiry
            </h2>
            <MessageSquare className="w-5 h-5 text-stone-400" />
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-3 text-rose-800 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Submission Issue</p>
                <p className="mt-0.5 text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}

          {formSubmitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-emerald-950">Inquiry Received Successfully</h4>
                <p className="text-xs sm:text-sm text-emerald-800 mt-1 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{submittedData?.name}</strong>! We have saved your inquiry in our concierge system. A confirmation email has been sent to <strong>{submittedData?.email}</strong> and our team will get back to you within one business day.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setFormSubmitted(false)}
                  className="px-5 py-2.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-rose-600 focus:border-rose-600 text-sm"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Email Address <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-rose-600 focus:border-rose-600 text-sm"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="096679 00313"
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-rose-600 focus:border-rose-600 text-sm"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Your Message or Inquiry <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Inquire about treatments, appointments, bridal packages, or custom clinic services..."
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-rose-600 focus:border-rose-600 text-sm"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:bg-stone-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin text-rose-300" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-2 text-rose-300" />
                    Submit Inquiry
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
