import React, { useState, useEffect } from 'react';
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
  X,
  LayoutGrid,
  Table as TableIcon,
  Inbox,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { inquiryService } from '../../services/inquiry.service';

const STATUS_CONFIG = {
  unread: {
    label: 'Unread / New',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dotClass: 'bg-amber-500 animate-pulse',
    icon: Clock3,
    color: 'text-amber-600'
  },
  read: {
    label: 'Read',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200/80',
    dotClass: 'bg-blue-500',
    icon: Eye,
    color: 'text-blue-600'
  },
  replied: {
    label: 'Replied',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dotClass: 'bg-emerald-500',
    icon: CheckCircle,
    color: 'text-emerald-600'
  },
  archived: {
    label: 'Archived',
    badgeClass: 'bg-stone-100 text-stone-600 border-stone-200/80',
    dotClass: 'bg-stone-400',
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
    cardBg: 'bg-red-50/70 hover:bg-red-50 border-red-200 text-red-700',
    btnBg: 'bg-red-600 hover:bg-red-700 text-white',
    getUrl: (email, subject, body) => 
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  },
  {
    id: 'outlook',
    name: 'Outlook.com / Live',
    description: 'Personal Microsoft account (outlook.live.com)',
    badge: 'Web',
    icon: Globe,
    cardBg: 'bg-blue-50/70 hover:bg-blue-50 border-blue-200 text-blue-700',
    btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    getUrl: (email, subject, body) => 
      `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  },
  {
    id: 'office365',
    name: 'Microsoft 365',
    description: 'Work & Enterprise Office 365 (outlook.office.com)',
    badge: 'Office 365',
    icon: Building,
    cardBg: 'bg-sky-50/70 hover:bg-sky-50 border-sky-200 text-sky-700',
    btnBg: 'bg-sky-600 hover:bg-sky-700 text-white',
    getUrl: (email, subject, body) => 
      `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  },
  {
    id: 'mailto',
    name: 'Default Mail App',
    description: 'Desktop native client (Apple Mail, Outlook Desktop)',
    badge: 'Client',
    icon: Send,
    cardBg: 'bg-stone-100/70 hover:bg-stone-100 border-stone-200 text-stone-700',
    btnBg: 'bg-stone-800 hover:bg-stone-900 text-white',
    getUrl: (email, subject, body) => 
      `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
];

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (name.slice(0, 2) || 'IN').toUpperCase();
};

const getAvatarBg = (name = '') => {
  const colors = [
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-teal-100 text-teal-700 border-teal-200'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  
  // Modals
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyingInquiry, setReplyingInquiry] = useState(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  
  // Feedback & Copy tooltips
  const [copiedId, setCopiedId] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      let res;
      if (inquiryService && typeof inquiryService.getInquiries === 'function') {
        res = await inquiryService.getInquiries(params);
      } else if (inquiryService && typeof inquiryService.getAllInquiries === 'function') {
        res = await inquiryService.getAllInquiries(params);
      }
      const list = res?.inquiries || res?.data?.inquiries || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
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
      showFeedback(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`, 'success');
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
      showFeedback('Internal note saved successfully', 'success');
    } catch (err) {
      showFeedback(err.message || 'Failed to save notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this inquiry record?')) {
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
      showFeedback('Inquiry deleted from database', 'success');
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

    showFeedback(`Opened in ${provider.name}. Marked status as Replied.`, 'success');
    setReplyingInquiry(null);
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
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-stone-900">
              Customer Inquiries
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              Live Inbox
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1.5 max-w-2xl">
            Review customer contact requests, consultation inquiries, and send instant replies via Gmail, Outlook, or Office 365.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInquiries}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 2. Feedback Alert Toast */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-sm flex items-center gap-3 shadow-sm border transition-all animate-in fade-in slide-in-from-top-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium text-xs sm:text-sm">{feedback.message}</span>
        </div>
      )}

      {/* 3. Luxury Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Inquiries</span>
            <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-serif text-stone-900">{stats.total}</div>
            <div className="text-xs text-stone-400 mt-0.5">All-time received</div>
          </div>
        </div>

        {/* Unread / Needs Attention Card */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">New / Unread</span>
            <div className="p-2 rounded-xl bg-amber-100/80 text-amber-700">
              <Clock3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 relative z-10">
            <div className="text-3xl font-bold font-serif text-amber-700 flex items-center gap-2">
              {stats.unread}
              {stats.unread > 0 && (
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full uppercase tracking-wider animate-pulse">
                  Action Required
                </span>
              )}
            </div>
            <div className="text-xs text-stone-400 mt-0.5">Awaiting admin response</div>
          </div>
        </div>

        {/* Replied Card */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Replied</span>
            <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-serif text-emerald-700">{stats.replied}</div>
            <div className="text-xs text-stone-400 mt-0.5">Response dispatched</div>
          </div>
        </div>

        {/* Archived Card */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Archived</span>
            <div className="p-2 rounded-xl bg-stone-100 text-stone-600">
              <Archive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-serif text-stone-700">{stats.archived}</div>
            <div className="text-xs text-stone-400 mt-0.5">Closed records</div>
          </div>
        </div>
      </div>

      {/* 4. Search, Status Filter & View Toggle Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by customer, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 hover:bg-stone-100/60 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-stone-900 placeholder-stone-400 transition-all"
          />
        </div>

        {/* Filter Pills & View Mode */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'unread', 'read', 'replied', 'archived'].map((statusKey) => {
              const isActive = statusFilter === statusKey;
              return (
                <button
                  key={statusKey}
                  onClick={() => setStatusFilter(statusKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600'
                  }`}
                >
                  {statusKey === 'all' ? 'All Inquiries' : STATUS_CONFIG[statusKey]?.label || statusKey}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      {/* 5. Inquiries Content (Table & Grid Views) */}
      {loading ? (
        <div className="py-24 bg-white rounded-2xl border border-stone-200/80 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
          <p className="text-sm font-semibold text-stone-700">Loading inquiries inbox...</p>
        </div>
      ) : error ? (
        <div className="py-16 bg-white rounded-2xl border border-rose-200 text-center flex flex-col items-center justify-center gap-2 shadow-xs">
          <AlertCircle className="w-8 h-8 text-rose-500" />
          <p className="text-sm font-bold text-rose-700">{error}</p>
          <button onClick={fetchInquiries} className="mt-2 px-4 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer">
            Retry Loading
          </button>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="py-20 bg-white rounded-2xl border border-stone-200/80 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
            <MessageSquare className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-stone-800">No customer inquiries found</p>
          <p className="text-xs text-stone-400 max-w-sm">
            {searchQuery ? 'No records match your search criteria.' : 'New inquiries submitted via the contact form will automatically arrive in this live inbox.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredInquiries.map((inquiry) => {
            const statusInfo = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.unread;
            const avatarColor = getAvatarBg(inquiry.name);
            const initials = getInitials(inquiry.name);

            return (
              <div
                key={inquiry._id}
                className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs hover:shadow-sm hover:border-stone-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs ${avatarColor}`}>
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-stone-900 line-clamp-1">{inquiry.name}</h3>
                        <span className="text-[11px] text-stone-400">
                          {new Date(inquiry.createdAt || Date.now()).toLocaleDateString()} at {new Date(inquiry.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`}></span>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-3.5 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-stone-600">
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{inquiry.email}</span>
                      </span>
                      <button
                        onClick={() => copyToClipboard(inquiry.email, inquiry._id)}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                        title="Copy Email"
                      >
                        {copiedId === inquiry._id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {inquiry.phone && (
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <a href={`tel:${inquiry.phone}`} className="hover:underline">{inquiry.phone}</a>
                      </div>
                    )}
                  </div>

                  {/* Service Pill & Message Quote */}
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/60 mb-2">
                      {inquiry.service || inquiry.subject || 'General Inquiry'}
                    </span>
                    <p className="text-xs text-stone-600 line-clamp-3 bg-stone-50/80 p-3 rounded-xl border border-stone-100 leading-relaxed italic">
                      "{inquiry.message}"
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedInquiry(inquiry);
                      setAdminNotes(inquiry.adminNotes || '');
                    }}
                    className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(inquiry._id)}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openReplyModal(inquiry)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50/90 text-[11px] uppercase font-bold text-stone-500 border-b border-stone-200/80 tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-4">Subject / Service</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Message Preview</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Received</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredInquiries.map((inquiry) => {
                  const statusInfo = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.unread;
                  const avatarColor = getAvatarBg(inquiry.name);
                  const initials = getInitials(inquiry.name);

                  return (
                    <tr 
                      key={inquiry._id}
                      className="hover:bg-rose-50/20 transition-colors group"
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-stone-900">
                              {inquiry.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-500 mt-0.5">
                              <span className="truncate max-w-[160px] sm:max-w-[200px]">{inquiry.email}</span>
                              <button
                                onClick={() => copyToClipboard(inquiry.email, inquiry._id)}
                                className="text-stone-400 hover:text-stone-700 transition-colors p-0.5"
                                title="Copy Email"
                              >
                                {copiedId === inquiry._id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                            {inquiry.phone && (
                              <div className="text-[11px] text-stone-400 mt-0.5">
                                📞 <a href={`tel:${inquiry.phone}`} className="hover:underline">{inquiry.phone}</a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Service / Subject */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/60">
                          {inquiry.service || inquiry.subject || 'General Inquiry'}
                        </span>
                      </td>

                      {/* Message Preview */}
                      <td className="py-4 px-4 hidden md:table-cell max-w-xs">
                        <p className="line-clamp-2 text-stone-600 leading-relaxed">
                          {inquiry.message}
                        </p>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4">
                        <select
                          value={inquiry.status || 'unread'}
                          onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/40 ${statusInfo.badgeClass}`}
                        >
                          <option value="unread">Unread / New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 hidden lg:table-cell text-stone-400">
                        <div className="font-medium text-stone-700">{new Date(inquiry.createdAt || Date.now()).toLocaleDateString()}</div>
                        <div className="text-[11px]">
                          {new Date(inquiry.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Primary Reply Button */}
                          <button
                            onClick={() => openReplyModal(inquiry)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                          >
                            <Send className="w-3 h-3" />
                            Reply
                          </button>

                          {/* View Details */}
                          <button
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setAdminNotes(inquiry.adminNotes || '');
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all cursor-pointer"
                            title="View Details & Notes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(inquiry._id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
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
        </div>
      )}
      {/* 6. Multi-Provider Reply Modal */}
      {replyingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 mb-1.5">
                  Compose Customer Reply
                </span>
                <h3 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-rose-600" />
                  Reply to {replyingInquiry.name}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Recipient Email: <span className="text-stone-800 font-semibold">{replyingInquiry.email}</span>
                </p>
              </div>
              <button
                onClick={() => setReplyingInquiry(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Email Provider Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
                1. Select Email Provider to Send
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {EMAIL_PROVIDERS.map((prov) => {
                  const ProviderIcon = prov.icon;
                  return (
                    <button
                      key={prov.id}
                      onClick={() => handleProviderSend(prov, replyingInquiry, replySubject, replyBody)}
                      className={`flex flex-col items-start p-3.5 rounded-2xl border transition-all text-left group hover:scale-[1.02] shadow-xs cursor-pointer ${prov.cardBg}`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="p-2 rounded-xl bg-white shadow-xs group-hover:rotate-6 transition-transform">
                          <ProviderIcon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/80">
                          {prov.badge}
                        </span>
                      </div>
                      <span className="text-xs font-bold">{prov.name}</span>
                      <span className="text-[11px] opacity-80 mt-0.5 leading-tight">{prov.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Subject Field */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                2. Email Subject
              </label>
              <input
                type="text"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-stone-50 focus:bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-stone-900 font-medium"
              />
            </div>

            {/* Email Body Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">
                  3. Pre-formatted Email Message
                </label>
                <button
                  onClick={() => copyToClipboard(replyBody, 'copy_body', 'Message text copied to clipboard!')}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  {copiedId === 'copy_body' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Message
                </button>
              </div>
              <textarea
                rows={7}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                className="w-full p-4 text-xs font-mono bg-stone-50 focus:bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 text-stone-900 resize-y leading-relaxed"
              />
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100 text-xs">
              <button
                onClick={() => copyToClipboard(replyingInquiry.email, 'copy_email_reply', 'Recipient email copied!')}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                {copiedId === 'copy_email_reply' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Email
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReplyingInquiry(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleProviderSend(EMAIL_PROVIDERS[0], replyingInquiry, replySubject, replyBody)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  Launch Gmail
                </button>
                <button
                  onClick={() => handleProviderSend(EMAIL_PROVIDERS[1], replyingInquiry, replySubject, replyBody)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Globe className="w-4 h-4" />
                  Launch Outlook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 mb-2">
                  {selectedInquiry.service || selectedInquiry.subject || 'Consultation Inquiry'}
                </span>
                <h3 className="text-xl font-bold font-serif text-stone-900">
                  {selectedInquiry.name}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Received on {new Date(selectedInquiry.createdAt || Date.now()).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Details Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs">
              <div>
                <span className="text-stone-400 block mb-1 font-bold uppercase tracking-wider text-[10px]">Email Address</span>
                <div className="flex items-center gap-2 text-stone-800 font-semibold">
                  <Mail className="w-3.5 h-3.5 text-rose-600" />
                  <span>{selectedInquiry.email}</span>
                  <button
                    onClick={() => copyToClipboard(selectedInquiry.email, 'modal')}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors cursor-pointer"
                    title="Copy email"
                  >
                    {copiedId === 'modal' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {selectedInquiry.phone && (
                <div>
                  <span className="text-stone-400 block mb-1 font-bold uppercase tracking-wider text-[10px]">Phone Number</span>
                  <div className="flex items-center gap-2 text-stone-800 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    <a href={`tel:${selectedInquiry.phone}`} className="hover:underline">{selectedInquiry.phone}</a>
                  </div>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                Customer Message
              </label>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs sm:text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Quick Reply CTA */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-rose-900">Ready to reply to this customer?</h4>
                <p className="text-[11px] text-rose-700 mt-0.5">Send a quick reply via Gmail, Outlook, or Office 365 with auto-formatted quote.</p>
              </div>
              <button
                onClick={() => {
                  const inq = selectedInquiry;
                  setSelectedInquiry(null);
                  openReplyModal(inq);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                Reply with Gmail / Outlook
              </button>
            </div>

            {/* Status & Admin Notes */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Inquiry Status
                </label>
                <select
                  value={selectedInquiry.status || 'unread'}
                  onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/40 cursor-pointer"
                >
                  <option value="unread">Unread / New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this customer, call log, or special requests..."
                  className="w-full p-3 text-xs bg-stone-50 focus:bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/40 text-stone-900 placeholder-stone-400 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleSaveNotes(selectedInquiry._id)}
                    disabled={savingNotes}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-stone-100 text-xs">
              <button
                onClick={() => handleDelete(selectedInquiry._id)}
                className="text-rose-600 hover:text-rose-800 flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Inquiry
              </button>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition-colors cursor-pointer"
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
