import { useState, useEffect } from 'react';
import { mediaService } from '../../services/media.service';
import {
  Camera,
  Video,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  X,
  UploadCloud,
  Layers,
  Clock
} from 'lucide-react';
import ImageUpload from '../../components/common/ImageUpload';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';

export default function AdminGallery() {
  const [mediaList, setMediaList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'photo',
    category: 'Salon Interior',
    url: '',
    thumbnail: '',
    duration: '',
    displayOrder: 0,
    isFeatured: false,
    isActive: true,
    beforeUrl: '',
    afterUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const photoCategories = [
    'Salon Interior',
    'Salon Exterior',
    'Hair',
    'Makeup',
    'Nails',
    'Skin Care',
    'Bridal',
    'Before & After',
    'Events',
    'Offers'
  ];

  const videoCategories = [
    'Salon Tour',
    'Hair Transformation',
    'Nail Art',
    'Customer Experience',
    'Behind the Scenes'
  ];

  const fetchAdminMedia = async () => {
    setIsLoading(true);
    try {
      const [mediaRes, catRes] = await Promise.all([
        mediaService.adminGetAllMedia({
          type: typeFilter,
          category: categoryFilter,
          status: statusFilter,
          search: searchQuery
        }),
        mediaService.getCategories()
      ]);

      if (mediaRes?.data?.media) {
        setMediaList(mediaRes.data.media);
      }
      if (catRes?.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch media assets' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminMedia();
  }, [typeFilter, categoryFilter, statusFilter, searchQuery]);

  const handleOpenModal = (media = null) => {
    if (media) {
      setEditingMedia(media);
      setFormData({
        title: media.title,
        description: media.description || '',
        type: media.type,
        category: media.category,
        url: media.url || '',
        thumbnail: media.thumbnail || '',
        duration: media.duration || '',
        displayOrder: media.displayOrder || 0,
        isFeatured: media.isFeatured || false,
        isActive: media.isActive !== false,
        beforeUrl: media.beforeAfter?.beforeUrl || '',
        afterUrl: media.beforeAfter?.afterUrl || ''
      });
    } else {
      setEditingMedia(null);
      setFormData({
        title: '',
        description: '',
        type: 'photo',
        category: 'Salon Interior',
        url: '',
        thumbnail: '',
        duration: '',
        displayOrder: 0,
        isFeatured: false,
        isActive: true,
        beforeUrl: '',
        afterUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const effectiveUrl = formData.url || formData.beforeUrl || formData.afterUrl;
      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        url: effectiveUrl,
        thumbnail: formData.thumbnail || effectiveUrl,
        duration: formData.duration ? Number(formData.duration) : 0,
        displayOrder: Number(formData.displayOrder) || 0,
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        beforeUrl: formData.beforeUrl,
        afterUrl: formData.afterUrl
      };

      if (editingMedia) {
        await mediaService.updateMedia(editingMedia._id, payload);
        setFeedback({ type: 'success', message: 'Media asset updated successfully.' });
      } else {
        await mediaService.createMedia(payload);
        setFeedback({ type: 'success', message: 'New media asset uploaded successfully.' });
      }

      setIsModalOpen(false);
      await fetchAdminMedia();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save media asset' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await mediaService.toggleMediaStatus(id);
      setMediaList((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isActive: !item.isActive } : item))
      );
      setFeedback({ type: 'success', message: 'Status updated.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to toggle status' });
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      await mediaService.deleteMedia(id);
      setMediaList((prev) => prev.filter((item) => item._id !== id));
      setFeedback({ type: 'success', message: `Deleted "${title}".` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete media' });
    }
  };

  const handleSeed = async () => {
    if (!window.confirm('Seed curated HD gallery images and videos?')) return;
    setIsLoading(true);
    try {
      await mediaService.seedDefaultMedia();
      setFeedback({ type: 'success', message: 'Curated salon showcase media loaded successfully.' });
      await fetchAdminMedia();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to seed sample media' });
    } finally {
      setIsLoading(false);
    }
  };

  // Stats KPI counts
  const totalPhotos = mediaList.filter((m) => m.type === 'photo').length;
  const totalVideos = mediaList.filter((m) => m.type === 'video').length;
  const totalFeatured = mediaList.filter((m) => m.isFeatured).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-stone-200">
            <span>Asset Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Media Gallery Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Upload salon photos, video tours, hair transformations, and real portfolio showcases.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSeed}
            className="px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
          >
            Seed Sample Media
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Upload Media
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Assets</span>
          <p className="text-2xl font-serif font-bold text-stone-900">{mediaList.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center">
            <Camera className="w-3.5 h-3.5 mr-1 text-stone-500" /> Photos
          </span>
          <p className="text-2xl font-serif font-bold text-stone-900">{totalPhotos}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center">
            <Video className="w-3.5 h-3.5 mr-1 text-stone-500" /> Videos
          </span>
          <p className="text-2xl font-serif font-bold text-stone-900">{totalVideos}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center">
            <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" /> Featured Work
          </span>
          <p className="text-2xl font-serif font-bold text-stone-900">{totalFeatured}</p>
        </div>
      </div>

      {/* Global Feedback Alert */}
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
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="photo">Photos Only</option>
            <option value="video">Videos Only</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white cursor-pointer max-w-[160px]"
          >
            <option value="all">All Categories</option>
            {[...photoCategories, ...videoCategories].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Media Grid Showcase */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
          <p className="text-xs text-stone-500">Loading media inventory...</p>
        </div>
      ) : mediaList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mediaList.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-stone-300 transition-colors flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                <img
                  src={resolveImageUrl(item.thumbnail || item.url, DEFAULT_SALON_PLACEHOLDER)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white">
                    {item.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/90 text-stone-900 shadow-xs">
                    {item.category}
                  </span>
                </div>

                {item.isFeatured && (
                  <div className="absolute top-2.5 right-2.5 p-1 rounded bg-stone-900 text-white shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold font-serif text-sm text-stone-900 line-clamp-1">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-mono text-stone-400 shrink-0">
                    Order: {item.displayOrder}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>
                )}
              </div>

              {/* Card Actions Footer */}
              <div className="p-4 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                {/* Status Toggle Button */}
                <button
                  onClick={() => handleToggleStatus(item._id)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer border ${
                    item.isActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-stone-100 text-stone-500 border-stone-200'
                  }`}
                >
                  {item.isActive ? 'Active' : 'Hidden'}
                </button>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 cursor-pointer"
                    title="Edit media details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id, item.title)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Delete media"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-xs text-stone-400 italic">
          No media records found.
        </div>
      )}

      {/* CREATE / EDIT MEDIA MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                {editingMedia ? 'Edit Media Details' : 'Upload Gallery Media'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Type Select */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Asset Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData({
                        ...formData,
                        type: newType,
                        category: newType === 'photo' ? photoCategories[0] : videoCategories[0]
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs bg-white"
                  >
                    <option value="photo">Photo / Picture</option>
                    <option value="video">Video Recording</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Master Balayage Showcase"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs bg-white"
                >
                  {(formData.type === 'photo' ? photoCategories : videoCategories).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Direct File / Video Upload or Before & After Pair */}
              {formData.category === 'Before & After' ? (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                  <span className="font-bold text-stone-800 uppercase tracking-wide block text-[11px]">
                    Before / After Transformation Photos
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImageUpload
                      value={formData.beforeUrl}
                      onChange={(url) =>
                        setFormData((prev) => ({
                          ...prev,
                          beforeUrl: url,
                          url: prev.url || url
                        }))
                      }
                      label="1. Before Transformation"
                      type="image"
                      accept="image/*"
                      aspectRatio="aspect-square"
                      helpText="Upload client before photo"
                    />
                    <ImageUpload
                      value={formData.afterUrl}
                      onChange={(url) =>
                        setFormData((prev) => ({
                          ...prev,
                          afterUrl: url,
                          url: prev.url || url
                        }))
                      }
                      label="2. After Transformation"
                      type="image"
                      accept="image/*"
                      aspectRatio="aspect-square"
                      helpText="Upload finished makeover photo"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <ImageUpload
                    value={formData.url}
                    onChange={(url) => setFormData((prev) => ({ ...prev, url }))}
                    label={formData.type === 'video' ? 'Upload Video File' : 'Upload Showcase Photo'}
                    type={formData.type}
                    accept={formData.type === 'video' ? 'video/*' : 'image/*'}
                    aspectRatio="aspect-video"
                    helpText={
                      formData.type === 'video'
                        ? 'Upload MP4, WEBM, MOV video (up to 100MB)'
                        : 'Upload PNG, JPG, WEBP photo (up to 25MB)'
                    }
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short caption or stylist notes..."
                  className="w-full p-2.5 rounded-lg border border-stone-300 text-xs"
                />
              </div>

              {/* Duration (if video) & Display Order */}
              <div className="grid grid-cols-2 gap-3">
                {formData.type === 'video' && (
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Duration (Seconds)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="45"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                )}
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>

              {/* Featured & Active Toggles */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                  />
                  <span className="font-semibold text-stone-700">Feature on Homepage</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                  />
                  <span className="font-semibold text-stone-700">Active (Visible)</span>
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Uploading...' : editingMedia ? 'Save Changes' : 'Upload Asset'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
