import { useState, useEffect, useMemo } from 'react';
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
  Clock,
  Sparkles,
  Crown
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
    isTop4kSpotlight: false,
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

  // Dynamically calculate the single TRUE Top 4K video so only ONE card gets highlighted
  const top4kVideo = useMemo(() => {
    const videos = mediaList.filter((m) => m.type === 'video' && m.isActive !== false);
    if (videos.length === 0) return null;
    const featured = videos.filter((v) => v.isFeatured);
    if (featured.length > 0) {
      return [...featured].sort((a, b) => {
        const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
        if (orderDiff !== 0) return orderDiff;
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      })[0];
    }
    return [...videos].sort((a, b) => {
      const orderDiff = (a.displayOrder || 0) - (b.displayOrder || 0);
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    })[0];
  }, [mediaList]);

  const handleOpenModal = (media = null) => {
    if (media) {
      setEditingMedia(media);
      const isTop = top4kVideo && media._id === top4kVideo._id;
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
        isTop4kSpotlight: Boolean(isTop),
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
        isTop4kSpotlight: false,
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
      const displayOrderNum = formData.isTop4kSpotlight ? 0 : Number(formData.displayOrder) || 0;
      const featuredVal = formData.isTop4kSpotlight ? true : formData.isFeatured;

      const payload = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        url: effectiveUrl,
        thumbnail: formData.type === 'video'
          ? (formData.thumbnail && !formData.thumbnail.includes('.mp4') ? formData.thumbnail : effectiveUrl)
          : effectiveUrl,
        duration: formData.duration ? Number(formData.duration) : 0,
        displayOrder: displayOrderNum,
        isFeatured: featuredVal,
        isActive: formData.isActive,
        beforeUrl: formData.beforeUrl,
        afterUrl: formData.afterUrl
      };

      if (editingMedia) {
        await mediaService.updateMedia(editingMedia._id, payload);
        if (formData.isTop4kSpotlight) {
          try {
            await mediaService.setTop4kVideo(editingMedia._id);
          } catch (_) {}
        }
        setFeedback({ type: 'success', message: 'Media asset updated successfully.' });
      } else {
        const createRes = await mediaService.createMedia(payload);
        const newId = createRes?.data?._id || createRes?.data?.media?._id;
        if (formData.isTop4kSpotlight && newId) {
          try {
            await mediaService.setTop4kVideo(newId);
          } catch (_) {}
        }
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

  const handleToggleFeatured = async (id, currentVal) => {
    try {
      const newVal = !currentVal;
      await mediaService.updateMedia(id, { isFeatured: newVal });
      setMediaList((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isFeatured: newVal } : item))
      );
      setFeedback({
        type: 'success',
        message: newVal ? 'Added to Homepage Featured Showcase.' : 'Removed from Homepage (still in Gallery).'
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update featured status' });
    }
  };

  // 1-Click action to designate a video as the unique Top 4K Spotlight Hero video
  const handleSetTop4kVideo = async (id, title) => {
    try {
      if (typeof mediaService.setTop4kVideo === 'function') {
        await mediaService.setTop4kVideo(id);
      } else {
        await mediaService.updateMedia(id, { isFeatured: true, displayOrder: 0 });
      }

      setMediaList((prev) =>
        prev.map((item) => {
          if (item._id === id) {
            return { ...item, isFeatured: true, displayOrder: 0, updatedAt: new Date().toISOString() };
          }
          if (item.type === 'video') {
            return { ...item, displayOrder: (item.displayOrder || 0) + 1 };
          }
          return item;
        })
      );

      setFeedback({
        type: 'success',
        message: '🌟 "' + title + '" is now the active Top 4K Spotlight Hero video in the Gallery portfolio!'
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to set top 4K video' });
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
    if (!window.confirm('Are you sure you want to permanently delete "' + title + '"?')) return;

    try {
      await mediaService.deleteMedia(id);
      setMediaList((prev) => prev.filter((item) => item._id !== id));
      setFeedback({ type: 'success', message: 'Deleted "' + title + '".' });
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
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-stone-200">
            <span>Asset Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Media Gallery Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Choose your <strong>Top 4K Spotlight Hero Video</strong>, upload client transformations, and curate the portfolio.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSeed}
            className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold cursor-pointer"
          >
            Seed Sample Media
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Upload Media
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Assets</span>
          <p className="text-2xl font-serif font-bold text-stone-900">{mediaList.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center">
            <Camera className="w-3.5 h-3.5 mr-1 text-stone-500" /> Photos
          </span>
          <p className="text-2xl font-serif font-bold text-stone-900">{totalPhotos}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center">
            <Video className="w-3.5 h-3.5 mr-1 text-stone-500" /> Videos
          </span>
          <p className="text-2xl font-serif font-bold text-stone-900">{totalVideos}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center">
            <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" /> Featured Work
          </span>
          <p className="text-2xl font-serif font-bold text-stone-900">{totalFeatured}</p>
        </div>
      </div>

      {/* Active Top 4K Hero Banner Reminder */}
      {top4kVideo && (
        <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-rose-50 border border-amber-300/80 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-md shrink-0">
              <Crown className="w-5 h-5 fill-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  Current Top 4K Spotlight Hero
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-mono font-bold">
                  Active in Gallery
                </span>
              </div>
              <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base line-clamp-1">
                {top4kVideo.title}
              </h4>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal(top4kVideo)}
            className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer shrink-0 shadow-xs"
          >
            Edit Top 4K Video
          </button>
        </div>
      )}

      {/* Global Feedback Alert */}
      {feedback.message && (
        <div
          className={'p-4 rounded-xl flex items-center justify-between text-xs sm:text-sm ' + (
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          )}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="text-stone-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center text-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs focus:outline-stone-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="photo">Photos Only</option>
            <option value="video">Videos Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white cursor-pointer max-w-[160px]"
          >
            <option value="all">All Categories</option>
            {[...photoCategories, ...videoCategories].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white cursor-pointer"
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
          {mediaList.map((item) => {
            const isTopSpotlight = item.type === 'video' && top4kVideo && item._id === top4kVideo._id;

            return (
              <div
                key={item._id}
                className={'bg-white rounded-2xl border overflow-hidden shadow-xs transition-all flex flex-col justify-between ' + (
                  isTopSpotlight
                    ? 'ring-2 ring-amber-500 border-amber-400 shadow-md'
                    : 'border-stone-200 hover:border-stone-300'
                )}
              >
                {/* Thumbnail Container */}
                <div className="relative h-48 w-full bg-stone-900 overflow-hidden flex items-center justify-center">
                  {item.type === 'video' && (!item.thumbnail || item.thumbnail.includes('.mp4') || item.thumbnail.includes('.webm') || item.thumbnail === item.url) ? (
                    <video
                      src={resolveImageUrl(item.url)}
                      preload="metadata"
                      muted
                      playsInline
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  ) : (
                    <img
                      src={resolveImageUrl(item.type === "photo" ? (item.url || item.thumbnail) : (item.thumbnail || item.url), DEFAULT_SALON_PLACEHOLDER)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                    />
                  )}

                  {/* Top Badges (Clean, non-truncating layout) */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10 max-w-[75%]">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-950/90 text-white shadow-xs">
                      {item.type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/95 text-stone-900 shadow-xs line-clamp-1 max-w-[110px]">
                      {item.category}
                    </span>
                    {isTopSpotlight && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-stone-950 flex items-center gap-1 shadow-md">
                        <Crown className="w-3 h-3 fill-stone-950" />
                        Top 4K
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFeatured(item._id, item.isFeatured);
                    }}
                    className={'absolute top-2.5 right-2.5 p-1.5 rounded-lg transition-all shadow-md cursor-pointer z-10 ' + (
                      item.isFeatured
                        ? 'bg-amber-500 text-stone-950 hover:bg-amber-400'
                        : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-900'
                    )}
                    title={item.isFeatured ? 'Featured on Homepage (Click to toggle)' : 'Click to feature on Homepage'}
                  >
                    <Star className={'w-3.5 h-3.5 ' + (item.isFeatured ? 'fill-current' : '')} />
                  </button>
                </div>

                {/* Info & Admin Controls */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 font-light leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* 1-Click Top 4K Spotlight Hero Selector for Videos */}
                  {item.type === 'video' && (
                    <div className="pt-1">
                      {isTopSpotlight ? (
                        <div className="w-full py-2 px-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between shadow-2xs">
                          <span className="flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                            <span>Active Top 4K Hero</span>
                          </span>
                          <span className="text-[10px] bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded-full font-mono font-bold">
                            #1 in Gallery
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetTop4kVideo(item._id, item.title)}
                          className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-950 border border-stone-200 hover:border-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer group/btn"
                          title="Click to place this video as the 100% wide 4K hero at the top of the Gallery"
                        >
                          <Crown className="w-3.5 h-3.5 text-stone-400 group-hover/btn:text-amber-600 group-hover/btn:fill-amber-500 transition-colors" />
                          <span>Set as Top 4K Hero</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                    <span className="font-mono">Order: {item.displayOrder || 0}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item._id)}
                      className={'px-2 py-0.5 rounded-md font-semibold cursor-pointer ' + (
                        item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                      )}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id, item.title)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto space-y-3">
          <Layers className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="font-serif font-bold text-stone-900 text-base">No Media Assets Found</h3>
          <p className="text-xs text-stone-500">No media matches the selected filters.</p>
        </div>
      )}

      {/* Upload / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h2 className="text-lg font-serif font-bold text-stone-900">
                {editingMedia ? 'Edit Media Showcase' : 'Upload New Media Asset'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Media Type Tabs */}
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1.5">Asset Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'photo', category: 'Salon Interior' })}
                    className={'py-2 rounded-xl border font-semibold flex items-center justify-center gap-1.5 cursor-pointer ' + (
                      formData.type === 'photo'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    )}
                  >
                    <Camera className="w-3.5 h-3.5" /> Photo Showcase
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'video', category: 'Salon Tour' })}
                    className={'py-2 rounded-xl border font-semibold flex items-center justify-center gap-1.5 cursor-pointer ' + (
                      formData.type === 'video'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    )}
                  >
                    <Video className="w-3.5 h-3.5" /> Video Story / Reel
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Royal Rajasthani Bridal Makeover"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white cursor-pointer"
                >
                  {(formData.type === 'photo' ? photoCategories : videoCategories).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Upload Section */}
              {formData.category === 'Before & After' ? (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
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
              ) : formData.type === 'video' ? (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                  <span className="font-bold text-stone-800 uppercase tracking-wide block text-[11px]">
                    Video Reel & Custom Thumbnail Cover
                  </span>

                  <ImageUpload
                    value={formData.url}
                    onChange={(url) => setFormData((prev) => ({ ...prev, url }))}
                    label="1. Video File (MP4 / WEBM)"
                    type="video"
                    accept="video/*"
                    aspectRatio="aspect-video"
                    helpText="Upload MP4/WEBM reel or paste local path (e.g. /images/videos/...)"
                  />

                  <ImageUpload
                    value={formData.thumbnail && !formData.thumbnail.includes('.mp4') && !formData.thumbnail.includes('.webm') ? formData.thumbnail : ''}
                    onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail: url }))}
                    label="2. Custom Video Thumbnail / Cover Poster Photo (Optional)"
                    type="image"
                    accept="image/*"
                    aspectRatio="aspect-video"
                    helpText="Choose a custom cover photo or leave empty to auto-use video's first frame"
                  />
                </div>
              ) : (
                <div>
                  <ImageUpload
                    value={formData.url}
                    onChange={(url) => setFormData((prev) => ({ ...prev, url, thumbnail: url }))}
                    label="Upload Showcase Photo"
                    type="image"
                    accept="image/*"
                    aspectRatio="aspect-video"
                    helpText="Upload PNG, JPG, WEBP photo (up to 25MB) or paste path (e.g. /images/bridal/...)"
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
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              {/* Top 4K Spotlight & Featured Toggles for Video */}
              {formData.type === 'video' && (
                <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isTop4kSpotlight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isTop4kSpotlight: e.target.checked,
                          isFeatured: e.target.checked ? true : formData.isFeatured,
                          displayOrder: e.target.checked ? 0 : formData.displayOrder
                        })
                      }
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      Set as Primary Top 4K Spotlight Video in Gallery
                    </span>
                  </label>
                  <p className="text-[11px] text-amber-800/80 pl-6">
                    This video will appear as the 100% wide 4K cinematic hero at the top of the Portfolio page.
                  </p>
                </div>
              )}

              {/* Duration & Display Order */}
              <div className="grid grid-cols-2 gap-3">
                {formData.type === 'video' && (
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Duration (Seconds)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="45"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                )}
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
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
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-rose-300" />
                      Saving & Updating...
                    </span>
                  ) : (
                    editingMedia ? 'Save Changes' : 'Upload Asset'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
