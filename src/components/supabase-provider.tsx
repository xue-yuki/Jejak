"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store";
import toast from "react-hot-toast";

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const profile = useAppStore((state) => state.profile);
  const learningPath = useAppStore((state) => state.learningPath);
  const exp = useAppStore((state) => state.exp);
  const setProfile = useAppStore((state) => state.setProfile);
  const setLearningPath = useAppStore((state) => state.setLearningPath);
  const addExp = useAppStore((state) => state.addExp);

  useEffect(() => {
    const checkUserAndSync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session and not on landing/login page, force to login
      if (!session && pathname !== '/login' && pathname !== '/') {
        router.push('/login');
        return;
      }

      if (session) {
        if (pathname === '/login') {
          router.push('/dashboard');
        }

        const userId = session.user.id;
        
        // Fetch remote profile
        const { data: dbProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (dbProfile) {
           // Sync DB to Local
           if (dbProfile.goal && !profile?.goal) {
              setProfile({ name: dbProfile.name || '', goal: dbProfile.goal, level: 'Beginner', hoursPerDay: 2 });
           }
           if (dbProfile.learning_path && !learningPath) {
              setLearningPath(dbProfile.learning_path);
           }
           if (dbProfile.exp > exp) {
             addExp(dbProfile.exp - exp);
           }

           // Redirect to onboarding if no learning path is set
           if (!dbProfile.learning_path && !learningPath && pathname !== '/onboarding') {
              router.push('/onboarding');
           } else if (dbProfile.learning_path && pathname === '/onboarding') {
              router.push('/dashboard');
           }

        } else if (!error || error.code === 'PGRST116') {
           // First time login, insert local data to DB
           const { error: insertError } = await supabase.from('profiles').insert({
             id: userId,
             name: profile?.name || '',
             goal: profile?.goal || 'Mulai Belajar',
             exp: exp || 0,
             learning_path: learningPath || null
           });
           
           if (insertError) console.error("Supabase Insert Error:", insertError);

           if (!learningPath && pathname !== '/onboarding') {
              router.push('/onboarding');
           }
        }
      }
      setIsInitialized(true);
    };

    checkUserAndSync();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/login' && pathname !== '/') {
         router.push('/login');
      } else if (session && (pathname === '/login' || pathname === '/')) {
         if (!learningPath) {
           router.push('/onboarding');
         } else {
           router.push('/dashboard');
         }
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // Debounced Sync to Supabase whenever Zustand state changes
  useEffect(() => {
    if (!isInitialized) return;

    const syncStateToDb = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { error } = await supabase.from('profiles').upsert({
         id: session.user.id,
         name: profile?.name || '',
         goal: profile?.goal || 'Mulai Belajar',
         exp: exp,
         learning_path: learningPath
      });

      if (error) {
        console.error("Supabase Sync Error:", error.message, error.details, error.hint);
      }
    };

    const debounceSync = setTimeout(() => {
      syncStateToDb();
    }, 2000); 

    return () => clearTimeout(debounceSync);
  }, [profile, learningPath, exp, isInitialized]);

  if (!isInitialized && pathname !== '/login' && pathname !== '/') {
     return (
       <div className="min-h-screen bg-[#FDF6E3] flex flex-col items-center justify-center font-black text-2xl uppercase">
         <div className="w-16 h-16 border-4 border-black border-t-[#00E5FF] rounded-full animate-spin mb-4"></div>
         SYNCING CLOUD DATA...
       </div>
     );
  }

  return <>{children}</>;
}
