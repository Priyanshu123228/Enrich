import SEO from '../components/common/SEO';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../utils/imageUrl';
import { useState, useEffect } from 'react';
import { mediaService } from '../services/media.service';
import PhotoLightbox from '../components/gallery/PhotoLightbox';
import VideoModal from '../components/gallery/VideoModal';
import BeforeAfterSlider from '../components/gallery/BeforeAfterSlider';
import {
  Camera,
  Video,
  Play,
  Layers,
  Loader2,
  AlertCircle,
  Eye,
  Clock,
  Sparkle,
  Image as ImageIcon
} from 'lucide-react';

export default function Gallery() {
  const [mediaList, setMediaList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'photo' | 'video' | 'before-after'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Lightbox & Modal States
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  // Fetch categories & media
  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch categories
      const catRes = await mediaService.getCategories();
      if (catRes?.data) {
        setCategories(catRes.data);
      }

      // 2. Fetch media with current filters
      const params = {};
      if (selectedType === 'photo' || selectedType === 'video') {
        params.type = selectedType;
      }
      if (selectedType === 'before-after') {
        params.category = 'Before & After';
      } else if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      let res = await mediaService.getGalleryMedia(params);
      
      // Auto-seed default sample media if gallery is empty on initial load
      if (!res?.data?.media || res.data.media.length === 0) {
        await mediaService.seedDefaultMedia();
        res = await mediaService.getGalleryMedia(params);
      }

      if (res?.data?.media) {
        setMediaList(res.data.media);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch gallery media');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedType, selectedCategory]);

  // Photo list specifically for the Lightbox previous/next navigation
  const photoList = mediaList.filter((m) => m.type === 'photo');

  const openPhotoLightbox = (mediaItem) => {
    const idx = photoList.findIndex((p) => p._id === mediaItem._id);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  };

  const typeTabs = [
    { id: 'all', label: 'All Portfolio', icon: Layers },
    { id: 'photo', label: 'Photos', icon: Camera },
    { id: 'video', label: 'Videos & Tours', icon: Video },
    { id: 'before-after', label: 'Before & After', icon: Sparkle }
  ];

  const filteredCategories = categories.filter((c) => {
    if (selectedType === 'photo') {
      return ['Hair', 'Makeup', 'Nails', 'Skin Care', 'Bridal', 'Salon Interior', 'Salon Exterior', 'Events', 'Offers'].includes(c.name);
    }
    if (selectedType === 'video') {
      return ['Salon Tour', 'Hair Transformation', 'Nail Art', 'Customer Experience', 'Behind the Scenes'].includes(c.name);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <SEO
        title="Photo & Video Transformations Showcase | Enrich Sikar"
        description="See real before/after client transformations, bridal makeover galleries, and salon studio photos at Sharda Heights, Sikar."
        url="/gallery"
      />

      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
          Studio Gallery
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Photos & Videos
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
          Photographs and video tours of our Sikar studio, treatment rooms, and styling services.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="space-y-3">
        
        {/* 1. Media Type Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {typeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectedType(tab.id);
                setSelectedCategory('all');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-2 cursor-pointer ${
                selectedType === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 text-rose-600" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 2. Category Filter Chips */}
        {selectedType !== 'before-after' && (
          <div className="flex items-center justify-center flex-wrap gap-1.5 pt-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Categories
            </button>

            {filteredCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  selectedCategory === cat.name
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span>{cat.name}</span>
                {cat.count > 0 && (
                  <span className={`text-[10px] px-1 rounded ${
                    selectedCategory === cat.name ? 'bg-rose-900 text-white' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Gallery Content Grid */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
          <p className="text-xs text-stone-500">Loading gallery...</p>
        </div>
      ) : errorMsg ? (
        <div className="p-10 text-center bg-rose-50 rounded-xl border border-rose-200 max-w-lg mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-700 mx-auto" />
          <h3 className="font-bold text-stone-900 text-sm">Failed to Load Gallery</h3>
          <p className="text-xs text-stone-600">{errorMsg}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white text-xs font-semibold cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : mediaList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mediaList.map((item) => {
            // Case 1: Before & After Card
            if (item.category === 'Before & After' && item.beforeAfter?.beforeUrl && item.beforeAfter?.afterUrl) {
              return (
                <div key={item._id} className="sm:col-span-2">
                  <BeforeAfterSlider
                    beforeImage={item.beforeAfter.beforeUrl}
                    afterImage={item.beforeAfter.afterUrl}
                    title={item.title}
                    category={item.category}
                  />
                </div>
              );
            }

            // Case 2: Video Card with Play Overlay
            if (item.type === 'video') {
              return (
                <div
                  key={item._id}
                  onClick={() => setActiveVideo(item)}
                  className="group relative h-72 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-end"
                >
                  <img
                    src={resolveImageUrl(item.thumbnail || item.url, DEFAULT_SALON_PLACEHOLDER)}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-95"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-stone-950/60" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-lg bg-white/90 group-hover:bg-rose-700 text-stone-900 group-hover:text-white flex items-center justify-center shadow-md transition-colors">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Duration Badge */}
                  {item.duration > 0 && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-mono flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-rose-400" />
                      {item.duration}s
                    </div>
                  )}

                  {/* Category Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-md bg-stone-900/80 text-stone-200 font-semibold text-[10px] uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="relative p-4 space-y-1 text-white z-10">
                    <h3 className="font-serif font-bold text-sm leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-stone-300 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            }

            // Case 3: Standard Photo Card
            return (
              <div
                key={item._id}
                onClick={() => openPhotoLightbox(item)}
                className="group relative h-72 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-end"
              >
                <img
                  src={resolveImageUrl(item.thumbnail || item.url, DEFAULT_SALON_PLACEHOLDER)}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-stone-900/80 text-stone-200 font-semibold text-[10px] uppercase tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* Hover Details Preview */}
                <div className="relative p-4 space-y-1 text-white z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="font-serif font-bold text-sm leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-[11px] text-stone-300 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="pt-0.5 flex items-center text-[10px] text-rose-300 font-semibold">
                    <Eye className="w-3 h-3 mr-1" />
                    <span>View Full Size</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">No Media Found</h3>
          <p className="text-xs text-stone-500">
            No photos or videos match this filter combination. Try selecting "All Portfolio".
          </p>
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white font-semibold text-xs cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          mediaList={photoList}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}

      {/* VIDEO PLAYER MODAL */}
      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

    </div>
  );
}
