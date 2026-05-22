"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Sandpack } from "@codesandbox/sandpack-react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store";
import { 
  Target, ExternalLink, 
  ArrowRight, BarChart2, Edit3, Zap, Lock, Play, Star, Sparkles, BookOpen, Clock, Flame, CheckCircle2, Brain, PlayCircle, Map,
  LogOut, AlertTriangle, Save, Settings, Menu, X
} from "lucide-react";
import { DailyCheckIn } from "@/components/daily-check-in";
import { NotionSidebar } from "@/components/notion-sidebar";

export default function Dashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [activePage, setActivePage] = useState<string>("home");
  const [viewLevel, setViewLevel] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  
  const profile = useAppStore((state) => state.profile);
  const setProfile = useAppStore((state) => state.setProfile);
  const learningPath = useAppStore((state) => state.learningPath);
  const resetProgress = useAppStore((state) => state.resetProgress);
  const streak = useAppStore((state) => state.streak);
  const notes = useAppStore((state) => state.notes);
  const setNotes = useAppStore((state) => state.setNotes);
  const stickyNotes = useAppStore((state) => state.stickyNotes) || [];
  const addStickyNote = useAppStore((state) => state.addStickyNote);
  const updateStickyNote = useAppStore((state) => state.updateStickyNote);
  const deleteStickyNote = useAppStore((state) => state.deleteStickyNote);

  const setTopicData = useAppStore((state) => state.setTopicData);
  const markTopicCompleted = useAppStore((state) => state.markTopicCompleted);
  const markQuizCompleted = useAppStore((state) => state.markQuizCompleted);
  const exp = useAppStore((state) => state.exp) || 0;
  const addExp = useAppStore((state) => state.addExp);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<{ [key: number]: number }>({}); 
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [currentLessonPage, setCurrentLessonPage] = useState(0);

  // Settings State
  const [editName, setEditName] = useState("");
  const [editGoal, setEditGoal] = useState("");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Drag to Scroll State for Skill Tree
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingMap, setIsDraggingMap] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [startScrollPos, setStartScrollPos] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (profile && activePage === 'settings') {
      setEditName(profile.name || "");
      setEditGoal(profile.goal || "");
    }
  }, [profile, activePage]);

  useEffect(() => {
    setCurrentLessonPage(0);
  }, [activePage]);

  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  
  const loadingMessages = [
    "Memanaskan mesin AI... 🔥",
    "Menyerap seluruh ilmu di internet... 🧠",
    "Meracik kode super rahasia... 💻",
    "Membuat kuis jebakan batman... 😈",
    "Menyeduh kopi virtual... ☕",
    "Sedikit lagi beres woi... 🚀"
  ];

  // Logic to simulate progress while loading
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let messageInterval: NodeJS.Timeout;

    if (isGeneratingLesson) {
      setLoadingProgress(0);
      setLoadingMessageIndex(0);
      
      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          // Slow down progress as it gets closer to 95%
          if (prev >= 95) return 95;
          const increment = Math.max(1, (95 - prev) / 10);
          return prev + increment;
        });
      }, 500);

      messageInterval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [isGeneratingLesson]);
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([
    { role: 'model', content: 'Halo! Gue si Bebek Karet (Rubber Duck) AI. Ada materi yang bikin lo bingung atau ide yang mau didiskusiin?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePage === 'notes' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activePage]);

  const notesRef = useRef<HTMLTextAreaElement>(null);

  let currentActiveDayIndex = 0;
  if (learningPath) {
    learningPath.forEach((day, index) => {
      if (day.isCompleted) {
        currentActiveDayIndex = Math.min(index + 1, learningPath.length - 1);
      }
    });
  }
  const activeLevel = Math.floor(currentActiveDayIndex / 7) + 1;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const prevExpRef = useRef(exp);
  useEffect(() => {
    if (!isMounted) return;
    
    const getLevel = (e: number) => {
      if (e < 100) return 1;
      if (e < 300) return 2;
      if (e < 600) return 3;
      if (e < 1000) return 4;
      return 5;
    };
    
    const oldLevel = getLevel(prevExpRef.current);
    const newLevel = getLevel(exp);
    
    if (newLevel > oldLevel) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFC900', '#38E54D', '#FF90E8', '#00E5FF']
      });
      toast.success(`🎉 LEVEL UP! Kamu sekarang Level ${newLevel}!`, {
        style: {
          border: '4px solid black',
          padding: '16px',
          color: 'black',
          background: '#00E5FF',
          fontWeight: '900',
          textTransform: 'uppercase',
          boxShadow: '6px 6px 0px #000',
        },
        iconTheme: { primary: 'black', secondary: '#00E5FF' },
      });
    }
    prevExpRef.current = exp;
  }, [exp, isMounted]);

  useEffect(() => {
    if (isMounted) {
      setViewLevel(activeLevel);
    }
  }, [activeLevel, isMounted]);

  const triggerConfetti = () => {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFC900', '#FF90E8', '#38E54D', '#000000']
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFC900', '#FF90E8', '#38E54D', '#000000']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleGenerateLesson = async (dayIndex: number, topicIndex: number, topic: any) => {
    setIsGeneratingLesson(true);
    try {
      const res = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: profile?.goal,
          level: profile?.level,
          topicTitle: topic.title,
          topicDescription: topic.description
        })
      });
      
      if (!res.ok) {
        throw new Error("Gagal mengambil data dari AI");
      }

      const data = await res.json();
      if (data.markdown) {
        setTopicData(dayIndex, topicIndex, data.markdown, data.quiz, data.youtubeVideos);
        setCurrentQuizIndex(0);
        setQuizScore(0);
        setQuizAnswered({});
        setIsQuizMode(false);
        setCurrentLessonPage(0);
      }
    } catch (e) {
      console.error(e);
      toast.error('AI sedang kelelahan. Coba klik generate lagi! 🤖💤', {
        style: {
          border: '4px solid black',
          padding: '16px',
          color: 'black',
          background: '#FF5F56',
          fontWeight: '900',
          boxShadow: '6px 6px 0px #000',
        },
        iconTheme: { primary: 'black', secondary: '#FF5F56' },
      });
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const handleTopicComplete = (dayIndex: number, topicIndex: number, completed: boolean) => {
    markTopicCompleted(dayIndex, topicIndex, completed);
    if (completed) {
      const day = learningPath![dayIndex];
      const otherTopicsCompleted = day.topics.filter((_, idx) => idx !== topicIndex).every(t => t.completed);
      
      if (otherTopicsCompleted) {
        triggerConfetti();
      }
    }
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen bg-[#FDF6E3] items-center justify-center">
        <div className="h-12 w-12 border-8 border-black border-t-[#FFC900] rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile || !learningPath) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center px-4 bg-[#FDF6E3] text-black">
        <div className="bg-white border-4 border-black p-12 rounded-2xl shadow-[12px_12px_0px_#000] max-w-md w-full">
          <Target className="h-24 w-24 mx-auto text-[#FF90E8] mb-8" />
          <h2 className="text-3xl font-black mb-4 uppercase">NO PATH FOUND!</h2>
          <p className="text-black/60 font-bold mb-8">Time to create your ultimate learning journey.</p>
          <button 
            onClick={() => router.push('/onboarding')}
            className="w-full px-6 py-4 bg-[#38E54D] text-black border-4 border-black rounded-xl font-black text-xl hover:translate-y-1 hover:shadow-[4px_4px_0px_#000] shadow-[8px_8px_0px_#000] transition-all"
          >
            START ONBOARDING
          </button>
        </div>
      </div>
    );
  }

  let totalTopics = 0;
  let completedTopics = 0;
  
  learningPath.forEach((day) => {
    day.topics.forEach(topic => {
      totalTopics++;
      if (topic.completed) completedTopics++;
    });
  });

  const progressPercentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
  const colors = ['#FFC900', '#FF90E8', '#38E54D', '#00E5FF', '#FF5722'];
  const activeDay = learningPath[currentActiveDayIndex];

  const LEVEL_SIZE = 7;
  const totalLevels = Math.ceil(learningPath.length / LEVEL_SIZE);
  const learningPathToRender = learningPath.slice((viewLevel - 1) * LEVEL_SIZE, viewLevel * LEVEL_SIZE);
  
  const viewProgressPercentage = 
    viewLevel < activeLevel ? 100 :
    viewLevel > activeLevel ? 0 :
    ((currentActiveDayIndex % LEVEL_SIZE) / Math.max(1, learningPathToRender.length - 1)) * 100;

  const renderContent = () => {
    if (activePage === 'home') {
      return (
        <div className="max-w-[1400px] mx-auto w-full px-6 md:px-8 py-8 text-black">
          {/* Top Navbar / Search area imitation (Optional) */}
          <div className="flex justify-between items-center mb-8">
            <div className="bg-white border-2 border-black rounded-full px-6 py-3 w-full max-w-md shadow-[4px_4px_0px_#000] flex items-center gap-3">
              <span className="text-black/40">?</span>
              <input type="text" placeholder="Search your course..." className="bg-transparent outline-none w-full font-bold placeholder:text-black/30" />
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="w-12 h-12 bg-white border-2 border-black rounded-full shadow-[4px_4px_0px_#000] flex items-center justify-center font-black">
                ?
              </div>
              <div className="w-12 h-12 bg-white border-2 border-black rounded-full shadow-[4px_4px_0px_#000] flex items-center justify-center font-black">
                ?
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8">
            
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-8">
              
              {/* Hero Banner */}
              <div 
                className="bg-[#7B61FF] border-4 border-black rounded-3xl p-8 md:p-12 shadow-[8px_8px_0px_#000] relative overflow-hidden text-white group"
                style={{ backgroundImage: "url('/images/banner-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="relative z-10 max-w-lg bg-white border-4 border-black p-6 md:p-8 rounded-2xl shadow-[8px_8px_0px_#000] -rotate-1 hover:rotate-0 transition-transform">
                  <div className="inline-block px-3 py-1 bg-[#FFC900] text-black font-black text-xs uppercase mb-4 border-2 border-black shadow-[2px_2px_0px_#000]">
                    WELCOME, {profile?.name || 'STUDENT'}! 🚀
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight uppercase text-black">
                    Master <br/><span className="text-[#FF90E8] drop-shadow-[2px_2px_0px_#000]">{profile.goal}</span> <br/> Like a Pro!
                  </h1>
                  <button 
                    onClick={() => setActivePage(`day-${activeDay.day}`)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00E5FF] text-black border-4 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-1 rounded-xl font-black uppercase text-sm transition-all"
                  >
                    CONTINUE LEARNING <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Stats (3 cards) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] flex items-center gap-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#000] transition-all">
                  <div className="w-12 h-12 bg-[#FFC900] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-sm text-black/40 uppercase">PROGRESS</div>
                    <div className="font-black text-xl">{progressPercentage}%</div>
                  </div>
                </div>

                <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] flex items-center gap-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#000] transition-all">
                  <div className="w-12 h-12 bg-[#FF90E8] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-sm text-black/40 uppercase">STREAK</div>
                    <div className="font-black text-xl">{streak} DAYS</div>
                  </div>
                </div>

                <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_#000] flex items-center gap-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#000] transition-all">
                  <div className="w-12 h-12 bg-[#00E5FF] border-2 border-black rounded-xl flex items-center justify-center shadow-[2px_2px_0px_#000]">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-sm text-black/40 uppercase">COMPLETED</div>
                    <div className="font-black text-xl">{completedTopics}/{totalTopics}</div>
                  </div>
                </div>
              </div>

              {/* Continue Watching / Today's Lesson */}
              <div>
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-black uppercase">CONTINUE LEARNING</h2>
                  <button onClick={() => setActivePage(`day-${activeDay.day}`)} className="text-sm font-black uppercase hover:underline flex items-center gap-1">
                    SEE ALL <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeDay.topics.map((topic, idx) => {
                    const cardColor = colors[idx % colors.length];
                    return (
                      <div key={idx} className="bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_#000] group flex flex-col hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] transition-all cursor-pointer" onClick={() => setActivePage(`day-${activeDay.day}`)}>
                        {/* Fake Thumbnail */}
                        <div className="h-32 border-b-4 border-black flex items-center justify-center relative" style={{ backgroundColor: cardColor }}>
                           <Play className="w-12 h-12 fill-black text-black opacity-30 group-hover:scale-110 transition-transform" />
                           <div className="absolute top-3 left-3 bg-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase rounded shadow-[2px_2px_0px_#000]">
                             DAY {activeDay.day}
                           </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-black text-lg leading-tight mb-2 line-clamp-2">{topic.title}</h3>
                          <div className="mt-auto flex items-center justify-between">
                            <span className="text-xs font-bold text-black/50 uppercase"><Clock className="w-3 h-3 inline mr-1" /> 10 MINS</span>
                            {topic.completed && <CheckCircle2 className="w-5 h-5 text-[#38E54D]" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* --- NEW SECTION: DAILY QUESTS --- */}
              <div className="mt-8">
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                  <Target className="w-8 h-8 text-[#FF5F56] fill-black" /> MISI BELAJAR
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { title: "Selesaikan Topik Pertama", exp: "+50 EXP", done: completedTopics >= 1 },
                    { title: "Kumpulkan 300 EXP", exp: "+100 EXP", done: exp >= 300 },
                    { title: "Capai 3 Hari Streak", exp: "+150 EXP", done: streak >= 3 },
                  ].map((quest, idx) => (
                    <div key={idx} className={`border-4 border-black p-4 md:p-5 rounded-2xl shadow-[6px_6px_0px_#000] flex items-center justify-between transition-all ${quest.done ? 'bg-gray-200 opacity-60' : 'bg-white hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000]'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 md:w-10 md:h-10 border-4 border-black rounded-lg flex items-center justify-center ${quest.done ? 'bg-[#38E54D]' : 'bg-white'}`}>
                          {quest.done && <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-black" />}
                        </div>
                        <span className={`font-black text-lg md:text-xl uppercase ${quest.done ? 'line-through decoration-4' : ''}`}>{quest.title}</span>
                      </div>
                      <div className="bg-[#FFC900] px-3 py-1 border-2 border-black font-black text-sm md:text-base rounded shadow-[2px_2px_0px_#000]">
                        {quest.exp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- NEW SECTION: ACTIVITY HEATMAP --- */}
              <div className="mt-8">
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                  <Flame className="w-8 h-8 text-[#FF90E8] fill-black" /> GRAFIK AKTIVITAS
                </h2>
                <div className="bg-white border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_#000] overflow-x-auto">
                  <div className="grid grid-rows-4 grid-flow-col gap-2 md:gap-3 min-w-max">
                    {Array.from({ length: 28 }).map((_, idx) => {
                      const dayData = learningPath[idx];
                      let bgColor = 'bg-gray-100';
                      let tooltipTitle = `Hari ${idx + 1} - Belum dimulai`;
                      
                      if (dayData) {
                        const topics = dayData.topics;
                        const completedCount = topics.filter((t: any) => t.completed).length;
                        if (completedCount === topics.length && topics.length > 0) {
                          bgColor = 'bg-[#FF5F56]';
                        } else if (completedCount > 0) {
                          bgColor = 'bg-[#FFC900]';
                        } else if (idx <= currentActiveDayIndex) {
                          bgColor = 'bg-[#38E54D] opacity-30'; // Visited but no progress
                        }
                        tooltipTitle = `Hari ${idx + 1} - ${completedCount}/${topics.length} Topik Selesai`;
                      }
                      
                      return (
                        <div 
                          key={idx} 
                          className={`w-6 h-6 md:w-8 md:h-8 rounded-md border-2 border-black shadow-[2px_2px_0px_#000] ${bgColor} hover:scale-110 hover:z-10 transition-transform cursor-pointer relative group`}
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-20">
                            {tooltipTitle}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* --- NEW SECTION: ACHIEVEMENT BADGES --- */}
              <div className="mt-8 mb-12">
                <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                  <Star className="w-8 h-8 text-[#00E5FF] fill-black" /> KOLEKSI LENCANA
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { title: "First Blood", icon: <Zap className="w-8 h-8 text-white fill-black" />, color: "bg-[#FF5F56]", unlocked: completedTopics >= 1 },
                    { title: "Fast Learner", icon: <Brain className="w-8 h-8 text-white fill-black" />, color: "bg-[#7B61FF]", unlocked: completedTopics >= 5 },
                    { title: "Quiz Master", icon: <Target className="w-8 h-8 text-white fill-black" />, color: "bg-[#FFC900]", unlocked: exp >= 500 },
                    { title: "Streaker", icon: <Flame className="w-8 h-8 text-white fill-black" />, color: "bg-[#FF90E8]", unlocked: streak >= 3 },
                  ].map((badge, idx) => (
                    <div key={idx} className={`border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_#000] flex flex-col items-center justify-center text-center gap-3 transition-all ${badge.unlocked ? `${badge.color} hover:-translate-y-2 hover:shadow-[10px_10px_0px_#000]` : 'bg-gray-200 grayscale opacity-60'}`}>
                      <div className="w-16 h-16 border-4 border-black rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
                        {badge.icon}
                      </div>
                      <span className="font-black uppercase text-sm md:text-base text-black bg-white px-2 py-1 border-2 border-black rounded w-full line-clamp-1">{badge.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Statistic / Journey Map) */}
            <div className="flex flex-col gap-8">
              
              <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_#000]">
                {/* Profile Widget */}
                <div className="text-center mb-8 border-b-4 border-black pb-8">
                  <div className="w-24 h-24 mx-auto bg-[#FFC900] border-4 border-black rounded-full shadow-[4px_4px_0px_#000] flex items-center justify-center mb-4 overflow-hidden relative">
                    {/* Placeholder Avatar */}
                    <div className="text-4xl">😎</div>
                  </div>
                  <h3 className="font-black text-2xl uppercase">HELLO, CHAMP! 🔥</h3>
                  <p className="text-sm font-bold text-black/50">KEEP PUSHING YOUR LIMITS</p>
                </div>

                {/* The Journey Map - Compact version */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-xl uppercase">THE JOURNEY MAP</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        disabled={viewLevel === 1} 
                        onClick={() => setViewLevel(l => l - 1)} 
                        className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_#000] disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] transition-all font-black"
                      >
                        {'<'}
                      </button>
                      <span className="font-black text-sm px-2 bg-[#FFC900] border-2 border-black rounded shadow-[2px_2px_0px_#000]">LEVEL {viewLevel}/{totalLevels}</span>
                      <button 
                        disabled={viewLevel === totalLevels} 
                        onClick={() => setViewLevel(l => l + 1)} 
                        className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_#000] disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] transition-all font-black"
                      >
                        {'>'}
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    className="flex flex-col items-center h-[500px] overflow-y-auto w-full"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <style dangerouslySetInnerHTML={{__html: `
                      div::-webkit-scrollbar { display: none; }
                    `}} />
                    
                    <div className="relative py-12 flex flex-col items-center w-full">
                      {/* Exact center-to-center container for the lines */}
                      <div className="absolute top-[104px] bottom-[104px] left-1/2 -translate-x-1/2 w-0">
                        <div className="absolute top-0 bottom-0 left-0 w-0 border-l-[6px] border-dashed border-black/20" />
                        <div 
                          className="absolute top-0 left-0 w-0 border-l-[6px] border-dashed border-black transition-all duration-1000"
                          style={{ height: `${viewProgressPercentage}%` }}
                        />
                      </div>

                      {learningPathToRender.map((day, relativeIndex) => {
                        const absoluteIndex = (viewLevel - 1) * LEVEL_SIZE + relativeIndex;
                        const isActive = absoluteIndex === currentActiveDayIndex;
                        const isCompleted = day.isCompleted;
                        const isLocked = absoluteIndex > currentActiveDayIndex;
                        
                        // Alternate tiny offsets for the compact map
                        const xOffset = relativeIndex % 2 === 0 ? '-translate-x-10' : 'translate-x-10';
                        const nodeColor = colors[relativeIndex % colors.length];
                        
                        return (
                          <motion.div 
                            key={day.day}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "0px" }}
                            className={`relative z-10 my-6 ${xOffset}`}
                          >
                          <button
                            onClick={() => setActivePage(`day-${day.day}`)}
                            className={`group relative flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 border-black shadow-[4px_4px_0px_#000] transition-all duration-300 focus:outline-none
                              ${isCompleted 
                                ? 'text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] opacity-80' 
                                : isActive 
                                  ? 'hover:scale-105' 
                                  : 'bg-white text-black/30 hover:bg-gray-100'
                              }`}
                            style={{ backgroundColor: (isActive || isCompleted) ? nodeColor : undefined }}
                          >
                            {/* Smooth, slow spinning dashed ring for active node */}
                            {isActive && (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                                className="absolute -inset-3 rounded-full border-[3px] border-dashed border-black/40 -z-10"
                              />
                            )}

                            <div className="flex flex-col items-center z-10">
                              {isCompleted ? (
                                <Star className="w-5 h-5 fill-current" />
                              ) : isLocked ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Play className="w-5 h-5 ml-1 fill-current" />
                              )}
                              <span className="font-black text-[10px] mt-0.5 uppercase">{day.day}</span>
                            </div>
                            
                            {/* Comic Speech Bubble Tooltip */}
                            <div className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_#000] font-black text-xs hidden group-hover:block text-black z-50 rounded-xl
                              ${relativeIndex % 2 === 0 ? 'left-[140%]' : 'right-[140%]'}`}>
                              {isCompleted ? 'REVIEW' : isActive ? 'PLAY NOW!' : 'LOCKED'}
                              {/* Speech bubble tail */}
                              <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-b-4 border-l-4 border-black transform rotate-45 
                                ${relativeIndex % 2 === 0 ? '-left-2.5 border-r-0 border-t-0' : '-right-2.5 border-l-0 border-b-0 border-t-4 border-r-4'}`}>
                              </div>
                            </div>
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            </div>
          </div>
        </div>
      );
    }

    if (activePage === 'settings') {
      return (
        <div className="max-w-4xl mx-auto w-full px-6 md:px-8 py-8 text-black">
          <header className="mb-12 flex items-center gap-4 border-b-4 border-black pb-6">
            <Settings className="w-10 h-10" />
            <h1 className="text-4xl font-black uppercase">Pengaturan</h1>
          </header>

          <div className="space-y-12">
            {/* 1. Profil Pengguna */}
            <section className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_#000]">
              <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                <Target className="w-6 h-6" /> Profil Pengguna
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block font-bold mb-2 uppercase text-sm">Nama Panggilan</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-4 border-4 border-black font-bold text-xl focus:outline-none focus:bg-[#00E5FF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2 uppercase text-sm">Misi Utama (Goal)</label>
                  <input 
                    type="text" 
                    value={editGoal}
                    onChange={(e) => setEditGoal(e.target.value)}
                    className="w-full p-4 border-4 border-black font-bold text-xl focus:outline-none focus:bg-[#00E5FF] transition-colors"
                  />
                </div>
                <button 
                  onClick={async () => {
                    setIsSaving(true);
                    if (profile) {
                      setProfile({ ...profile, name: editName, goal: editGoal });
                    }
                    toast.success("Profil berhasil disimpan!");
                    setIsSaving(false);
                  }}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#38E54D] border-4 border-black font-black uppercase text-lg shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" /> Simpan Perubahan
                </button>
              </div>
            </section>

            {/* 2. Account Actions */}
            <section className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_#000]">
              <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                <Lock className="w-6 h-6" /> Akun
              </h2>
              <button 
                onClick={async () => {
                  setIsLoggingOut(true);
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  resetProgress(); // CLEAR LOCAL STORAGE
                  router.push('/login');
                }}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-6 py-3 bg-[#FFC900] border-4 border-black font-black uppercase text-lg shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" /> Keluar (Logout)
              </button>
            </section>

            {/* 3. Danger Zone */}
            <section className="bg-white border-4 border-[#FF5F56] p-8 shadow-[8px_8px_0px_#FF5F56]">
              <h2 className="text-2xl font-black uppercase text-[#FF5F56] mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" /> Zona Berbahaya
              </h2>
              <p className="font-bold mb-6 max-w-xl">
                Aksi ini akan menghapus permanen semua poin EXP Anda, menghancurkan modul Learning Path, dan mereset profil Anda ke nol. Anda akan diminta untuk menyusun ulang misi dari awal.
              </p>

              {!isResetConfirmOpen ? (
                <button 
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="px-6 py-3 border-4 border-[#FF5F56] text-[#FF5F56] hover:bg-[#FF5F56] hover:text-white font-black uppercase text-lg transition-colors"
                >
                  Reset Progress Saya
                </button>
              ) : (
                <div className="bg-[#FF5F56]/10 border-4 border-[#FF5F56] p-6 animate-pulse">
                  <p className="font-black text-xl text-[#FF5F56] mb-4 uppercase">APAKAH ANDA YAKIN 100%?</p>
                  <div className="flex gap-4">
                    <button 
                      onClick={async () => {
                        resetProgress();
                        // Also clear from Supabase
                        const supabase = createClient();
                        const { data: { session } } = await supabase.auth.getSession();
                        if (session) {
                          await supabase.from('profiles').update({
                            goal: null,
                            exp: 0,
                            learning_path: null
                          }).eq('id', session.user.id);
                        }
                        router.push('/onboarding');
                      }}
                      className="px-6 py-3 bg-[#FF5F56] text-white border-4 border-black font-black uppercase shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      YA, HANCURKAN!
                    </button>
                    <button 
                      onClick={() => setIsResetConfirmOpen(false)}
                      className="px-6 py-3 bg-white text-black border-4 border-black font-black uppercase shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      );
    }

    if (activePage === 'skill-tree') {
      if (!learningPath || learningPath.length === 0) {
        return (
          <div className="w-full h-screen flex flex-col bg-white overflow-hidden text-black justify-center items-center">
            <h1 className="text-4xl font-black uppercase mb-4">PETA BELUM TERSEDIA</h1>
            <p className="font-bold text-black/60 mb-8">Buat Learning Path terlebih dahulu di menu Home.</p>
            <button onClick={() => setActivePage('home')} className="px-6 py-3 bg-[#00E5FF] border-4 border-black font-black uppercase shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all">
              Kembali ke Home
            </button>
          </div>
        );
      }

      const MAX_COLUMNS = 4;
      const X_SPACING = 350;
      const Y_SPACING = 250;
      const START_X = 150;
      const START_Y = 200;

      const icons = ['🌱', '📦', '⚙️', '🧱', '📁', '🌐', '🧠', '💻', '🚀', '🔥', '🎨', '🕹️', '🏆', '💎', '📚'];
      const colors = ['#38E54D', '#FFC900', '#00E5FF', '#FF90E8', '#FF5F56', '#7B61FF'];

      let hasFoundActive = false;

      const nodes = learningPath.map((day, index) => {
        const row = Math.floor(index / MAX_COLUMNS);
        const isEvenRow = row % 2 === 0;
        const col = index % MAX_COLUMNS;
        const xCol = isEvenRow ? col : (MAX_COLUMNS - 1 - col);
        
        const x = START_X + (xCol * X_SPACING);
        const y = START_Y + (row * Y_SPACING);
        
        let status = 'locked';
        if (day.isCompleted) {
          status = 'completed';
        } else if (!hasFoundActive) {
          status = 'active';
          hasFoundActive = true;
        }

        const isLastNode = index === learningPath.length - 1;

        return {
          id: day.day,
          title: `DAY ${day.day}`,
          topicsCount: day.topics.length,
          x,
          y,
          color: colors[index % colors.length],
          status,
          icon: isLastNode ? '👑' : icons[index % icons.length],
          scale: isLastNode ? 1.5 : (status === 'active' ? 1.2 : 1)
        };
      });

      const edges: {from: number, to: number}[] = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({ from: nodes[i].id, to: nodes[i + 1].id });
      }

      // We don't need fixed canvas width/height anymore because of infinite pan!
      
      // We will use local state inside the render block for the pan offsets. 
      // Note: React usually expects hooks at top-level. I will add a tiny wrapper logic or just use global/top-level state that we already added.
      // Wait, we added `startScrollPos` earlier at the top level of the component! We can reuse them!
      
      return (
        <div className="w-full h-screen flex flex-col bg-white overflow-hidden text-black">
          <header className="h-20 border-b-4 border-black bg-[#00E5FF] flex items-center justify-between px-6 shrink-0 shadow-[0px_4px_0px_#000] z-20">
             <div className="font-black text-2xl uppercase flex items-center gap-3">
               <Map className="w-8 h-8 fill-black" /> SKILL TREE
             </div>
             <button onClick={() => setActivePage('home')} className="px-4 py-2 bg-white border-2 border-black rounded-lg font-black uppercase text-sm shadow-[2px_2px_0px_#000] hover:translate-y-0.5 hover:shadow-none transition-all">
               X TUTUP
             </button>
          </header>
          
          <div 
            ref={scrollRef}
            className={`flex-1 relative bg-[#FDF6E3] overflow-hidden ${isDraggingMap ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{ 
              backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', 
              backgroundSize: '40px 40px',
              backgroundPosition: `${startScrollPos.left}px ${startScrollPos.top}px` // Moves the dots infinitely
            }}
            onPointerDown={(e) => {
              if (e.target instanceof Element && e.target.closest('.node-element')) return; // Don't pan if clicking on a node
              setIsDraggingMap(true);
              setStartDragPos({ x: e.clientX, y: e.clientY });
            }}
            onPointerUp={() => setIsDraggingMap(false)}
            onPointerLeave={() => setIsDraggingMap(false)}
            onPointerMove={(e) => {
              if (!isDraggingMap) return;
              e.preventDefault();
              const dx = e.clientX - startDragPos.x;
              const dy = e.clientY - startDragPos.y;
              setStartScrollPos(prev => ({ left: prev.left + dx, top: prev.top + dy }));
              setStartDragPos({ x: e.clientX, y: e.clientY }); // update reference
            }}
            onWheel={(e) => {
               // Enable trackpad panning!
               setStartScrollPos(prev => ({ left: prev.left - e.deltaX, top: prev.top - e.deltaY }));
            }}
          >
             {/* Pan Container */}
             <div 
               className="absolute inset-0"
               style={{ transform: `translate(${startScrollPos.left}px, ${startScrollPos.top}px)` }}
             >
                
                {/* SVG Lines */}
                <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none z-0 overflow-visible">
                  {edges.map((edge, idx) => {
                    const fromNode = nodes.find(n => n.id === edge.from)!;
                    const toNode = nodes.find(n => n.id === edge.to)!;
                    
                    const x1 = fromNode.x + 48;
                    const y1 = fromNode.y + 48;
                    const x2 = toNode.x + 48;
                    const y2 = toNode.y + 48;
                    
                    // Determine curve direction based on rows
                    const isSameRow = fromNode.y === toNode.y;
                    let pathD = '';
                    
                    if (isSameRow) {
                      pathD = `M ${x1} ${y1} C ${x1 + (x2>x1?150:-150)} ${y1}, ${x2 - (x2>x1?150:-150)} ${y2}, ${x2} ${y2}`;
                    } else {
                      // Dropping down to next row
                      pathD = `M ${x1} ${y1} C ${x1} ${y1 + 150}, ${x2} ${y2 - 150}, ${x2} ${y2}`;
                    }

                    return (
                      <path 
                        key={idx}
                        d={pathD}
                        fill="transparent"
                        stroke="black"
                        strokeWidth="8"
                        strokeDasharray={toNode.status === 'locked' ? '12,12' : 'none'}
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map(node => (
                   <div 
                     key={node.id}
                     className={`node-element absolute flex flex-col items-center justify-center z-10 transition-transform ${node.status === 'locked' ? 'grayscale' : 'hover:scale-110 cursor-pointer'}`}
                     style={{ left: node.x, top: node.y, transform: `scale(${node.scale})` }}
                   >
                     {node.status === 'active' && (
                        <div className="absolute -top-12 font-black text-[#FF5F56] text-xl animate-bounce drop-shadow-[2px_2px_0px_#000] whitespace-nowrap">
                          KAMU DI SINI ↓
                        </div>
                     )}
                     <div className="relative w-24 h-24 border-4 border-black rounded-full shadow-[8px_8px_0px_#000] bg-white overflow-hidden">
                       <div className="absolute inset-0 flex items-center justify-center text-5xl" style={{ backgroundColor: node.color }}>
                         {node.icon}
                       </div>
                     </div>
                     <div className="mt-6 bg-white px-4 py-2 border-4 border-black font-black uppercase text-base shadow-[4px_4px_0px_#000] whitespace-nowrap text-center relative z-20">
                       {node.title}
                       <div className="text-xs font-bold text-black/50 mt-1">{node.topicsCount} Topik</div>
                     </div>
                     {node.status === 'locked' && (
                       <div className="absolute -top-2 -right-2 w-10 h-10 bg-black rounded-full flex items-center justify-center text-white border-2 border-white z-30">
                         <Lock className="w-5 h-5" />
                       </div>
                     )}
                     {node.status === 'completed' && (
                       <div className="absolute -top-2 -right-2 w-10 h-10 bg-[#38E54D] rounded-full flex items-center justify-center border-4 border-black text-black z-30">
                         <CheckCircle2 className="w-6 h-6" />
                       </div>
                     )}
                   </div>
                ))}
             </div>
          </div>
        </div>
      );
    }

    if (activePage === 'notes') {
      const handleSendMessage = async () => {
        if (!chatInput.trim() || isChatLoading) return;
        
        const newMsg = { role: 'user', content: chatInput };
        setChatMessages(prev => [...prev, newMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
          const res = await fetch('/api/rubber-duck', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              history: chatMessages,
              message: newMsg.content,
              context: `Materi yang sedang dibahas: ${profile?.goal}`
            })
          });
          const data = await res.json();
          if (data.reply) {
            setChatMessages(prev => [...prev, { role: 'model', content: data.reply }]);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsChatLoading(false);
        }
      };

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-8 flex flex-col h-full text-black overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row gap-6 h-full flex-1">
            {/* LEFT: STICKY NOTES BOARD */}
            <div className="flex-1 bg-white border-4 border-black shadow-[12px_12px_0px_#000] rounded-3xl p-6 relative overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-6 z-10 border-b-4 border-black pb-4">
                <h1 className="text-3xl font-black flex items-center gap-3 uppercase">
                  <Edit3 className="w-8 h-8" /> STICKY BOARD
                </h1>
                <button 
                  onClick={() => {
                    const colors = ['#FFC900', '#FF90E8', '#38E54D', '#00E5FF', '#FF5F56'];
                    addStickyNote({
                      id: Date.now().toString(),
                      content: '',
                      color: colors[Math.floor(Math.random() * colors.length)],
                      x: Math.random() * 200,
                      y: Math.random() * 200
                    });
                  }}
                  className="px-6 py-3 bg-black text-[#FFC900] font-black text-lg uppercase rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0px_#FFC900] transition-all"
                >
                  + TAMBAH
                </button>
              </div>
              
              <div className="flex-1 relative w-full h-full overflow-hidden bg-[radial-gradient(#00000022_1px,transparent_1px)] [background-size:20px_20px]">
                {stickyNotes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-50 font-black text-2xl text-center px-10 pointer-events-none">
                    PAPAN KOSONG. KLIK "+ TAMBAH" UNTUK MEMBUAT STICKY NOTE BARU.
                  </div>
                )}
                
                {stickyNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    drag
                    dragMomentum={false}
                    initial={{ x: note.x, y: note.y }}
                    onDragEnd={(e, info) => {
                      updateStickyNote(note.id, {
                        x: note.x + info.offset.x,
                        y: note.y + info.offset.y
                      });
                    }}
                    className="absolute w-64 h-64 border-4 border-black shadow-[8px_8px_0px_#000] rounded-xl flex flex-col overflow-hidden group cursor-grab active:cursor-grabbing"
                    style={{ backgroundColor: note.color }}
                  >
                    <div className="h-8 border-b-4 border-black bg-black/10 flex justify-end items-center px-2">
                      <button 
                        onPointerDown={(e) => { e.stopPropagation(); deleteStickyNote(note.id); }}
                        className="w-6 h-6 bg-white border-2 border-black rounded-full flex items-center justify-center text-xs font-black opacity-0 group-hover:opacity-100 hover:bg-[#FF5F56] hover:text-white transition-all cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                    <textarea
                      value={note.content}
                      onChange={(e) => updateStickyNote(note.id, { content: e.target.value })}
                      onPointerDown={(e) => e.stopPropagation()} // Allow text selection without dragging
                      className="flex-1 w-full bg-transparent p-4 resize-none focus:outline-none font-bold text-lg text-black placeholder:text-black/50"
                      placeholder="Ketik catatan di sini..."
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* RIGHT: AI RUBBER DUCK CHAT */}
            <div className="w-full lg:w-96 bg-[#FF90E8] border-4 border-black shadow-[12px_12px_0px_#000] rounded-3xl flex flex-col flex-shrink-0 h-[600px] lg:h-auto">
              <div className="p-4 border-b-4 border-black bg-white rounded-t-2xl flex items-center gap-3">
                <div className="w-12 h-12 bg-black text-white text-2xl flex items-center justify-center border-2 border-black rounded-full shadow-[2px_2px_0px_#000]">
                  🦆
                </div>
                <div>
                  <h3 className="font-black text-xl leading-none">RUBBER DUCK</h3>
                  <p className="text-xs font-bold text-black/60">Tanya apa saja</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] border-2 border-black p-3 rounded-2xl shadow-[4px_4px_0px_#000] ${
                      msg.role === 'user' 
                        ? 'bg-[#38E54D] text-black rounded-br-sm' 
                        : 'bg-white text-black rounded-bl-sm'
                    }`}>
                      <ReactMarkdown
                        components={{
                          p: ({node, ...props}) => <p className="font-bold text-sm leading-relaxed" {...props} />,
                          code: ({node, inline, children, ...props}: any) => inline 
                            ? <code className="bg-black text-[#FFC900] px-1 rounded text-xs" {...props}>{children}</code>
                            : <code className="block bg-black text-[#FFC900] p-2 rounded text-xs mt-2 overflow-x-auto" {...props}>{children}</code>
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border-2 border-black p-3 rounded-2xl rounded-bl-sm shadow-[4px_4px_0px_#000] font-black animate-pulse">
                      Bebek sedang berpikir...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t-4 border-black bg-white rounded-b-2xl">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Tanya si bebek..."
                    className="flex-1 bg-[#FDF6E3] border-2 border-black p-3 rounded-xl font-bold focus:outline-none focus:bg-white"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isChatLoading}
                    className="bg-black text-white px-4 border-2 border-black rounded-xl font-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] transition-all disabled:opacity-50"
                  >
                    ➤
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    if (activePage.startsWith('day-')) {
      const dayNum = parseInt(activePage.split('-')[1]);
      const dayIndex = learningPath.findIndex(d => d.day === dayNum);
      const dayData = learningPath[dayIndex];

      if (!dayData) return null;

      const completedCount = dayData.topics.filter(t => t.completed).length;

      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          key={dayData.day}
          className="max-w-4xl mx-auto w-full px-8 py-16 text-black"
        >
          <div className="bg-[#00E5FF] border-4 border-black rounded-3xl p-12 shadow-[16px_16px_0px_#000] mb-12">
            <div className="inline-block px-4 py-2 bg-white border-2 border-black font-black text-sm uppercase mb-8 shadow-[4px_4px_0px_#000]">
              MISSION LOG
            </div>
            <h1 className="text-7xl font-black tracking-tighter mb-8 uppercase">
              DAY {dayData.day}
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex-1 h-6 bg-white border-4 border-black rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FFC900] transition-all border-r-4 border-black" 
                  style={{ width: `${(completedCount / dayData.topics.length) * 100}%` }}
                />
              </div>
              <span className="font-black text-2xl">{completedCount}/{dayData.topics.length}</span>
            </div>
          </div>

          <div className="space-y-8">
            {dayData.topics.map((topic, topicIndex) => (
              <div 
                key={topicIndex} 
                className={`group bg-white border-4 border-black rounded-2xl p-0 transition-all hover:translate-x-1 hover:translate-y-1 overflow-hidden ${
                  topic.completed 
                    ? 'bg-gray-100 shadow-none opacity-60' 
                    : 'shadow-[8px_8px_0px_#000] hover:shadow-[4px_4px_0px_#000]'
                }`}
              >
                <div className="flex flex-col md:flex-row items-stretch">
                  {/* Status Button Area */}
                  <div className="p-6 md:p-8 border-b-4 md:border-b-0 md:border-r-4 border-black flex items-center justify-center bg-[#FDF6E3]">
                    <button 
                      onClick={() => handleTopicComplete(dayIndex, topicIndex, !topic.completed)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-90"
                    >
                      {topic.completed ? (
                        <div className="w-12 h-12 rounded-xl bg-[#38E54D] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000]">
                          <Star className="w-7 h-7 text-black fill-current" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white border-4 border-black shadow-[4px_4px_0px_#000] group-hover:bg-[#FFC900]" />
                      )}
                    </button>
                  </div>
                  
                  {/* Topic Content Area (Clickable to Lesson View) */}
                  <div 
                    className="p-6 md:p-8 flex-1 cursor-pointer hover:bg-gray-50"
                    onClick={() => setActivePage(`topic-${dayIndex}-${topicIndex}`)}
                  >
                    <h3 className={`text-2xl md:text-3xl font-black uppercase leading-tight ${topic.completed ? 'line-through' : ''} break-words`}>
                      {topic.title}
                    </h3>
                    <p className="mt-4 text-xl font-bold text-black/60 leading-relaxed">
                      {topic.description}
                    </p>

                    {topic.explanation && (
                      <div className="mt-8 p-6 bg-[#FDF6E3] border-4 border-black shadow-[4px_4px_0px_#000] relative">
                         <div className="absolute top-0 left-4 -translate-y-1/2 bg-[#FFC900] border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_#000]">
                            AI Summary / Rangkuman
                         </div>
                         <p className="font-bold text-lg leading-relaxed whitespace-pre-wrap mt-2">
                            {topic.explanation}
                         </p>
                      </div>
                    )}
                    
                    <div className="mt-8 flex gap-4">
                      <span className="inline-flex items-center gap-2 bg-[#FF90E8] border-4 border-black px-6 py-3 rounded-xl font-black uppercase text-sm shadow-[4px_4px_0px_#000]">
                        <BookOpen className="w-5 h-5" /> BACA MODUL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    if (activePage.startsWith('topic-')) {
      const [, dayIdxStr, topicIdxStr] = activePage.split('-');
      const dayIndex = parseInt(dayIdxStr);
      const topicIndex = parseInt(topicIdxStr);
      const dayData = learningPath[dayIndex];
      const topic = dayData?.topics[topicIndex];

      if (!topic) return null;

      const lessonPages = topic.content ? topic.content.split(/\n---\n/) : [];

      const hasNextTopic = topicIndex < dayData.topics.length - 1;
      const hasPrevTopic = topicIndex > 0;

      return (
        <div className="flex flex-col h-full bg-[#FDF6E3] overflow-hidden">
          
          {/* TOP BAR (Sticky) */}
          <header className="h-20 border-b-4 border-black bg-[#FF90E8] flex items-center justify-between px-6 shrink-0 shadow-[0px_4px_0px_#000] z-20">
            <button 
              onClick={() => setActivePage(`day-${dayData.day}`)}
              className="font-black uppercase text-sm hover:-translate-y-0.5 transition-transform flex items-center gap-2 bg-white px-4 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]"
            >
              {'<'} KEMBALI
            </button>
            <div className="font-black uppercase text-xl truncate px-4 hidden md:block">
              {profile?.goal} - DAY {dayData.day}
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_#000] flex items-center justify-center font-black">
                😎
              </div>
            </div>
          </header>

          {/* MAIN WORKSPACE */}
          <div className="flex flex-1 overflow-hidden relative">
            
            {/* CENTER: Markdown Reader (Scrollable) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
              <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 pb-24">
                
                <h1 className="text-4xl md:text-5xl font-black mb-8 border-b-8 border-black pb-4 uppercase leading-tight">
                  {topic.title}
                </h1>

                {!topic.content ? (
                  <div className="flex flex-col items-center justify-center text-center py-20">
                    <div className="w-24 h-24 bg-[#FF90E8] border-4 border-black shadow-[8px_8px_0px_#000] mb-8 flex items-center justify-center rounded-2xl rotate-3 hover:rotate-0 transition-transform">
                      <Zap className="w-12 h-12 text-black" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-6 uppercase">GENERATE MAGIC LESSON</h2>
                    <p className="font-bold text-black/60 mb-10 max-w-lg text-lg">
                      Modul ini belum dibuat. Klik tombol di bawah untuk menyuruh AI meracikkan tutorial super lengkap.
                    </p>
                    {isGeneratingLesson ? (
                      <div className="w-full max-w-lg mt-8 border-4 border-black p-6 bg-white shadow-[8px_8px_0px_#000] rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-black uppercase text-xl">{loadingMessages[loadingMessageIndex]}</span>
                          <span className="font-black text-[#FF5F56] text-xl">{Math.floor(loadingProgress)}%</span>
                        </div>
                        <div className="w-full h-8 border-4 border-black rounded-full overflow-hidden bg-gray-200 relative">
                          <motion.div 
                            className="h-full bg-[#00E5FF] border-r-4 border-black"
                            initial={{ width: '0%' }}
                            animate={{ width: `${loadingProgress}%` }}
                            transition={{ ease: "linear", duration: 0.5 }}
                          />
                          {/* Animated stripes */}
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleGenerateLesson(dayIndex, topicIndex, topic)}
                        disabled={isGeneratingLesson}
                        className="px-8 py-4 bg-[#38E54D] text-black border-4 border-black rounded-xl font-black text-xl hover:-translate-y-2 hover:shadow-[8px_8px_0px_#000] shadow-[8px_8px_0px_#000] transition-all disabled:opacity-50 flex items-center gap-4 mt-8"
                      >
                        BUAT SEKARANG! 🔥
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col w-full">
                    {!isQuizMode ? (
                      <>
                        <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl md:text-5xl font-black uppercase border-b-8 border-black pb-4 mb-8 mt-4 leading-tight text-black" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl md:text-3xl font-black uppercase mt-12 mb-6 block w-fit max-w-full bg-[#FFC900] px-4 py-2 border-4 border-black shadow-[6px_6px_0px_#000] text-black" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl md:text-2xl font-black uppercase mt-10 mb-4 underline decoration-8 decoration-[#38E54D] text-black" {...props} />,
                        p: ({node, ...props}) => <p className="text-lg md:text-xl font-bold text-black/80 leading-relaxed mb-6" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-10 mb-8 space-y-3 text-lg md:text-xl font-bold text-black/80 marker:text-[#FF90E8]" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-10 mb-8 space-y-3 text-lg md:text-xl font-bold text-black/80 marker:text-[#38E54D]" {...props} />,
                        li: ({node, ...props}) => <li className="pl-2" {...props} />,
                        a: ({node, ...props}) => <a className="text-black bg-[#00E5FF] px-2 font-black underline decoration-4 hover:bg-black hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                        blockquote: ({node, ...props}) => (
                          <blockquote className="border-4 border-black bg-[#FF90E8] p-6 md:p-8 rounded-2xl shadow-[8px_8px_0px_#000] my-10 relative">
                            <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#FFC900] border-4 border-black rounded-full flex items-center justify-center font-black text-2xl shadow-[4px_4px_0px_#000] rotate-12 hover:rotate-0 transition-transform">💡</div>
                            <div className="font-bold text-black text-lg md:text-xl italic leading-relaxed" {...(props as any)} />
                          </blockquote>
                        ),
                        strong: ({node, ...props}) => <strong className="font-black text-black bg-[#FFC900] px-1 border-2 border-black" {...props} />,
                        table: ({node, ...props}) => (
                          <div className="w-full overflow-x-auto my-10 border-4 border-black shadow-[8px_8px_0px_#000] rounded-xl bg-white">
                            <table className="w-full text-left border-collapse" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-[#00E5FF] border-b-4 border-black" {...props} />,
                        tbody: ({node, ...props}) => <tbody className="divide-y-4 divide-black" {...props} />,
                        tr: ({node, ...props}) => <tr className="hover:bg-gray-100 transition-colors" {...props} />,
                        th: ({node, ...props}) => <th className="px-6 py-4 font-black uppercase text-black border-r-4 border-black last:border-r-0 text-lg whitespace-nowrap" {...props} />,
                        td: ({node, ...props}) => <td className="px-6 py-4 font-bold text-black border-r-4 border-black last:border-r-0" {...props} />,
                        code: ({node, className, children, ...props}: any) => {
                          const isInline = !className || !className.includes('language-');
                          const match = /language-(\w+)/.exec(className || '');
                          
                          if (!isInline && match) {
                            const language = match[1].toLowerCase();
                            const codeString = String(children).replace(/\n$/, '');
                            
                            // Web Technologies use Sandpack
                            if (['javascript', 'js', 'html', 'css', 'react', 'jsx', 'tsx'].includes(language)) {
                              let template: any = 'vanilla';
                              if (['react', 'jsx', 'tsx'].includes(language)) template = 'react';
                              
                              return (
                                <div className="my-10 border-4 border-black rounded-2xl overflow-hidden shadow-[12px_12px_0px_#000] relative z-10">
                                  <div className="bg-[#FFC900] px-4 py-3 flex items-center justify-between border-b-4 border-black">
                                    <div className="flex gap-2">
                                      <div className="w-4 h-4 rounded-full bg-[#FF5F56] border-2 border-black"></div>
                                      <div className="w-4 h-4 rounded-full bg-[#FFBD2E] border-2 border-black"></div>
                                      <div className="w-4 h-4 rounded-full bg-[#27C93F] border-2 border-black"></div>
                                    </div>
                                    <div className="font-black text-black text-sm uppercase tracking-widest flex items-center gap-2">
                                      <Zap className="w-4 h-4 fill-current"/> LIVE {language} EDITOR
                                    </div>
                                  </div>
                                  <Sandpack 
                                    template={template} 
                                    theme="dark"
                                    files={{
                                      [template === 'react' ? '/App.js' : (language === 'html' ? '/index.html' : '/index.js')]: codeString
                                    }}
                                    options={{
                                      showNavigator: false,
                                      editorHeight: 400,
                                      showLineNumbers: true,
                                    }}
                                  />
                                </div>
                              );
                            }
                            
                            // Fallback to static syntax highlighter for non-web languages
                            return (
                              <div className="my-10 border-4 border-black rounded-2xl overflow-hidden shadow-[12px_12px_0px_#000] group">
                                <div className="bg-black px-4 py-3 flex items-center gap-2 relative">
                                  <div className="w-4 h-4 rounded-full bg-[#FF5F56] border-2 border-black"></div>
                                  <div className="w-4 h-4 rounded-full bg-[#FFBD2E] border-2 border-black"></div>
                                  <div className="w-4 h-4 rounded-full bg-[#27C93F] border-2 border-black"></div>
                                  <div className="absolute left-1/2 -translate-x-1/2 font-black text-white/80 text-sm uppercase tracking-widest">{language}</div>
                                </div>
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={language}
                                  PreTag="div"
                                  customStyle={{ margin: 0, padding: '2rem', background: '#1E1E1E', fontSize: '1.125rem', lineHeight: '1.6' }}
                                  {...props}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
                            );
                          }
                          
                          return (
                            <code className="bg-[#00E5FF] text-black px-1.5 py-0.5 rounded-sm font-black text-base md:text-lg border-2 border-black shadow-[2px_2px_0px_#000] mx-0.5 inline-block" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {lessonPages[currentLessonPage] || topic.content}
                    </ReactMarkdown>

                    {/* Pagination Controls */}
                    {topic.content && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t-8 border-black pb-24 md:pb-12">
                        {lessonPages.length > 1 ? (
                          <>
                            <button
                              onClick={() => setCurrentLessonPage(p => Math.max(0, p - 1))}
                              disabled={currentLessonPage === 0}
                              className="w-full sm:w-auto px-6 py-3 bg-white text-black border-4 border-black rounded-xl font-black text-lg uppercase shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {'<'} Sebelumnya
                            </button>
                            
                            <div className="font-black text-xl uppercase bg-[#FFC900] px-4 py-2 border-4 border-black shadow-[4px_4px_0px_#000] text-center w-full sm:w-auto">
                              HAL {currentLessonPage + 1} / {lessonPages.length}
                            </div>
                          </>
                        ) : (
                          <div className="hidden sm:block"></div>
                        )}
                        
                        {currentLessonPage < lessonPages.length - 1 ? (
                          <button
                            onClick={() => setCurrentLessonPage(p => Math.min(lessonPages.length - 1, p + 1))}
                            className="w-full sm:w-auto px-6 py-3 bg-[#00E5FF] text-black border-4 border-black rounded-xl font-black text-lg uppercase shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all"
                          >
                            Selanjutnya {'>'}
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsQuizMode(true)}
                            className="w-full sm:w-auto px-6 py-3 bg-[#38E54D] text-black border-4 border-black rounded-xl font-black text-lg uppercase shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all"
                          >
                            LANJUT KUIS 🔥
                          </button>
                        )}
                      </div>
                    )}

                    {/* YouTube Recommendations Section */}
                    {currentLessonPage === lessonPages.length - 1 && topic.youtubeVideos && topic.youtubeVideos.length > 0 && (
                      <div className="mt-16 mb-8 p-6 md:p-10 bg-[#00E5FF] border-4 border-black rounded-3xl shadow-[12px_12px_0px_#000]">
                        <h2 className="text-3xl md:text-4xl font-black uppercase mb-8 flex items-center gap-4">
                          <PlayCircle className="w-10 h-10 text-white fill-black" /> VIDEO REFERENSI
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {topic.youtubeVideos.map((vid, idx) => (
                            <a
                              key={idx}
                              href={vid.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white border-4 border-black p-5 rounded-2xl shadow-[6px_6px_0px_#000] hover:-translate-y-2 hover:shadow-[10px_10px_0px_#000] transition-all flex items-start gap-4 group"
                            >
                              <div className="w-14 h-14 bg-[#FF5F56] border-4 border-black rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 text-white fill-current ml-1" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-black text-xl line-clamp-2 leading-tight mb-2">{vid.title}</h4>
                                <p className="text-sm font-bold text-black/60 uppercase">Tonton di YouTube ↗</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Interactive Quiz Section - Trigger */}
                    {currentLessonPage === lessonPages.length - 1 && topic.quiz && topic.quiz.length > 0 && !topic.quizCompleted && (
                      <div className="mt-16 p-8 md:p-12 bg-[#FFC900] border-4 border-black rounded-3xl shadow-[12px_12px_0px_#000] text-center">
                        <h2 className="text-3xl md:text-4xl font-black uppercase mb-6 flex items-center justify-center gap-4">
                          <Brain className="w-12 h-12" /> SIAP UJI PEMAHAMAN?
                        </h2>
                        <p className="font-bold text-xl md:text-2xl mb-10 text-black/80">
                          Kuis ini bersifat tertutup. Materi bacaan akan disembunyikan agar Anda tidak bisa menyontek!
                        </p>
                        <button
                          onClick={() => setIsQuizMode(true)}
                          className="px-10 py-5 bg-[#38E54D] text-black border-4 border-black font-black text-2xl uppercase rounded-xl hover:-translate-y-2 hover:shadow-[8px_8px_0px_#000] transition-all shadow-[4px_4px_0px_#000]"
                        >
                          MULAI KUIS SEKARANG 🚀
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-8 p-6 md:p-10 bg-[#FFC900] border-4 border-black rounded-3xl shadow-[12px_12px_0px_#000]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b-4 border-black pb-6">
                      <h2 className="text-3xl font-black uppercase flex items-center gap-3">
                        <Brain className="w-8 h-8" /> KUIS TERTUTUP
                      </h2>
                      <button 
                        onClick={() => setIsQuizMode(false)}
                        className="font-bold text-sm px-6 py-3 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] uppercase"
                      >
                        BACA MATERI LAGI
                      </button>
                    </div>
                        
                        {currentQuizIndex < topic.quiz!.length ? (
                          <div className="bg-white p-6 md:p-8 border-4 border-black rounded-xl shadow-[6px_6px_0px_#000]">
                            <div className="font-bold text-lg mb-4 text-black/60">
                              Pertanyaan {currentQuizIndex + 1} dari {topic.quiz!.length}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black mb-8 leading-tight">
                              {topic.quiz![currentQuizIndex].question}
                            </h3>
                            
                            <div className="space-y-4">
                              {topic.quiz![currentQuizIndex].options.map((opt, optIdx) => {
                                const isAnswered = quizAnswered[currentQuizIndex] !== undefined;
                                const isSelected = quizAnswered[currentQuizIndex] === optIdx;
                                const isCorrect = optIdx === topic.quiz![currentQuizIndex].correctAnswerIndex;
                                
                                let btnClass = "bg-white hover:bg-[#FDF6E3] hover:-translate-y-1 shadow-[4px_4px_0px_#000]";
                                if (isAnswered) {
                                  if (isCorrect) btnClass = "bg-[#38E54D] text-black shadow-none translate-y-1";
                                  else if (isSelected) btnClass = "bg-[#FF5F56] text-white shadow-none translate-y-1";
                                  else btnClass = "bg-white opacity-50 shadow-none translate-y-1";
                                }
                                
                                return (
                                  <button
                                    key={optIdx}
                                    disabled={isAnswered}
                                    onClick={() => {
                                      const newAnswered = { ...quizAnswered, [currentQuizIndex]: optIdx };
                                      setQuizAnswered(newAnswered);
                                      if (isCorrect) setQuizScore(s => s + 1);
                                      
                                      setTimeout(() => {
                                        setCurrentQuizIndex(i => i + 1);
                                      }, 3000); // 3 second delay to read explanation
                                    }}
                                    className={`w-full p-4 border-4 border-black rounded-xl text-left font-bold text-lg md:text-xl transition-all ${btnClass}`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <span className="w-10 h-10 shrink-0 flex items-center justify-center border-4 border-current rounded-full font-black bg-white text-black">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      {opt}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            
                            {/* Explanation Box */}
                            {quizAnswered[currentQuizIndex] !== undefined && (
                              <div className={`mt-8 p-6 border-4 border-black rounded-xl font-bold text-lg md:text-xl shadow-[4px_4px_0px_#000] ${
                                quizAnswered[currentQuizIndex] === topic.quiz![currentQuizIndex].correctAnswerIndex 
                                  ? 'bg-[#38E54D] text-black' 
                                  : 'bg-[#FF5F56] text-white'
                              }`}>
                                <div className="font-black text-2xl mb-2">
                                  {quizAnswered[currentQuizIndex] === topic.quiz![currentQuizIndex].correctAnswerIndex 
                                    ? '✅ BENAR!' 
                                    : '❌ SALAH!'}
                                </div>
                                {topic.quiz![currentQuizIndex].explanation}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white p-10 border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] text-center">
                            <h3 className="text-4xl md:text-5xl font-black uppercase mb-6">
                              {quizScore === topic.quiz!.length ? "LULUS SEMPURNA! 🎉" : "KUIS SELESAI!"}
                            </h3>
                            <p className="text-3xl font-black mb-10 border-4 border-black inline-block px-6 py-3 bg-[#FF90E8] -rotate-2">
                              Skor: {quizScore} / {topic.quiz!.length}
                            </p>
                            <br/>
                            {quizScore >= Math.ceil(topic.quiz!.length / 2) ? (
                              <button
                                onClick={() => {
                                  markQuizCompleted(dayIndex, topicIndex);
                                  if (quizScore === topic.quiz!.length) {
                                    addExp(100);
                                    toast.success('BONUS +100 EXP UNTUK KUIS SEMPURNA!', {
                                      style: {
                                        border: '4px solid black',
                                        padding: '16px',
                                        color: 'black',
                                        background: '#38E54D',
                                        fontWeight: '900',
                                        boxShadow: '6px 6px 0px #000',
                                      },
                                    });
                                  }
                                  setIsQuizMode(false);
                                }}
                                className="px-10 py-5 bg-[#38E54D] text-black border-4 border-black font-black text-2xl uppercase rounded-xl hover:-translate-y-2 hover:shadow-[8px_8px_0px_#000] transition-all shadow-[4px_4px_0px_#000]"
                              >
                                BUKA KUNCI MATERI 🔓
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setCurrentQuizIndex(0);
                                  setQuizScore(0);
                                  setQuizAnswered({});
                                }}
                                className="px-10 py-5 bg-[#FF5F56] text-white border-4 border-black font-black text-2xl uppercase rounded-xl hover:-translate-y-2 hover:shadow-[8px_8px_0px_#000] transition-all shadow-[4px_4px_0px_#000]"
                              >
                                COBA LAGI 🔄
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR: Curriculum (Fixed Width, Scrollable) */}
            <div className="w-80 border-l-4 border-black bg-[#FDF6E3] flex-col shrink-0 hidden lg:flex z-10 relative">
              <div className="p-6 border-b-4 border-black bg-[#FF90E8] shadow-[0px_4px_0px_#000] z-20">
                <h3 className="font-black text-xl uppercase flex items-center justify-between">
                  DAFTAR MODUL
                  <span className="text-xs px-2 py-1 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_#000]">
                    {dayData.topics.filter(t => t.completed).length}/{dayData.topics.length}
                  </span>
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4">
                {dayData.topics.map((t, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActivePage(`topic-${dayIndex}-${idx}`)}
                    className={`flex items-start gap-4 text-left group p-4 border-4 border-black rounded-xl transition-all ${idx === topicIndex ? 'bg-white shadow-[4px_4px_0px_#000] translate-x-2' : 'bg-[#FFC900] hover:bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000]'}`}
                  >
                    <div className={`w-6 h-6 shrink-0 rounded-full border-2 border-black flex items-center justify-center mt-1 ${t.completed ? 'bg-[#38E54D]' : 'bg-white'}`}>
                      {t.completed && <CheckCircle2 className="w-3 h-3 text-black" />}
                    </div>
                    <div>
                      <div className={`font-black uppercase text-sm leading-tight group-hover:underline ${idx === topicIndex ? 'text-black' : 'text-black/80'}`}>
                        {t.title}
                      </div>
                      <div className="text-xs font-bold text-black/50 mt-1 uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" /> FOKUS MODE
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Action Button in Sidebar */}
              {topic.content && (
                <div className="p-6 border-t-4 border-black bg-white z-20">
                  {topic.quiz && !topic.quizCompleted ? (
                    <button 
                      disabled
                      className="w-full py-4 border-4 border-black font-black uppercase text-lg transition-all rounded-xl bg-gray-200 text-black/40 shadow-none cursor-not-allowed border-dashed"
                    >
                      SELESAIKAN KUIS 🔒
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        handleTopicComplete(dayIndex, topicIndex, !topic.completed);
                        if (!topic.completed && hasNextTopic) {
                          setActivePage(`topic-${dayIndex}-${topicIndex + 1}`);
                        } else if (!topic.completed && !hasNextTopic) {
                          setActivePage(`day-${dayData.day}`);
                        }
                      }}
                      className={`w-full py-4 border-4 border-black font-black uppercase text-lg transition-all rounded-xl ${
                        topic.completed 
                          ? 'bg-gray-200 text-black translate-y-1 shadow-none' 
                          : 'bg-[#38E54D] text-black shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000]'
                      }`}
                    >
                      {topic.completed ? 'SELESAI ✅' : 'TANDAI SELESAI 🔥'}
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen bg-[#FDF6E3] text-black font-sans overflow-hidden">
      <DailyCheckIn />
      
      {/* Mobile Menu Backdrop */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Neo-Brutalist Sidebar */}
      <NotionSidebar 
        activePage={activePage} 
        setActivePage={(page) => {
           setActivePage(page);
           setIsSidebarOpen(false); // Close sidebar on mobile when navigating
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 h-screen custom-scrollbar ${activePage.startsWith('topic-') ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {renderContent()}
      </main>

      {/* Mobile Floating Menu Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#FFC900] border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
      >
        {isSidebarOpen ? <X className="w-8 h-8 text-black" /> : <Menu className="w-8 h-8 text-black" />}
      </button>
    </div>
  );
}
