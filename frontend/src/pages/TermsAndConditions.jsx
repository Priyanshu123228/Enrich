import { FileText, Shield, Clock, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SALON_CONFIG } from '../config/salonConfig';

export default function TermsAndConditions() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-800 border border-stone-200 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-rose-700" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light">
            Effective Date: October 2026 • Governing client bookings and services at <strong>{SALON_CONFIG.business.name}</strong>
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 shadow-xs space-y-8 text-stone-700 text-xs sm:text-sm leading-relaxed font-light">
          
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing our website, reserving appointments, purchasing cosmetics, or receiving treatments at <strong>{SALON_CONFIG.business.name}</strong>, you agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              2. Appointments & Scheduling
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
              <li><strong>Arrival Time:</strong> We request clients arrive 5–10 minutes prior to scheduled session time for consultation.</li>
              <li><strong>Late Arrivals:</strong> If you arrive late, your session time may be reduced to prevent delays for subsequent clients.</li>
              <li><strong>Cancellations & Rescheduling:</strong> Please notify us at least 2 hours prior to your slot if you need to reschedule.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              3. Pricing & Payments
            </h2>
            <p>
              All service prices and cosmetics are listed in Indian Rupees (INR ₹). We accept UPI, Cash, Credit/Debit cards, and secure online payments via Razorpay. We reserve the right to revise service pricing with advance on-site notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              4. Consultations & Patch Tests
            </h2>
            <p>
              For advanced chemical procedures (such as hair coloring, keratin, hydrafacials, or chemical peels), our specialists may perform a preliminary consultation or patch test. Please disclose any allergies, sensitivities, or medical conditions prior to treatment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              5. Intellectual Property & Reviews
            </h2>
            <p>
              All website content, logos, images, and brand assets are the exclusive property of {SALON_CONFIG.business.name}. Reviews submitted on Google Maps or our platform represent genuine client feedback.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              6. Governing Law & Jurisdiction
            </h2>
            <p>
              These terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the competent courts in <strong>Sikar, Rajasthan, India</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
              7. Contact & Assistance
            </h2>
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-1 text-xs">
              <p><strong>{SALON_CONFIG.business.name}</strong></p>
              <p>{SALON_CONFIG.contact.address}</p>
              <p>Direct Concierge: <a href={SALON_CONFIG.contact.phoneTel} className="text-rose-700 font-semibold">{SALON_CONFIG.contact.phone}</a></p>
              <p>Email: <a href={SALON_CONFIG.contact.emailMailto} className="text-rose-700 font-semibold">{SALON_CONFIG.contact.email}</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
