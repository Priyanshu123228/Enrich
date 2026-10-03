import { useState, useEffect } from 'react';
import { inquiryService } from '../../services/inquiry.service';
import {
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Search,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle2,
  X,
  Send,
  ExternalLink
} from 'lucide-react';

const STATUS_BADGES = {
  unread: {
    label: 'Unread',
    className: 'bg-rose-100 text-rose-800 border-rose-200 font-bold',
    dot: 'bg-rose-500'
  },
  read: {
    label: 'Read',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500'
  },
  replied: {
    label: 'Replied',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold',
    dot: 'bg-emerald-500'
  },
  archived: {
    label: 'Archived',
    className: 'bg-stone-100 text-stone-600 border-stone-200',
    dot: 'bg-stone-400'
  }
};

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Detail Modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (activeStatus !== 'all') params.status = activeStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await inquiryService.getInquiries(params);
      if (res?.data?.inquiries) {
        setInquiries(res.data.inquiries);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to fetch inquiries'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [activeStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInquiries();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await inquiryService.updateInquiryStatus(id, { status: newStatus });
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus } : inq))
      );
      if (selectedInquiry?._id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
      setFeedback({
        type: 'success',
        message: `Inquiry marked as ${newStatus.toUpperCase()}`
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update status'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer inquiry?')) return;
    try {
      await inquiryService.deleteInquiry(id);
      setInquiries((prev) => prev.filter((inq) => inq._id !== id));
      if (selectedInquiry?._id === id) setSelectedInquiry(null);
      setFeedback({ type: 'success', message: 'Inquiry deleted successfully' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete inquiry'
      });
    }
  };

  const openDetailModal = async (inq) => {
    setSelectedInquiry(inq);
    setAdminNoteInput(inq.adminNotes || '');
    // If it was unread, trigger read state
    if (inq.status === 'unread') {
      handleStatusChange(inq._id, 'read');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsUpdatingNote(true);
    try {
      await inquiryService.updateInquiryStatus(selectedInquiry._id, {
        adminNotes: adminNoteInput
      });
      setSelectedInquiry((prev) => ({ ...prev, adminNotes: adminNoteInput }));
      setInquiries((prev) =>
        prev.map((inq) =>
          inq._id === selectedInquiry._id ? { ...inq, adminNotes: adminNoteInput } : inq
        )
      );
      setFeedback({ type: 'success', message: 'Internal admin notes saved' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save notes'
      });
    } finally {
      setIsUpdatingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Customer Inquiries
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Review and respond to messages submitted via the website contact concierge.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          className="inline-flex items-center px-3.5 py-2 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback.message && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-xs font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['all', 'unread', 'read', 'replied', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                activeStatus === st
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {st}
              {st === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-900 focus:border-stone-900 bg-stone-50/50"
          />
        </form>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-500 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-stone-400" />
            <p className="text-xs">Loading customer inquiries...</p>
          </div>
        ) : inquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Message Snippet</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {inquiries.map((inq) => {
                  const badge = STATUS_BADGES[inq.status] || STATUS_BADGES.unread;
                  return (
                    <tr
                      key={inq._id}
                      className={`hover:bg-stone-50/80 transition-colors ${
                        inq.status === 'unread' ? 'bg-rose-50/30 font-medium' : ''
                      }`}
                    >
                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${badge.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-stone-900 text-xs sm:text-sm">{inq.name}</p>
                          <div className="flex items-center space-x-3 text-[11px] text-stone-500">
                            <a
                              href={`mailto:${inq.email}`}
                              className="hover:text-rose-700 flex items-center"
                            >
                              <Mail className="w-3 h-3 mr-1 text-stone-400" />
                              {inq.email}
                            </a>
                            {inq.phone && (
                              <a
                                href={`tel:${inq.phone}`}
                                className="hover:text-rose-700 flex items-center"
                              >
                                <Phone className="w-3 h-3 mr-1 text-stone-400" />
                                {inq.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Message Preview */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="line-clamp-2 text-stone-600 text-xs">
                          {inq.message}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-stone-400 text-[11px] font-mono">
                        {new Date(inq.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => openDetailModal(inq)}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          View
                        </button>

                        <a
                          href={`mailto:${inq.email}?subject=Re:%20Inquiry%20at%20Enrich%20Beauty%20Parlour`}
                          onClick={() => handleStatusChange(inq._id, 'replied')}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md font-semibold transition-colors cursor-pointer inline-flex items-center"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Reply
                        </a>

                        <button
                          onClick={() => handleDelete(inq._id)}
                          className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer inline-flex items-center"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-stone-500 space-y-3">
            <MessageSquare className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-serif font-bold text-stone-800 text-base">No Inquiries Found</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              There are no customer inquiries matching your selected filter. New submissions through the contact page will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs select-none animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 space-y-5 p-6 sm:p-8">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Inquiry Details
                </span>
                <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                  {selectedInquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Email:</span>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="font-semibold text-stone-900 hover:text-rose-700 flex items-center"
                >
                  {selectedInquiry.email}
                  <ExternalLink className="w-3 h-3 ml-1 text-stone-400" />
                </a>
              </div>
              {selectedInquiry.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">Phone:</span>
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="font-semibold text-stone-900 hover:text-rose-700"
                  >
                    {selectedInquiry.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Received Date:</span>
                <span className="font-mono text-stone-700">
                  {new Date(selectedInquiry.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Customer Message:
              </h4>
              <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Internal Staff Notes:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Called customer on Oct 4, scheduled bridal preview..."
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-900"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isUpdatingNote}
                  className="px-3.5 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 cursor-pointer transition-colors"
                >
                  {isUpdatingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>

            {/* Status Change & Action Bar */}
            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-medium text-stone-500 mr-1">Status:</span>
                {['unread', 'read', 'replied', 'archived'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedInquiry._id, st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                      selectedInquiry.status === st
                        ? 'bg-stone-900 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <a
                href={`mailto:${selectedInquiry.email}?subject=Re:%20Inquiry%20at%20Enrich%20Beauty%20Parlour`}
                onClick={() => handleStatusChange(selectedInquiry._id, 'replied')}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold flex items-center shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
