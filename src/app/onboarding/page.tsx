"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Code2, Brain, Smartphone, LineChart, PenTool, Sparkles, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";
import toast from "react-hot-toast";

const GOAL_OPTIONS = [
  { id: "Web Developer", title: "Web Developer", icon: <Code2 className="h-8 w-8" /> },
  { id: "AI Engineer", title: "AI Engineer", icon: <Brain className="h-8 w-8" /> },
  { id: "Mobile Developer", title: "Mobile Developer", icon: <Smartphone className="h-8 w-8" /> },
  { id: "Data Analyst", title: "Data Analyst", icon: <LineChart className="h-8 w-8" /> },
  { id: "UI/UX Designer", title: "UI/UX Designer", icon: <PenTool className="h-8 w-8" /> },
  { id: "custom", title: "Bebas pilih sendiri", icon: <Sparkles className="h-8 w-8" /> },
];

const LEVEL_OPTIONS = [
  { id: "Pemula (Belum pernah coding)", title: "NOOB 🐣", desc: "Belum pernah nulis kode sama sekali. Mulai dari nol!" },
  { id: "Punya Dasar (HTML/CSS/Logic)", title: "HUSTLER 💻", desc: "Udah tau basic HTML/CSS atau logika dasar." },
  { id: "Menengah (Bisa bikin project kecil)", title: "PRO 🚀", desc: "Udah bisa bikin project kecil, butuh roadmap level dewa." },
];

export default function Onboarding() {
  const router = useRouter();
  const setProfile = useAppStore((state) => state.setProfile);
  const setLearningPath = useAppStore((state) => state.setLearningPath);
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [level, setLevel] = useState("");
  const [hours, setHours] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = [
    "Menganalisis Profil Belajarmu... 🤔",
    "Mencari Referensi Terbaik... 📚",
    "Menyusun Struktur 30 Hari... 🏗️",
    "Meracik Topik Harian... ☕",
    "Hampir Selesai! Bentar Lagi... 🚀"
  ];

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      await generatePath();
    }
  };

  const generatePath = async () => {
    setIsGenerating(true);
    setLoadingProgress(0);
    setLoadingMessageIndex(0);
    
    // Start progress simulation
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => (prev >= 95 ? 95 : prev + 1));
    }, 200); // 1% every 200ms -> roughly 20s to hit 95%
    
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => Math.min(prev + 1, loadingMessages.length - 1));
    }, 4000); // Change message every 4 seconds
    
    const finalGoal = goal === "custom" ? customGoal : goal;
    
    const profile = {
      name: name.trim() || "Pahlawan Tanpa Nama",
      goal: finalGoal,
      level,
      hoursPerDay: hours,
    };
    
    setProfile(profile);

    try {
      const response = await fetch('/api/generate-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Gagal generate learning path');
      }

      const data = await response.json();
      
      // Handle array or object wrapper (just in case)
      const pathData = Array.isArray(data) ? data : data.learningPath;
      
      setLearningPath(pathData);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      setLoadingProgress(100);
      
      toast.success('Learning path berhasil dibuat!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500); // brief delay to show 100%
    } catch (error) {
      console.error(error);
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      toast.error('Maaf, ada masalah saat generate path. Coba lagi ya!');
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#FDF6E3] text-black overflow-hidden relative">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
        >
          <div className="w-32 h-32 bg-[#FFC900] border-8 border-black shadow-[12px_12px_0px_#000] flex items-center justify-center mb-12 transform rotate-12">
            <Zap className="h-16 w-16 text-black fill-current" />
          </div>
        </motion.div>
        
        <h2 className="text-4xl md:text-6xl font-black uppercase text-center mb-12 leading-tight max-w-4xl px-4 z-10">
          AI SEDANG <br /> <span className="bg-[#38E54D] px-4 border-4 border-black shadow-[6px_6px_0px_#000] inline-block my-2 -rotate-2">MEMASAK</span> <br /> KURIKULUM 90 HARIMU!
        </h2>
        
        {/* Dynamic Progress Loader */}
        <div className="w-full max-w-2xl px-6 z-10">
          <div className="flex justify-between items-end mb-2 font-black uppercase text-xl">
            <span>{loadingMessages[loadingMessageIndex]}</span>
            <span className="text-3xl">{loadingProgress}%</span>
          </div>
          <div className="h-10 w-full bg-white border-4 border-black shadow-[8px_8px_0px_#000] relative overflow-hidden">
            <motion.div 
              className="h-full bg-[#FF90E8] border-r-4 border-black flex items-center justify-end px-2"
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* Optional pattern or shine effect inside bar */}
              <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }}></div>
            </motion.div>
          </div>
          <p className="font-bold text-center mt-6 bg-white border-4 border-black px-4 py-2 inline-block mx-auto shadow-[4px_4px_0px_#000] -rotate-1">
            Biasanya butuh 15-20 detik tergantung tingkat kesulitan.
          </p>
        </div>

        {/* Decor */}
        <div className="absolute top-20 left-20 text-6xl animate-pulse">🛠️</div>
        <div className="absolute bottom-20 right-20 text-6xl animate-pulse delay-75">☕</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6E3] text-black font-sans pb-32">
      {/* Header / Nav */}
      <header className="p-6">
        <div className="font-black text-2xl uppercase tracking-tighter">
          JEJAK<span className="text-[#FFC900]">.AI</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-6 pt-12 flex flex-col">
        {/* Retro Progress Bar */}
        <div className="mb-16">
          <div className="flex justify-between text-xl font-black uppercase mb-4">
            <span>LEVEL {step}/4</span>
            <span>{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-8 bg-white border-4 border-black flex p-1 gap-1 shadow-[6px_6px_0px_#000]">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={`flex-1 border-2 border-black transition-colors duration-300 ${
                  i <= step ? 'bg-[#FF90E8]' : 'bg-transparent border-dashed opacity-30'
                }`} 
              />
            ))}
          </div>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">SIAPA NAMA ANDA? 🕵️‍♂️</h1>
                  <p className="text-xl font-bold border-l-8 border-[#00E5FF] pl-4">Agar kami bisa menyapa Anda di Dashboard nanti.</p>
                </div>
                <div className="pt-4">
                  <input 
                    type="text" 
                    placeholder="Masukkan nama panggilanmu..." 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-6 text-2xl font-black uppercase bg-white border-4 border-black shadow-[8px_8px_0px_#000] focus:outline-none focus:bg-[#00E5FF] transition-colors placeholder:text-black/30"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">PILIH MISI UTAMAMU 🎯</h1>
                  <p className="text-xl font-bold border-l-8 border-[#38E54D] pl-4">Goal apa yang ingin kamu capai dalam 90 hari ke depan?</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  {GOAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setGoal(opt.id)}
                      className={`p-6 border-4 text-left flex flex-col items-start gap-4 transition-all focus:outline-none ${
                        goal === opt.id 
                          ? 'border-black bg-[#FFC900] shadow-none translate-x-[4px] translate-y-[4px]' 
                          : 'border-black bg-white shadow-[8px_8px_0px_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000]'
                      }`}
                    >
                      <div className="bg-white border-4 border-black p-3 shadow-[4px_4px_0px_#000]">
                        {opt.icon}
                      </div>
                      <div className="font-black text-2xl uppercase mt-2">{opt.title}</div>
                    </button>
                  ))}
                </div>
                {goal === "custom" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4">
                    <input 
                      type="text" 
                      placeholder="Tulis goal spesifikmu di sini..." 
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      className="w-full p-6 text-xl font-bold uppercase bg-white border-4 border-black shadow-[8px_8px_0px_#000] focus:outline-none focus:bg-[#00E5FF] transition-colors placeholder:text-black/30"
                    />
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">SEBERAPA JAGO KAMU? 💪</h1>
                  <p className="text-xl font-bold border-l-8 border-[#FF90E8] pl-4">Pilih levelmu agar kurikulum tidak terlalu mudah atau terlalu gila.</p>
                </div>
                <div className="space-y-6">
                  {LEVEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setLevel(opt.id)}
                      className={`w-full p-8 border-4 text-left transition-all focus:outline-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        level === opt.id 
                          ? 'border-black bg-[#38E54D] shadow-none translate-x-[4px] translate-y-[4px]' 
                          : 'border-black bg-white shadow-[8px_8px_0px_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000]'
                      }`}
                    >
                      <div className="font-black text-3xl uppercase">{opt.title}</div>
                      <div className="font-bold text-lg sm:text-right max-w-sm">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">WAKTU NGE-GRIND! ⏳</h1>
                  <p className="text-xl font-bold border-l-8 border-[#00E5FF] pl-4">Berapa jam per hari yang bisa kamu komitmenkan?</p>
                </div>
                
                <div className="py-16 px-8 bg-white border-4 border-black shadow-[12px_12px_0px_#000] relative mt-12">
                  <div className="absolute -top-10 -right-6 text-6xl rotate-12">🔥</div>
                  
                  <div className="text-center mb-12">
                    <span className="text-8xl font-black">{hours}</span>
                    <span className="text-3xl font-black ml-4 uppercase">Jam / Hari</span>
                  </div>
                  
                  {/* Chunky Buttons instead of Slider */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((val) => (
                      <button
                        key={val}
                        onClick={() => setHours(val)}
                        className={`py-6 border-4 border-black font-black text-3xl transition-all focus:outline-none ${
                          hours === val
                            ? 'bg-[#FFC900] shadow-none translate-x-[4px] translate-y-[4px]'
                            : 'bg-white shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:bg-[#FFC900]/20'
                        }`}
                      >
                        {val}{val === 4 ? '+' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t-4 border-black p-4 z-50 shadow-[0px_-4px_0px_#000]">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
          {step > 1 ? (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-4 border-4 border-black bg-white font-black text-xl hover:-translate-x-1 hover:shadow-[4px_4px_0px_#000] transition-all"
            >
              <ChevronLeft className="w-6 h-6" /> KEMBALI
            </button>
          ) : (
            <div></div>
          )}

          <button 
            onClick={handleNext}
            disabled={
              (step === 1 && !name.trim()) ||
              (step === 2 && (!goal || (goal === 'custom' && !customGoal))) ||
              (step === 3 && !level)
            }
            className="flex items-center gap-2 px-8 py-4 border-4 border-black bg-[#38E54D] text-black font-black text-xl hover:translate-x-1 hover:shadow-[4px_4px_0px_#000] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:shadow-none transition-all shadow-[6px_6px_0px_#000]"
          >
            {step === 4 ? "GENERATE PATH!" : "LANJUT"} <ChevronRight className="w-6 h-6" />
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
