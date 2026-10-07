import { Shield, Lock, Eye, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SALON_CONFIG } from '../config/salonConfig';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-rose-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light">
            Last Updated: October 2026 • Effective for all clients of <strong>{SALON_CONFIG.business.name}</strong>
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-xs space-y-8 text-stone-700 text-xs sm:text-sm leading-relaxed font-light">
          
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              1. Introduction & Overview
            </h2>
            <p>
              Welcome to <strong>{SALON_CONFIG.business.name}</strong> ("we," "our," or "us"). We respect your privacy and are committed to protecting the personal data you share with us when visiting our salon and cosmetic clinic in Sikar, Rajasthan, or using our online booking platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              2. Information We Collect
            </h2>
            <p>We collect information necessary to provide professional beauty treatments, appointment reservations, and client care:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li><strong>Personal Identifiers:</strong> Name, phone number, email address for booking confirmations and OTP authentication.</li>
              <li><strong>Appointment Details:</strong> Selected services, preferred stylists, scheduled dates, and service notes.</li>
              <li><strong>Payment Information:</strong> Online transactions are processed securely through PCI-DSS compliant payment gateways (Razorpay). We do not store raw credit/debit card numbers or UPI PINs on our servers.</li>
              <li><strong>Technical Data:</strong> IP address, device type, browser settings, and cookie identifiers to enhance website performance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              3. How We Use Your Information
            </h2>
            <p>Your data is used exclusively to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li>Confirm, reschedule, or manage your salon and clinic appointments.</li>
              <li>Send transaction receipts, appointment reminders, and account security OTP codes.</li>
              <li>Customize your aesthetic treatment consultations and client history records.</li>
              <li>Maintain website security, fraud prevention, and regulatory compliance.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              4. Google Places API & Third-Party Services
            </h2>
            <p>
              Our website integrates with <strong>Google Places API</strong> to display verified Google Business Profile ratings, review counts, and customer reviews. We comply with Google's API Terms of Service. Third-party integrations do not have access to your private booking records or personal contact information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              5. Cookies & Tracking Technologies
            </h2>
            <p>
              We use essential cookies for user authentication, session security, and preference management. You can control or decline non-essential cookies using our on-site cookie consent banner or your browser settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              6. Data Security & Storage
            </h2>
            <p>
              We implement industry-standard SSL/TLS 256-bit encryption for all data in transit (HTTPS enforcement), hashed passwords (bcrypt), and encrypted databases. Your information is never sold, rented, or traded to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              7. Contact Us
            </h2>
            <p>
              If you have any questions or wish to exercise your data privacy rights, please contact our concierge:
            </p>
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-1 text-xs">
              <p><strong>{SALON_CONFIG.business.name}</strong></p>
              <p>{SALON_CONFIG.contact.address}</p>
              <p>Phone: <a href={SALON_CONFIG.contact.phoneTel} className="text-rose-700 font-semibold">{SALON_CONFIG.contact.phone}</a></p>
              <p>Email: <a href={SALON_CONFIG.contact.emailMailto} className="text-rose-700 font-semibold">{SALON_CONFIG.contact.email}</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
