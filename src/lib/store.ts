import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Resource {
  title: string;
  url: string;
  type: string; // 'Video', 'Artikel', 'Course', dll
}

export interface Topic {
  title: string;
  description: string;
  resources: Resource[];
  estimatedHours: number;
  completed: boolean;
}

export interface DayPlan {
  day: number;
  topics: Topic[];
  isCompleted: boolean;
}

export interface UserProfile {
  goal: string;
  level: string;
  hoursPerDay: number;
}

interface AppState {
  profile: UserProfile | null;
  learningPath: DayPlan[] | null;
  currentDay: number;
  streak: number;
  lastCheckInDate: string | null;
  notes: string;
  setProfile: (profile: UserProfile) => void;
  setLearningPath: (path: DayPlan[]) => void;
  markTopicCompleted: (dayIndex: number, topicIndex: number, completed: boolean) => void;
  checkIn: () => void;
  setNotes: (notes: string) => void;
  resetProgress: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      learningPath: null,
      currentDay: 1,
      streak: 0,
      lastCheckInDate: null,
      notes: "",
      
      setProfile: (profile) => set({ profile }),
      
      setLearningPath: (path) => set({ learningPath: path }),

      setNotes: (notes) => set({ notes }),
      
      markTopicCompleted: (dayIndex, topicIndex, completed) => 
        set((state) => {
          if (!state.learningPath) return state;
          
          const newPath = [...state.learningPath];
          newPath[dayIndex].topics[topicIndex].completed = completed;
          
          // Check if all topics in the day are completed
          const allTopicsCompleted = newPath[dayIndex].topics.every(t => t.completed);
          newPath[dayIndex].isCompleted = allTopicsCompleted;
          
          return { learningPath: newPath };
        }),
        
      checkIn: () => 
        set((state) => {
          const today = new Date().toDateString();
          if (state.lastCheckInDate === today) return state; // Already checked in today
          
          let newStreak = state.streak;
          if (state.lastCheckInDate) {
            const lastDate = new Date(state.lastCheckInDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastDate.toDateString() === yesterday.toDateString()) {
              newStreak += 1; // Continuing streak
            } else {
              newStreak = 1; // Streak broken, start from 1
            }
          } else {
            newStreak = 1; // First check in
          }
          
          return { 
            streak: newStreak, 
            lastCheckInDate: today 
          };
        }),
        
      resetProgress: () => set({
        profile: null,
        learningPath: null,
        currentDay: 1,
        streak: 0,
        lastCheckInDate: null,
        notes: "",
      }),
    }),
    {
      name: 'jejak-storage', // name of item in the storage (must be unique)
    }
  )
);
