import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Users, HeartHandshake, Sparkles, MapPin, Phone, Clock, Star, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { staffService } from '../services/staff.service';
import { resolveImageUrl, handleImageError, DEFAULT_AVATAR_PLACEHOLDER } from '../utils/imageUrl';
import SEO from '../components/common/SEO';
import { SALON_CONFIG } from '../config/salonConfig';

export default function About() {
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await staffService.getStaff();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setTeam(res.data);
        } else {
          // Authentic Enrich Beauty specialists fallback
          setTeam([
            {
              _id: 'enrich-lead-1',
              name: 'Dr. Reena Saini',
              specialization: ['Clinical Aesthetician', 'Cosmetology'],
              experience: '12+ Years Clinical Experience',
              bio: 'Specializing in advanced hydrafacial therapy, medical dermabrasion, and personalized clinical skin rejuvenation regimens.'
            },
            {
              _id: 'enrich-lead-2',
              name: 'Pooja Sharma',
              specialization: ['Master Bridal Stylist', 'HD Airbrush Makeup'],
              experience: '9+ Years Bridal Artistry',
              bio: 'Renowned throughout Shekhawati for couture bridal transformations, royal Rajasthani jewelry styling, and precision balayage.'
            },
            {
              _id: 'enrich-lead-3',
              name: 'Kavita Verma',
              specialization: ['Hair & Keratin Expert', 'Color Correction'],
              experience: '7+ Years Salon Experience',
              bio: 'Expert in texture transformation, botanical scalp detoxification, and customized fashion shades.'
            }
          ]);
        }
      } catch (err) {
        console.warn('Could not load dynamic staff:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      <SEO
        title="About Enrich Beauty & Clinic | Premier Salon in Sikar, Rajasthan"
        description="Learn about Enrich Beauty Parlour & Cosmetic Clinic at Sharda Heights, Chandpol, Sikar. Our certified aesthetic doctors, master bridal stylists, and clean clinical standards."
        keywords="about enrich beauty, best parlour in sikar, cosmetic clinic sikar, bridal artists sikar, sharda heights beauty parlour"
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200/80 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Story & Philosophy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Premier Salon & Aesthetic Clinic in Sikar
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
          Located at First Floor, Sharda Heights, Ramlila Maidan, Chandpol, Sikar, Enrich Beauty Parlour & Cosmetic Clinic blends clinical dermatological precision with high-fashion luxury bridal artistry.
        </p>
      </div>

      {/* Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Licensed Cosmetologists</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            All aesthetic and clinical hair services are administered by certified specialists with verified credentials and advanced training.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Customized Consultations</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            Every bridal look, skin therapy, or color transformation begins with an in-depth consultation tailored to your skin tone and hair profile.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-stone-200/90 shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">Hospital-Grade Hygiene</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
            Autoclaved instruments, sterilized treatment rooms, and 100% genuine luxury products dermatologically verified for safety.
          </p>
        </div>
      </div>

      {/* Dynamic Team Section */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between pb-3 border-b border-stone-200 gap-3">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
              Clinical & Styling Team
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Meet Our Salon Specialists
            </h2>
          </div>
          <Link
            to="/staff"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 transition-colors"
          >
            <span>View All Staff</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.slice(0, 6).map((member) => {
            const rawAvatar = member.avatar || member.image || member.photo || '';
            const avatarUrl = resolveImageUrl(rawAvatar, DEFAULT_AVATAR_PLACEHOLDER);
            const specs = Array.isArray(member.specialization)
              ? member.specialization.join(' • ')
              : (member.specialization || member.role || 'Beauty Specialist');

            return (
              <div
                key={member._id || member.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={avatarUrl}
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover object-top border-2 border-rose-100 shadow-2xs"
                      onError={(e) => handleImageError(e, DEFAULT_AVATAR_PLACEHOLDER)}
                    />
                    <div>
                      <h3 className="text-base font-bold font-serif text-stone-900 leading-snug">
                        {member.name}
                      </h3>
                      <p className="text-xs text-rose-700 font-semibold line-clamp-1">{specs}</p>
                      {member.experience && (
                        <p className="text-[11px] text-stone-500 font-light">{member.experience}</p>
                      )}
                    </div>
                  </div>

                  {member.bio && (
                    <p className="text-xs text-stone-600 font-light border-t border-stone-100 pt-3 leading-relaxed line-clamp-3">
                      {member.bio}
                    </p>
                  )}
                </div>

                <Link
                  to={`/book?staff=${encodeURIComponent(member._id || member.name)}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-900 text-stone-800 hover:text-white transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book with {member.name.split(' ')[0]}</span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Salon Location & Verification Strip */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-bold tracking-widest uppercase">
            <MapPin className="w-4 h-4" />
            <span>Visit Our Studio & Clinic</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            First Floor, Sharda Heights, Sikar
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed">
            Near Ramlila Maidan / Parshuram Park, Chandpol, Sikar, Rajasthan 332001. Open 7 days a week for appointments, bridal trials, and walk-in skincare consultations.
          </p>
          <div className="flex items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-stone-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>9:00 AM – 8:00 PM</span>
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span>+91 96679 00313</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          <Link
            to="/book"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold uppercase tracking-wider transition-colors shadow-md text-center"
          >
            <span>Book Appointment</span>
          </Link>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-stone-700 hover:border-stone-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors text-center"
          >
            <span>Get Directions</span>
          </a>
        </div>
      </div>
    </div>
  );
}
