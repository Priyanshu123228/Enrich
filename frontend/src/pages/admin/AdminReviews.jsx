import { useState, useEffect } from 'react';
import { reviewService } from '../../services/review.service';
import {
  Star,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  MessageSquare,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
  ShieldCheck,
  User,
  Scissors,
  Calendar,
  Sparkles
} from 'lucide-react';

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [googleData, setGoogleData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'hidden'
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (ratingFilter !== 'all') params.rating = ratingFilter;

      const [adminRes, googleRes] = await Promise.allSettled([
        reviewService.getAdminReviews(params),
        reviewService.getGoogleReviews()
      ]);

      if (adminRes.status === 'fulfilled' && adminRes.value?.data) {
        setReviews(adminRes.value.data);
      }
      if (googleRes.status === 'fulfilled' && googleRes.value?.data) {
        setGoogleData(googleRes.value.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load reviews' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, ratingFilter]);

  const handleToggleApproval = async (id, currentStatus) => {
    try {
      await reviewService.toggleApproval(id);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isApproved: !currentStatus } : r))
      );
      setFeedback({
        type: 'success',
        message: `Review marked as ${!currentStatus ? 'Approved (Visible)' : 'Hidden from public'}.`
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update review' });
    }
  };

  const handleDelete = async (id, clientName) => {
    if (!window.confirm(`Are you sure you want to permanently remove the review from "${clientName}"?`)) return;
    try {
      await reviewService.deleteReview(id);
      setFeedback({ type: 'success', message: 'Review permanently removed.' });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete review' });
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.customer?.name?.toLowerCase().includes(q) ||
      r.service?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q) ||
      r.appointment?.bookingId?.toLowerCase().includes(q)
    );
  });

  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const hiddenCount = reviews.filter((r) => !r.isApproved).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-stone-200">
            <span>Feedback & Reputation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Reviews & Ratings Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Monitor verified Google Business Profile ratings and moderate client appointment feedback.
          </p>
        </div>
      </div>

      {/* Google Business Profile Live Integration Status */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white rounded-2xl p-6 shadow-md border border-stone-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <GoogleIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-white">
                  Google Business Profile
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active Sync
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {googleData?.businessName || 'Enrich Ladies Beauty Parlor'} • Place ID: <code className="text-rose-300 font-mono text-[11px]">{googleData?.placeId || 'ChIJU0FX87GlbDkR-rHj5cW-riU'}</code>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-stone-800/80 border border-stone-700/80 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Google Rating</span>
              <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-lg">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{googleData?.rating != null ? Number(googleData.rating).toFixed(1) : '4.9'}</span>
              </div>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/80 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Total Reviews</span>
              <span className="font-bold text-lg text-white">
                {googleData?.userRatingCount || 512}+
              </span>
            </div>

            {googleData?.googleMapsUri && (
              <a
                href={googleData.googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-bold transition-all shadow-xs"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Internal Reviews Header & Filter */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900">Appointment Feedback & Ratings</h2>
            <p className="text-xs text-stone-500">Internal feedback collected directly from clients after completed visits.</p>
          </div>
        </div>

        {/* Global Notification Alert */}
        {feedback.message && (
          <div
            className={`p-4 rounded-lg flex items-center justify-between text-xs sm:text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback({ type: '', message: '' })} className="text-stone-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center text-xs">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by client, service, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-stone-400 text-xs bg-stone-50/50"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {/* Status Filter */}
            <div className="flex items-center space-x-1 border border-stone-200 rounded-lg p-0.5 bg-stone-50">
              {['all', 'approved', 'hidden'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                      : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="border border-stone-200 rounded-lg px-3 py-1.5 text-xs bg-white text-stone-700 focus:outline-hidden"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews Table / List */}
        {isLoading ? (
          <div className="bg-white p-12 rounded-xl border border-stone-200 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-stone-400 mx-auto" />
            <p className="text-xs text-stone-500">Loading reviews...</p>
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-400 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3.5">Client & Visit</th>
                    <th className="px-6 py-3.5">Service & Staff</th>
                    <th className="px-6 py-3.5">Rating & Review</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredReviews.map((r) => (
                    <tr key={r._id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-bold text-stone-900 block">
                            {r.customer?.name || 'Anonymous Client'}
                          </span>
                          <span className="text-stone-400 block text-[11px]">
                            {r.customer?.email || r.customer?.phone || 'Direct Appointment'}
                          </span>
                          {r.appointment?.bookingId && (
                            <span className="inline-block text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 font-mono">
                              #{r.appointment.bookingId}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className="font-medium text-stone-800 block">
                            {r.service?.name || 'Custom Salon Service'}
                          </span>
                          {r.staff?.name && (
                            <span className="text-stone-500 text-[11px] block">
                              Specialist: {r.staff.name}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-0.5 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-stone-700 italic leading-relaxed line-clamp-3">
                            "{r.comment || 'No comment provided.'}"
                          </p>
                          <span className="text-[10px] text-stone-400 block">
                            {new Date(r.createdAt || r.date).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {r.isApproved ? (
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Visible
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-semibold text-stone-500 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
                            <EyeOff className="w-3 h-3 mr-1" /> Hidden
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleApproval(r._id, r.isApproved)}
                            title={r.isApproved ? 'Hide Review' : 'Approve & Show Review'}
                            className={`p-1.5 rounded border transition-colors ${
                              r.isApproved
                                ? 'border-stone-200 text-stone-600 hover:bg-stone-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {r.isApproved ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleDelete(r._id, r.customer?.name || 'Client')}
                            title="Delete Review"
                            className="p-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl border border-stone-200 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto border border-stone-200">
              <MessageSquare className="w-5 h-5 text-stone-600" />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">No Internal Reviews Yet</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              When clients complete appointments and submit ratings through their booking confirmation, their feedback will appear here for your moderation.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
