
import React, { useRef, useCallback } from 'react';
import { UploadCloudIcon } from './icons/UploadCloudIcon';
import { XIcon } from './icons/XIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imageSrc: string | null;
  onRemoveImage: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imageSrc, onRemoveImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageUpload(event.target.files[0]);
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      onImageUpload(event.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  return (
    <div className="w-full aspect-square relative">
      {imageSrc ? (
        <>
          <img src={imageSrc} alt="Uploaded preview" className="w-full h-full object-cover rounded-lg" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveImage();
            }}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
            aria-label="Remove image"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </>
      ) : (
        <div
          className="w-full h-full border-2 border-dashed border-brand-border rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-brand-primary hover:bg-white/5 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
          />
          <UploadCloudIcon className="w-8 h-8 text-brand-secondary mb-2" />
          <p className="text-sm font-semibold text-white">Click to upload or drag and drop</p>
          <p className="text-xs text-brand-secondary">PNG, JPG, or WEBP</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
