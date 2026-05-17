"use client";

import { useAppStore } from "@/lib/store";
import { Edit3, Calendar, BarChart2 } from "lucide-react";

export function Sidebar() {
  const profile = useAppStore((state) => state.profile);
  const learningPath = useAppStore((state) => state.learningPath);
  const notes = useAppStore((state) => state.notes);
  const setNotes = useAppStore((state) => state.setNotes);

  if (!profile || !learningPath) return null;

  // calculate progress
  let totalTopics = 0;
  let completedTopics = 0;
  learningPath.forEach(day => {
    day.topics.forEach(t => {
      totalTopics++;
      if (t.completed) completedTopics++;
    })
  });
  
  const progress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  const scrollToDay = (day: number) => {
    const el = document.getElementById(`day-${day}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto no-scrollbar pb-8">
      
      {/* Chart */}
      <div className="bg-background border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold flex items-center gap-2 mb-4 text-primary">
          <BarChart2 className="w-5 h-5"/> Analitik Belajar
        </h3>
        <div className="text-sm font-medium text-foreground/80 mb-2 flex justify-between">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }}/>
        </div>
        <div className="mt-4 flex justify-between text-xs font-bold text-foreground/50 uppercase tracking-wider">
          <span>{completedTopics} Topik Selesai</span>
          <span>{totalTopics} Total Topik</span>
        </div>
      </div>

      {/* Grid Timeline */}
      <div className="bg-background border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold flex items-center gap-2 mb-4 text-primary">
          <Calendar className="w-5 h-5"/> Timeline
        </h3>
        <div className="flex flex-wrap gap-2">
          {learningPath.map((day, i) => {
            // Check if day is currently active (first uncompleted day)
            let isCurrent = false;
            if (!day.isCompleted) {
              const previousDaysCompleted = i === 0 || learningPath[i-1].isCompleted;
              isCurrent = previousDaysCompleted;
            }

            return (
              <button 
                key={day.day} 
                onClick={() => scrollToDay(day.day)}
                title={`Lompat ke Hari ${day.day}`}
                className={`w-7 h-7 rounded-md transition-all border ${
                  day.isCompleted 
                    ? 'bg-primary border-primary hover:bg-primary/80' 
                    : isCurrent
                      ? 'bg-primary/20 border-primary animate-pulse hover:bg-primary/30'
                      : 'bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              />
            );
          })}
        </div>
        <p className="text-xs text-foreground/50 mt-4 text-center">
          Klik kotak untuk lompat ke hari tersebut.
        </p>
      </div>

      {/* Quick Notes */}
      <div className="bg-background border border-black/10 dark:border-white/10 rounded-2xl p-5 flex-1 flex flex-col min-h-[300px] shadow-sm">
        <h3 className="font-bold flex items-center gap-2 mb-4 text-primary">
          <Edit3 className="w-5 h-5"/> Catatan Belajar
        </h3>
        <textarea
           value={notes || ""}
           onChange={(e) => setNotes(e.target.value)}
           placeholder="Tulis apapun di sini (shortcut, tugas tambahan, ide)... Otomatis tersimpan kok!"
           className="w-full flex-1 bg-transparent resize-none focus:outline-none text-sm leading-relaxed"
           spellCheck={false}
        />
      </div>

    </div>
  );
}
