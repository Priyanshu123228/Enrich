import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { staffService } from '../services/staff.service';
import {
  Clock,
  Star,
  Award,
  Calendar,
  Mail,
  Phone,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Scissors
} from 'lucide-react';

export default function StaffDetail() {
  const { id } = useParams();

  const [staff, setStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchStaffDetail = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const res = await staffService.getStaffById(id);
        if (res?.data) {
          setStaff(res.data);
        } else {
          setErrorMsg('Stylist profile not found');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load stylist profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-3" />
        <p className="text-xs text-stone-500">Loading stylist profile...</p>
      </div>
    );
  }

  if (errorMsg || !staff) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-rose-700" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900">Stylist Profile Not Found</h2>
        <p className="text-xs text-stone-600">{errorMsg || 'The requested beautician does not exist.'}</p>
        <Link
          to="/staff"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stylists
        </Link>
      </div>
    );
  }

  const avatarUrl =
    staff.avatar?.url ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-stone-900">Home</Link>
        <span>/</span>
        <Link to="/staff" className="hover:text-stone-900">Stylists</Link>
        <span>/</span>
        <span className="text-stone-800 font-medium">{staff.name}</span>
      </div>

      {/* Hero Profile Overview Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Avatar & Badges */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200">
              <img
                src={avatarUrl}
                alt={staff.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {staff.status}
                </span>
              </div>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="lg:col-span-8 space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  {staff.name}
                </h1>
                {staff.ratingCount > 0 && (
                  <div className="flex items-center px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                    <span>{staff.ratingAverage?.toFixed(1)} ({staff.ratingCount} Reviews)</span>
                  </div>
                )}
              </div>

              {staff.experience > 0 && (
                <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center">
                  <Award className="w-3.5 h-3.5 mr-1" />
                  {staff.experience} Years Industry Experience
                </p>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
              {staff.bio}
            </p>

            {/* Specializations */}
            {staff.specialization && staff.specialization.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Specialties
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {staff.specialization.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 text-stone-800 border border-stone-200 flex items-center"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Contact Info */}
            <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-5 text-xs text-stone-500">
              <span className="flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-stone-400" />
                {staff.email}
              </span>
              <span className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-stone-400" />
                {staff.phone}
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* Grid: Working Schedule + Services Offered */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Weekly Schedule */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="space-y-0.5">
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Weekly Schedule
                </h3>
                <p className="text-xs text-stone-500">Working hours for appointment bookings</p>
              </div>
              <Clock className="w-4 h-4 text-stone-500" />
            </div>

            <div className="divide-y divide-stone-100">
              {staff.schedule?.map((day) => (
                <div key={day.dayOfWeek} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800 w-28">
                    {day.dayName}
                  </span>
                  
                  {day.isWorking ? (
                    <div className="flex items-center space-x-2 text-stone-600">
                      <span className="bg-stone-50 px-2 py-0.5 rounded border border-stone-200 font-mono text-[11px]">
                        {day.startTime} - {day.endTime}
                      </span>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-500">
                      Off Day
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-100">
              <Link
                to="/book"
                state={{ preSelectedStaffId: staff._id }}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 mr-2 text-rose-300" />
                Book with {staff.name.split(' ')[0]}
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Services Catalog */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
                Assigned Services
              </span>
              <h2 className="text-xl font-serif font-bold text-stone-900">
                Services by {staff.name.split(' ')[0]}
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
              {staff.services?.length || 0} Services
            </span>
          </div>

          {staff.services && staff.services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {staff.services.map((service) => (
                <div
                  key={service._id}
                  className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {service.category}
                      </span>
                      <span className="text-base font-bold font-serif text-stone-900">
                        ${service.discountPrice > 0 ? service.discountPrice : service.price}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-stone-900 font-serif line-clamp-1">
                      {service.name}
                    </h4>

                    <p className="text-xs text-stone-500 line-clamp-2">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-400 flex items-center text-[11px]">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {service.duration} mins
                    </span>
                    <Link
                      to={`/services/${service._id}`}
                      className="text-stone-900 font-semibold hover:text-rose-700 text-xs"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-stone-200 text-center space-y-2">
              <Scissors className="w-6 h-6 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-500">No specific services assigned to this stylist yet.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
