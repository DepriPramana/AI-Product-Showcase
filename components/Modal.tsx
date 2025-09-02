
import React, { useEffect } from 'react';
import { XIcon } from './icons/XIcon';

interface ModalProps {
  imageSrc: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ imageSrc, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={imageSrc} alt="Enlarged view" className="w-full h-full object-contain" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
          aria-label="Close modal"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Modal;
