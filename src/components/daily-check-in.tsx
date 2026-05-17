"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, Flame } from "lucide-react";
import { useAppStore } from "@/lib/store";
import toast from "react-hot-toast";

export function DailyCheckIn() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  
  const profile = useAppStore((state) => state.profile);
  const checkIn = useAppStore((state) => state.checkIn);
  const lastCheckInDate = useAppStore((state) => state.lastCheckInDate);

  useEffect(() => {
    // Check if user needs to check in today
    const today = new Date().toDateString();
    if (lastCheckInDate !== today && profile) {
      // Small delay to make it feel natural
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [lastCheckInDate, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    
    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, profile }),
      });

      if (!res.ok) throw new Error("Gagal kirim check-in");
      
      const data = await res.json();
      setAiResponse(data.message);
      checkIn(); // Update streak & lastCheckInDate
      toast.success("Check-in harian berhasil!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mendapatkan respons AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // If they close without submitting, we might want to remind them later,
    // but for MVP, we just close it.
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-background border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl w-full max-w-md overflow-hidden relative"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/20 p-2 rounded-full text-primary">
                  <Flame className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold">Daily Check-in</h2>
              </div>
              
              {!aiResponse ? (
                <>
                  <p className="text-foreground/70 mb-6">
                    Halo! Udah belajar apa aja hari ini buat jadi {profile?.goal}? Atau ada kesulitan? Cerita dong!
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Hari ini aku belajar..."
                      className="w-full h-32 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                      disabled={isLoading}
                    />
                    
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Kirim Jurnal
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-primary/10 p-5 rounded-xl border border-primary/20 relative">
                    <Sparkles className="absolute top-3 right-3 h-5 w-5 text-primary opacity-50" />
                    <p className="text-foreground/90 font-medium leading-relaxed">
                      {aiResponse}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    Lanjut Belajar
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
