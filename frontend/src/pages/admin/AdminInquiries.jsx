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
  Globe,
  Edit3,
  X
} from 'lucide-react';
import { inquiryService } from '../../services/inquiry.service';

const STATUS_CONFIG = {
  unread: {
    label: 'Unread / New',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    icon: Clock3,
    color: 'text-amber-600'
  },
  read: {
    label: 'Read',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    icon: Eye,
    color: 'text-blue-600'
  },
  replied: {
    label: 'Replied',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: Send,
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
    description: 'Open in Gmail compose (mail.google.com)',
    badge: 'Popular',
    icon: Mail,
    bgColor: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900',
    btnColor: 'bg-red-500 hover:bg-red-600 text-white',
    getUrl: (email, subject, body) => 
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  },
  {
    id: 'outlook',
    name: 'Outlook.com / Live',
    description: 'Personal Microsoft account (outlook.live.com)',
    badge: 'Web',
    icon: Globe,
    bgColor: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    getUrl: (email, subject, body) => 
      `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  },
  {
    id: 'office365',
    name: 'Microsoft 365',
    description: 'Work & Enterprise Office 365 (outlook.office.com)',
    badge: 'Office 365',
    icon: Building,
    bgColor: 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900',
    btnColor: 'bg-sky-600 hover:bg-sky-700 text-white',
    getUrl: (email, subject, body) => 
      `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  },
  {
    id: 'mailto',
    name: 'Default Mail App',
    description: 'Native mail app (Apple Mail, Thunderbird)',
    badge: 'Client',
    icon: Send,
    bgColor: 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700',
    btnColor: 'bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white',
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
  
  // Modals
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyingInquiry, setReplyingInquiry] = useState(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  
  // Interactive elements
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
      const res = await inquiryService.getInquiries(params);
      const list = res?.inquiries || res?.data?.inquiries || (Array.isArray(res) ? res : []);
      setInquiries(list);
    } catch (err) {
      console.error('Fetch inquiries error:', err);
      setError(err.message || 'Failed to load customer inquiries');
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
      showFeedback('Internal notes saved successfully', 'success');
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
      if (replyingInquiry && replyingInquiry._id === id) {
        setReplyingInquiry(null);
      }
      showFeedback('Inquiry deleted successfully', 'success');
    } catch (err) {
      showFeedback(err.message || 'Failed to delete inquiry', 'error');
    }
  };

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const copyToClipboard = (text, id, msg = 'Email address copied!') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showFeedback(msg, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const openReplyModal = (inquiry) => {
    const subject = `Re: Inquiry at Enrich Beauty Parlour - ${inquiry.service || inquiry.subject || 'Consultation'}`;
    const quoteDate = new Date(inquiry.createdAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const body = `Hello ${inquiry.name},\n\nThank you for reaching out to Enrich Beauty Parlour & Cosmetic Clinic regarding "${inquiry.service || inquiry.subject || 'your inquiry'}".\n\n\n\n---\nOriginal Inquiry (${quoteDate}):\n"${inquiry.message}"\n\nWarm regards,\nEnrich Beauty Parlour Team\nPhone: +91 98765 43210\nWebsite: www.enrichbeauty.com`;

    setReplyingInquiry(inquiry);
    setReplySubject(subject);
    setReplyBody(body);
    setActiveDropdownId(null);
  };

  const handleProviderSend = (provider, inquiry, customSubject, customBody) => {
    const s = customSubject || replySubject || `Re: Inquiry at Enrich Beauty Parlour - ${inquiry.service || inquiry.subject || 'Consultation'}`;
    const b = customBody || replyBody || `Hello ${inquiry.name},\n\nThank you for contacting Enrich Beauty Parlour.\n\n---\n"${inquiry.message}"`;

    const url = provider.getUrl(inquiry.email, s, b);

    // Auto mark as replied in background if currently unread or read
    if (inquiry.status !== 'replied' && inquiry.status !== 'archived') {
      handleStatusChange(inquiry._id, 'replied');
    }

    if (provider.id === 'mailto') {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    showFeedback(`Opened in ${provider.name}. Marked inquiry as Replied.`, 'success');
    setReplyingInquiry(null);
    setActiveDropdownId(null);
  };

  const filteredInquiries = inquiries.filter(item => {
    const query = searchQuery.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(query);
    const emailMatch = item.email?.toLowerCase().includes(query);
    const phoneMatch = item.phone?.toLowerCase().includes(query);
    const serviceMatch = (item.service || item.subject)?.toLowerCase().includes(query);
    const msgMatch = item.message?.toLowerCase().includes(query);
    return nameMatch || emailMatch || phoneMatch || serviceMatch || msgMatch;
  });

  const stats = {
    total: inquiries.length,
    unread: inquiries.filter(i => i.status === 'unread').length,
    replied: inquiries.filter(i => i.status === 'replied').length,
    archived: inquiries.filter(i => i.status === 'archived').length,
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
            Review customer contact requests, reply instantly using Gmail or Outlook, and maintain customer logs.
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
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">New / Unread</div>
          <div className="text-2xl font-bold font-serif text-amber-800 dark:text-amber-300 mt-1">{stats.unread}</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Replied</div>
          <div className="text-2xl font-bold font-serif text-emerald-800 dark:text-emerald-300 mt-1">{stats.replied}</div>
        </div>
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Archived</div>
          <div className="text-2xl font-bold font-serif text-stone-700 dark:text-stone-300 mt-1">{stats.archived}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-stone-900 dark:text-white placeholder-stone-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-stone-400 shrink-0 ml-1" />
          {['all', 'unread', 'read', 'replied', 'archived'].map((statusKey) => (
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
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Subject / Service</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Message</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Received</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {filteredInquiries.map((inquiry) => {
                  const statusInfo = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.unread;
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
                            <a href={`tel:${inquiry.phone}`} className="hover:underline">{inquiry.phone}</a>
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
                          value={inquiry.status || 'unread'}
                          onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500 ${statusInfo.badgeClass}`}
                        >
                          <option value="unread">Unread / New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
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
                          {/* Primary Reply Button (Opens Composer Modal with Gmail / Outlook buttons) */}
                          <button
                            onClick={() => openReplyModal(inquiry)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Reply
                          </button>

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
      {/* 1. Dedicated Multi-Provider Reply Modal */}
      {replyingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900 mb-1.5">
                  Reply to Customer
                </span>
                <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-rose-500" />
                  {replyingInquiry.name}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Sending email to: <span className="text-stone-800 dark:text-stone-200 font-medium">{replyingInquiry.email}</span>
                </p>
              </div>
              <button
                onClick={() => setReplyingInquiry(null)}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Providers Row (Gmail, Outlook, Office 365, Default Client) */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2.5">
                Choose Email Client to Send
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {EMAIL_PROVIDERS.map((prov) => {
                  const ProviderIcon = prov.icon;
                  return (
                    <button
                      key={prov.id}
                      onClick={() => handleProviderSend(prov, replyingInquiry, replySubject, replyBody)}
                      className={`flex flex-col items-start p-3 rounded-2xl border transition-all text-left group hover:scale-[1.02] shadow-sm ${prov.bgColor}`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="p-1.5 rounded-xl bg-white dark:bg-stone-800 shadow-xs group-hover:rotate-6 transition-transform">
                          <ProviderIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                          {prov.badge}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-stone-900 dark:text-white">{prov.name}</span>
                      <span className="text-[11px] opacity-75 mt-0.5 leading-tight">{prov.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5">
                Email Subject
              </label>
              <input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-stone-900 dark:text-white"
              />
            </div>

            {/* Body Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Email Body (Pre-formatted)
                </label>
                <button
                  onClick={() => copyToClipboard(replyBody, 'copy_body', 'Full reply text copied to clipboard!')}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium"
                >
                  {copiedId === 'copy_body' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Message
                </button>
              </div>
              <textarea
                rows={7}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className="w-full p-3.5 text-xs font-mono bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-stone-900 dark:text-white resize-y leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100 dark:border-stone-800 text-xs">
              <button
                onClick={() => copyToClipboard(replyingInquiry.email, 'copy_email_reply', 'Email address copied!')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl font-medium transition-colors"
              >
                {copiedId === 'copy_email_reply' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Recipient Email
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReplyingInquiry(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleProviderSend(EMAIL_PROVIDERS[0], replyingInquiry, replySubject, replyBody)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  Launch Gmail Web
                </button>
                <button
                  onClick={() => handleProviderSend(EMAIL_PROVIDERS[1], replyingInquiry, replySubject, replyBody)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
                >
                  <Globe className="w-4 h-4" />
                  Launch Outlook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
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
                <X className="w-5 h-5" />
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

            {/* Quick Reply Button to open Reply Composer */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">Ready to reply to this customer?</h4>
                <p className="text-[11px] text-rose-700 dark:text-rose-400">Choose between Gmail, Outlook, or Office 365 with auto-filled message template.</p>
              </div>
              <button
                onClick={() => {
                  const inq = selectedInquiry;
                  setSelectedInquiry(null);
                  openReplyModal(inq);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                Reply with Gmail / Outlook
              </button>
            </div>

            {/* Status & Admin Notes */}
            <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Inquiry Status
                </label>
                <select
                  value={selectedInquiry.status || 'unread'}
                  onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value)}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="unread">Unread / New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
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
