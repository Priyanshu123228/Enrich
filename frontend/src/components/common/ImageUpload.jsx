import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Video, Link2 } from 'lucide-react';
import { mediaService } from '../../services/media.service';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';

/**
 * Reusable Direct File & URL Media Upload Component
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
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const maxSize = type === 'video' ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`File too large. Maximum size is ${type === 'video' ? '100MB' : '25MB'}.`);
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const res = await mediaService.uploadFile(file);
      if (res?.data?.url) {
        onChange(res.data.url, res.data.public_id || '');
      } else {
        throw new Error('Upload completed but no URL was returned');
      }
    } catch (err) {
      console.error('Direct file upload error:', err);
      setUploadError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualUrlSubmit = (e) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      onChange(manualUrl.trim(), '');
      setIsUrlMode(false);
    }
  };

  const resolvedValue = resolveImageUrl(value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
            {label}
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
            className="px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            Apply
          </button>
        </form>
      )}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
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

          <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-stone-900 text-xs font-semibold rounded-lg shadow-sm hover:bg-stone-100 cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Change
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
        </div>
      ) : (
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
          } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <Loader2 className="w-7 h-7 text-stone-700 animate-spin" />
              <p className="text-xs font-medium text-stone-700">Uploading media directly...</p>
              <p className="text-[11px] text-stone-400">Please wait while the asset is processed</p>
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
        <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1 mt-1">
          <X className="w-3.5 h-3.5 shrink-0" />
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
