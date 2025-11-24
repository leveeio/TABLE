import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Copy, BookOpen, RotateCcw, Bookmark, ScrollText, Eye } from 'lucide-react';
import { HistoryEntry } from '../types';

interface ChroniclesProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  savedParchments: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onDeleteHistory: (id: string) => void;
  onDeleteSaved: (id: string) => void;
  onViewParchment: (entry: HistoryEntry) => void;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `The ${getOrdinal(day)} of ${month}, Anno Domini ${year} • ${time}`;
};

const Chronicles: React.FC<ChroniclesProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  savedParchments, 
  onRestore, 
  onDeleteHistory,
  onDeleteSaved,
  onViewParchment
}) => {
  const [activeTab, setActiveTab] = useState<'journal' | 'treasury'>('journal');

  const activeList = activeTab === 'journal' ? history : savedParchments;
  const onDelete = activeTab === 'journal' ? onDeleteHistory : onDeleteSaved;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[500px] z-[70] bg-noble-dark border-l border-noble-gold/20 shadow-2xl flex flex-col"
          >
            {/* Texture Overlay */}
             <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
              }} 
            />

            {/* Header */}
            <div className="relative z-10 p-8 border-b border-noble-gold/20 flex items-center justify-between bg-noble-green/30">
              <div>
                <h2 className="font-cinzel text-2xl text-noble-gold tracking-widest flex items-center gap-3">
                  <BookOpen className="w-5 h-5" />
                  Chronicles
                </h2>
                <p className="font-playfair text-xs text-stone-500 italic mt-1">
                  The registry of your past decrees
                </p>
              </div>
              <button 
                onClick={onClose}
                className="text-stone-500 hover:text-noble-paper transition-colors p-2 hover:bg-white/5 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="relative z-10 flex border-b border-stone-800">
              <button
                onClick={() => setActiveTab('journal')}
                className={`flex-1 py-4 font-cinzel text-xs tracking-[0.2em] transition-colors relative ${activeTab === 'journal' ? 'text-noble-paper' : 'text-stone-600 hover:text-stone-400'}`}
              >
                Journal
                {activeTab === 'journal' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[1px] bg-noble-gold" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('treasury')}
                className={`flex-1 py-4 font-cinzel text-xs tracking-[0.2em] transition-colors relative ${activeTab === 'treasury' ? 'text-noble-gold' : 'text-stone-600 hover:text-stone-400'}`}
              >
                Treasury
                {activeTab === 'treasury' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[1px] bg-noble-gold" />
                )}
              </button>
            </div>

            {/* List */}
            <div className="relative z-10 flex-grow overflow-y-auto p-6 space-y-6">
              {activeList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-600 opacity-60">
                   {activeTab === 'journal' ? <ScrollText className="w-12 h-12 mb-4" /> : <Bookmark className="w-12 h-12 mb-4" />}
                   <p className="font-cinzel text-sm tracking-wider">
                     {activeTab === 'journal' ? "No recent writings" : "The treasury is empty"}
                   </p>
                </div>
              ) : (
                activeList.map((entry) => (
                  <motion.div
                    key={entry.id}
                    layoutId={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`group relative bg-black/40 border transition-colors rounded-sm overflow-hidden ${activeTab === 'treasury' ? 'border-noble-gold/30 hover:border-noble-gold/60' : 'border-stone-800 hover:border-noble-gold/40'}`}
                  >
                    {/* Entry Header */}
                    <div className="px-4 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-cinzel text-[10px] tracking-widest text-noble-gold/80">
                          {formatDate(entry.timestamp)}
                        </span>
                        <div className="flex gap-2 font-playfair text-[9px] text-stone-500 italic mt-0.5">
                          {entry.era && <span>{entry.era} Era</span>}
                          {entry.writer && entry.writer !== 'None' && <span>• {entry.writer}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => onViewParchment(entry)}
                           title="View as Parchment"
                           className="p-1.5 text-stone-400 hover:text-noble-gold hover:bg-white/10 rounded transition-colors"
                         >
                           <Eye className="w-3.5 h-3.5" />
                         </button>
                         <button 
                           onClick={() => onRestore(entry)}
                           title="Resurrect this text"
                           className="p-1.5 text-stone-400 hover:text-noble-paper hover:bg-white/10 rounded transition-colors"
                         >
                           <RotateCcw className="w-3.5 h-3.5" />
                         </button>
                         <button 
                           onClick={() => navigator.clipboard.writeText(entry.transformed)}
                           title="Copy Noble Text"
                           className="p-1.5 text-stone-400 hover:text-noble-paper hover:bg-white/10 rounded transition-colors"
                         >
                           <Copy className="w-3.5 h-3.5" />
                         </button>
                         <button 
                           onClick={() => onDelete(entry.id)}
                           title="Expunge from records"
                           className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                         >
                           <Trash2 className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    </div>

                    {/* Content - Clickable to open view */}
                    <div 
                      className="p-5 space-y-4 cursor-pointer"
                      onClick={() => onViewParchment(entry)}
                    >
                      <div>
                         <p className="font-cinzel text-[10px] text-stone-600 mb-1">Original</p>
                         <p className="font-playfair text-stone-400 text-sm italic line-clamp-2">
                           "{entry.original}"
                         </p>
                      </div>
                      <div className="relative pl-4 border-l-2 border-noble-gold/30">
                         <p className="font-cinzel text-[10px] text-noble-gold mb-1">Noble Translation</p>
                         <p className="font-cormorant text-noble-paper text-lg leading-relaxed line-clamp-3">
                           {entry.transformed}
                         </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="relative z-10 p-4 border-t border-stone-800 bg-noble-dark text-center">
              <span className="font-cinzel text-[10px] text-stone-600 tracking-[0.3em]">
                VOX NOBILIS ARCHIVES
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Chronicles;