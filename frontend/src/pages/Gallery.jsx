import SEO from '../components/common/SEO';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../utils/imageUrl';
import { useState, useEffect } from 'react';
import { mediaService } from '../services/media.service';
import PhotoLightbox from '../components/gallery/PhotoLightbox';
import VideoModal from '../components/gallery/VideoModal';
import VideoReelsGallery from '../components/gallery/VideoReelsGallery';
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
  const [videoCategoryFilter, setVideoCategoryFilter] = useState('All');
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
      try {
        const catRes = await mediaService.getCategories();
        if (catRes?.data) {
          const rawCats = Array.isArray(catRes.data) ? catRes.data : catRes.data?.categories || [];
          setCategories(rawCats.map((c) => (typeof c === 'string' ? c : c?.name)).filter(Boolean));
        }
      } catch (catErr) {
        console.warn('Could not load categories:', catErr);
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
        try {
          await mediaService.seedDefaultMedia();
          res = await mediaService.getGalleryMedia(params);
        } catch (_) {}
      }

      if (res?.data?.media && Array.isArray(res.data.media)) {
        setMediaList(res.data.media);
      } else if (Array.isArray(res?.data)) {
        setMediaList(res.data);
      } else {
        setMediaList([]);
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setErrorMsg(err.message || 'Unable to load gallery items. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedType, selectedCategory]);

  const safeMediaList = Array.isArray(mediaList) ? mediaList : [];
  const photoList = safeMediaList.filter((m) => m?.type === 'photo');
  const videoList = safeMediaList.filter((m) => m?.type === 'video');

  const openPhotoLightbox = (item) => {
    const idx = photoList.findIndex((p) => p._id === item._id);
    if (idx !== -1) setLightboxIndex(idx);
  };

  return (
    <div className="space-y-8 sm:space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEO
        title="Portfolio & Studio Gallery | Enrich Beauty Salon"
        description="Explore our high-end portfolio of bridal looks, hair transformations, salon tours, skin treatments, and before-and-after results at Enrich Beauty."
        keywords="salon gallery, beauty portfolio, bridal makeup videos, hair transformation reels, Enrich Beauty salon"
      />

      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold uppercase tracking-wider">
          <Sparkle className="w-3.5 h-3.5 fill-rose-700" />
          <span>Our Visual Portfolio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Artistry & Transformations
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Step inside Enrich Beauty. Explore real client results, creative hairstyles, glowing skincare, and behind-the-scenes studio moments.
        </p>
      </div>

      {/* MAIN VIEW CONTROLS & FILTER TABS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-200 pb-6">
        
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-stone-100 rounded-xl border border-stone-200/80">
          <button
            onClick={() => {
              setSelectedType('all');
              setSelectedCategory('all');
            }}
            className={'px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2 cursor-pointer ' + (
              selectedType === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Portfolio</span>
          </button>

          <button
            onClick={() => {
              setSelectedType('photo');
              setSelectedCategory('all');
            }}
            className={'px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2 cursor-pointer ' + (
              selectedType === 'photo'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            )}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photos</span>
          </button>

          <button
            onClick={() => {
              setSelectedType('video');
              setSelectedCategory('all');
            }}
            className={'px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2 cursor-pointer ' + (
              selectedType === 'video'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            )}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Studio Videos & Reels</span>
          </button>

          <button
            onClick={() => {
              setSelectedType('before-after');
              setSelectedCategory('all');
            }}
            className={'px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-2 cursor-pointer ' + (
              selectedType === 'before-after'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            )}
          >
            <Sparkle className="w-3.5 h-3.5" />
            <span>Before & After</span>
          </button>
        </div>

        {/* Category Pill Filters (when NOT in dedicated video view) */}
        {selectedType !== 'video' && categories.length > 0 && selectedType !== 'before-after' && (
          <div className="flex items-center space-x-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ' + (
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              )}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ' + (
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-stone-700 animate-spin" />
          <p className="text-xs text-stone-500">Loading visual studio gallery...</p>
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
      ) : selectedType === 'video' ? (
        /* DEDICATED LUXURY VIDEO REELS GALLERY EXPERIENCE */
        <VideoReelsGallery
          videos={videoList}
          selectedCategory={videoCategoryFilter}
          onCategoryChange={(cat) => setVideoCategoryFilter(cat)}
          onSelectVideo={(v) => setActiveVideo(v)}
        />
      ) : safeMediaList.length > 0 ? (
        /* MIXED / PHOTO / BEFORE-AFTER GALLERY GRID */
        <div className="space-y-12">
          {/* If viewing 'all', show featured video reels showcase first if videos exist */}
          {selectedType === 'all' && videoList.length > 0 && (
            <VideoReelsGallery
              videos={videoList.slice(0, 5)}
              selectedCategory="All"
              onCategoryChange={() => {}}
              onSelectVideo={(v) => setActiveVideo(v)}
            />
          )}

          {/* Photos & Before/After Section */}
          <div className="space-y-4">
            {selectedType === 'all' && videoList.length > 0 && (
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  Photo Stories & Transformations
                </h3>
                <span className="text-xs text-stone-500">
                  {photoList.length} photos
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(selectedType === 'all' ? photoList : safeMediaList).map((item) => {
                if (!item) return null;

                // Case 1: Before & After Card
                if (item.category === 'Before & After' && item.beforeAfter?.beforeUrl && item.beforeAfter?.afterUrl) {
                  return (
                    <div key={item._id || item.title} className="sm:col-span-2">
                      <BeforeAfterSlider
                        beforeImage={item.beforeAfter.beforeUrl}
                        afterImage={item.beforeAfter.afterUrl}
                        title={item.title}
                        category={item.category}
                      />
                    </div>
                  );
                }

                // Case 2: Standard Photo Card
                return (
                  <div
                    key={item._id || item.title}
                    onClick={() => openPhotoLightbox(item)}
                    className="group relative h-72 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-end"
                  >
                    <img
                      src={resolveImageUrl(item.type === "photo" ? (item.url || item.thumbnail) : (item.thumbnail || item.url), DEFAULT_SALON_PLACEHOLDER)}
                      alt={item.title || 'Salon Gallery Photo'}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
                    />
                    <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Top Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-stone-900/80 text-stone-200 font-semibold text-[10px] uppercase tracking-wider">
                        {item.category || 'Portfolio'}
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
          </div>
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

      {/* VIDEO PLAYER CINEMA MODAL */}
      {activeVideo && (
        <VideoModal
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
        />
      )}

    </div>
  );
}
