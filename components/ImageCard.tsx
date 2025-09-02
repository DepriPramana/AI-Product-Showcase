import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { VideoCameraIcon } from './icons/VideoCameraIcon';

interface ImageCardProps {
  image: GeneratedImage;
  onZoom: () => void;
  onGeneratePrompt: () => void;
  onGenerateVideo: (image: GeneratedImage) => void;
  isGeneratingVideo: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onZoom, onGeneratePrompt, onGenerateVideo, isGeneratingVideo }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyPrompt = () => {
    if (image.prompt && image.prompt !== '...') {
      navigator.clipboard.writeText(image.prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  const handleDownloadClick = () => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = `ai-showcase-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="aspect-[2/3] relative rounded-lg overflow-hidden group">
      <img src={image.src} alt="Generated fashion look" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
        {image.prompt && image.prompt !== '...' ? (
          <div className="bg-black/60 backdrop-blur-sm p-2 rounded-md">
            <p className="text-xs text-gray-200 leading-snug line-clamp-3">{image.prompt}</p>
          </div>
        ) : <div />}

        <div className="flex flex-col items-center gap-2">
            {image.prompt && image.prompt !== '...' && (
                 <button onClick={handleCopyPrompt} className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs py-2 px-3 rounded-md transition-colors">
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <ClipboardIcon className="w-4 h-4" />}
                    {isCopied ? 'Copied!' : 'Copy Prompt'}
                </button>
            )}
           <ActionButton onClick={onZoom} icon={<ZoomInIcon className="w-4 h-4"/>} label="Zoom" />
           <ActionButton onClick={handleDownloadClick} icon={<DownloadIcon className="w-4 h-4"/>} label="Download" />
           <ActionButton 
            onClick={onGeneratePrompt} 
            icon={<SparklesIcon className="w-4 h-4"/>} 
            label={image.prompt === '...' ? "Generating..." : "Generate Prompt"} 
            disabled={!!image.prompt}
            />
           <ActionButton 
            onClick={() => onGenerateVideo(image)}
            icon={<VideoCameraIcon className="w-4 h-4"/>}
            label={isGeneratingVideo ? "Generating..." : "Generate Video"}
            disabled={isGeneratingVideo}
           />
        </div>
      </div>
    </div>
  );
};

interface ActionButtonProps {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, icon, label, disabled }) => {
    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold text-xs py-2 px-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {icon}
            {label}
        </button>
    )
}

export default ImageCard;
