import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

export default function Contact() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 4000);
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
                  Shubham Apartment, SH 8A, Chandpol, Sikar, Rajasthan 332001<br /><span className="text-xs text-stone-500">(near Parshuram Park and Ramleela Maidan on Shetala Ka Bass Road)</span>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 text-rose-700 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Direct Phone</h4>
                <p className="text-sm text-stone-600">096679 00313</p>
                <p className="text-xs text-stone-400">Front desk assistance</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 text-rose-700 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Email Inquiries</h4>
                <p className="text-sm text-stone-600">enrichparlour1212@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-lg bg-stone-100 text-rose-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 text-sm">Salon Timings</h4>
                <p className="text-sm text-stone-600">Mon - Sat: 10:00 AM - 8:00 PM</p>
                <p className="text-sm text-stone-600">Sun: 10:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-xl border border-stone-200 shadow-xs">
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">
            Send an Inquiry
          </h2>

          {formSubmitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center space-y-2">
              <h4 className="font-bold text-base">Inquiry Received</h4>
              <p className="text-sm">Thank you for getting in touch. Our salon concierge will reply within one business day.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-rose-600 focus:border-rose-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-rose-600 focus:border-rose-600 text-sm"
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
                    placeholder="(212) 555-0123"
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-rose-600 focus:border-rose-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                  Your Message or Inquiry
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Inquire about treatments, appointments, or special bridal services..."
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-rose-600 focus:border-rose-600 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 mr-2 text-rose-300" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
