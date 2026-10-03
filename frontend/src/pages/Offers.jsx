import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { offerService } from '../services/offer.service';
import {
  Gift,
  Tag,
  Clock,
  Check,
  Copy,
  ArrowRight,
  Loader2,
  AlertCircle,
  Percent,
  Layers,
  Sparkle
} from 'lucide-react';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'discount' | 'package' | 'seasonal'
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOffers = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = activeTab !== 'all' ? { offerType: activeTab } : {};
      const res = await offerService.getActiveOffers(params);
      if (res?.data) {
        setOffers(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load salon offers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [activeTab]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const tabs = [
    { id: 'all', label: 'All Specials', icon: Gift },
    { id: 'discount', label: 'Discount Codes', icon: Percent },
    { id: 'package', label: 'Service Bundles', icon: Layers },
    { id: 'seasonal', label: 'Seasonal Offers', icon: Sparkle }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
          Promotions & Bundles
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Current Salon Offers
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
          Explore current discounts, multi-treatment service packages, and seasonal specials for appointments at our Sikar, Rajasthan studio.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5 text-rose-600" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Offers Showcase Grid */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
          <p className="text-xs text-stone-500">Loading current offers...</p>
        </div>
      ) : errorMsg ? (
        <div className="p-10 text-center bg-rose-50 rounded-xl border border-rose-200 max-w-lg mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-700 mx-auto" />
          <h3 className="font-bold text-stone-900 text-sm">Failed to Load Offers</h3>
          <p className="text-xs text-stone-600">{errorMsg}</p>
          <button
            onClick={fetchOffers}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => {
            const isPercentage = offer.discountType === 'percentage';
            const discountLabel = isPercentage ? `${offer.discountValue}% OFF` : `$${offer.discountValue} OFF`;
            const validDateStr = new Date(offer.endDate || offer.validTill).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={offer._id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                {/* Banner Section */}
                <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
                  <img
                    src={
                      offer.bannerImage ||
                      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'
                    }
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-stone-950/60" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-700 text-white">
                      {offer.badgeText || 'Special Offer'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-900/80 text-stone-200">
                      {offer.offerType}
                    </span>
                  </div>

                  {/* Discount Highlight */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-stone-900/90 text-amber-300 font-serif font-bold text-sm border border-stone-700 flex items-center gap-1">
                    <span>{discountLabel}</span>
                  </div>
                </div>

                {/* Offer Card Body */}
                <div className="p-5 space-y-3.5">
                  <div>
                    <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {offer.description}
                    </p>
                  </div>

                  {/* Rules / Terms */}
                  <div className="p-3 bg-stone-50 rounded-lg space-y-1.5 text-xs text-stone-700">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 flex items-center">
                        <Tag className="w-3 h-3 mr-1 text-stone-400" />
                        Min. Booking:
                      </span>
                      <span className="font-semibold text-stone-900">
                        {offer.minBookingAmount > 0 ? `₹${offer.minBookingAmount}` : 'None'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-rose-600" />
                        Valid Until:
                      </span>
                      <span className="font-medium text-stone-900">{validDateStr}</span>
                    </div>

                    {offer.applicableServices && offer.applicableServices.length > 0 && !offer.isAllServices && (
                      <div className="pt-1 border-t border-stone-200/60">
                        <span className="text-[10px] uppercase font-semibold text-stone-500 block mb-1">
                          Applicable Treatments:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {offer.applicableServices.map((s) => (
                            <span
                              key={s._id}
                              className="px-2 py-0.5 rounded bg-white border border-stone-200 text-[10px] text-stone-700"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Promo Code Copy Strip */}
                  <div className="flex items-center justify-between p-2 bg-stone-100 rounded-lg border border-stone-200">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-stone-500 block">
                        Promo Code
                      </span>
                      <span className="font-mono font-bold text-xs text-stone-900 tracking-wider">
                        {offer.code}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-300 flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      {copiedCode === offer.code ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-5 pt-0">
                  <Link
                    to={`/book?promo=${offer.code}`}
                    className="w-full flex items-center justify-center py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <span>Book With This Offer</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
            <Gift className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">No Active Offers in this Category</h3>
          <p className="text-xs text-stone-500">
            Check back soon for new service packages and seasonal discounts.
          </p>
          <button
            onClick={() => setActiveTab('all')}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white font-semibold text-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Salon Loyalty Banner */}
      <div className="bg-gradient-to-br from-[#2E1822] via-[#481E2C] to-[#1C0E15] text-white p-8 sm:p-12 rounded-3xl border border-rose-900/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Custom Inquiries
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Custom Group or Bridal Packages
          </h2>
          <p className="text-xs text-stone-300 leading-relaxed">
            We curate hair, skincare, and bridal styling packages for groups and wedding parties. Contact our concierge to discuss arrangements.
          </p>
        </div>

        <Link
          to="/contact"
          className="px-6 py-2.5 rounded-lg bg-white text-stone-900 hover:bg-stone-100 font-semibold text-xs transition-colors shrink-0"
        >
          Contact Concierge
        </Link>
      </div>

    </div>
  );
}
