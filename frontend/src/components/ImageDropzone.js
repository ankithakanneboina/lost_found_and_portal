import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image } from 'lucide-react';

export default function ImageDropzone({ onFileSelect, label = 'Upload Image' }) {
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (!accepted.length) return;
    const file = accepted[0];
    onFileSelect(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null);
    onFileSelect(null);
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-ink-200 mb-2">{label}</label>}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden ${
          isDragActive
            ? 'border-accent bg-accent/10'
            : preview
            ? 'border-ink-600'
            : 'border-ink-600 hover:border-accent/50 hover:bg-ink-700/30'
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative h-48">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button onClick={clear}
              className="absolute top-2 right-2 p-1.5 bg-ink-900/80 rounded-lg hover:bg-ink-900 transition-colors">
              <X size={14} className="text-white" />
            </button>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-ink-900/80 rounded-lg text-xs text-ink-300 flex items-center gap-1">
              <Image size={11} /> Click to change
            </div>
          </div>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center gap-2 px-4">
            <Upload size={28} className={isDragActive ? 'text-accent' : 'text-ink-500'} />
            <p className="text-sm text-ink-400 text-center">
              {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-xs text-ink-600">PNG, JPG, WebP up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
