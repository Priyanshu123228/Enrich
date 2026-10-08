import { Link } from 'react-router-dom';
import { resolveImageUrl, handleImageError, DEFAULT_AVATAR_PLACEHOLDER } from '../../utils/imageUrl';
import { Star, Award, Scissors, ArrowRight, Calendar } from 'lucide-react';

export default function StaffCard({ staff }) {
  const rawAvatar = staff.avatar?.url || (typeof staff.avatar === 'string' ? staff.avatar : '') || '';
  const avatarUrl = resolveImageUrl(rawAvatar, DEFAULT_AVATAR_PLACEHOLDER);

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    on_leave: 'bg-amber-100 text-amber-800 border-amber-200',
    inactive: 'bg-stone-100 text-stone-600 border-stone-200'
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
      
      <div>
        {/* Top Image */}
        <div className="relative h-64 w-full overflow-hidden bg-stone-100">
          <img
            src={avatarUrl}
            alt={staff.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            onError={(e) => handleImageError(e, DEFAULT_AVATAR_PLACEHOLDER)}
          />
          <div className="absolute inset-0 bg-stone-900/40" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border backdrop-blur-xs ${
                statusColors[staff.status] || statusColors.active
              }`}
            >
              {staff.status === 'on_leave' ? 'On Leave' : staff.status}
            </span>
          </div>

          {/* Experience Badge */}
          {staff.experience > 0 && (
            <div className="absolute bottom-3 left-3 flex items-center bg-stone-900/80 backdrop-blur-xs text-stone-200 px-2.5 py-0.5 rounded-md text-[11px] font-medium">
              <Award className="w-3 h-3 mr-1 text-rose-300" />
              <span>{staff.experience} Years Exp</span>
            </div>
          )}

          {/* Rating (only if real ratings exist) */}
          {staff.ratingCount > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center bg-stone-900/80 backdrop-blur-xs text-stone-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-1" />
              <span>{staff.ratingAverage?.toFixed(1)} ({staff.ratingCount})</span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-2.5">
          <Link
            to={`/staff/${staff._id}`}
            className="block group-hover:text-rose-700 transition-colors"
          >
            <h3 className="text-base font-bold font-serif text-stone-900 leading-tight">
              {staff.name}
            </h3>
          </Link>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {staff.bio}
          </p>

          {/* Specialization Tags */}
          {staff.specialization && staff.specialization.length > 0 && (
            <div className="pt-1 flex flex-wrap gap-1">
              {staff.specialization.slice(0, 3).map((spec, i) => (
                <span
                  key={i}
                  className="inline-flex items-center text-[10px] font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between">
        <div className="text-xs text-stone-500 flex items-center">
          <Scissors className="w-3.5 h-3.5 mr-1 text-stone-400" />
          <span>
            <strong className="text-stone-800">{staff.services?.length || 0}</strong> Services
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to={`/staff/${staff._id}`}
            className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="View Full Profile"
            aria-label="View Full Profile"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={`/staff/${staff._id}`}
            className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-rose-300" />
            Book
          </Link>
        </div>
      </div>

    </div>
  );
}
