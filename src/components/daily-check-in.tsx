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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#00E5FF] border-4 border-black shadow-[16px_16px_0px_#000] rounded-3xl w-full max-w-md overflow-hidden relative text-black"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-full border-2 border-transparent hover:border-black hover:bg-[#FF5F56] hover:text-white transition-colors z-10"
            >
              <X className="h-6 w-6 font-black" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b-4 border-black">
                <div className="bg-[#FFC900] p-3 rounded-full border-4 border-black shadow-[4px_4px_0px_#000]">
                  <Flame className="h-8 w-8 text-black fill-current" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight">Daily Check-in</h2>
              </div>
              
              {!aiResponse ? (
                <>
                  <p className="text-black/80 font-bold text-lg mb-8 leading-relaxed">
                    Halo! Udah belajar apa aja hari ini buat jadi <span className="bg-[#FF90E8] border-2 border-black px-2 py-0.5 whitespace-nowrap">{profile?.goal}</span>? Atau ada kesulitan? Cerita dong!
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Hari ini aku belajar..."
                      className="w-full h-36 p-5 rounded-2xl border-4 border-black bg-white focus:outline-none focus:bg-[#FDF6E3] resize-none text-xl font-bold text-black placeholder:text-black/30 shadow-inner custom-scrollbar"
                      disabled={isLoading}
                    />
                    
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#38E54D] border-4 border-black text-black font-black text-xl uppercase hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {isLoading ? (
                        <div className="h-6 w-6 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="h-6 w-6" />
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
                  className="space-y-8"
                >
                  <div className="bg-white p-6 rounded-2xl border-4 border-black relative shadow-[8px_8px_0px_#000]">
                    <Sparkles className="absolute -top-4 -right-4 h-10 w-10 text-[#FF90E8] fill-current" />
                    <p className="text-black font-black text-lg leading-relaxed">
                      {aiResponse}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full py-4 rounded-2xl bg-black text-white font-black text-xl uppercase hover:-translate-y-1 hover:shadow-[6px_6px_0px_#FFC900] transition-all"
                  >
                    Lanjut Belajar 🚀
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
