"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAppStore } from "@/lib/store";
import { 
  Target, ExternalLink, 
  ArrowRight, BarChart2, Edit3, Zap, Lock, Play, Star, Sparkles, BookOpen, Clock, Flame, CheckCircle2, Brain
} from "lucide-react";
import { DailyCheckIn } from "@/components/daily-check-in";
import { NotionSidebar } from "@/components/notion-sidebar";

export default function Dashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [activePage, setActivePage] = useState<string>("home");
  const [viewLevel, setViewLevel] = useState<number>(1);
  
  const profile = useAppStore((state) => state.profile);
  const learningPath = useAppStore((state) => state.learningPath);
  const streak = useAppStore((state) => state.streak);
  const notes = useAppStore((state) => state.notes);
  const setNotes = useAppStore((state) => state.setNotes);
  const setTopicData = useAppStore((state) => state.setTopicData);
  const markTopicCompleted = useAppStore((state) => state.markTopicCompleted);
  const markQuizCompleted = useAppStore((state) => state.markQuizCompleted);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<{ [key: number]: number }>({}); // Track user's answers
  const [isQuizMode, setIsQuizMode] = useState(false);

  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

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
    document.documentElement.style.colorScheme = 'light';
  }, []);

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
      const data = await res.json();
      if (data.markdown) {
        setTopicData(dayIndex, topicIndex, data.markdown, data.quiz);
        setCurrentQuizIndex(0);
        setQuizScore(0);
        setQuizAnswered({});
        setIsQuizMode(false);
      }
    } catch (e) {
      console.error(e);
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
              <div className="bg-[#7B61FF] border-4 border-black rounded-3xl p-8 md:p-12 shadow-[8px_8px_0px_#000] relative overflow-hidden text-white">
                <Sparkles className="absolute right-10 top-10 w-32 h-32 text-white/20" />
                <Sparkles className="absolute right-40 bottom-10 w-16 h-16 text-white/20" />
                <div className="relative z-10 max-w-lg">
                  <div className="inline-block px-3 py-1 bg-white text-black font-black text-xs uppercase mb-4 border-2 border-black shadow-[2px_2px_0px_#000]">
                    YOUR MISSION
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight uppercase">
                    Master <span className="text-[#FFC900]">{profile.goal}</span> <br/> Like a Pro!
                  </h1>
                  <button 
                    onClick={() => setActivePage(`day-${activeDay.day}`)}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-black uppercase text-sm hover:scale-105 transition-transform"
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

    if (activePage === 'notes') {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-5xl mx-auto w-full px-8 py-16 flex flex-col h-full text-black"
        >
          <div className="bg-[#FF90E8] border-4 border-black shadow-[16px_16px_0px_#000] rounded-3xl p-12 flex flex-col flex-1">
            <h1 className="text-5xl font-black mb-12 flex items-center gap-4 uppercase border-b-4 border-black pb-6">
              <Edit3 className="w-12 h-12" /> SCRATCHPAD
            </h1>
            <textarea
              ref={notesRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="WRITE YOUR BRILLIANT IDEAS HERE..."
              className="w-full flex-1 bg-white border-4 border-black p-8 rounded-xl resize-none focus:outline-none text-2xl font-bold leading-relaxed text-black placeholder:text-black/20 shadow-inner custom-scrollbar"
              spellCheck={false}
            />
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
                <div className="flex items-stretch">
                  {/* Status Button Area */}
                  <div className="p-8 border-r-4 border-black flex items-center justify-center bg-[#FDF6E3]">
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
                    className="p-8 flex-1 cursor-pointer hover:bg-gray-50"
                    onClick={() => setActivePage(`topic-${dayIndex}-${topicIndex}`)}
                  >
                    <h3 className={`text-3xl font-black uppercase leading-tight ${topic.completed ? 'line-through' : ''}`}>
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
                    <button 
                      onClick={() => handleGenerateLesson(dayIndex, topicIndex, topic)}
                      disabled={isGeneratingLesson}
                      className="px-8 py-4 bg-[#38E54D] text-black border-4 border-black rounded-xl font-black text-xl hover:-translate-y-2 hover:shadow-[8px_8px_0px_#000] shadow-[8px_8px_0px_#000] transition-all disabled:opacity-50 flex items-center gap-4"
                    >
                      {isGeneratingLesson ? (
                        <><div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div> MENYUSUN MODUL...</>
                      ) : "BUAT SEKARANG! 🔥"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col w-full">
                    {!isQuizMode ? (
                      <>
                        <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl md:text-5xl font-black uppercase border-b-8 border-black pb-4 mb-8 mt-4 leading-tight text-black" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl md:text-3xl font-black uppercase mt-12 mb-6 inline-block bg-[#FFC900] px-4 py-2 border-4 border-black shadow-[6px_6px_0px_#000] text-black" {...props} />,
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
                        code: ({node, className, children, ...props}: any) => {
                          const isInline = !className || !className.includes('language-');
                          const match = /language-(\w+)/.exec(className || '');
                          
                          return !isInline && match ? (
                            <div className="my-10 border-4 border-black rounded-2xl overflow-hidden shadow-[12px_12px_0px_#000] group">
                              <div className="bg-black px-4 py-3 flex items-center gap-2 relative">
                                <div className="w-4 h-4 rounded-full bg-[#FF5F56] border-2 border-black"></div>
                                <div className="w-4 h-4 rounded-full bg-[#FFBD2E] border-2 border-black"></div>
                                <div className="w-4 h-4 rounded-full bg-[#27C93F] border-2 border-black"></div>
                                <div className="absolute left-1/2 -translate-x-1/2 font-black text-white/80 text-sm uppercase tracking-widest">{match[1]}</div>
                              </div>
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{ margin: 0, padding: '2rem', background: '#1E1E1E', fontSize: '1.125rem', lineHeight: '1.6' }}
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className="bg-black text-[#FFC900] px-2 py-1 rounded-md font-bold text-base md:text-lg border-2 border-black shadow-[2px_2px_0px_#FFC900]" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {topic.content}
                    </ReactMarkdown>
                    
                    {/* Interactive Quiz Section - Trigger */}
                    {topic.quiz && topic.quiz.length > 0 && !topic.quizCompleted && (
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
                        
                        {currentQuizIndex < topic.quiz.length ? (
                          <div className="bg-white p-6 md:p-8 border-4 border-black rounded-xl shadow-[6px_6px_0px_#000]">
                            <div className="font-bold text-lg mb-4 text-black/60">
                              Pertanyaan {currentQuizIndex + 1} dari {topic.quiz.length}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black mb-8 leading-tight">
                              {topic.quiz[currentQuizIndex].question}
                            </h3>
                            
                            <div className="space-y-4">
                              {topic.quiz[currentQuizIndex].options.map((opt, optIdx) => {
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
                                quizAnswered[currentQuizIndex] === topic.quiz[currentQuizIndex].correctAnswerIndex 
                                  ? 'bg-[#38E54D] text-black' 
                                  : 'bg-[#FF5F56] text-white'
                              }`}>
                                <div className="font-black text-2xl mb-2">
                                  {quizAnswered[currentQuizIndex] === topic.quiz[currentQuizIndex].correctAnswerIndex 
                                    ? '✅ BENAR!' 
                                    : '❌ SALAH!'}
                                </div>
                                {topic.quiz[currentQuizIndex].explanation}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-white p-10 border-4 border-black rounded-xl shadow-[8px_8px_0px_#000] text-center">
                            <h3 className="text-4xl md:text-5xl font-black uppercase mb-6">
                              {quizScore === topic.quiz.length ? "LULUS SEMPURNA! 🎉" : "KUIS SELESAI!"}
                            </h3>
                            <p className="text-3xl font-black mb-10 border-4 border-black inline-block px-6 py-3 bg-[#FF90E8] -rotate-2">
                              Skor: {quizScore} / {topic.quiz.length}
                            </p>
                            <br/>
                            {quizScore >= Math.ceil(topic.quiz.length / 2) ? (
                              <button
                                onClick={() => {
                                  markQuizCompleted(dayIndex, topicIndex);
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
      
      {/* Neo-Brutalist Sidebar */}
      <NotionSidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <main className={`flex-1 h-screen custom-scrollbar ${activePage.startsWith('topic-') ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {renderContent()}
      </main>
    </div>
  );
}
