import SEO from '../components/common/SEO';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, MessageCircle, ChevronDown, ChevronUp, Check, Sparkles } from 'lucide-react';
import BridalPortfolioModal from '../components/gallery/BridalPortfolioModal';

export default function Bridal() {
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const whatsappBridalUrl = `https://wa.me/919667900313?text=${encodeURIComponent(
    'Hi Anu Saini, I want to book an appointment for Bridal Makeup at Enrich Sikar. Please share package details and available dates.'
  )}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <SEO
        title="Bridal Makeup | Enrich Sikar"
        description="Your special day, your perfect look. Royal Rajasthani and HD airbrush bridal makeup in Sikar by Anu Saini."
        url="/bridal"
      />

      {/* 1. Simple Heading & Short Subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Bridal Makeup
        </h1>
        <p className="text-sm sm:text-base text-stone-600 font-light">
          Your special day, your perfect look.
        </p>
      </div>

      {/* 2. Beautiful Large Bridal Photo Immediately */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full rounded-3xl overflow-hidden shadow-xl bg-stone-900 border border-stone-200">
        <img
          src="https://res.cloudinary.com/dzahy6r3o/image/upload/v1792325848/enrich/direct_uploads/rwtxitnjispxjnyy2hqs.jpg"
          alt="Royal Bridal Makeup by Anu Saini"
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent pointer-events-none" />

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
          <span className="font-semibold bg-stone-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            Lead Cosmetologist Anu Saini • Sikar
          </span>
          <button
            type="button"
            onClick={() => setIsPortfolioOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 hover:bg-white text-stone-900 font-bold transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-rose-700" />
            <span>View All Photos</span>
          </button>
        </div>
      </div>

      {/* 3. Primary Booking Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={whatsappBridalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 active:bg-rose-900 shadow-sm transition-all cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-current shrink-0" />
          <span>Book Bridal Makeup</span>
        </a>

        <button
          type="button"
          onClick={() => setIsPortfolioOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors cursor-pointer"
        >
          <Camera className="w-4 h-4 text-rose-700" />
          <span>View Bridal Portfolio</span>
        </button>


      </div>

      {/* 4. Collapsible Additional Details Section */}
      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-700" />
            <span>What's Included in Bridal Packages</span>
          </span>
          {showDetails ? (
            <ChevronUp className="w-4 h-4 text-stone-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-500" />
          )}
        </button>

        {showDetails && (
          <div className="p-4 sm:p-6 border-t border-stone-100 bg-stone-50/50 space-y-3 text-xs sm:text-sm text-stone-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
                <p className="font-bold text-stone-900">HD Airbrush Makeover</p>
                <p className="text-xs text-stone-600">18-hour waterproof base, tear-resistant, ideal for HD photography.</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
                <p className="font-bold text-stone-900">Rajasthani Draping</p>
                <p className="text-xs text-stone-600">Authentic poshak, double-veil pinning, matha patti and jewelry setting.</p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
                <p className="font-bold text-stone-900">Pre-Bridal Rituals</p>
                <p className="text-xs text-stone-600">Hydrafacial skin prep, body polishing, and hair spa for wedding glow.</p>
              </div>
            </div>

            <div className="pt-2 text-center text-xs text-stone-500">
              Personal consultation with Anu Saini included with every bridal booking.
            </div>
          </div>
        )}
      </div>

      {/* Dedicated Bridal Photo Portfolio Modal */}
      <BridalPortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
      />

    </div>
  );
}
