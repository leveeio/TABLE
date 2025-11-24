import * as React from 'react';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Feather, Download, Loader2 } from 'lucide-react';
import { HistoryEntry } from '../types';

interface ParchmentModalProps {
  entry: HistoryEntry | null;
  onClose: () => void;
}

const ParchmentModal: React.FC<ParchmentModalProps> = ({ entry, onClose }) => {
  const parchmentRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleDownloadImage = async () => {
    if (!parchmentRef.current || isSaving) return;
    setIsSaving(true);
    
    try {
      // Access html2canvas from window (loaded via script tag in index.html)
      const html2canvas = (window as any).html2canvas;
      if (!html2canvas) {
         console.error("html2canvas not loaded");
         return;
      }

      // We need to temporarily disable the mix-blend-mode for capture 
      // because html2canvas struggles with complex blend modes sometimes.
      
      const canvas = await html2canvas(parchmentRef.current, {
        scale: 3, // Very High resolution for HD
        backgroundColor: null, // Transparent base
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `VoxNobilis_${new Date().getTime()}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to save image", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {entry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 z-50 flex gap-4">
             <button 
              onClick={(e) => { e.stopPropagation(); handleDownloadImage(); }}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-noble-gold/20 hover:bg-noble-gold/40 text-noble-gold rounded-full transition-colors border border-noble-gold/50 font-cinzel text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(138,126,86,0.2)]"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isSaving ? "Inscribing..." : "Save to Gallery"}
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex items-center justify-center h-full max-h-[90vh] w-auto aspect-[3/4] md:aspect-[1/1.3]" 
          >
            {/* The Parchment Element to Capture */}
            <div 
              ref={parchmentRef}
              className="relative w-full h-full bg-[#fcf5e5] shadow-2xl overflow-hidden flex flex-col items-center text-center p-8 md:p-12 border-4 border-[#e8dfca]"
              style={{
                boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
                borderRadius: '4px',
              }}
            >
              {/* Subtle Paper Texture - Cleaned up for HD */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }} 
              />
              
              {/* Very slight vignette, less muddy */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(160,140,100,0.1)_100%)] pointer-events-none" />
              
              {/* Content within Fixed Container */}
              <div className="relative z-10 w-full h-full flex flex-col">
                
                {/* Header Date */}
                <div className="shrink-0 font-cinzel text-xs text-[#5c4d3c] tracking-[0.3em] uppercase mb-8 md:mb-12 border-b border-[#c9bfa8] pb-4 w-2/3 mx-auto">
                  {new Date(entry.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                {/* The Noble Text - HD */}
                <div className="flex-grow flex items-center justify-center overflow-hidden px-2 md:px-6">
                   <div className="max-h-full w-full overflow-hidden relative">
                      {/* ink-text class now uses the cleaner 'ink-roughness' filter (no blur) */}
                      <p className="ink-text font-handwriting text-2xl md:text-3xl lg:text-4xl leading-relaxed text-justify hyphens-auto text-[#1a1510]">
                        <span className="float-left text-5xl md:text-7xl font-cinzel text-[#7a6e46] mr-4 mt-[-8px]">
                          {entry.transformed.charAt(0)}
                        </span>
                        {entry.transformed.slice(1)}
                      </p>
                   </div>
                </div>

                {/* Footer / Seal */}
                <div className="shrink-0 mt-8 flex flex-col items-center gap-4 w-full">
                  <div className="w-full h-px bg-[#c9bfa8]" />
                  <div className="flex items-center justify-between w-full px-4 md:px-8">
                    <div className="flex flex-col items-start">
                      <span className="font-cinzel text-[8px] md:text-[10px] text-[#8a7e56] uppercase tracking-widest">Era</span>
                      <span className="font-cormorant text-[#3d332a] italic text-sm">{entry.era || "Medieval"}</span>
                    </div>
                    
                    {/* Realistic Wax Seal - Crisper */}
                    <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full shadow-md flex items-center justify-center"
                         style={{
                           background: 'radial-gradient(circle at 35% 35%, #b64c4c, #802828)',
                           boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                         }}
                    >
                       <div className="absolute inset-0 rounded-full border-4 border-[#6a2222]/30" />
                       <div className="absolute inset-2 border border-[#efbaaa]/20 rounded-full" />
                       <Feather className="w-6 h-6 md:w-8 md:h-8 text-[#4e1d1d] opacity-60 rotate-[-15deg] drop-shadow-sm" style={{ mixBlendMode: 'multiply' }} />
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="font-cinzel text-[8px] md:text-[10px] text-[#8a7e56] uppercase tracking-widest">Scribe</span>
                      <span className="font-cormorant text-[#3d332a] italic text-sm">{entry.writer !== 'None' ? entry.writer : 'Vox Nobilis'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ParchmentModal;