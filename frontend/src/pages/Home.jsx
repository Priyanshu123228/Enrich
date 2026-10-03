import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceService } from '../services/service.service';
import { staffService } from '../services/staff.service';
import { offerService } from '../services/offer.service';
import { reviewService } from '../services/review.service';
import { mediaService } from '../services/media.service';
import PhotoLightbox from '../components/gallery/PhotoLightbox';
import VideoModal from '../components/gallery/VideoModal';
import BeforeAfterSlider from '../components/gallery/BeforeAfterSlider'; 
import SocialMediaSection from '../components/SocialMediaSection';
import { CardSkeleton } from '../components/common/SkeletonLoader';
import {
  Calendar,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Play,
  Camera,
  Video,
  Eye,
  Clock,
  MapPin,
  Sparkles,
  Phone,
  Copy,
  Check,
  Star,
  Compass,
  Car,
  Train
} from 'lucide-react';

export default function Home() {
  // State for dynamic sections
  const [popularServices, setPopularServices] = useState([]);
  const [featuredStaff, setFeaturedStaff] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  const [approvedReviews, setApprovedReviews] = useState([]);
  const [featuredMedia, setFeaturedMedia] = useState({ photos: [], videos: [], beforeAfters: [] });
  
  // UI states
  const [activeGalleryTab, setActiveGalleryTab] = useState('photos'); // 'photos' | 'videos' | 'transformations'
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomepageData = async () => {
      setLoading(true);
      try {
        const [servicesRes, staffRes, offersRes, reviewsRes, mediaRes] = await Promise.allSettled([
          serviceService.getServices({ limit: 6 }),
          staffService.getStaff({ status: 'active', limit: 4 }),
          offerService.getActiveOffers({ limit: 3 }),
          reviewService.getPublicReviews({ limit: 3 }),
          mediaService.getFeaturedMedia()
        ]);

        if (servicesRes.status === 'fulfilled' && servicesRes.value?.data?.services) {
          setPopularServices(servicesRes.value.data.services.slice(0, 6));
        }
        if (staffRes.status === 'fulfilled' && staffRes.value?.data) {
          const staffList = Array.isArray(staffRes.value.data) ? staffRes.value.data : staffRes.value.data?.staff || [];
          setFeaturedStaff(staffList.slice(0, 4));
        }
        if (offersRes.status === 'fulfilled' && offersRes.value?.data) {
          const offersList = Array.isArray(offersRes.value.data) ? offersRes.value.data : offersRes.value.data?.offers || [];
          setActiveOffers(offersList.slice(0, 3));
        }
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data) {
          const reviewsList = Array.isArray(reviewsRes.value.data) ? reviewsRes.value.data : reviewsRes.value.data?.reviews || [];
          setApprovedReviews(reviewsList.slice(0, 3));
        }
        if (mediaRes.status === 'fulfilled' && mediaRes.value?.data) {
          setFeaturedMedia(mediaRes.value.data);
        }
      } catch (err) {
        console.error('Homepage data loading notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomepageData();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Why Choose Us Pillars
  const salonPillars = [
    {
      icon: ShieldCheck,
      title: 'Licensed Professionals',
      description: 'Every treatment is performed by certified cosmetologists and certified skin therapists.'
    },
    {
      icon: CheckCircle,
      title: 'Medical-Grade Sanitation',
      description: 'Hospital-grade autoclaving for all metal implements and single-use sanitary kits for every client.'
    },
    {
      icon: Sparkles,
      title: 'Clean Formulations',
      description: 'We partner with dermatologically tested, cruelty-free professional hair, nail, and skincare lines.'
    },
    {
      icon: Clock,
      title: 'Dedicated Consultations',
      description: 'Every appointment begins with a focused assessment of your hair, skin, and personal styling goals.'
    }
  ];

  // Default fallback services if database is booting
  const fallbackServices = [
    {
      _id: 'fb1',
      name: 'Custom Cut & Blowout',
      category: 'Hair',
      duration: 60,
      price: 95,
      description: 'Consultation, scalp massage, tailored precision cut, and professional blowout finish.'
    },
    {
      _id: 'fb2',
      name: 'Signature Deep Cleansing Facial',
      category: 'Skin',
      duration: 60,
      price: 120,
      description: 'Ultrasonic pore cleansing, targeted enzyme exfoliation, hydration mask, and facial massage.'
    },
    {
      _id: 'fb3',
      name: 'Structured Gel Manicure',
      category: 'Nails',
      duration: 50,
      price: 65,
      description: 'Cuticle care, apex-building builder gel overlay, and high-shine non-chip finish.'
    }
  ];

  const displayServices = popularServices.length > 0 ? popularServices : fallbackServices;

  return (
    <div className="space-y-24 pb-24">
      
      {/* =========================================================================
          SECTION 1: HERO
          ========================================================================= */}
      <section className="bg-stone-50 border-b border-stone-200 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-stone-200 text-stone-800 text-xs font-semibold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-rose-700" />
                <span>Shubham Apartment, SH 8A, Chandpol, Sikar, Rajasthan</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-rose-700 uppercase block">
                  Enrich Beauty Parlour & Cosmetic Clinic
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                  Hair, Makeup, Skin & Cosmetic Clinic Services in Sikar, Rajasthan
                </h1>
              </div>

              <p className="text-base text-stone-600 max-w-xl leading-relaxed">
                A dedicated beauty boutique offering personalized hair color, precision styling, clinical skincare, and luxury nail services. Book your appointment online or visit our Midtown studio.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start pt-2">
                <Link
                  to="/book"
                  className="btn-primary"
                >
                  <Calendar className="w-4 h-4 mr-2 text-rose-300" />
                  Book Appointment
                </Link>
                <Link
                  to="/services"
                  className="btn-secondary"
                >
                  View Services
                </Link>
              </div>

              {/* Operational Callout */}
              <div className="pt-6 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="bg-white p-4 rounded-xl border border-stone-200">
                  <p className="text-[11px] font-semibold uppercase text-stone-500 tracking-wider">Salon Hours</p>
                  <p className="text-sm font-medium text-stone-900 mt-0.5">Mon - Sat: 9:00 AM - 8:00 PM</p>
                  <p className="text-xs text-stone-500">Sun: 10:00 AM - 5:00 PM</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-stone-200">
                  <p className="text-[11px] font-semibold uppercase text-stone-500 tracking-wider">Direct Concierge</p>
                  <p className="text-sm font-medium text-stone-900 mt-0.5">096679 00313</p>
                  <p className="text-xs text-stone-500">enrichparlour1212@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Right Hero Overview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-900">Featured Salon Menu</h3>
                    <p className="text-xs text-stone-500">Transparent pricing with real service durations</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200/60 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-stone-900">Balayage & Gloss Finish</p>
                      <p className="text-xs text-stone-500">Duration: 120 mins</p>
                    </div>
                    <span className="text-stone-900 font-bold text-sm">$180</span>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200/60 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-stone-900">Hydrating Oxygen Facial</p>
                      <p className="text-xs text-stone-500">Duration: 60 mins</p>
                    </div>
                    <span className="text-stone-900 font-bold text-sm">$110</span>
                  </div>
                  <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200/60 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-stone-900">Full Set Gel Extensions</p>
                      <p className="text-xs text-stone-500">Duration: 75 mins</p>
                    </div>
                    <span className="text-stone-900 font-bold text-sm">$80</span>
                  </div>
                </div>

                <Link
                  to="/services"
                  className="w-full flex items-center justify-center py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  View All Services & Pricing
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: POPULAR SERVICES
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-4 border-b border-stone-200">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
              Service Menu
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Popular Salon Services
            </h2>
            <p className="text-xs text-stone-500">
              Select a service to reserve a scheduled appointment with a specialist.
            </p>
          </div>
          <Link
            to="/services"
            className="mt-3 md:mt-0 inline-flex items-center text-rose-700 font-semibold text-xs hover:text-rose-800"
          >
            View Complete Menu <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <CardSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayServices.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium px-2.5 py-0.5 bg-stone-100 text-stone-800 rounded-md uppercase tracking-wider">
                      {service.category}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {service.duration} mins
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-serif text-stone-900">{service.name}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xl font-bold text-stone-900">${service.price}</span>
                  <Link
                    to={`/book?serviceId=${service._id}`}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 3: ABOUT SALON
          ========================================================================= */}
      <section className="bg-stone-100 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
                About Enrich Beauty Parlour & Cosmetic Clinic
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                A Premier Salon & Cosmetic Clinic in Sikar, Rajasthan
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                Founded with a commitment to technical precision and uncompromised client care, Enrich Beauty Parlour & Cosmetic Clinic provides tailored hair transformations, clinical skincare, and luxury nail services in a serene, private setting.
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                Our team consists exclusively of state-certified beauticians and master cosmetologists who participate in continuous advanced training to deliver modern, healthy, and enduring results.
              </p>
              
              <div className="pt-2">
                <Link
                  to="/about"
                  className="btn-secondary text-xs"
                >
                  Read Our Philosophy & Standards
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
                  <p className="text-2xl font-serif font-bold text-stone-900">100%</p>
                  <p className="text-xs font-semibold text-stone-800">Licensed Cosmetologists</p>
                  <p className="text-[11px] text-stone-500">Every team member holds full state certification and liability coverage.</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
                  <p className="text-2xl font-serif font-bold text-stone-900">Clean</p>
                  <p className="text-xs font-semibold text-stone-800">Hospital Sanitation</p>
                  <p className="text-[11px] text-stone-500">Medical-grade dry heat autoclaving and individual sealed tool kits.</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
                  <p className="text-2xl font-serif font-bold text-stone-900">Direct</p>
                  <p className="text-xs font-semibold text-stone-800">Online Reservations</p>
                  <p className="text-[11px] text-stone-500">Real-time schedule availability with instant email confirmation.</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-2">
                  <p className="text-2xl font-serif font-bold text-stone-900">Sikar, RJ</p>
                  <p className="text-xs font-semibold text-stone-800">Prime Location</p>
                  <p className="text-[11px] text-stone-500">Steps away from Penn Station and Herald Square subway lines.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: WHY CHOOSE US
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
            Our Standards
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Professional Care & Clean Standards
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm">
            We focus on individualized client care, clean ingredients, and sanitary salon practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {salonPillars.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200">
                  <item.icon className="w-5 h-5 text-rose-700" />
                </div>
                <h3 className="text-base font-bold text-stone-900 font-serif">{item.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: FEATURED STAFF / STYLISTS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-4 border-b border-stone-200">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
              Stylist Roster
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Meet Our Specialists
            </h2>
            <p className="text-xs text-stone-500">
              Experienced practitioners dedicated to individualized consultations and exceptional service.
            </p>
          </div>
          <Link
            to="/staff"
            className="mt-3 md:mt-0 inline-flex items-center text-rose-700 font-semibold text-xs hover:text-rose-800"
          >
            View All Stylists <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(featuredStaff.length > 0 ? featuredStaff : [
            {
              _id: 'st1',
              name: 'Elena Rostova',
              specialization: ['Master Colorist', 'Balayage'],
              experience: 12,
              profileImage: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80',
              bio: 'Specializing in dimensional blondes, color corrections, and precision French haircuts.'
            },
            {
              _id: 'st2',
              name: 'Marcus Vance',
              specialization: ['Precision Cutting', 'Hair Restructuring'],
              experience: 9,
              profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
              bio: 'Expert in tailored razor cutting, texture management, and keratin smoothing treatments.'
            },
            {
              _id: 'st3',
              name: 'Aria Chen',
              specialization: ['Clinical Esthetician', 'Hydrafacial'],
              experience: 8,
              profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
              bio: 'Certified clinical esthetician focused on dermal barrier repair and custom anti-aging therapies.'
            },
            {
              _id: 'st4',
              name: 'Sophia Laurent',
              specialization: ['Bridal Artistry', 'Editorial Makeup'],
              experience: 10,
              profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
              bio: 'Master bridal stylist creating radiant, camera-ready bridal looks and modern occasion hair.'
            }
          ]).map((staff) => (
            <div
              key={staff._id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="h-56 bg-stone-100 overflow-hidden relative">
                  <img
                    src={staff.profileImage || 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80'}
                    alt={staff.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {staff.experience > 0 && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-medium tracking-wide">
                      {staff.experience} Years Exp
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-serif font-bold text-base text-stone-900">{staff.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {(staff.specialization || []).map((spec, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed pt-1">
                    {staff.bio}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <Link
                  to={`/book?staffId=${staff._id}`}
                  className="w-full btn-secondary text-xs py-2"
                >
                  Book with {staff.name.split(' ')[0]}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: ACTIVE OFFERS & PACKAGES
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-4 border-b border-stone-200">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
              Special Packages
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Current Offers & Promotions
            </h2>
            <p className="text-xs text-stone-500">
              Valid promotional discounts applied automatically at checkout or reception.
            </p>
          </div>
          <Link
            to="/offers"
            className="mt-3 md:mt-0 inline-flex items-center text-rose-700 font-semibold text-xs hover:text-rose-800"
          >
            View All Offers <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(activeOffers.length > 0 ? activeOffers : [
            {
              _id: 'off1',
              title: 'Welcome Client Package',
              discount: '15% OFF',
              code: 'WELCOME15',
              description: 'Enjoy 15% off your first hair styling, cut, or facial appointment at Enrich Beauty Parlour & Cosmetic Clinic.',
              validUntil: 'Ongoing'
            },
            {
              _id: 'off2',
              title: 'Seasonal Skin Revitalization',
              discount: '20% OFF',
              code: 'GLOW20',
              description: 'Save 20% on any signature clinical facial when booked with an add-on eye treatment.',
              validUntil: 'Limited Seasonal'
            },
            {
              _id: 'off3',
              title: 'Bridal Trial Consultation',
              discount: '$25 CREDIT',
              code: 'BRIDAL25',
              description: 'Receive a $25 credit toward wedding day bookings following your bridal preview session.',
              validUntil: 'Active'
            }
          ]).map((offer) => (
            <div
              key={offer._id}
              className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-bold text-xs">
                    {offer.discount}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {offer.validUntil || 'Active'}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900">{offer.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{offer.description}</p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold px-2 py-1 bg-stone-100 rounded-md text-stone-800">
                    {offer.code}
                  </span>
                  <button
                    onClick={() => handleCopyCode(offer.code)}
                    className="p-1 rounded text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    title="Copy Promo Code"
                  >
                    {copiedCode === offer.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <Link
                  to={`/book?offerCode=${offer.code}`}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Apply & Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: GALLERY (PHOTOS, VIDEOS, BEFORE & AFTER)
          ========================================================================= */}
      <section className="bg-stone-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-stone-800 pb-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold tracking-widest text-rose-400 uppercase">
                Studio Portfolio
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold">
                Our Work & Studio Environment
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm">
                Authentic photographs and video previews of our salon interior and styling sessions.
              </p>
            </div>

            {/* Showcase Toggle Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-stone-800 border border-stone-700">
              <button
                onClick={() => setActiveGalleryTab('photos')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  activeGalleryTab === 'photos'
                    ? 'bg-rose-700 text-white'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photos</span>
              </button>
              <button
                onClick={() => setActiveGalleryTab('videos')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  activeGalleryTab === 'videos'
                    ? 'bg-rose-700 text-white'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Tours</span>
              </button>
              <button
                onClick={() => setActiveGalleryTab('transformations')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  activeGalleryTab === 'transformations'
                    ? 'bg-rose-700 text-white'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <span>Before & After</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Featured Photos */}
          {activeGalleryTab === 'photos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(featuredMedia.photos.length > 0 ? featuredMedia.photos : [
                {
                  _id: 'sample1',
                  title: 'Styling Floor & Reception',
                  category: 'Salon Interior',
                  url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
                  description: 'Spacious styling stations and consultation desk'
                },
                {
                  _id: 'sample2',
                  title: 'Dimensional Caramel Color',
                  category: 'Hair',
                  url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80',
                  description: 'Balayage highlight application'
                },
                {
                  _id: 'sample3',
                  title: 'Bridal Hair & Makeup',
                  category: 'Bridal',
                  url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
                  description: 'Bridal updo and dewy makeup'
                },
                {
                  _id: 'sample4',
                  title: 'Gel Nail Art Service',
                  category: 'Nails',
                  url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80',
                  description: 'Hand-painted fine line gel art'
                }
              ]).map((photo, idx) => (
                <div
                  key={photo._id}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative h-72 rounded-xl overflow-hidden bg-stone-800 border border-stone-700 shadow-sm cursor-pointer flex flex-col justify-end"
                >
                  <img
                    src={photo.thumbnail || photo.url}
                    alt={photo.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-stone-950/60" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-stone-900/80 text-stone-200 text-[10px] font-semibold uppercase tracking-wider">
                      {photo.category}
                    </span>
                  </div>

                  <div className="relative p-4 space-y-1 z-10">
                    <h3 className="font-serif font-bold text-sm leading-snug line-clamp-1">{photo.title}</h3>
                    <p className="text-[11px] text-stone-300 line-clamp-1">{photo.description}</p>
                    <div className="flex items-center text-[10px] text-rose-400 font-semibold pt-0.5">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>Click to view</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Featured Videos */}
          {activeGalleryTab === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredMedia.videos.length > 0 ? featuredMedia.videos : [
                {
                  _id: 'vid1',
                  title: 'Salon Walkthrough',
                  category: 'Salon Tour',
                  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                  thumbnail: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
                  duration: 60,
                  description: 'Walkthrough of treatment suites and styling areas'
                },
                {
                  _id: 'vid2',
                  title: 'Hair Styling Demo',
                  category: 'Hair Transformation',
                  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                  thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
                  duration: 45,
                  description: 'Layered cut and blowout technique demonstrated by stylist'
                },
                {
                  _id: 'vid3',
                  title: 'Nail Application Process',
                  category: 'Nail Art',
                  url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                  thumbnail: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
                  duration: 35,
                  description: 'Builder gel overlay and finishing process'
                }
              ]).map((vid) => (
                <div
                  key={vid._id}
                  onClick={() => setActiveVideo(vid)}
                  className="group relative h-72 rounded-xl overflow-hidden bg-stone-800 border border-stone-700 shadow-sm cursor-pointer flex flex-col justify-end"
                >
                  <img
                    src={vid.thumbnail || vid.url}
                    alt={vid.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-stone-950/60" />

                  {/* Play Trigger */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-lg bg-white/90 group-hover:bg-rose-700 text-stone-900 group-hover:text-white flex items-center justify-center shadow-md transition-colors">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {vid.duration > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-mono flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-rose-400" />
                      {vid.duration}s
                    </div>
                  )}

                  <div className="relative p-4 space-y-1 z-10">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                      {vid.category}
                    </span>
                    <h3 className="font-serif font-bold text-sm leading-snug line-clamp-1">{vid.title}</h3>
                    <p className="text-[11px] text-stone-300 line-clamp-2">{vid.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Before & After */}
          {activeGalleryTab === 'transformations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80"
                afterImage="https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80"
                title="Color Correction: Warm Tone to Cool Beige"
                category="Hair Color"
              />
              <BeforeAfterSlider
                beforeImage="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=80"
                afterImage="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80"
                title="Bridal Makeup: Natural Evening Finish"
                category="Bridal Makeup"
              />
            </div>
          )}

          {/* Action Button */}
          <div className="text-center pt-2">
            <Link
              to="/gallery"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs transition-colors border border-stone-700 cursor-pointer"
            >
              View Full Gallery
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* =======================================================================
          SECTION 7.5: SOCIAL MEDIA INTEGRATION ("Follow Our Journey")
          ======================================================================= */}
      <SocialMediaSection />

      {/* =========================================================================
          SECTION 8: CUSTOMER REVIEWS
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-4 border-b border-stone-200">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
              Verified Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Client Experiences
            </h2>
            <p className="text-xs text-stone-500">
              Reviews submitted by clients following completed salon appointments.
            </p>
          </div>
        </div>

        {approvedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedReviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Client'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-900">
                    {rev.customer?.name || 'Verified Client'}
                  </span>
                  <span className="text-stone-500">
                    {rev.service?.name || 'Salon Treatment'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center mx-auto border border-stone-200">
              <Star className="w-5 h-5 text-stone-700" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">Verified Client Reviews</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Reviews are collected directly from clients who have completed an appointment. After your visit, you will receive an invitation to leave feedback.
            </p>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 9: LOCATION & VISIT INFORMATION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Location Text Information */}
            <div className="lg:col-span-6 p-8 sm:p-10 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
                  Studio Location
                </span>
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  Visiting Enrich Beauty Parlour & Cosmetic Clinic
                </h2>
                <p className="text-xs text-stone-500">
                  Conveniently situated in the Midtown Fashion District.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Address</p>
                    <p className="text-stone-600 mt-0.5">Shubham Apartment, SH 8A, Chandpol, Sikar, Rajasthan 10018</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Train className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Transit & Subway Access</p>
                    <p className="text-stone-600 mt-0.5">
                      Penn Station (1, 2, 3, A, C, E, LIRR, NJ Transit) - 2 blocks away.<br />
                      Herald Square (N, Q, R, W, B, D, F, M) - 3 blocks away.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Car className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Parking</p>
                    <p className="text-stone-600 mt-0.5">
                      Covered garage parking available at 452 7th Ave and 224 W 35th St.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-stone-900">Concierge Desk</p>
                    <p className="text-stone-600 mt-0.5">096679 00313 | enrichparlour1212@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/contact"
                  className="btn-secondary text-xs"
                >
                  <Compass className="w-3.5 h-3.5 mr-1.5" />
                  Get Detailed Directions
                </Link>
              </div>
            </div>

            {/* Map Placeholder Graphic */}
            <div className="lg:col-span-6 bg-stone-100 border-t lg:border-t-0 lg:border-l border-stone-200 p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-rose-700 shadow-xs">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">Shubham Apartment, Chandpol, Sikar</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Between 34th & 35th Streets, Suite 1800. Elevator access to 18th floor.
                </p>
              </div>
              <a
                href="https://maps.google.com/?q=450+7th+Ave+New+York+NY"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                Open in Google Maps
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: CALL TO ACTION (CTA)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-stone-900 text-white p-8 sm:p-12 text-center space-y-5 border border-stone-800">
          <span className="text-xs font-bold tracking-widest text-rose-400 uppercase block">
            Appointments & Consultations
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
            Reserve Your Salon Visit
          </h2>
          <p className="text-stone-300 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
            Select your preferred service, choose your specialist, and confirm your appointment with real-time schedule verification.
          </p>
          
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3.5">
            <Link
              to="/book"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold text-stone-900 bg-white hover:bg-stone-100 transition-colors shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4 mr-2 text-rose-700" />
              Book Appointment Online
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 mr-2 text-stone-300" />
              Contact Concierge
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODALS & LIGHTBOX
          ========================================================================= */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          mediaList={featuredMedia.photos.length > 0 ? featuredMedia.photos : []}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}

      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

    </div>
  );
}
