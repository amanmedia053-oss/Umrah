import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, SkipBack, SkipForward, Settings as SettingsIcon, 
  Home, Info, Share2, Star, MessageCircle, Send, Mail,
  Headphones, ChevronLeft, Moon, Sun, Check
} from 'lucide-react';
import { Lesson, AppSettings, ThemeColor } from './types';
import { THEME_COLORS, ABOUT_US_TEXT } from './constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [view, setView] = useState<'splash' | 'home' | 'player' | 'settings' | 'about'>('splash');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('umrah_settings');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      themeColor: 'orange',
      autoPlayNext: true
    };
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load lessons
  useEffect(() => {
    fetch('/lessons.json')
      .then(res => res.json())
      .then(data => setLessons(data));
    
    // Splash screen timer
    const timer = setTimeout(() => setView('home'), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Sync settings to localStorage and DOM
  useEffect(() => {
    localStorage.setItem('umrah_settings', JSON.stringify(settings));
    // Apply to both html and body for maximum compatibility
    document.documentElement.classList.toggle('dark', settings.darkMode);
    document.body.classList.toggle('dark', settings.darkMode);
    document.documentElement.setAttribute('data-theme', settings.themeColor);
  }, [settings]);

  // Audio Logic
  useEffect(() => {
    if (currentLesson && audioRef.current) {
      audioRef.current.src = currentLesson.audioUrl;
      if (isPlaying) audioRef.current.play();
    }
  }, [currentLesson]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (settings.autoPlayNext && currentLesson) {
      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex < lessons.length - 1) {
        setCurrentLesson(lessons[currentIndex + 1]);
        setIsPlaying(true);
      }
    }
  };

  const seek = (amount: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration, audioRef.current.currentTime + amount));
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'د عمرې آډيو لارښود',
        text: 'د عمرې مکمل آډيو لارښود اپلیکیشن ډاونلوډ کړئ.',
        url: window.location.href,
      });
    }
  };

  // --- Components ---

  const SplashScreen = () => {
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 1;
        });
      }, 45); // Roughly 5 seconds to reach 100
      return () => clearInterval(interval);
    }, []);

    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-black"
      >
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-32 h-32 bg-[var(--primary)] rounded-3xl flex items-center justify-center shadow-2xl shadow-[var(--primary)]/20 mb-6"
        >
          <Headphones size={64} className="text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">د عمرې آډيو لارښود</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Version 1.0.0</p>
        
        <div className="w-48 h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[var(--primary)]"
            initial={{ width: 0 }}
            animate={{ width: `${loadingProgress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 font-mono">{loadingProgress}%</p>
      </motion.div>
    );
  };

  const Header = ({ title, showBack = false }: { title: string, showBack?: boolean }) => (
    <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/90 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors dark:text-white">
            <ChevronLeft size={24} className="rotate-180" />
          </button>
        )}
        <h2 className="text-xl font-bold dark:text-white">{title}</h2>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setView('settings')} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors dark:text-white">
          <SettingsIcon size={20} />
        </button>
      </div>
    </div>
  );

  const HomeScreen = () => (
    <div className="pb-24">
      <Header title="کورپاڼه" />
      <div className="p-4">
        <div className="bg-[var(--primary)] rounded-3xl p-6 text-white mb-6 shadow-xl shadow-[var(--primary)]/20 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">د عمرې مکمل آډيو لارښود</h1>
            <p className="opacity-90 text-sm leading-relaxed">
              په دې اپلیکیشن کې تاسو د عمرې ټول اړین درسونه په آډیو بڼه اوریدلی شئ.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Headphones size={160} />
          </div>
        </div>

        <div className="space-y-4">
          {lessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setCurrentLesson(lesson);
                setView('player');
                setIsPlaying(true);
              }}
              className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                <Headphones size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg dark:text-white">{lesson.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{lesson.duration}</p>
              </div>
              <div className="w-10 h-10 bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 rounded-full flex items-center justify-center text-[var(--primary)]">
                <Play size={20} fill="currentColor" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const PlayerScreen = () => (
    <>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setView('home')}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />
      
      {/* Bottom Sheet */}
      <motion.div 
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 rounded-t-[2.5rem] flex flex-col max-h-[92vh] shadow-2xl overflow-hidden"
      >
        {/* Drag Handle */}
        <div className="w-full flex justify-center py-4 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-12 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-6">
            <button onClick={() => setView('home')} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
              <ChevronLeft size={28} className="rotate-180" />
            </button>
            <h2 className="font-bold text-lg dark:text-white">اوسنی درس</h2>
            <div className="w-10" />
          </div>

          <motion.div 
            animate={{ 
              scale: isPlaying ? [1, 1.02, 1] : 1,
            }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-56 h-56 bg-[var(--primary)] rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-[var(--primary)]/30 mb-8"
          >
            <Headphones size={100} className="text-white" />
          </motion.div>

          <h1 className="text-2xl font-bold mb-2 dark:text-white text-center">{currentLesson?.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs text-center text-sm">
            {currentLesson?.description}
          </p>

          <div className="w-full space-y-6">
            <div className="space-y-3">
              <div className="relative h-2.5 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  className="absolute top-0 right-0 h-full bg-[var(--primary)]"
                  style={{ width: `${progress}%` }}
                />
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  value={progress}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (audioRef.current && audioRef.current.duration) {
                      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
                      setProgress(val);
                    }
                  }}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-slate-400 dark:text-zinc-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-10">
              <button onClick={() => seek(-10)} className="p-3 text-slate-400 hover:text-[var(--primary)] transition-colors">
                <SkipBack size={36} />
              </button>
              <button 
                onClick={togglePlay}
                className="w-20 h-20 bg-[var(--primary)] rounded-full flex items-center justify-center text-white shadow-xl shadow-[var(--primary)]/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="mr-1" />}
              </button>
              <button onClick={() => seek(10)} className="p-3 text-slate-400 hover:text-[var(--primary)] transition-colors">
                <SkipForward size={36} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );

  const SettingsScreen = () => (
    <div className="pb-24">
      <Header title="ترتیبات" showBack />
      <div className="p-4 space-y-6">
        <section className="bg-white dark:bg-zinc-950 rounded-3xl p-4 border border-slate-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                <Moon size={20} />
              </div>
              <span className="font-bold dark:text-white">د شپې حالت</span>
            </div>
            <button 
              onClick={() => setSettings(s => ({ ...s, darkMode: !s.darkMode }))}
              className={cn(
                "w-14 h-8 rounded-full transition-colors relative",
                settings.darkMode ? "bg-[var(--primary)]" : "bg-slate-200 dark:bg-zinc-800"
              )}
            >
              <div className={cn(
                "w-6 h-6 bg-white rounded-full absolute top-1 transition-all",
                settings.darkMode ? "left-1" : "left-7"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-300">
                <Play size={20} />
              </div>
              <span className="font-bold dark:text-white">بل درس اوتومات شروع شي</span>
            </div>
            <button 
              onClick={() => setSettings(s => ({ ...s, autoPlayNext: !s.autoPlayNext }))}
              className={cn(
                "w-14 h-8 rounded-full transition-colors relative",
                settings.autoPlayNext ? "bg-[var(--primary)]" : "bg-slate-200 dark:bg-zinc-800"
              )}
            >
              <div className={cn(
                "w-6 h-6 bg-white rounded-full absolute top-1 transition-all",
                settings.autoPlayNext ? "left-1" : "left-7"
              )} />
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-bold px-2 dark:text-white">رنګ بدلول</h3>
          <div className="grid grid-cols-5 gap-3">
            {THEME_COLORS.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSettings(s => ({ ...s, themeColor: theme.id }))}
                className="aspect-square rounded-2xl flex items-center justify-center transition-transform hover:scale-110 relative"
                style={{ backgroundColor: theme.color }}
              >
                {settings.themeColor === theme.id && (
                  <Check size={24} className="text-white" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-950 rounded-3xl p-2 border border-slate-100 dark:border-zinc-800 overflow-hidden">
          <button onClick={shareApp} className="w-full p-4 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
            <Share2 size={20} className="text-slate-400 dark:text-slate-300" />
            <span className="font-bold flex-1 text-right dark:text-white">اپ شريکول</span>
          </button>
          <div className="h-px bg-slate-100 dark:bg-zinc-800 mx-4" />
          <button className="w-full p-4 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
            <Star size={20} className="text-slate-400 dark:text-slate-300" />
            <span className="font-bold flex-1 text-right dark:text-white">درجه ورکول</span>
          </button>
          <div className="h-px bg-slate-100 dark:bg-zinc-800 mx-4" />
          <button onClick={() => setView('about')} className="w-full p-4 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
            <Info size={20} className="text-slate-400 dark:text-slate-300" />
            <span className="font-bold flex-1 text-right dark:text-white">زموږ په اړه</span>
          </button>
        </section>

        <section className="space-y-3">
          <h3 className="font-bold px-2 dark:text-white">زموږ سره اړيکه</h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="https://t.me/YOUR_USERNAME" target="_blank" className="bg-sky-500 text-white p-4 rounded-2xl flex flex-col items-center gap-2 shadow-lg shadow-sky-500/20">
              <Send size={24} />
              <span className="text-sm font-bold">ټیلیګرام</span>
            </a>
            <a href="https://wa.me/YOUR_NUMBER" target="_blank" className="bg-emerald-500 text-white p-4 rounded-2xl flex flex-col items-center gap-2 shadow-lg shadow-emerald-500/20">
              <MessageCircle size={24} />
              <span className="text-sm font-bold">واټساپ</span>
            </a>
            <a href="mailto:your@email.com" className="bg-rose-500 text-white p-4 rounded-2xl flex flex-col items-center gap-2 shadow-lg shadow-rose-500/20 col-span-2">
              <Mail size={24} />
              <span className="text-sm font-bold">بریښنالیک</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );

  const AboutScreen = () => (
    <div className="pb-24">
      <Header title="زموږ په اړه" showBack />
      <div className="p-6 text-center">
        <div className="w-24 h-24 bg-[var(--primary)] rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-[var(--primary)]/20">
          <Headphones size={48} />
        </div>
        <h1 className="text-2xl font-bold mb-6 dark:text-white">د عمرې آډيو لارښود</h1>
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 text-right leading-loose whitespace-pre-wrap dark:text-white">
          {ABOUT_US_TEXT}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen max-w-md mx-auto relative overflow-x-hidden transition-colors duration-300",
      settings.darkMode ? "dark bg-black text-white" : "bg-slate-50 text-slate-900"
    )}>
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <AnimatePresence mode="wait">
        {view === 'splash' && <SplashScreen key="splash" />}
        {view === 'home' && <HomeScreen key="home" />}
        {view === 'settings' && <SettingsScreen key="settings" />}
        {view === 'about' && <AboutScreen key="about" />}
      </AnimatePresence>

      <AnimatePresence>
        {view === 'player' && <PlayerScreen key="player" />}
      </AnimatePresence>

      {/* Mini Player */}
      {currentLesson && view !== 'player' && view !== 'splash' && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30"
        >
          <div 
            onClick={() => setView('player')}
            className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 p-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer"
          >
            <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center text-white shrink-0">
              {isPlaying ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>
                  <Headphones size={24} />
                </motion.div>
              ) : (
                <Headphones size={24} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate dark:text-white">{currentLesson.title}</h4>
              <div className="w-full h-1 bg-slate-100 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-[var(--primary)]" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="w-10 h-10 bg-slate-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-[var(--primary)]"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="mr-0.5" />}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
