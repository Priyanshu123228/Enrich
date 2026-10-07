import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Video, Link2, CheckCircle2, AlertCircle } from 'lucide-react';
import { mediaService } from '../../services/media.service';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';

/**
 * Reusable Direct File & URL Media Upload Component with High-Visibility Loading Indicators
 */
export default function ImageUpload({
  value,
  onChange,
  label = 'Upload Photo / Video',
  accept = 'image/*',
  type = 'image', // 'image' | 'video'
  isCircular = false,
  aspectRatio = 'aspect-video',
  helpText = 'Supports PNG, JPG, WEBP or MP4 up to 50MB'
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Clear success flash after 3.5 seconds
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => setUploadSuccess(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  const handleFile = async (file) => {
    if (!file) return;
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`File too large. Maximum size is ${type === 'video' ? '100MB' : '25MB'}.`);
      return;
    }

    setUploadError('');
    setUploadSuccess(false);
    setIsUploading(true);
    setUploadProgressText(`Uploading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

    try {
      const res = await mediaService.uploadFile(file);
      if (res?.data?.url) {
        onChange(res.data.url, res.data.public_id || '');
        setUploadSuccess(true);
      } else {
        throw new Error('Upload completed but no URL was returned');
      }
    } catch (err) {
      console.error('Direct file upload error:', err);
      setUploadError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
    }
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('', '');
    setManualUrl('');
    setUploadSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualUrlSubmit = (e) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      setImageLoading(true);
      onChange(manualUrl.trim(), '');
      setUploadSuccess(true);
      setIsUrlMode(false);
      setTimeout(() => setImageLoading(false), 800);
    }
  };

  const resolvedValue = resolveImageUrl(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            {label}
            {isUploading && (
              <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Uploading...
              </span>
            )}
            {uploadSuccess && (
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Updated!
              </span>
            )}
          </label>
        )}
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-[11px] font-medium text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
        >
          <Link2 className="w-3 h-3" />
          {isUrlMode ? 'Switch to File Upload' : 'Paste Media Path / URL'}
        </button>
      </div>

      {isUrlMode && (
        <form onSubmit={handleManualUrlSubmit} className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="e.g. /images/salon/interior.webp or https://..."
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900 bg-white"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 cursor-pointer flex items-center gap-1"
          >
            Apply
          </button>
        </form>
      )}

      {value ? (
        // PREVIEW STATE WITH ACTIVE LOADING OVERLAY
        <div className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
          
          {/* Active Uploading / Processing Overlay */}
          {isUploading && (
            <div className="absolute inset-0 z-30 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white text-center">
              <div className="w-12 h-12 rounded-full bg-rose-700/30 flex items-center justify-center mb-2 animate-bounce">
                <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
              </div>
              <p className="text-xs font-bold tracking-wide text-stone-100">
                Updating Media...
              </p>
              <p className="text-[11px] text-stone-300 mt-1 max-w-xs truncate">
                {uploadProgressText || 'Uploading and optimizing file...'}
              </p>
            </div>
          )}

          {/* Success Flash Overlay */}
          {uploadSuccess && !isUploading && (
            <div className="absolute top-2 left-2 z-20 bg-emerald-600/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Image Uploaded</span>
            </div>
          )}

          {type === 'video' ? (
            <video
              src={resolvedValue}
              controls
              className={`w-full max-h-56 object-cover ${aspectRatio} bg-black`}
            />
          ) : (
            <div className={`w-full overflow-hidden flex items-center justify-center ${isCircular ? 'w-28 h-28 mx-auto rounded-full' : `${aspectRatio} max-h-56`}`}>
              <img
                src={resolvedValue}
                alt="Uploaded preview"
                className={`w-full h-full object-cover ${isCircular ? 'rounded-full' : ''}`}
                onError={(e) => handleImageError(e, DEFAULT_SALON_PLACEHOLDER)}
              />
            </div>
          )}

          {/* Action Overlay */}
          {!isUploading && (
            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-stone-900 text-xs font-semibold rounded-lg shadow-sm hover:bg-stone-100 cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Change File
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-rose-800 cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        // UPLOAD DROPZONE WITH ACTIVE PROGRESS SPINNER
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-stone-900 bg-stone-100'
              : 'border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50'
          } ${isUploading ? 'border-rose-500 bg-rose-50/40' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center animate-pulse">
                <Loader2 className="w-5 h-5 text-rose-700 animate-spin" />
              </div>
              <p className="text-xs font-bold text-stone-900">Uploading media...</p>
              <p className="text-[11px] text-stone-500">{uploadProgressText || 'Please wait while your asset is uploaded'}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-stone-200/70 text-stone-700 flex items-center justify-center">
                {type === 'video' ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-stone-900">Click to upload</span> or drag and drop
              </div>
              <p className="text-[11px] text-stone-500">{helpText}</p>
            </div>
          )}
        </div>
      )}

      {uploadError && (
        <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1 mt-1 bg-rose-50 p-2 rounded-md border border-rose-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {uploadError}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onFileInputChange}
        className="hidden"
      />
    </div>
  );
}
