import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { serviceService } from '../services/service.service';
import { useAuth } from '../context/AuthContext';
import { customerService } from '../services/customer.service';
import {
  Clock,
  Star,
  Check,
  ShieldCheck,
  Calendar,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  Heart
} from 'lucide-react';

export default function ServiceDetail() {
  const { isAuthenticated } = useAuth();
  const { id } = useParams();

  const [service, setService] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const res = await serviceService.getServiceById(id);
        if (res?.data) {
          setService(res.data);
        } else {
          setErrorMsg('Service not found');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to fetch service details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-3" />
        <p className="text-xs text-stone-500">Loading service details...</p>
      </div>
    );
  }

  if (errorMsg || !service) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-rose-700" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Service Not Available</h2>
        <p className="text-xs text-stone-600">{errorMsg || 'The requested service does not exist.'}</p>
        <Link
          to="/services"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Services
        </Link>
      </div>
    );
  }

  const images = service.images && service.images.length > 0
    ? service.images
    : [{ url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80' }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-stone-900">Home</Link>
        <span>/</span>
        <Link to="/services" className="hover:text-stone-900">Services</Link>
        <span>/</span>
        <span className="text-stone-400">{service.category}</span>
        <span>/</span>
        <span className="text-stone-800 font-medium truncate max-w-[200px]">{service.name}</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Visual Gallery & Detailed Information */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main Showcase Image */}
          <div className="space-y-4">
            <div className="relative h-80 sm:h-96 w-full rounded-xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200">
              <img
                src={images[activeImageIndex]?.url}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-stone-900/80 text-stone-100 backdrop-blur-xs">
                  {service.category}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery (if multiple images) */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-stone-900 scale-95' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description & Treatment Overview */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
                Treatment Overview
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                About this Service
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {service.description}
            </p>

            {/* Features Checklist */}
            {service.features && service.features.length > 0 && (
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Included in This Appointment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.features.map((feat, i) => (
                    <div key={i} className="flex items-start text-xs text-stone-700">
                      <div className="w-4 h-4 rounded bg-stone-100 text-stone-800 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                        <Check className="w-3 h-3 text-rose-700" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hygiene & Salon Standards */}
          <div className="bg-stone-900 text-white p-6 rounded-xl border border-stone-800 flex items-start space-x-4">
            <div className="w-10 h-10 rounded-lg bg-stone-800 text-rose-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold font-serif">Sanitation Standards</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                All metal implements are sanitized in autoclaves between appointments. Single-use sanitary items are used for every client.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Booking Card & Price Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-sm space-y-6">
            
            <div className="space-y-2 pb-5 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
                  {service.category}
                </span>
                {service.ratingCount > 0 && (
                  <div className="flex items-center text-xs font-semibold text-stone-900">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                    <span>{service.ratingAverage?.toFixed(1)} ({service.ratingCount} Reviews)</span>
                  </div>
                )}
              </div>

              <h1 className="text-2xl font-serif font-bold text-stone-900">
                {service.name}
              </h1>
            </div>

            {/* Pricing Section (Gated) */}
            {isAuthenticated ? (
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[11px] text-stone-500 uppercase tracking-wider">Service Fee</p>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                      ₹{service.discountPrice > 0 ? service.discountPrice : service.price}
                    </span>
                    {service.discountPrice > 0 && (
                      <span className="text-xs text-stone-400 line-through">
                        ₹{service.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-stone-500 uppercase tracking-wider">Duration</p>
                  <p className="text-sm font-semibold text-stone-800 mt-0.5 flex items-center justify-end">
                    <Clock className="w-3.5 h-3.5 mr-1 text-rose-700" />
                    {service.duration} Minutes
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-rose-700 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Member Exclusive Rate</span>
                    <span className="text-[11px] text-stone-500">Sign in to unlock treatment price</span>
                  </div>
                </div>
                <Link
                  to={`/login?redirect=/services/${service._id || service.slug}`}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shrink-0 transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Meta summary badges */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-stone-100 text-xs text-stone-600">
              <div className="flex items-center">
                <Users className="w-3.5 h-3.5 text-stone-400 mr-1.5" />
                <span>Service: <strong className="capitalize text-stone-800">{service.gender}</strong></span>
              </div>
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 text-stone-400 mr-1.5" />
                <span>Buffer: <strong className="text-stone-800">{service.bufferTimeMinutes || 10} min</strong></span>
              </div>
            </div>

            {/* Action CTA Buttons */}
            <div className="space-y-3 pt-2">
              <Link
                to="/book"
                state={{ preSelectedServiceId: service._id }}
                className="w-full flex items-center justify-center py-3 px-6 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <Calendar className="w-4 h-4 mr-2 text-rose-300" />
                Book Appointment
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    try {
                      await customerService.toggleFavorite(service._id);
                      alert('Favorites updated');
                    } catch {
                      alert('Please sign in to save favorite treatments.');
                    }
                  }}
                  className="w-full flex items-center justify-center py-2.5 px-3 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium text-xs transition-colors cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 mr-1.5 text-stone-500" />
                  Save Favorite
                </button>

                <Link
                  to="/services"
                  className="w-full flex items-center justify-center py-2.5 px-3 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium text-xs transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Menu
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
