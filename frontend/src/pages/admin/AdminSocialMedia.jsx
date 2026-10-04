import React, { useState, useEffect } from 'react';
import {
  Share2,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Check,
  AlertCircle,
  ShieldCheck,
  Globe,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import socialService from '../../services/social.service';
import SocialIcon from '../../components/common/SocialIcon';
import Modal from '../../components/common/Modal';

const SUPPORTED_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    placeholder: 'https://www.instagram.com/enrich_beauty25/',
    defaultHandle: '@enrich_beauty25',
    defaultDesc: 'Daily hair transformations, bridal reels, and skincare tips.',
    color: '#E1306C'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    placeholder: 'https://www.facebook.com/enrichparloursikar',
    defaultHandle: '@enrichparloursikar',
    defaultDesc: 'Community updates, beauty workshops, and customer reviews.',
    color: '#1877F2'
  },
  {
    id: 'threads',
    name: 'Threads',
    placeholder: 'https://threads.net/@enrich_beauty25',
    defaultHandle: '@enrich_beauty25',
    defaultDesc: 'Behind-the-scenes conversations, announcements, and salon thoughts.',
    color: '#000000'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    placeholder: 'https://youtube.com/@enrichparloursikar',
    defaultHandle: '@enrichparloursikar',
    defaultDesc: 'Full treatment walk-throughs, makeover vlogs, and beauty tutorials.',
    color: '#FF0000'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    placeholder: 'https://wa.me/919667900313',
    defaultHandle: '+91 96679 00313',
    defaultDesc: 'Instant customer assistance, appointment inquiries, and bridal bookings.',
    color: '#25D366'
  },
  {
    id: 'google',
    name: 'Google Business Profile',
    placeholder: 'https://maps.google.com/?q=Enrich+Beauty+Parlour+and+Cosmetic+Clinic+Sikar',
    defaultHandle: 'Enrich Beauty & Cosmetic Clinic',
    defaultDesc: 'Verified salon reviews, clinic location directions, and opening hours.',
    color: '#4285F4'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    placeholder: 'https://tiktok.com/@enrichparloursikar',
    defaultHandle: '@enrichparloursikar',
    defaultDesc: 'Trending styling reels, quick beauty hacks, and client reactions.',
    color: '#000000'
  }
];

function sanitizeUrlInput(url) {
  if (!url) return '';
  let trimmed = url.trim();
  if (trimmed && !/^https?:\/\//i.test(trimmed) && !/^(javascript|data|vbscript):/i.test(trimmed)) {
    if (trimmed.startsWith('wa.me/')) {
      trimmed = 'https://' + trimmed;
    } else if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
      trimmed = 'https://' + trimmed;
    }
  }
  return trimmed;
}

export default function AdminSocialMedia() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);

  const [formData, setFormData] = useState({
    platform: 'instagram',
    displayName: 'Instagram',
    url: '',
    handle: '',
    description: '',
    isActive: true,
    order: 1
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await socialService.getAllSocialLinks();
      const data = res?.data ? (Array.isArray(res.data) ? res.data : res.data.data || []) : [];
      setLinks(data);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to load social media links'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    const configuredPlatforms = links.map((l) => l.platform?.toLowerCase());
    const available = SUPPORTED_PLATFORMS.find((p) => !configuredPlatforms.includes(p.id)) || SUPPORTED_PLATFORMS[0];

    setEditingLink(null);
    setFormData({
      platform: available.id,
      displayName: available.name,
      url: available.placeholder,
      handle: available.defaultHandle,
      description: available.defaultDesc,
      isActive: true,
      order: links.length + 1
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (link) => {
    setEditingLink(link);
    setFormData({
      platform: link.platform,
      displayName: link.displayName,
      url: link.url,
      handle: link.handle || '',
      description: link.description || '',
      isActive: link.isActive,
      order: link.order || 0
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handlePlatformChange = (selectedPlatformId) => {
    const meta = SUPPORTED_PLATFORMS.find((p) => p.id === selectedPlatformId);
    if (meta) {
      setFormData((prev) => ({
        ...prev,
        platform: meta.id,
        displayName: meta.name,
        url: prev.url ? prev.url : meta.placeholder,
        handle: prev.handle ? prev.handle : meta.defaultHandle,
        description: prev.description ? prev.description : meta.defaultDesc
      }));
    } else {
      setFormData((prev) => ({ ...prev, platform: selectedPlatformId }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.platform) {
      errors.platform = 'Platform identifier is required';
    }

    if (!formData.displayName || !formData.displayName.trim()) {
      errors.displayName = 'Display name is required';
    }

    const sanitizedUrl = sanitizeUrlInput(formData.url);
    if (!sanitizedUrl) {
      errors.url = 'Profile URL is required';
    } else if (/^(javascript|data|vbscript):/i.test(sanitizedUrl)) {
      errors.url = 'Dangerous URL protocol detected';
    } else {
      try {
        const parsed = new URL(sanitizedUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          errors.url = 'URL must start with http:// or https://';
        }
      } catch (e) {
        errors.url = 'Please enter a valid, complete web URL';
      }
    }

    if (!editingLink || editingLink.platform !== formData.platform) {
      const isDuplicate = links.some(
        (l) => l.platform?.toLowerCase() === formData.platform?.toLowerCase() && (!editingLink || l._id !== editingLink._id)
      );
      if (isDuplicate) {
        errors.platform = `Platform "${formData.platform}" is already configured. Please edit the existing entry.`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        url: sanitizeUrlInput(formData.url),
        displayName: formData.displayName.trim(),
        handle: formData.handle.trim(),
        description: formData.description.trim(),
        order: Number(formData.order) || 0
      };

      if (editingLink) {
        await socialService.updateSocialLink(editingLink._id, payload);
        setMessage({ type: 'success', text: `Platform ${payload.displayName} updated successfully!` });
      } else {
        await socialService.createSocialLink(payload);
        setMessage({ type: 'success', text: `Platform ${payload.displayName} added to social media channels!` });
      }

      setIsModalOpen(false);
      await fetchLinks();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to save social platform configuration'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (link) => {
    setActionLoading(true);
    try {
      await socialService.toggleSocialLinkStatus(link._id);
      const newStatus = !link.isActive;
      setLinks((prev) =>
        prev.map((item) => (item._id === link._id ? { ...item, isActive: newStatus } : item))
      );
      setMessage({
        type: 'success',
        text: `${link.displayName} is now ${newStatus ? 'Active & visible on website' : 'Disabled & hidden'}`
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to toggle status'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveOrder = async (index, direction) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === links.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    const reorderedItems = newLinks.map((item, idx) => ({
      id: item._id,
      order: idx + 1
    }));

    setLinks(newLinks);

    try {
      await socialService.reorderSocialLinks(reorderedItems);
      setMessage({ type: 'success', text: 'Social media display order updated!' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to save reordered positions'
      });
      fetchLinks();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!linkToDelete) return;
    setActionLoading(true);
    try {
      await socialService.deleteSocialLink(linkToDelete._id);
      setMessage({
        type: 'success',
        text: `${linkToDelete.displayName} removed successfully.`
      });
      setDeleteModalOpen(false);
      setLinkToDelete(null);
      await fetchLinks();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to delete platform'
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-rose-300 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Social Media Channels
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            Configure official profiles, control visibility on the customer website, and adjust display order.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={fetchLinks}
            className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs tracking-wide shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Social Platform</span>
          </button>
        </div>
      </div>

      {/* Alert / Notification Feedback */}
      {message.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="text-stone-400 hover:text-stone-600 text-base leading-none font-bold cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Info Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950">
            Customer Website Visibility Rule
          </p>
          <p className="text-amber-800/90 leading-relaxed">
            Only platforms with status <strong>"Active"</strong> will appear under <strong>"Follow Our Journey"</strong> on the homepage and in the footer. Use the quick toggle switch to instantly hide or show any channel without deleting it.
          </p>
        </div>
      </div>

      {/* Main Table / List Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Configured Platforms ({links.length})
            </span>
          </div>
          <span className="text-[11px] text-stone-600 font-medium">
            Active: {links.filter((l) => l.isActive).length} / {links.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-500">Loading social platforms...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Share2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-stone-800">No social platforms configured</h3>
              <p className="text-xs text-stone-500">Click "Add Social Platform" to configure Instagram, WhatsApp, Facebook, or other channels.</p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Platform</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 uppercase text-[10px] font-bold bg-stone-50/30">
                  <th className="py-3 px-4 w-16 text-center">Order</th>
                  <th className="py-3 px-4">Platform & Channel</th>
                  <th className="py-3 px-4">Target Profile URL</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {links.map((link, idx) => (
                  <tr
                    key={link._id}
                    className={`hover:bg-stone-50/80 transition-colors ${
                      !link.isActive ? 'opacity-60 bg-stone-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <span className="font-mono text-[11px] font-bold text-stone-500 w-4">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            disabled={idx === 0 || actionLoading}
                            onClick={() => handleMoveOrder(idx, 'up')}
                            className="p-0.5 text-stone-400 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            disabled={idx === links.length - 1 || actionLoading}
                            onClick={() => handleMoveOrder(idx, 'down')}
                            className="p-0.5 text-stone-400 hover:text-stone-900 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800 shrink-0 shadow-2xs">
                          <SocialIcon platform={link.platform} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                            <span>{link.displayName}</span>
                            {link.isActive ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400" title="Disabled" />
                            )}
                          </p>
                          <span className="text-[11px] font-mono text-stone-400">
                            {link.handle || link.platform}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-stone-600 hover:text-stone-900 hover:underline max-w-xs truncate"
                        title="Click to open external preview"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="w-3 h-3 text-stone-400 shrink-0" />
                      </a>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-stone-500 truncate" title={link.description}>
                        {link.description || '?'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(link)}
                        disabled={actionLoading}
                        className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          link.isActive ? 'bg-emerald-600' : 'bg-stone-300'
                        }`}
                        title={link.isActive ? 'Click to Disable' : 'Click to Enable'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            link.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(link)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="Edit Platform"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setLinkToDelete(link);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Platform"
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
        )}
      </div>

      {/* Add / Edit Platform Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingLink ? `Edit Platform: ${editingLink.displayName}` : 'Add Social Platform'}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Social Platform <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SUPPORTED_PLATFORMS.map((p) => {
                  const isSelected = formData.platform === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePlatformChange(p.id)}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <SocialIcon
                        platform={p.id}
                        className="w-4 h-4 shrink-0"
                        style={{ color: isSelected ? '#FFFFFF' : p.color }}
                      />
                      <span className="truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
              {formErrors.platform && (
                <p className="text-rose-500 text-[11px] font-medium">{formErrors.platform}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g. Instagram, WhatsApp, Facebook"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
              />
              {formErrors.displayName && (
                <p className="text-rose-500 text-[11px] font-medium">{formErrors.displayName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Profile / Channel URL <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-stone-400">Must be http:// or https://</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://www.instagram.com/enrich_beauty25/"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
                />
              </div>
              {formErrors.url && (
                <p className="text-rose-500 text-[11px] font-medium">{formErrors.url}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Account Handle / Badge Subtitle (Optional)
              </label>
              <input
                type="text"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                placeholder="e.g. @enrich_beauty25 or +91 96679 00313"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Card Description (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of what customers will find on this channel..."
                className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              <label className="flex items-center space-x-3 cursor-pointer p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900 border-stone-300 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-stone-800 block">
                    Active & Displayed
                  </span>
                  <span className="text-[10px] text-stone-500">
                    Visible on website
                  </span>
                </div>
              </label>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-stone-600 uppercase">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold tracking-wide shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{editingLink ? 'Save Changes' : 'Create Platform'}</span>
              </button>
            </div>

          </form>
        </Modal>
      )}

      {deleteModalOpen && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Platform Configuration"
        >
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 space-y-1">
              <p className="font-bold">Are you sure you want to delete this channel?</p>
              <p>
                This will immediately remove <strong>{linkToDelete?.displayName}</strong> ({linkToDelete?.url}) from the database and hide it from the customer website.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Channel</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
