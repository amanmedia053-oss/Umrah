import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Lesson {
  id: number;
  title: string;
  duration: string;
  audioUrl: string;
  description: string;
}

interface AudioContextType {
  currentLesson: Lesson | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playLesson: (lesson: Lesson) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  isPlayerOpen: boolean;
  setIsPlayerOpen: (val: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  const playLesson = (lesson: Lesson) => {
    if (audioRef.current) {
      if (currentLesson?.id !== lesson.id) {
        audioRef.current.src = lesson.audioUrl;
        setCurrentLesson(lesson);
      }
      audioRef.current.play();
      setIsPlaying(true);
      setIsPlayerOpen(true);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  return (
    <AudioContext.Provider value={{ 
      currentLesson, isPlaying, progress, duration, 
      playLesson, togglePlay, seek, skip,
      isPlayerOpen, setIsPlayerOpen
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};
