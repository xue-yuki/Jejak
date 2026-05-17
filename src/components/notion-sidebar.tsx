"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import toast from "react-hot-toast";
import { 
  Home, Edit3, Settings, Search, 
  ChevronRight, LayoutDashboard, Compass, Star, Zap, Loader2
} from "lucide-react";

type NotionSidebarProps = {
  activePage: string;
  setActivePage: (page: string) => void;
};

export function NotionSidebar({ activePage, setActivePage }: NotionSidebarProps) {
  const profile = useAppStore((state) => state.profile);
  const learningPath = useAppStore((state) => state.learningPath);
  const appendLearningPath = useAppStore((state) => state.appendLearningPath);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!profile || !learningPath) return null;

  return (
    <aside className="w-[280px] h-screen bg-white border-r-4 border-black flex flex-col flex-shrink-0 text-black overflow-hidden select-none z-20 relative">
      {/* Workspace Header */}
      <div className="p-6 border-b-4 border-black bg-[#FFC900] hover:bg-[#FF90E8] cursor-pointer transition-colors">
        <div className="flex items-center gap-3 font-black text-xl uppercase tracking-tight">
          <div className="w-8 h-8 bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center rounded-md">
            {profile.goal.charAt(0).toUpperCase()}
          </div>
          <span className="truncate">{profile.goal}&apos;S HQ</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {/* Main Nav */}
        <div className="mb-8 space-y-3">
          <button 
            onClick={() => setActivePage('search')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] rounded-lg transition-all font-bold"
          >
            <Search className="w-5 h-5" /> SEARCH
          </button>
          <button 
            onClick={() => setActivePage('settings')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border-2 border-black shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] rounded-lg transition-all font-bold"
          >
            <Settings className="w-5 h-5" /> SETTINGS
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="mb-8">
          <div className="font-black text-black/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" /> DASHBOARD
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => setActivePage('home')}
              className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-black rounded-lg transition-all font-bold ${
                activePage === 'home' 
                  ? 'bg-[#38E54D] shadow-[4px_4px_0px_#000]' 
                  : 'bg-white hover:bg-[#38E54D]/20 hover:shadow-[4px_4px_0px_#000]'
              }`}
            >
              <Home className="w-5 h-5" /> HOME
            </button>
            <button 
              onClick={() => setActivePage('notes')}
              className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-black rounded-lg transition-all font-bold ${
                activePage === 'notes' 
                  ? 'bg-[#FF90E8] shadow-[4px_4px_0px_#000]' 
                  : 'bg-white hover:bg-[#FF90E8]/20 hover:shadow-[4px_4px_0px_#000]'
              }`}
            >
              <Edit3 className="w-5 h-5" /> NOTES
            </button>
          </div>
        </div>

        <div>
          <div className="font-black text-black/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Compass className="w-4 h-4" /> THE JOURNEY
          </div>
          <div className="space-y-6">
            {Array.from({ length: Math.ceil(learningPath.length / 7) }).map((_, levelIndex) => {
              const levelDays = learningPath.slice(levelIndex * 7, (levelIndex + 1) * 7);
              
              return (
                <div key={levelIndex}>
                  <div className="font-black text-xs text-black/40 uppercase tracking-widest mb-3">
                    LEVEL {levelIndex + 1}
                  </div>
                  <div className="space-y-3">
                    {levelDays.map((day) => {
                      const isActive = activePage === `day-${day.day}`;
                      const isCompleted = day.isCompleted;

                      let bgColor = 'bg-white';
                      if (isActive) bgColor = 'bg-[#FFC900]';
                      if (isCompleted && !isActive) bgColor = 'bg-black text-white';

                      return (
                        <button 
                          key={day.day}
                          onClick={() => setActivePage(`day-${day.day}`)}
                          className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-black rounded-lg transition-all font-bold ${bgColor} ${
                            isActive || isCompleted ? 'shadow-[4px_4px_0px_#000]' : 'hover:shadow-[4px_4px_0px_#000] hover:-translate-y-1'
                          }`}
                        >
                          <div className={`w-6 h-6 flex items-center justify-center border-2 border-current rounded-full bg-white`}>
                            {isCompleted && <Star className="w-3 h-3 text-black fill-current" />}
                          </div>
                          <span className="truncate uppercase">DAY {day.day}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {learningPath.length < 90 && (
              <div className="mt-8 pt-4 border-t-2 border-black/10">
                <button
                  onClick={async () => {
                    if (isGenerating) return;
                    setIsGenerating(true);
                    try {
                      const response = await fetch('/api/generate-path', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          goal: profile.goal,
                          level: profile.level,
                          hoursPerDay: profile.hoursPerDay,
                          startDay: learningPath.length + 1
                        }),
                      });

                      if (!response.ok) throw new Error("Gagal generate fase berikutnya");
                      
                      const jsonResult = await response.json();
                      const pathArray = Array.isArray(jsonResult) ? jsonResult : jsonResult.learningPath;
                      
                      appendLearningPath(pathArray);
                      toast.success(`Fase berikutnya (Hari ${learningPath.length + 1}) berhasil ditambahkan!`);
                    } catch (error) {
                      console.error(error);
                      toast.error("Gagal membuat fase berikutnya. Coba lagi.");
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-[#FFC900] border-2 border-black rounded-lg transition-all font-black text-black uppercase hover:-translate-y-1 hover:shadow-[4px_4px_0px_#000] disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> MENGANALISIS...</>
                  ) : (
                    <><Zap className="w-5 h-5 fill-current" /> GENERATE FASE {Math.floor(learningPath.length / 30) + 1}</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 border-t-4 border-black bg-white font-black uppercase text-sm tracking-widest text-center">
        JEJAK AI ? 2026
      </div>
    </aside>
  );
}
