import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Trash2, 
  Eye, 
  CheckCircle, 
  Clock3, 
  AlertCircle, 
  ExternalLink,
  Send,
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  RefreshCw,
  User,
  MessageSquare,
  Building,
  Archive,
  Globe
} from 'lucide-react';
import { inquiryService } from '../../services/inquiry.service';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    icon: Clock3,
    color: 'text-amber-600'
  },
  in_progress: {
    label: 'In Progress',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    icon: RefreshCw,
    color: 'text-blue-600'
  },
  replied: {
    label: 'Replied',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    icon: Send,
    color: 'text-indigo-600'
  },
  resolved: {
    label: 'Resolved',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: CheckCircle,
    color: 'text-emerald-600'
  },
  archived: {
    label: 'Archived',
    badgeClass: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
    icon: Archive,
    color: 'text-stone-500'
  }
};
const EMAIL_PROVIDERS = [
  {
    id: 'gmail',
    name: 'Gmail Web',
    description: 'Open in Gmail compose',
    badge: 'Popular',
    icon: Mail,
    color: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30',
    getUrl: (email, subject, body) => 
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  },
  {
    id: 'outlook',
    name: 'Outlook.com / Live',
    description: 'Personal Microsoft account',
    badge: 'Web',
    icon: Globe,
    color: 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30',
    getUrl: (email, subject, body) => 
      `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  },
  {
    id: 'office365',
    name: 'Microsoft 365 (Office)',
    description: 'Work & business account',
    badge: 'Office 365',
    icon: Building,
    color: 'text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30',
    getUrl: (email, subject, body) => 
      `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  },
  {
    id: 'mailto',
    name: 'Default Mail App',
    description: 'Apple Mail, Thunderbird, etc.',
    badge: 'Client',
    icon: Send,
    color: 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800',
    getUrl: (email, subject, body) => 
      `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
];

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const data = await inquiryService.getAllInquiries(params);
      setInquiries(Array.isArray(data) ? data : (data?.inquiries || []));
    } catch (err) {
      setError(err.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await inquiryService.updateInquiryStatus(id, { status: newStatus });
      setInquiries(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(prev => ({ ...prev, status: newStatus }));
      }
      showFeedback(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      showFeedback(err.message || 'Failed to update status', 'error');
    }
  };

  const handleSaveNotes = async (id) => {
    try {
      setSavingNotes(true);
      await inquiryService.updateInquiryStatus(id, { adminNotes });
      setInquiries(prev => prev.map(item => item._id === id ? { ...item, adminNotes } : item));
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(prev => ({ ...prev, adminNotes }));
      }
      showFeedback('Notes saved successfully', 'success');
    } catch (err) {
      showFeedback(err.message || 'Failed to save notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this inquiry?')) {
      return;
    }
    try {
      await inquiryService.deleteInquiry(id);
      setInquiries(prev => prev.filter(item => item._id !== id));
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(null);
      }
      showFeedback('Inquiry deleted', 'success');
    } catch (err) {
      showFeedback(err.message || 'Failed to delete inquiry', 'error');
    }
  };

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showFeedback('Email address copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleReplyClick = (provider, inquiry) => {
    const subject = `Re: Inquiry at Enrich Beauty Parlour - ${inquiry.service || inquiry.subject || 'Consultation'}`;
    const quoteDate = new Date(inquiry.createdAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const body = `Hello ${inquiry.name},\n\nThank you for reaching out to Enrich Beauty Parlour & Cosmetic Clinic regarding "${inquiry.service || inquiry.subject || 'your inquiry'}".\n\n\n\n---\nOriginal Inquiry (${quoteDate}):\n"${inquiry.message}"\n\nWarm regards,\nEnrich Beauty Parlour Team\nPhone: +91 98765 43210\nWebsite: www.enrichbeauty.com`;

    const url = provider.getUrl(inquiry.email, subject, body);
    
    // Automatically mark as replied if currently pending
    if (inquiry.status === 'pending') {
      handleStatusChange(inquiry._id, 'replied');
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    setActiveDropdownId(null);
  };

  const filteredInquiries = inquiries.filter(item => {
    const query = searchQuery.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(query);
    const emailMatch = item.email?.toLowerCase().includes(query);
    const serviceMatch = item.service?.toLowerCase().includes(query);
    const msgMatch = item.message?.toLowerCase().includes(query);
    return nameMatch || emailMatch || serviceMatch || msgMatch;
  });

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
    resolved: inquiries.filter(i => i.status === 'resolved').length,
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-rose-500" />
            Customer Inquiries & Messages
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage inquiries, reply with Gmail or Outlook, track response statuses, and archive records.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 shadow-md transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {feedback.message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Total Inquiries</div>
          <div className="text-2xl font-bold font-serif text-stone-900 dark:text-white mt-1">{stats.total}</div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Needs Reply</div>
          <div className="text-2xl font-bold font-serif text-amber-800 dark:text-amber-300 mt-1">{stats.pending}</div>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/60 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Replied</div>
          <div className="text-2xl font-bold font-serif text-indigo-800 dark:text-indigo-300 mt-1">{stats.replied}</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Resolved</div>
          <div className="text-2xl font-bold font-serif text-emerald-800 dark:text-emerald-300 mt-1">{stats.resolved}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search inquiries by name, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-stone-900 dark:text-white placeholder-stone-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
          {['all', 'pending', 'in_progress', 'replied', 'resolved', 'archived'].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setStatusFilter(statusKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === statusKey
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              {statusKey === 'all' ? 'All Inquiries' : STATUS_CONFIG[statusKey]?.label || statusKey}
            </button>
          ))}
        </div>
      </div>
      {/* Main Table / List */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-stone-500 dark:text-stone-400 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
            <p className="text-sm font-medium">Loading inquiries...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-500 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-semibold">{error}</p>
            <button onClick={fetchInquiries} className="mt-2 px-4 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-medium">Try Again</button>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="py-20 text-center text-stone-500 dark:text-stone-400 flex flex-col items-center justify-center gap-3">
            <MessageSquare className="w-12 h-12 text-stone-300 dark:text-stone-700 stroke-1" />
            <p className="text-base font-semibold text-stone-700 dark:text-stone-300">No inquiries found</p>
            <p className="text-xs text-stone-400 max-w-sm">
              {searchQuery ? 'No records match your search query.' : 'New customer messages submitted from the contact form will appear right here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
              <thead className="bg-stone-50 dark:bg-stone-800/60 text-xs uppercase font-semibold text-stone-500 dark:text-stone-400 border-b border-stone-200/80 dark:border-stone-800">
                <tr>
                  <th className="py-3.5 px-4">Customer / Contact</th>
                  <th className="py-3.5 px-4">Service / Subject</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Message Preview</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Received</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {filteredInquiries.map((inquiry) => {
                  const statusInfo = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.pending;
                  const isDropdownOpen = activeDropdownId === inquiry._id;

                  return (
                    <tr 
                      key={inquiry._id}
                      className="hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-stone-900 dark:text-white flex items-center gap-2">
                          {inquiry.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            {inquiry.email}
                          </span>
                          <button
                            onClick={() => copyToClipboard(inquiry.email, inquiry._id)}
                            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors"
                            title="Copy Email"
                          >
                            {copiedId === inquiry._id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-stone-400" />}
                          </button>
                        </div>
                        {inquiry.phone && (
                          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-stone-400" />
                            {inquiry.phone}
                          </div>
                        )}
                      </td>

                      {/* Service / Subject */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
                          {inquiry.service || inquiry.subject || 'General Inquiry'}
                        </span>
                      </td>

                      {/* Message Preview */}
                      <td className="py-4 px-4 hidden md:table-cell max-w-xs">
                        <p className="line-clamp-2 text-xs text-stone-600 dark:text-stone-400">
                          {inquiry.message}
                        </p>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={inquiry.status}
                          onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 ${statusInfo.badgeClass}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="replied">Replied</option>
                          <option value="resolved">Resolved</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 hidden lg:table-cell text-xs text-stone-400">
                        <div>{new Date(inquiry.createdAt || Date.now()).toLocaleDateString()}</div>
                        <div className="text-[11px] text-stone-400">
                          {new Date(inquiry.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reply Provider Dropdown */}
                          <div className="relative" ref={isDropdownOpen ? dropdownRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownId(isDropdownOpen ? null : inquiry._id);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold transition-all border border-rose-200/80 dark:border-rose-800 shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Reply
                              <ChevronDown className="w-3 h-3 ml-0.5" />
                            </button>

                            {isDropdownOpen && (
                              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-700 p-2 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-700/60 mb-1">
                                  Choose Email Client
                                </div>
                                {EMAIL_PROVIDERS.map((prov) => {
                                  const ProviderIcon = prov.icon;
                                  return (
                                    <button
                                      key={prov.id}
                                      onClick={() => handleReplyClick(prov, inquiry)}
                                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-colors ${prov.color}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <ProviderIcon className="w-4 h-4 shrink-0" />
                                        <span>{prov.name}</span>
                                      </div>
                                      <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-300 rounded font-normal">
                                        {prov.badge}
                                      </span>
                                    </button>
                                  );
                                })}

                                <div className="mt-1 pt-1 border-t border-stone-100 dark:border-stone-700/60">
                                  <button
                                    onClick={() => {
                                      copyToClipboard(inquiry.email, inquiry._id);
                                      setActiveDropdownId(null);
                                    }}
                                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-stone-400" />
                                    <span>Copy Email Address</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* View Details */}
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setAdminNotes(inquiry.adminNotes || '');
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
                            title="View Details & Notes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(inquiry._id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900 mb-2">
                  {selectedInquiry.service || selectedInquiry.subject || 'Consultation Inquiry'}
                </span>
                <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-white">
                  {selectedInquiry.name}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Received on {new Date(selectedInquiry.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contact Details Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 text-xs">
              <div>
                <span className="text-stone-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Email Address</span>
                <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium">
                  <Mail className="w-3.5 h-3.5 text-rose-500" />
                  <span>{selectedInquiry.email}</span>
                  <button
                    onClick={() => copyToClipboard(selectedInquiry.email, 'modal')}
                    className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded transition-colors"
                    title="Copy email"
                  >
                    {copiedId === 'modal' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-stone-400" />}
                  </button>
                </div>
              </div>

              {selectedInquiry.phone && (
                <div>
                  <span className="text-stone-400 block mb-1 font-semibold uppercase tracking-wider text-[10px]">Phone Number</span>
                  <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 font-medium">
                    <Phone className="w-3.5 h-3.5 text-rose-500" />
                    <a href={`tel:${selectedInquiry.phone}`} className="hover:underline">{selectedInquiry.phone}</a>
                  </div>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                Customer Message
              </label>
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Quick Reply Provider Action Panel */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Reply Options (Choose Provider)</span>
                <span className="text-[11px] font-normal text-rose-500">Auto-fills subject & message quote</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {EMAIL_PROVIDERS.map((prov) => {
                  const ProviderIcon = prov.icon;
                  return (
                    <button
                      key={prov.id}
                      onClick={() => handleReplyClick(prov, selectedInquiry)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-rose-300 dark:hover:border-rose-700 bg-white dark:bg-stone-800/90 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all text-center group"
                    >
                      <div className={`p-2 rounded-xl bg-stone-100 dark:bg-stone-700 group-hover:scale-110 transition-transform mb-1.5 ${prov.color}`}>
                        <ProviderIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">{prov.name}</span>
                      <span className="text-[10px] text-stone-400 mt-0.5">{prov.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status & Admin Notes */}
            <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Inquiry Status
                </label>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value)}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="replied">Replied</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this inquiry, callback logs, or discussion notes..."
                  className="w-full p-3 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-stone-900 dark:text-white placeholder-stone-400 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleSaveNotes(selectedInquiry._id)}
                    disabled={savingNotes}
                    className="px-4 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-medium transition-colors shadow-sm"
                  >
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-stone-100 dark:border-stone-800 text-xs">
              <button
                onClick={() => handleDelete(selectedInquiry._id)}
                className="text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1.5 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Inquiry
              </button>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
