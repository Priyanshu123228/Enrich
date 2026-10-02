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
  Filter,
  ShieldCheck,
  User,
  Scissors,
  Calendar
} from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
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

      const res = await reviewService.getAdminReviews(params);
      if (res?.data) setReviews(res.data);
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
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-stone-200">
            <span>Feedback Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Client Reviews & Ratings
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Audit testimonials from completed appointments, approve client ratings, and manage visibility.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Feedback</span>
          <p className="text-2xl font-serif font-bold text-stone-900">{totalReviews}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center">
            <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" /> Average Rating
          </span>
          <p className="text-2xl font-serif font-bold text-stone-900">{avgRating} / 5.0</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Visible & Approved</span>
          <p className="text-2xl font-serif font-bold text-stone-900">{approvedCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Hidden / Moderated</span>
          <p className="text-2xl font-serif font-bold text-stone-900">{hiddenCount}</p>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, service, or keyword..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved (Visible)</option>
            <option value="hidden">Hidden / Moderated</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white cursor-pointer"
          >
            <option value="all">All Star Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars Only</option>
            <option value="2">2 Stars Only</option>
            <option value="1">1 Star Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
            <p className="text-xs text-stone-500">Loading reviews...</p>
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-3.5 px-6">Client & Verification</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Comment & Feedback</th>
                  <th className="py-3.5 px-4">Treatment & Stylist</th>
                  <th className="py-3.5 px-4">Visibility</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredReviews.map((r) => (
                  <tr key={r._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-stone-900">{r.customer?.name || 'Client'}</p>
                        <p className="text-[11px] text-stone-400">{r.customer?.email}</p>
                        {r.appointment?.bookingId && (
                          <span className="inline-flex items-center text-[10px] font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                            Verified Visit #{r.appointment.bookingId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center text-amber-700 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" />
                        <span>{r.rating}.0</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-stone-800 leading-relaxed font-serif text-[13px]">
                        "{r.comment}"
                      </p>
                      <span className="text-[10px] text-stone-400 block mt-1">
                        Submitted on {new Date(r.date || r.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[10px] font-semibold block w-fit border border-stone-200">
                          {r.service?.name}
                        </span>
                        {r.staff?.name && (
                          <span className="text-[11px] text-stone-500 block">
                            Stylist: {r.staff.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleApproval(r._id, r.isApproved)}
                        className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer border ${
                          r.isApproved
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border-stone-200'
                        }`}
                      >
                        {r.isApproved ? (
                          <>
                            <Eye className="w-3 h-3 mr-1 text-emerald-600" /> Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1 text-stone-400" /> Hidden
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(r._id, r.customer?.name || 'Client')}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-stone-400 italic">No reviews found matching filters.</div>
        )}
      </div>

    </div>
  );
}
