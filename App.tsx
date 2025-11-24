import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Feather, MoveRight, RotateCcw, Copy, Sparkles, Loader2, BookOpen, Globe, Bookmark, Check, Hourglass, PenTool, Languages, Music, X, ChevronRight } from 'lucide-react'; 
import Background from './components/Background';
import OrnateButton from './components/OrnateButton';
import Chronicles from './components/Chronicles';
import ParchmentModal from './components/ParchmentModal';
import { transformTextToNoble, translateText } from './services/geminiService';
import { TransformationState, HistoryEntry } from './types';

const LANGUAGES = [
  "English", "Simplified Chinese", "Traditional Chinese", "Spanish", "French", "German", "Italian", 
  "Japanese", "Korean", "Russian", "Portuguese", "Latin"
];

const ERAS = [
  "Medieval", "Renaissance", "Victorian", "Ancient", "Enlightenment",
  "Industrial", "Roaring 20s", "Wild West", "Edo Period", "Cyberpunk"
];

// Writer Data with Descriptions
const WRITER_DATA: Record<string, { masterpiece: string; style: string }> = {
  "None": { masterpiece: "The Universal Chronicle", style: "Standard noble style without specific author influence." },
  "Shakespeare": { masterpiece: "Hamlet", style: "Iambic pentameter, rich metaphors, dramatic flair." },
  "Hemingway": { masterpiece: "The Old Man and the Sea", style: "Concise, stoic, direct, iceberg theory." },
  "Poe": { masterpiece: "The Raven", style: "Macabre, melancholic, atmospheric, psychological." },
  "Austen": { masterpiece: "Pride and Prejudice", style: "Witty, social commentary, irony, polite society." },
  "Twain": { masterpiece: "Huckleberry Finn", style: "Satirical, colloquial, sharp wit, regional voice." },
  "Wilde": { masterpiece: "The Picture of Dorian Gray", style: "Aesthetic, paradoxical, flamboyant, incredibly witty and cynical." },
  "Lovecraft": { masterpiece: "The Call of Cthulhu", style: "Eldritch, cosmic horror, archaic adjectives." },
  "Homer": { masterpiece: "The Iliad", style: "Epic epithets, grand scope, invocation of muses." },
  "Dante": { masterpiece: "The Divine Comedy", style: "Terza rima structure, allegorical, spiritual." },
  "Tolkien": { masterpiece: "The Lord of the Rings", style: "Mythopoeic, archaic, descriptive, high fantasy." },
  "Dostoevsky": { masterpiece: "Crime and Punishment", style: "Psychological realism, philosophical urgency, manic." },
  "Tolstoy": { masterpiece: "War and Peace", style: "Epic scope, moralistic, omniscient, detailed." },
  "Kafka": { masterpiece: "The Metamorphosis", style: "Surreal, bureaucratic, alienated, absurd." },
  "Joyce": { masterpiece: "Ulysses", style: "Stream of consciousness, experimental, complex." },
  "Woolf": { masterpiece: "Mrs. Dalloway", style: "Lyrical, introspective, impressionistic flow." },
  "Dickens": { masterpiece: "Great Expectations", style: "Vivid caricatures, social critique, dramatic." },
  "Hugo": { masterpiece: "Les Misérables", style: "Romantic grandeur, digressive, passionate." },
  "Melville": { masterpiece: "Moby-Dick", style: "Biblical cadence, nautical, dense, philosophical." },
  "Orwell": { masterpiece: "1984", style: "Clear, political, direct, journalistic." },
  "Nabokov": { masterpiece: "Lolita", style: "Complex wordplay, aesthetic, sensory details." },
  "Camus": { masterpiece: "The Stranger", style: "Absurdist, detached, plain, philosophical." },
  "Fitzgerald": { masterpiece: "The Great Gatsby", style: "Lyrical, poetic prose, jazz age romanticism." },
  "Steinbeck": { masterpiece: "The Grapes of Wrath", style: "Realistic, sympathetic, descriptive, rugged." },
  "Christie": { masterpiece: "Murder on the Orient Express", style: "Plot-driven, dialogue-heavy, mystery structure." },
  "Asimov": { masterpiece: "Foundation", style: "Rational, scientific, unadorned, idea-focused." },
};

const WRITERS = Object.keys(WRITER_DATA);

// Music Playlists: 3 Piano, 3 Violin, 3 Cello per Era (approximate for some eras to maintain vibe)
// Using Public Domain / Creative Commons sources from Archive.org
const ERA_MUSIC_PLAYLISTS: Record<string, string[]> = {
  "Medieval": [
    // Cello (Dark/Moody)
    "https://archive.org/download/BachCelloSuiteNo1/01_Prelude.mp3",
    "https://archive.org/download/JohnMichelCello-J.s.bachCelloSuiteNo.3InCMajor/01_Prelude.mp3",
    "https://archive.org/download/JohnMichelCello-J.s.bachCelloSuiteNo.2InDMinor/01_Prelude.mp3",
    // Violin (Solo/Folk-ish)
    "https://archive.org/download/MassenetMeditationFromThais/Massenet_Meditation_from_Thais.mp3", // Meditative
    "https://archive.org/download/BachPartitaNo.3InEMajor/06_Bourree.mp3",
    "https://archive.org/download/BachPartitaNo.2InDMinor/04_Giga.mp3",
    // Piano/Harp/Lute (Atmospheric)
    "https://archive.org/download/Greensleeves_201305/Greensleeves.mp3", // Lute
    "https://archive.org/download/GymnopedieNo1/GymnopedieNo1.mp3", // Satie (Timeless)
    "https://archive.org/download/Gnossienne_No_1/Erik_Satie_-_Gnossienne_No_1.mp3"
  ],
  "Renaissance": [
    // Lute/Strings
    "https://archive.org/download/DowlandLachrimae/01_LachrimaeAntiquae.mp3",
    "https://archive.org/download/DowlandLachrimae/02_LachrimaeAntiquaeNovae.mp3",
    "https://archive.org/download/DowlandLachrimae/07_LachrimaeVerae.mp3",
    // Violin
    "https://archive.org/download/VivaldiFourSeasons_201708/01_Spring_Allegro.mp3",
    "https://archive.org/download/VivaldiFourSeasons_201708/06_Summer_Presto.mp3", 
    "https://archive.org/download/VivaldiFourSeasons_201708/03_Spring_Allegro_Pastorale.mp3",
    // Piano (Harpsichord feel equivalents)
    "https://archive.org/download/BachGoldbergVariations/01_Aria.mp3",
    "https://archive.org/download/BachInventionNo1/Bach_Invention_No_1_C_Major.mp3",
    "https://archive.org/download/BachInventionNo8/Bach_Invention_No_8_F_Major.mp3"
  ],
  "Victorian": [
    // Piano (Romantic)
    "https://archive.org/download/ChopinNocturneOp9No2/Chopin_Nocturne_Op_9_No_2.mp3",
    "https://archive.org/download/ChopinWaltzOp64No1/Chopin_Waltz_Op_64_No_1_Minute_Waltz.mp3",
    "https://archive.org/download/LisztLiebestraumNo3/Liszt_Liebestraum_No_3.mp3",
    // Violin
    "https://archive.org/download/PaganiniCaprice24/Paganini_Caprice_24.mp3",
    "https://archive.org/download/KreislerLiebesleid/Kreisler_Liebesleid.mp3",
    "https://archive.org/download/ElgarSalutDAmour/Elgar_Salut_d_Amour.mp3",
    // Cello
    "https://archive.org/download/Saint-saensTheSwan-Cello/TheSwan.mp3",
    "https://archive.org/download/FaureElegie/Faure_Elegie.mp3",
    "https://archive.org/download/ElgarCelloConcerto/01_Adagio_Moderato.mp3"
  ],
  "Enlightenment": [
    // Piano (Classical)
    "https://archive.org/download/MozartEineKleineNachtmusik_201709/Mozart_Eine_Kleine_Nachtmusik_1.mp3",
    "https://archive.org/download/MozartSonataK545/01_Allegro.mp3",
    "https://archive.org/download/BeethovenFurElise/Beethoven_Fur_Elise.mp3",
    // Violin
    "https://archive.org/download/MozartViolinConcertoNo3/01_Allegro.mp3",
    "https://archive.org/download/BachConcertoForTwoViolins/01_Vivace.mp3",
    "https://archive.org/download/BoccheriniMinuet/Boccherini_Minuet.mp3",
    // Cello
    "https://archive.org/download/HaydnCelloConcertoNo1/01_Moderato.mp3",
    "https://archive.org/download/BoccheriniCelloConcerto/01_Allegro_Moderato.mp3",
    "https://archive.org/download/BeethovenCelloSonataNo3/01_Allegro_ma_non_tanto.mp3"
  ],
  "Ancient": [
    // Generic "Ancient" feeling (Reconstructions + Timeless)
    "https://archive.org/download/ancient-greek-music-seikilos-epitaph/Ancient%20Greek%20Music%20-%20Seikilos%20Epitaph.mp3",
    "https://archive.org/download/GymnopedieNo1/GymnopedieNo1.mp3", // Satie works everywhere
    "https://archive.org/download/Gnossienne_No_1/Erik_Satie_-_Gnossienne_No_1.mp3",
    // Flute/Lyre equivalents
    "https://archive.org/download/DebussySyrinx/Debussy_Syrinx.mp3",
    "https://archive.org/download/GluckDanceOfTheBlessedSpirits/Gluck_Dance_of_the_Blessed_Spirits.mp3",
    "https://archive.org/download/VaughanWilliamsFantasiaOnGreensleeves/Vaughan_Williams_Fantasia_on_Greensleeves.mp3",
    // Strings (Simple)
    "https://archive.org/download/BachCelloSuiteNo1/01_Prelude.mp3",
    "https://archive.org/download/BachCelloSuiteNo1/04_Sarabande.mp3",
    "https://archive.org/download/BachCelloSuiteNo5/04_Sarabande.mp3"
  ],
  "Industrial": [
    // Heavy/Dark Classical
    "https://archive.org/download/HolstThePlanets/01_Mars.mp3",
    "https://archive.org/download/BeethovenSymphonyNo5/01_Allegro_con_brio.mp3",
    "https://archive.org/download/WagnerRideOfTheValkyries/Wagner_Ride_of_the_Valkyries.mp3",
    // Piano (Mechanical/Repetitive)
    "https://archive.org/download/MoonlightSonata_754/Beethoven-MoonlightSonata.mp3", // 3rd movement ideally, but 1st is dark
    "https://archive.org/download/RachmaninoffPreludeInCSharpMinor/Rachmaninoff_Prelude_in_C_Sharp_Minor.mp3",
    "https://archive.org/download/ProkofievToccata/Prokofiev_Toccata.mp3",
    // Cello/Low Strings
    "https://archive.org/download/DvorakCelloConcerto/01_Allegro.mp3",
    "https://archive.org/download/ElgarCelloConcerto/01_Adagio_Moderato.mp3",
    "https://archive.org/download/ShostakovichCelloConcertoNo1/01_Allegretto.mp3"
  ],
  "Roaring 20s": [
    // Piano (Ragtime/Jazz)
    "https://archive.org/download/ScottJoplinMapleLeafRag/ScottJoplin-MapleLeafRag.mp3",
    "https://archive.org/download/ScottJoplinTheEntertainer/ScottJoplin-TheEntertainer.mp3",
    "https://archive.org/download/GershwinRhapsodyInBlue/Gershwin_Rhapsody_in_Blue.mp3",
    // Violin (Jazz/Swing style)
    "https://archive.org/download/GrappelliReinhardtMinorSwing/Minor_Swing.mp3",
    "https://archive.org/download/KreislerLiebesfreud/Kreisler_Liebesfreud.mp3",
    "https://archive.org/download/MontiCzardas/Monti_Czardas.mp3",
    // Cello (Melodic/Romantic backup)
    "https://archive.org/download/GershwinSummertime/Summertime_Cello.mp3", // Hypothetical generic
    "https://archive.org/download/Saint-saensTheSwan-Cello/TheSwan.mp3",
    "https://archive.org/download/ElgarSalutDAmour/Elgar_Salut_d_Amour.mp3"
  ],
  "Wild West": [
    // Piano (Saloon)
    "https://archive.org/download/ScottJoplinMapleLeafRag/ScottJoplin-MapleLeafRag.mp3",
    "https://archive.org/download/ScottJoplinEliteSyncopations/ScottJoplin-EliteSyncopations.mp3",
    "https://archive.org/download/CamptownRacesPiano/Camptown_Races.mp3",
    // Violin (Fiddle style)
    "https://archive.org/download/TurkeyInTheStraw/Turkey_in_the_Straw.mp3",
    "https://archive.org/download/RedRiverValley_201605/RedRiverValley.mp3",
    "https://archive.org/download/OhSusannaViolin/Oh_Susanna.mp3",
    // Cello/Guitar (Folk)
    "https://archive.org/download/HomeOnTheRangeCello/Home_on_the_Range.mp3",
    "https://archive.org/download/DvorakNewWorldSymphony/02_Largo.mp3", // Going Home theme
    "https://archive.org/download/ShenandoahCello/Shenandoah.mp3"
  ],
  "Edo Period": [
    // Flute (Shakuhachi)
    "https://archive.org/download/Shakuhachi_Honkyoku/Shakuhachi.mp3",
    "https://archive.org/download/JapaneseFluteMusic/Traditional_Japanese_Flute.mp3",
    "https://archive.org/download/KotoMusic/Sakura_Sakura.mp3",
    // Strings (Koto/Shamisen feel) -> Using Harp/Pizzicato Violin
    "https://archive.org/download/DebussyPagodes/Debussy_Pagodes.mp3",
    "https://archive.org/download/RavelEmpressOfThePagodas/Ravel_Empress_of_the_Pagodas.mp3",
    "https://archive.org/download/PizzicatoPolka/Pizzicato_Polka.mp3",
    // Cello/Low (Meditative)
    "https://archive.org/download/BachCelloSuiteNo5/01_Prelude.mp3",
    "https://archive.org/download/BachCelloSuiteNo2/04_Sarabande.mp3",
    "https://archive.org/download/CelloDrone/Cello_Drone_D.mp3"
  ],
  "Cyberpunk": [
    // Modern/Synth/Abstract
    "https://archive.org/download/NASA_Sounds/Kepler_Star_KIC12268220C_Light_Curve_Waves_to_Sound.mp3",
    "https://archive.org/download/NASA_Sounds/Saturn_Radio_Emissions.mp3",
    "https://archive.org/download/HolstThePlanets/07_Neptune.mp3",
    // Piano (Minimalist)
    "https://archive.org/download/GymnopedieNo1/GymnopedieNo1.mp3",
    "https://archive.org/download/GlassMetamorphosisOne/Glass_Metamorphosis_One.mp3", // Philip Glass style
    "https://archive.org/download/SatieGnossienneNo3/Satie_Gnossienne_No_3.mp3",
    // Cello/Violin (Electric/Processed feel)
    "https://archive.org/download/BachCelloSuiteNo1/01_Prelude.mp3", // Classic but fits sci-fi
    "https://archive.org/download/KodalyCelloSonata/01_Allegro.mp3",
    "https://archive.org/download/BartokViolinConcertoNo2/01_Allegro.mp3"
  ]
};

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [status, setStatus] = useState<TransformationState>(TransformationState.IDLE);
  const [isChroniclesOpen, setIsChroniclesOpen] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [savedParchments, setSavedParchments] = useState<HistoryEntry[]>([]);
  const [useArchaic, setUseArchaic] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [selectedEra, setSelectedEra] = useState('Medieval');
  const [selectedWriter, setSelectedWriter] = useState('None');
  const [justSaved, setJustSaved] = useState(false);
  const [viewingEntry, setViewingEntry] = useState<HistoryEntry | null>(null);
  const [isTranslatingOutput, setIsTranslatingOutput] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  
  // Audio state
  const [activeMusicEra, setActiveMusicEra] = useState<string | null>(null); // Null means silence/ambience only
  const [isMusicMenuOpen, setIsMusicMenuOpen] = useState(false);
  const [currentTrackUrl, setCurrentTrackUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null); // Ambience
  const musicRef = useRef<HTMLAudioElement | null>(null); // Music Track

  // Writer Info Modal
  const [viewingWriterInfo, setViewingWriterInfo] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-resize textarea
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history/saved from local storage on mount
  useEffect(() => {
    const loadedHistory = localStorage.getItem('vox_nobilis_history');
    if (loadedHistory) {
      try { setHistory(JSON.parse(loadedHistory)); } catch (e) { console.error(e); }
    }
    const loadedSaved = localStorage.getItem('vox_nobilis_saved');
    if (loadedSaved) {
      try { setSavedParchments(JSON.parse(loadedSaved)); } catch (e) { console.error(e); }
    }
  }, []);

  // Persist data
  useEffect(() => {
    localStorage.setItem('vox_nobilis_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('vox_nobilis_saved', JSON.stringify(savedParchments));
  }, [savedParchments]);

  // Safe volume setter helper to prevent "Operation not supported" on iOS
  const setVolumeSafe = (audio: HTMLAudioElement | null, vol: number) => {
    if (!audio) return;
    try {
      audio.volume = vol;
    } catch (e) {
      // Ignore volume setting errors on devices that don't support it (iOS)
    }
  };

  // Sync musicRef with selection (handling switch)
  useEffect(() => {
    if (activeMusicEra && musicRef.current) {
        // If era changed or enabled, pick a random track from that Era's playlist
        playRandomTrackForEra(activeMusicEra);
    } else if (!activeMusicEra && musicRef.current) {
        musicRef.current.pause();
        // Resume ambience if it was paused (optional, currently we keep ambience looping)
        if (audioRef.current) {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
             playPromise.catch(() => {});
          }
        }
    }
  }, [activeMusicEra]);

  const getRandomTrack = (era: string) => {
    const playlist = ERA_MUSIC_PLAYLISTS[era];
    if (!playlist || playlist.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * playlist.length);
    return playlist[randomIndex];
  };

  const playRandomTrackForEra = (era: string) => {
    const url = getRandomTrack(era);
    if (url && musicRef.current) {
        setCurrentTrackUrl(url);
        musicRef.current.src = url;
        musicRef.current.load(); // Ensure source is loaded before playing
        
        const playPromise = musicRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.warn("Music play failed/prevented:", e);
            });
        }
        
        // Slightly lower ambience volume when music plays
        setVolumeSafe(audioRef.current, 0.2);
    }
  };

  const handleTrackEnded = () => {
    if (activeMusicEra) {
        playRandomTrackForEra(activeMusicEra);
    }
  };

  const handleStartApp = () => {
    // CRITICAL for Mobile: Play audio synchronously within the user interaction event
    if (audioRef.current) {
      setVolumeSafe(audioRef.current, 0.4);
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio autoplay prevented by browser policy (Ambience):", error);
        });
      }
    }
    // "Warm up" the music ref
    if (musicRef.current) {
        musicRef.current.load(); 
    }

    setHasStarted(true);
  };

  const handleEraMusicSelect = (era: string | null) => {
    setActiveMusicEra(era);
    setIsMusicMenuOpen(false);
    
    if (era === null) {
      // Return ambience to normal volume
      setVolumeSafe(audioRef.current, 0.4);
    }
  };

  const handleTransform = async () => {
    if (!inputText.trim()) return;

    setStatus(TransformationState.THINKING);
    setJustSaved(false);
    setShowTranslateMenu(false); // Close menu if open
    try {
      const result = await transformTextToNoble(inputText, useArchaic, targetLanguage, selectedEra, selectedWriter);
      setOutputText(result);
      setStatus(TransformationState.COMPLETED);
      
      const newEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        original: inputText,
        transformed: result,
        timestamp: Date.now(),
        era: selectedEra,
        writer: selectedWriter
      };
      
      setHistory(prev => [newEntry, ...prev]);
      
    } catch (error) {
      setStatus(TransformationState.ERROR);
    }
  };

  const handleOutputTranslation = async (lang: string) => {
    if (!outputText) return;
    setIsTranslatingOutput(true);
    setShowTranslateMenu(false);
    try {
      const translated = await translateText(outputText, lang);
      setOutputText(translated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslatingOutput(false);
    }
  };

  const handleSaveParchment = () => {
    if (!outputText) return;
    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      original: inputText,
      transformed: outputText,
      timestamp: Date.now(),
      era: selectedEra,
      writer: selectedWriter
    };
    setSavedParchments(prev => [newEntry, ...prev]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
  };

  const reset = () => {
    setInputText('');
    setOutputText('');
    setStatus(TransformationState.IDLE);
    setJustSaved(false);
    setShowTranslateMenu(false);
  };

  const handleRestoreEntry = (entry: HistoryEntry) => {
    setInputText(entry.original);
    setOutputText(entry.transformed);
    setSelectedEra(entry.era || 'Medieval');
    setSelectedWriter(entry.writer || 'None');
    setStatus(TransformationState.COMPLETED);
    setIsChroniclesOpen(false);
  };

  // Long press logic for Writers
  const handleWriterMouseDown = (writer: string) => {
    longPressTimer.current = setTimeout(() => {
      setViewingWriterInfo(writer);
    }, 600); // 600ms long press
  };

  const handleWriterMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleWriterClick = (writer: string) => {
    setSelectedWriter(writer);
  };

  return (
    <div className="min-h-screen w-full relative font-cormorant text-noble-text selection:bg-noble-gold selection:text-noble-dark overflow-x-hidden">
      <Background />
      
      {/* Audio Sources */}
      <audio 
        ref={audioRef} 
        loop 
        crossOrigin="anonymous"
        src="https://archive.org/download/GymnopedieNo1/GymnopedieNo1.mp3" 
      />
      <audio
        ref={musicRef}
        crossOrigin="anonymous"
        onEnded={handleTrackEnded} // Auto-play next random track
      />

      <ParchmentModal 
        entry={viewingEntry} 
        onClose={() => setViewingEntry(null)} 
      />

      {/* Writer Info Modal */}
      <AnimatePresence>
        {viewingWriterInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setViewingWriterInfo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-noble-dark border border-noble-gold p-6 max-w-sm w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setViewingWriterInfo(null)}
                className="absolute top-2 right-2 text-stone-500 hover:text-noble-gold"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h3 className="font-cinzel text-2xl text-noble-gold mb-1">{viewingWriterInfo}</h3>
                <div className="w-12 h-px bg-stone-600 mx-auto mb-4" />
                
                <div className="mb-4">
                  <p className="font-cinzel text-[10px] uppercase tracking-widest text-stone-500 mb-1">Masterpiece</p>
                  <p className="font-playfair text-lg italic text-noble-paper">
                    {WRITER_DATA[viewingWriterInfo].masterpiece}
                  </p>
                </div>

                <div>
                  <p className="font-cinzel text-[10px] uppercase tracking-widest text-stone-500 mb-1">Signature Style</p>
                  <p className="font-cormorant text-stone-300 leading-relaxed">
                    {WRITER_DATA[viewingWriterInfo].style}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Chronicles 
        isOpen={isChroniclesOpen} 
        onClose={() => setIsChroniclesOpen(false)}
        history={history}
        savedParchments={savedParchments}
        onRestore={handleRestoreEntry}
        onDeleteHistory={(id) => setHistory(h => h.filter(i => i.id !== id))}
        onDeleteSaved={(id) => setSavedParchments(s => s.filter(i => i.id !== id))}
        onViewParchment={(entry) => setViewingEntry(entry)}
      />

      {/* Start Screen */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5 }}
              className="text-center flex flex-col items-center"
            >
              <div className="w-px h-24 bg-gradient-to-b from-transparent via-noble-gold to-transparent mb-8"></div>
              <h1 className="font-cinzel text-5xl md:text-7xl text-noble-paper tracking-[0.15em] mb-6 drop-shadow-[0_0_15px_rgba(138,126,86,0.5)]">
                The Scribe's Desk
              </h1>
              <p className="font-playfair italic text-noble-gold/60 text-xl tracking-widest mb-12">
                Vox Nobilis
              </p>
              
              <OrnateButton onClick={handleStartApp}>
                Enter the Study
              </OrnateButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main UI */}
      {hasStarted && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center pt-8 pb-32 md:pb-12"
        >
          {/* Top Navigation */}
          <div className="absolute top-8 right-8 z-50 flex gap-3">
             {/* Music Menu */}
             <div className="relative">
                <button
                  onClick={() => setIsMusicMenuOpen(!isMusicMenuOpen)}
                  className={`group flex items-center justify-center w-10 h-10 rounded-full glass-panel border transition-all duration-300 ${activeMusicEra ? 'border-noble-gold text-noble-gold' : 'border-transparent text-stone-500 hover:text-noble-paper'}`}
                  title="Select Era Music"
                >
                  <Music className={`w-5 h-5 ${activeMusicEra ? 'animate-pulse' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isMusicMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-noble-dark border border-stone-800 shadow-xl rounded-sm overflow-hidden z-[60]"
                    >
                      <div className="px-3 py-2 border-b border-stone-800 font-cinzel text-[10px] text-stone-500 uppercase tracking-widest">
                        Accompaniment
                      </div>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                         <button
                           onClick={() => handleEraMusicSelect(null)}
                           className={`w-full text-left px-4 py-2 text-xs font-cinzel hover:bg-white/5 transition-colors ${activeMusicEra === null ? 'text-noble-gold' : 'text-stone-400'}`}
                         >
                           Silent (Ambience)
                         </button>
                         {Object.keys(ERA_MUSIC_PLAYLISTS).map((era) => (
                           <button
                             key={era}
                             onClick={() => handleEraMusicSelect(era)}
                             className={`w-full text-left px-4 py-2 text-xs font-cinzel hover:bg-white/5 transition-colors ${activeMusicEra === era ? 'text-noble-gold bg-noble-gold/10' : 'text-stone-400'}`}
                           >
                             {era}
                           </button>
                         ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

            <button
              onClick={() => setIsChroniclesOpen(true)}
              className="group flex items-center gap-3 px-4 py-2 rounded-full glass-panel border border-transparent hover:border-noble-gold/50 transition-all duration-300"
            >
              <span className="hidden md:block font-cinzel text-xs tracking-widest text-noble-gold group-hover:text-noble-paper transition-colors">
                Chronicles
              </span>
              <BookOpen className="w-5 h-5 text-noble-gold group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Header */}
          <header className="mb-8 text-center mt-8">
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-noble-gold to-transparent mx-auto mb-6 opacity-50"></div>
            <h2 className="font-cinzel text-3xl md:text-4xl text-noble-paper tracking-widest mb-2">
              The Scribe's Desk
            </h2>
            <p className="font-playfair italic text-stone-500 max-w-md mx-auto">
              Choose your era, channel a master, and imbue your words with eternity.
            </p>
          </header>

          {/* Editor Container */}
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* LEFT: Input (Modern) */}
            <div className="glass-panel p-6 md:p-8 relative group rounded-sm min-h-[500px] flex flex-col">
              
              {/* Control Row 1: Language & Archaic */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
                <div className="relative group/lang flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-stone-600 group-hover/lang:text-noble-gold transition-colors" />
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="bg-transparent text-[10px] font-cinzel text-stone-500 hover:text-noble-gold border-none outline-none cursor-pointer uppercase tracking-widest transition-colors appearance-none pr-4"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang} value={lang} className="bg-noble-dark text-noble-text">{lang}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={() => setUseArchaic(!useArchaic)}
                    className="flex items-center gap-2 group z-20 cursor-pointer"
                  >
                    <span className={`text-[10px] font-cinzel tracking-widest uppercase transition-colors ${useArchaic ? 'text-noble-gold' : 'text-stone-600 group-hover:text-noble-gold'}`}>
                      Use 'Thou'
                    </span>
                    <div className={`w-2.5 h-2.5 border rotate-45 transition-all duration-300 ${useArchaic ? 'bg-noble-gold border-noble-gold shadow-[0_0_8px_rgba(138,126,86,0.5)]' : 'border-stone-600 group-hover:border-noble-gold'}`} />
                  </button>
              </div>

              {/* Control Row 2: Eras */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hourglass className="w-3 h-3 text-stone-500" />
                  <span className="text-[10px] font-cinzel text-stone-500 tracking-widest uppercase">Era</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {ERAS.map(era => (
                    <button
                      key={era}
                      onClick={() => setSelectedEra(era)}
                      className={`flex-shrink-0 px-3 py-1.5 border text-[10px] font-cinzel uppercase tracking-wider rounded-sm transition-all duration-300 ${selectedEra === era ? 'border-noble-gold text-noble-gold bg-noble-gold/10' : 'border-stone-800 text-stone-600 hover:border-stone-600'}`}
                    >
                      {era}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control Row 3: Writers */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 justify-between w-full">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-3 h-3 text-stone-500" />
                    <span className="text-[10px] font-cinzel text-stone-500 tracking-widest uppercase">Writer Influence</span>
                  </div>
                  <span className="text-[9px] font-cinzel text-stone-600 italic">Long press for info</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {WRITERS.map(writer => (
                    <button
                      key={writer}
                      onClick={() => handleWriterClick(writer)}
                      onMouseDown={() => handleWriterMouseDown(writer)}
                      onMouseUp={handleWriterMouseUp}
                      onMouseLeave={handleWriterMouseUp}
                      onTouchStart={() => handleWriterMouseDown(writer)}
                      onTouchEnd={handleWriterMouseUp}
                      className={`flex-shrink-0 px-3 py-1.5 border text-[10px] font-cinzel uppercase tracking-wider rounded-sm transition-all duration-300 select-none ${selectedWriter === writer ? 'border-noble-gold text-noble-gold bg-noble-gold/10' : 'border-stone-800 text-stone-600 hover:border-stone-600'}`}
                    >
                      {writer}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Input Area */}
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your modern message here..."
                className="flex-grow w-full bg-transparent border-none resize-none outline-none text-xl font-playfair text-stone-300 placeholder-stone-800 leading-relaxed"
                spellCheck={false}
                disabled={status === TransformationState.THINKING}
              />

              <div className="mt-4 flex justify-end">
                <div className={`transition-opacity duration-300 ${inputText ? 'opacity-100' : 'opacity-0'}`}>
                  <Feather className="w-5 h-5 text-stone-600" />
                </div>
              </div>
            </div>

            {/* RIGHT: Output (Noble) */}
            <div className="relative min-h-[500px] flex flex-col">
              {/* Action Area */}
              <div className="absolute -top-12 lg:top-1/2 lg:-left-8 lg:-translate-y-1/2 left-1/2 -translate-x-1/2 z-20">
                {status === TransformationState.THINKING ? (
                  <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center border border-noble-gold/40">
                      <Loader2 className="w-6 h-6 text-noble-gold animate-spin" />
                  </div>
                ) : (
                  <button 
                    onClick={handleTransform}
                    disabled={!inputText || status === TransformationState.THINKING}
                    className="w-12 h-12 lg:w-16 lg:h-16 rounded-full glass-panel flex items-center justify-center border border-stone-700 hover:border-noble-gold hover:scale-110 transition-all duration-300 group disabled:opacity-50 disabled:hover:scale-100 disabled:hover:border-stone-700"
                  >
                      <MoveRight className="w-5 h-5 lg:w-6 lg:h-6 text-stone-400 group-hover:text-noble-gold transition-colors lg:hidden rotate-90" />
                      <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-stone-400 group-hover:text-noble-gold transition-colors hidden lg:block" />
                  </button>
                )}
              </div>

              {/* The Output Panel */}
              <div className={`glass-panel p-6 md:p-8 relative rounded-sm h-full flex flex-col transition-all duration-1000 ${status === TransformationState.COMPLETED ? 'border-noble-gold/30 bg-noble-green/20' : 'border-stone-800'}`}>
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <div className="text-xs font-cinzel text-noble-gold tracking-widest uppercase flex items-center gap-2">
                    Noble Script
                    {status === TransformationState.COMPLETED && <Sparkles className="w-3 h-3" />}
                  </div>
                </div>

                <div className="flex-grow mt-8 relative overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode='wait'>
                      {status === TransformationState.COMPLETED && outputText ? (
                        <motion.div
                          initial={{ opacity: 0, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="text-xl font-cormorant text-noble-paper leading-loose italic select-text whitespace-pre-wrap"
                        >
                          "{outputText}"
                        </motion.div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-800 italic font-playfair text-lg select-none">
                            The parchment awaits ink...
                        </div>
                      )}
                  </AnimatePresence>
                </div>

                {/* Actions Footer */}
                {status === TransformationState.COMPLETED && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 flex flex-wrap items-center justify-between border-t border-white/5 pt-4 gap-2"
                  >
                    {/* Translation Section (Left aligned) */}
                    <div className="relative">
                       {showTranslateMenu ? (
                         <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                           <button onClick={() => setShowTranslateMenu(false)} className="text-stone-500 hover:text-white"><X className="w-4 h-4" /></button>
                           <div className="h-6 w-px bg-stone-700 mx-1"></div>
                           <div className="flex gap-2 overflow-x-auto max-w-[200px] hide-scrollbar pb-1">
                              {LANGUAGES.map(lang => (
                                <button
                                  key={lang}
                                  onClick={() => handleOutputTranslation(lang)}
                                  className="text-[10px] font-cinzel uppercase text-stone-400 hover:text-noble-gold whitespace-nowrap px-2 py-1 border border-transparent hover:border-noble-gold/30 rounded"
                                >
                                  {lang}
                                </button>
                              ))}
                           </div>
                         </div>
                       ) : (
                         <button 
                           onClick={() => setShowTranslateMenu(true)}
                           disabled={isTranslatingOutput}
                           className="flex items-center gap-2 text-xs font-cinzel text-stone-500 hover:text-noble-gold transition-colors uppercase tracking-widest px-2 py-1"
                         >
                           {isTranslatingOutput ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                           Translate
                         </button>
                       )}
                    </div>

                    {/* Standard Actions (Right aligned) */}
                    <div className="flex items-center gap-4">
                        <button 
                          onClick={handleSaveParchment}
                          disabled={justSaved}
                          className={`flex items-center gap-2 text-xs font-cinzel transition-colors uppercase tracking-widest ${justSaved ? 'text-noble-gold' : 'text-stone-500 hover:text-noble-gold'}`}
                        >
                          {justSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />} 
                          {justSaved ? 'Kept' : 'Keep'}
                        </button>
                        <div className="w-px h-4 bg-white/10 self-center" />
                        <button 
                          onClick={copyToClipboard}
                          className="flex items-center gap-2 text-xs font-cinzel text-stone-500 hover:text-noble-gold transition-colors uppercase tracking-widest"
                        >
                          <Copy className="w-4 h-4" /> Copy
                        </button>
                        <button 
                          onClick={reset}
                          className="flex items-center gap-2 text-xs font-cinzel text-stone-500 hover:text-noble-gold transition-colors uppercase tracking-widest"
                        >
                          <RotateCcw className="w-4 h-4" /> Reset
                        </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="fixed bottom-0 left-0 right-0 p-4 md:p-6 flex items-end justify-center z-40 pointer-events-none"
          >
             <div className="text-[10px] font-cinzel tracking-[0.3em] text-stone-800 mb-2">
               Vox Nobilis
             </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default App;