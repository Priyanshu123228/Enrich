import SEO from '../components/common/SEO';
import { useState, useEffect } from 'react';
import { serviceService } from '../services/service.service';
import ServiceCard from '../components/services/ServiceCard';
import { CATEGORY_HINGLISH_GUIDE } from '../utils/hinglishSubtitles';
import { Search, SlidersHorizontal, AlertCircle, Database, Phone, MessageCircle } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([
    { name: 'All', count: 0 },
    { name: 'Hair', count: 0 },
    { name: 'Skin', count: 0 },
    { name: 'Makeup', count: 0 },
    { name: 'Nails', count: 0 },
    { name: 'Bridal', count: 0 }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await serviceService.getCategories();
      if (res?.data) {
        const totalCount = res.data.reduce((sum, item) => sum + item.count, 0);
        setCategories([{ name: 'All', count: totalCount }, ...res.data]);
      }
    } catch (err) {
      console.error('Failed to load categories:', err.message);
    }
  };

  // Fetch Services with query parameters
  const fetchServices = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = {
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined
      };

      const res = await serviceService.getServices(params);
      if (res?.data?.services) {
        setServices(res.data.services);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch services. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchServices();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <SEO
        title="Beauty & Salon Services Menu | Enrich Sikar"
        description="Browse hair styling, HD bridal makeup, hydrafacials, skin therapy, and nail art at Enrich Beauty Parlour in Sikar. Direct WhatsApp booking."
        url="/services"
      />

      {/* Simplified, Short Header with 1-Tap Direct Help */}
      <div className="text-center max-w-xl mx-auto space-y-2 pt-2">
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Beauty & Salon Services
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 font-light">
          Har treatment ki aasan Hindi samjh ke sath. Kisi bhi service par <strong>Book on WhatsApp</strong> tap karein ya direct call milayein.
        </p>

        {/* 1-Tap Quick Action Row */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <a
            href="https://wa.me/919667900313?text=Namaste%20Enrich%20Salon!%20Mujhe%20services%20aur%20rates%20ke%20bare%20mein%20puchna%20hai."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>Rate List on WhatsApp</span>
          </a>

          <a
            href="tel:+919667900313"
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-2xs transition-all active:scale-95"
          >
            <Phone className="w-3.5 h-3.5 text-rose-300" />
            <span>Call: 96679 00313</span>
          </a>
        </div>
      </div>

      {/* Compact Search & Category Filter */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hair, facial, bridal, nails, waxing..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-rose-700 text-xs sm:text-sm shadow-2xs"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.name
                  ? 'bg-rose-700 text-white shadow-xs font-bold'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span>{cat.name}</span>
              {cat.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === cat.name
                      ? 'bg-rose-900 text-rose-100'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Hinglish Category Subtitle Banner */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 shadow-2xs">
            ✨ {CATEGORY_HINGLISH_GUIDE[selectedCategory] || 'Sabhi Salon Services & Treatments'}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Services Grid (ServiceCard includes Hinglish Subtitles & WhatsApp Action) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-stone-200 p-4 h-64 animate-pulse flex flex-col justify-between"
            >
              <div className="h-36 bg-stone-200 rounded-xl w-full" />
              <div className="h-6 bg-stone-200 rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-stone-200/90 p-8 space-y-4 max-w-md mx-auto">
          <p className="text-xs sm:text-sm text-stone-600">
            Koi specific service nahi mili. Direct WhatsApp par baat karke koi bhi parlour service book karein.
          </p>
          <a
            href="https://wa.me/919667900313?text=Namaste%20Enrich%20Salon!%20Mujhe%20services%20book%20karna%20hai."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp Directly</span>
          </a>
        </div>
      )}

    </div>
  );
}
