import React, { useState, useCallback } from 'react';
import { GenerationMode, GeneratedImage, ImageData } from './types';
import { PHOTOSHOOT_THEMES, LIGHTING_STYLES, INITIAL_IMAGES } from './constants';
import { generateImages, generateImagePrompt, generateVideoFromImage } from './services/geminiService';
import { fileToGenerativePart } from './utils/imageUtils';
import ImageUploader from './components/ImageUploader';
import ImageCard from './components/ImageCard';
import Modal from './components/Modal';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import VideoModal from './components/VideoModal';

export default function App() {
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.Lookbook);
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [productImage, setProductImage] = useState<ImageData | null>(null);
  const [theme, setTheme] = useState<string>(PHOTOSHOOT_THEMES[0].value);
  const [lighting, setLighting] = useState<string>(LIGHTING_STYLES[0].value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(INITIAL_IMAGES);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoGenerationMessage, setVideoGenerationMessage] = useState<string>('');

  const videoMessages = [
    "AI is directing your video...",
    "Setting up the virtual cameras...",
    "Rendering the first few frames...",
    "This can take a few minutes...",
    "Applying final cinematic touches...",
    "Almost there, polishing the final cut...",
  ];

  const isGenerationDisabled = 
    isLoading || 
    !productImage || 
    (mode === GenerationMode.Lookbook && !modelImage);

  const handleImageUpload = async (file: File, type: 'model' | 'product') => {
    try {
      const generativePart = await fileToGenerativePart(file);
      const imageData = {
        part: generativePart,
        url: URL.createObjectURL(file)
      };
      if (type === 'model') {
        setModelImage(imageData);
      } else {
        setProductImage(imageData);
      }
    } catch (err) {
      setError('Failed to process image. Please try another file.');
    }
  };
  
  const handleGenerate = async () => {
    if (isGenerationDisabled) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
        const results = await generateImages({
            mode,
            theme,
            lighting,
            productImage: productImage!.part,
            modelImage: modelImage?.part,
        });
        setGeneratedImages(results.map(img => ({ src: img.src, mimeType: img.mimeType, prompt: null, id: crypto.randomUUID() })));
    } catch (err: any) {
        console.error(err);
        setError(`Failed to generate images: ${err.message || 'An unknown error occurred.'}`);
        setGeneratedImages(INITIAL_IMAGES); // Reset to default on error
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleGeneratePromptForImage = useCallback(async (imageId: string) => {
    const imageToUpdate = generatedImages.find(img => img.id === imageId);
    if (!imageToUpdate) return;

    // Mark as loading prompt
    setGeneratedImages(imgs => imgs.map(img => img.id === imageId ? { ...img, prompt: '...' } : img));

    try {
        const prompt = await generateImagePrompt({ src: imageToUpdate.src, mimeType: imageToUpdate.mimeType });
        setGeneratedImages(imgs => imgs.map(img => img.id === imageId ? { ...img, prompt } : img));
    } catch (err: any) {
        console.error(err);
        setError(`Failed to generate prompt: ${err.message}`);
        setGeneratedImages(imgs => imgs.map(img => img.id === imageId ? { ...img, prompt: 'Error generating prompt.' } : img));
    }
  }, [generatedImages]);

  const handleGenerateVideo = useCallback(async (image: GeneratedImage) => {
    setIsGeneratingVideo(true);
    setError(null);
    setGeneratedVideoUrl(null);
    
    let messageIndex = 0;
    setVideoGenerationMessage(videoMessages[messageIndex]);
    const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % videoMessages.length;
        setVideoGenerationMessage(videoMessages[messageIndex]);
    }, 5000);

    try {
        const videoUrl = await generateVideoFromImage({ src: image.src, mimeType: image.mimeType });
        setGeneratedVideoUrl(videoUrl);
    } catch (err: any) {
        console.error(err);
        setError(`Failed to generate video: ${err.message || 'An unknown error occurred.'}`);
    } finally {
        setIsGeneratingVideo(false);
        clearInterval(messageInterval);
        setVideoGenerationMessage('');
    }
  }, [videoMessages]);


  const changeMode = (newMode: GenerationMode) => {
    setMode(newMode);
    setModelImage(null);
    setProductImage(null);
    setGeneratedImages(INITIAL_IMAGES);
  }

  return (
    <div className="min-h-screen bg-brand-dark font-sans flex flex-col p-4 md:p-6 lg:p-8">
      <Header />
      <main className="flex-grow container mx-auto max-w-7xl pt-6">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight">AI Product Showcase</h1>
            <p className="text-brand-light mt-2 max-w-2xl mx-auto">Create stunning, AI-generated lookbooks or product B-rolls for your affiliate campaigns in seconds.</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel: Controls */}
          <div className="w-full lg:w-2/5 xl:w-1/3 flex-shrink-0 space-y-6">
              <ControlSection title="1. Select Generation Mode" subtitle="Choose what you want to create.">
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => changeMode(GenerationMode.Lookbook)} className={`py-3 px-4 rounded-lg font-semibold transition-colors text-sm ${mode === GenerationMode.Lookbook ? 'bg-brand-primary text-white' : 'bg-brand-card hover:bg-brand-border'}`}>Lookbook</button>
                    <button onClick={() => changeMode(GenerationMode.Broll)} className={`py-3 px-4 rounded-lg font-semibold transition-colors text-sm ${mode === GenerationMode.Broll ? 'bg-brand-primary text-white' : 'bg-brand-card hover:bg-brand-border'}`}>B-roll</button>
                </div>
              </ControlSection>

              {mode === GenerationMode.Lookbook && (
                <ControlSection title="2. Upload Model" subtitle="A clear photo of a person.">
                  <ImageUploader onImageUpload={(file) => handleImageUpload(file, 'model')} imageSrc={modelImage?.url} onRemoveImage={() => setModelImage(null)} />
                </ControlSection>
              )}

              <ControlSection title={mode === GenerationMode.Lookbook ? "3. Upload Product" : "1. Upload Product"} subtitle="Clothing, bags, shoes, etc.">
                <ImageUploader onImageUpload={(file) => handleImageUpload(file, 'product')} imageSrc={productImage?.url} onRemoveImage={() => setProductImage(null)} />
              </ControlSection>

              <ControlSection title={mode === GenerationMode.Lookbook ? "4. Customize Look" : "2. Customize Look"} subtitle="Set the theme and lighting for the photoshoot.">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-brand-light mb-1">Photoshoot Theme</label>
                    <select id="theme" value={theme} onChange={e => setTheme(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-brand-primary focus:border-brand-primary">
                      {PHOTOSHOOT_THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="lighting" className="block text-sm font-medium text-brand-light mb-1">Lighting Style</label>
                    <select id="lighting" value={lighting} onChange={e => setLighting(e.target.value)} className="w-full bg-brand-card border border-brand-border rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-brand-primary focus:border-brand-primary">
                      {LIGHTING_STYLES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                </div>
              </ControlSection>

              <button 
                onClick={handleGenerate} 
                disabled={isGenerationDisabled}
                className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg transition-all hover:bg-sky-400 disabled:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading && <LoadingSpinner size="sm" />}
                {isLoading ? 'Generating...' : `Create ${mode === GenerationMode.Lookbook ? 'Lookbook' : 'B-roll'}`}
              </button>
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>

          {/* Right Panel: Results */}
          <div className="w-full lg:w-3/5 xl:w-2/3">
            <div className="bg-brand-card rounded-xl p-4 md:p-6 border border-brand-border h-full">
              <h2 className="text-xl font-bold text-white mb-4">Your Fashion {mode === GenerationMode.Lookbook ? 'Lookbook' : 'B-roll'}</h2>
              <div className="relative min-h-[400px] w-full">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 rounded-lg">
                      <LoadingSpinner />
                      <p className="mt-4 text-brand-light">Warming up the AI stylist...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {generatedImages.map((image) => (
                      <ImageCard 
                        key={image.id}
                        image={image}
                        onZoom={() => setSelectedImage(image)}
                        onGeneratePrompt={() => handleGeneratePromptForImage(image.id)}
                        onGenerateVideo={handleGenerateVideo}
                        isGeneratingVideo={isGeneratingVideo}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center text-brand-secondary text-xs mt-8">
        <p>&copy; 2024 AI Product Showcase. Powered by Google Gemini.</p>
      </footer>

      {selectedImage && (
        <Modal imageSrc={selectedImage.src} onClose={() => setSelectedImage(null)} />
      )}

      {generatedVideoUrl && (
        <VideoModal videoSrc={generatedVideoUrl} onClose={() => setGeneratedVideoUrl(null)} />
      )}
      
      {isGeneratingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <LoadingSpinner size="lg" />
            <p className="text-xl font-semibold text-white mt-6">{videoGenerationMessage}</p>
            <p className="text-brand-light mt-2">Please keep this tab open.</p>
        </div>
      )}
    </div>
  );
}

interface ControlSectionProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const ControlSection: React.FC<ControlSectionProps> = ({ title, subtitle, children }) => {
  return (
    <div className="bg-brand-card rounded-xl p-5 border border-brand-border">
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-sm text-brand-secondary mb-4">{subtitle}</p>
      {children}
    </div>
  );
};
