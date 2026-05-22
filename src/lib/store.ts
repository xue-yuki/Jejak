import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Resource {
  title: string;
  url: string;
  type: string; // 'Video', 'Artikel', 'Course', dll
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Topic {
  title: string;
  description: string;
  explanation?: string;
  content?: string;
  quiz?: QuizItem[];
  quizCompleted?: boolean;
  resources: Resource[];
  youtubeVideos?: { title: string; url: string }[];
  estimatedHours: number;
  completed: boolean;
}

export interface DayPlan {
  day: number;
  topics: Topic[];
  isCompleted: boolean;
}

export interface UserProfile {
  name?: string;
  goal: string;
  level: string;
  hoursPerDay: number;
}

export interface StickyNote {
  id: string;
  content: string;
  color: string;
  x: number;
  y: number;
}

interface AppState {
  profile: UserProfile | null;
  learningPath: DayPlan[] | null;
  currentDay: number;
  streak: number;
  lastCheckInDate: string | null;
  notes: string;
  stickyNotes: StickyNote[];
  exp: number;
  setProfile: (profile: UserProfile) => void;
  setLearningPath: (path: DayPlan[]) => void;
  appendLearningPath: (path: DayPlan[]) => void;
  setTopicData: (dayIndex: number, topicIndex: number, content: string, quiz?: QuizItem[], youtubeVideos?: { title: string; url: string }[]) => void;
  markTopicCompleted: (dayIndex: number, topicIndex: number, completed: boolean) => void;
  markQuizCompleted: (dayIndex: number, topicIndex: number) => void;
  checkIn: () => void;
  setNotes: (notes: string) => void;
  addStickyNote: (note: StickyNote) => void;
  updateStickyNote: (id: string, updates: Partial<StickyNote>) => void;
  deleteStickyNote: (id: string) => void;
  addExp: (amount: number) => void;
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
      stickyNotes: [],
      exp: 0,
      
      setProfile: (profile) => set({ profile }),
      
      setLearningPath: (path) => set({ learningPath: path }),

      appendLearningPath: (newDays) => set((state) => ({
        learningPath: state.learningPath ? [...state.learningPath, ...newDays] : newDays
      })),

      setTopicData: (dayIndex, topicIndex, content, quiz, youtubeVideos) => 
        set((state) => {
          if (!state.learningPath) return state;
          const newPath = [...state.learningPath];
          newPath[dayIndex].topics[topicIndex].content = content;
          newPath[dayIndex].topics[topicIndex].quiz = quiz;
          newPath[dayIndex].topics[topicIndex].youtubeVideos = youtubeVideos;
          newPath[dayIndex].topics[topicIndex].quizCompleted = false; // Reset on new generation
          return { learningPath: newPath };
        }),

      setNotes: (notes) => set({ notes }),
      
      addStickyNote: (note) => set((state) => ({ 
        stickyNotes: [...state.stickyNotes, note] 
      })),
      
      updateStickyNote: (id, updates) => set((state) => ({
        stickyNotes: state.stickyNotes.map((note) => 
          note.id === id ? { ...note, ...updates } : note
        )
      })),
      
      deleteStickyNote: (id) => set((state) => ({
        stickyNotes: state.stickyNotes.filter((note) => note.id !== id)
      })),
      
      markTopicCompleted: (dayIndex, topicIndex, completed) => 
        set((state) => {
          if (!state.learningPath) return state;
          
          const newPath = [...state.learningPath];
          const topic = newPath[dayIndex].topics[topicIndex];
          
          // Add EXP if newly completed
          let addedExp = 0;
          if (!topic.completed && completed) {
            addedExp = 50;
          }
          
          topic.completed = completed;
          
          // Check if all topics in the day are completed
          const allTopicsCompleted = newPath[dayIndex].topics.every(t => t.completed);
          newPath[dayIndex].isCompleted = allTopicsCompleted;
          
          return { learningPath: newPath, exp: state.exp + addedExp };
        }),

      markQuizCompleted: (dayIndex, topicIndex) => 
        set((state) => {
          if (!state.learningPath) return state;
          const newPath = [...state.learningPath];
          newPath[dayIndex].topics[topicIndex].quizCompleted = true;
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
            lastCheckInDate: today,
            exp: state.exp + 50
          };
        }),
        
      addExp: (amount) => set((state) => ({ exp: state.exp + amount })),
        
      resetProgress: () => set({
        profile: null,
        learningPath: null,
        currentDay: 1,
        streak: 0,
        lastCheckInDate: null,
        notes: "",
        stickyNotes: [],
        exp: 0,
      }),
    }),
    {
      name: 'jejak-storage', // name of item in the storage (must be unique)
    }
  )
);
