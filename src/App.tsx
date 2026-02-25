import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Heart, Settings, Info, Play, Pause, SkipBack, SkipForward, X, Heart as HeartIcon, Share2, Star, MessageCircle, Send, Mail } from 'lucide-react';

// پخواني ./context مو په @/context بدل کړل ترڅو Build خطا ورنکړي
import { useTheme, getAccentClass, getAccentTextClass, getAccentHex, ThemeColor } from '@/context/ThemeContext';
import { useAudio, Lesson } from '@/context/AudioContext';

// پاتې کوډ مو هغسې پرېږدئ، کوم تغیر ته اړتیا نشته...


// --- Components ---

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const { isDarkMode, accentColor } = useTheme();
  const accentText = getAccentTextClass(accentColor);

  const tabs = [
    { id: 'home', label: 'کورپاڼه', icon: Home },
    { id: 'favs', label: 'خوښي شوي', icon: Heart },
    { id: 'settings', label: 'تنظيمات', icon: Settings },
    { id: 'about', label: 'زموږ په اړه', icon: Info },
  ];

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 min-h-[4rem] flex items-center justify-around border-t z-40
      ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-black/5'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors py-2
              ${isActive ? accentText : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}
          >
            <Icon size={20} className={isActive ? 'scale-110' : ''} />
            <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const LessonCard: React.FC<{ lesson: Lesson, onPlay: (l: Lesson) => void }> = ({ lesson, onPlay }) => {
  const { isDarkMode, accentColor } = useTheme();
  const [isFav, setIsFav] = useState(() => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favs.includes(lesson.id);
  });

  const toggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavs;
    if (isFav) {
      newFavs = favs.filter((id: number) => id !== lesson.id);
    } else {
      newFavs = [...favs, lesson.id];
    }
    localStorage.setItem('favorites', JSON.stringify(newFavs));
    setIsFav(!isFav);
    window.dispatchEvent(new Event('favoritesChanged'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onPlay(lesson)}
      className={`relative p-4 rounded-2xl mb-4 cursor-pointer overflow-hidden group
        ${isDarkMode ? 'bg-zinc-900 border border-white/5' : 'bg-white shadow-sm border border-black/5'}`}
    >
      <div className="absolute inset-0 opacity-[0.03] islamic-pattern pointer-events-none" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center
          ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
          <Play size={20} className={getAccentTextClass(accentColor)} />
        </div>
        
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{lesson.title}</h3>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{lesson.duration} آډيو</p>
        </div>

        <button 
          onClick={toggleFav}
          className={`p-2 rounded-full transition-colors ${isFav ? 'text-red-500' : (isDarkMode ? 'text-gray-600' : 'text-gray-300')}`}
        >
          <HeartIcon size={20} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </motion.div>
  );
};

const PlayerOverlay = () => {
  const { isPlayerOpen, setIsPlayerOpen, currentLesson, isPlaying, togglePlay, progress, duration, seek, skip } = useAudio();
  const { isDarkMode, accentColor } = useTheme();
  
  if (!currentLesson) return null;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isPlayerOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`fixed inset-0 z-50 flex flex-col ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}
        >
          <div className="absolute inset-0 opacity-[0.05] islamic-pattern pointer-events-none" />
          
          <div 
            className="px-6 flex justify-between items-center relative z-10"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
          >
            <button onClick={() => setIsPlayerOpen(false)} className="p-2">
              <X size={24} />
            </button>
            <h2 className="font-bold text-lg">اوس غږول کيږي</h2>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
            <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center relative
              ${isDarkMode ? 'border-white/10' : 'border-black/5'}`}>
              <div className={`absolute inset-4 rounded-full border border-dashed opacity-20 animate-spin-slow
                ${isDarkMode ? 'border-white' : 'border-black'}`} />
              <div className={`w-48 h-48 rounded-full flex items-center justify-center overflow-hidden
                ${getAccentClass(accentColor)}`}>
                 <Play size={64} className="text-white opacity-20" />
              </div>
            </div>

            <div className="mt-12 text-center">
              <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>
              <p className={`text-sm opacity-60`}>د عمرې غږيز لارښود</p>
            </div>

            <div className="w-full mt-12">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={(e) => seek(Number(e.target.value))}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-current
                  ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}
                style={{ color: getAccentHex(accentColor) }}
              />
              <div className="flex justify-between mt-2 text-xs opacity-50 font-mono">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div 
              className="flex items-center justify-center gap-8 mt-12"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 2rem)' }}
            >
              <button onClick={() => skip(-10)} className="p-2 opacity-70 hover:opacity-100 transition-opacity">
                <SkipBack size={32} />
              </button>
              
              <button 
                onClick={togglePlay}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95
                  ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
              >
                {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="mr-[-4px]" />}
              </button>

              <button onClick={() => skip(10)} className="p-2 opacity-70 hover:opacity-100 transition-opacity">
                <SkipForward size={32} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Screens ---

const HomeScreen = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const { playLesson } = useAudio();
  const { isDarkMode, accentColor } = useTheme();

  useEffect(() => {
    fetch('/lessons.json')
      .then(res => res.json())
      .then(data => setLessons(data));
  }, []);

  return (
    <div className="pb-24">
      <div 
        className={`px-6 pb-6 rounded-b-[40px] relative overflow-hidden mb-6 ${getAccentClass(accentColor)}`}
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 2rem)' }}
      >
        <div className="absolute inset-0 opacity-10 islamic-pattern" />
        <div className="relative z-10 text-white">
          <h1 className="text-3xl font-bold mb-2">د عمرې لارښود</h1>
          <p className="opacity-80 text-sm">ټول ضروري احکام او فضائل په آډيو بڼه</p>
        </div>
      </div>

      <div className="px-6">
        <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ټول درسونه</h2>
        {lessons.map(lesson => (
          <LessonCard key={lesson.id} lesson={lesson} onPlay={playLesson} />
        ))}
      </div>
    </div>
  );
};

const FavoritesScreen = () => {
  const [favLessons, setFavLessons] = useState<Lesson[]>([]);
  const { playLesson } = useAudio();
  const { isDarkMode } = useTheme();

  const loadFavs = () => {
    const favIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    fetch('/lessons.json')
      .then(res => res.json())
      .then((data: Lesson[]) => {
        setFavLessons(data.filter(l => favIds.includes(l.id)));
      });
  };

  useEffect(() => {
    loadFavs();
    window.addEventListener('favoritesChanged', loadFavs);
    return () => window.removeEventListener('favoritesChanged', loadFavs);
  }, []);

  return (
    <div 
      className="px-6 pb-24"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}
    >
      <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>خوښي شوي</h1>
      
      {favLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-40">
          <Heart size={64} className="mb-4" />
          <p className="text-center font-medium">تر اوسه کوم برخه خوښ شوی نه دی</p>
        </div>
      ) : (
        favLessons.map(lesson => (
          <LessonCard key={lesson.id} lesson={lesson} onPlay={playLesson} />
        ))
      )}
    </div>
  );
};

const SettingsScreen = () => {
  const { isDarkMode, setIsDarkMode, accentColor, setAccentColor, autoNext, setAutoNext } = useTheme();
  
  const colors: {id: ThemeColor, hex: string}[] = [
    { id: 'orange', hex: '#F27D26' },
    { id: 'green', hex: '#2E7D32' },
    { id: 'blue', hex: '#0288D1' },
    { id: 'purple', hex: '#7B1FA2' },
    { id: 'red', hex: '#C62828' },
    { id: 'gold', hex: '#D4AF37' },
    { id: 'gray', hex: '#616161' },
    { id: 'teal', hex: '#00897B' },
    { id: 'dark-green', hex: '#1B5E20' },
    { id: 'navy', hex: '#1A237E' },
  ];

  const SettingItem = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl mb-3
      ${isDarkMode ? 'bg-zinc-900' : 'bg-white shadow-sm border border-black/5'}`}>
      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{label}</span>
      {children}
    </div>
  );

  return (
    <div 
      className="px-6 pb-24"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}
    >
      <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>تنظيمات</h1>

      <SettingItem label="د شپې حالت">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-12 h-6 rounded-full transition-colors relative
            ${isDarkMode ? 'bg-white' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full transition-all
            ${isDarkMode ? 'right-1 bg-black' : 'left-1 bg-white shadow-sm'}`} />
        </button>
      </SettingItem>

      <SettingItem label="بل درس اوتومات شروع شي">
        <button 
          onClick={() => setAutoNext(!autoNext)}
          className={`w-12 h-6 rounded-full transition-colors relative
            ${autoNext ? getAccentClass(accentColor) : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full transition-all bg-white shadow-sm
            ${autoNext ? 'right-1' : 'left-1'}`} />
        </button>
      </SettingItem>

      <div className={`p-4 rounded-2xl mb-3 ${isDarkMode ? 'bg-zinc-900' : 'bg-white shadow-sm border border-black/5'}`}>
        <p className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>رنګ بدلول</p>
        <div className="grid grid-cols-5 gap-3">
          {colors.map(c => (
            <button
              key={c.id}
              onClick={() => setAccentColor(c.id)}
              className={`w-10 h-10 rounded-full border-2 transition-transform active:scale-90
                ${accentColor === c.id ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      <button className={`w-full p-4 rounded-2xl mb-3 flex items-center justify-center gap-2 font-bold
        ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
        <Share2 size={20} />
        اپ شريکول
      </button>

      <button className={`w-full p-4 rounded-2xl mb-3 flex items-center justify-center gap-2 font-bold
        ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
        <Star size={20} />
        درجه ورکول
      </button>
    </div>
  );
};

const AboutScreen = () => {
  const { isDarkMode } = useTheme();

  const ContactBtn = ({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-full p-4 rounded-2xl mb-3 flex items-center gap-4 font-bold transition-transform active:scale-[0.98]
        ${isDarkMode ? 'bg-zinc-900 text-white' : 'bg-white shadow-sm border border-black/5 text-gray-800'}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${color}`}>
        <Icon size={20} />
      </div>
      <span>{label}</span>
    </button>
  );

  return (
    <div 
      className="px-6 pb-24"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 3rem)' }}
    >
      <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>زموږ په اړه</h1>
      
      <div className={`p-6 rounded-3xl mb-8 leading-relaxed text-justify
        ${isDarkMode ? 'bg-zinc-900 text-gray-300' : 'bg-white shadow-sm border border-black/5 text-gray-600'}`}>
        <p className="mb-4">
          دا اپ د عمرې اړوند مهم او ضروري آډيو درسونه وړاندې کوي، تر څو مسلمانان وکولای شي د عمرې طريقه، احکام او فضائل په اسانه توګه زده کړي.
        </p>
        <p className="mb-4">
          دا کاريال مکمل افلاین دی او د کارولو لپاره انټرنېټ ته اړتيا نه لري.
        </p>
        <p className="mb-4">
          زموږ موخه دا ده چې اسلامي علم په ساده، ښکلي او منظم ډول خلکو ته وړاندې کړو.
        </p>
        <p className="font-bold text-center mt-6">
          کاريال جوړوونکی: عبیدالله غفاري <br/>
          مرسته کوونکي: الحاج ډاکټر فريدون   <br/>
          الله تعالی دې زموږ دا هڅه قبوله کړي.
        </p>
      </div>

      <ContactBtn icon={Send} label="ټليګرام" color="bg-blue-500" onClick={() => window.open('https://t.me/obaidapp')} />
      <ContactBtn icon={MessageCircle} label="واټساپ" color="bg-green-500" onClick={() => window.open('https://wa.me/93779705897')} />
      <ContactBtn icon={Mail} label="بريښناليک" color="bg-red-500" onClick={() => window.location.href = 'mailto: obaidkhanghafari@gmail.com'} />
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { isDarkMode } = useTheme();
  // د Player منطق دلته راوستل شو
  const { isPlayerOpen, setIsPlayerOpen } = useAudio();

  // هیسټري تنظیمول کله چې اپلیکېشن لومړی ځل خلاصیږي
  useEffect(() => {
    window.history.replaceState({ tab: 'home' }, '');
  }, []);

  // د پلیر د خلاصېدو او بندېدو سره سم د هیسټري اپډېټ
  useEffect(() => {
    if (isPlayerOpen) {
      window.history.pushState({ tab: activeTab, player: true }, '');
    } else {
      // که کاروونکي پخپله د X بټن په وهلو پلیر بند کړ، هیسټري باید شاته لاړه شي
      if (window.history.state && window.history.state.player) {
        window.history.back();
      }
    }
  }, [isPlayerOpen, activeTab]);

  // د موبایل د بک (Back) بټن کنټرول
  useEffect(() => {
    const handlePopState = (event: any) => {
      // که پلیر خلاص وي، یوازې پلیر بند کړه
      if (isPlayerOpen) {
        setIsPlayerOpen(false);
      }
      // که پلیر خلاص نه وي، د ټبونو ترمنځ شاتګ وکړه
      if (event.state && event.state.tab) {
        setActiveTab(event.state.tab);
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isPlayerOpen, setIsPlayerOpen]);

  // د ټب بدلولو فنکشن
  const handleTabChange = (tab: string) => {
    if (tab !== activeTab) {
      window.history.pushState({ tab }, '');
      setActiveTab(tab);
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="max-w-md mx-auto min-h-screen relative">
        <main className="w-full">
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'favs' && <FavoritesScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
          {activeTab === 'about' && <AboutScreen />}
        </main>

        <PlayerOverlay />
        <BottomNav activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>
    </div>
  );
}
