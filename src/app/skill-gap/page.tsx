"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Target, Briefcase, ChevronRight, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/lib/store";
import toast from "react-hot-toast";
import Link from "next/link";

interface GapAnalysis {
  requiredSkills: string[];
  currentSkills: string[];
  gapSkills: string[];
}

export default function SkillGapDetector() {
  const router = useRouter();
  const profile = useAppStore((state) => state.profile);
  const setLearningPath = useAppStore((state) => state.setLearningPath);
  
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [newPath, setNewPath] = useState<any | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || !profile) return;
    
    setIsAnalyzing(true);
    
    try {
      const res = await fetch('/api/analyze-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, profile }),
      });

      if (!res.ok) throw new Error("Gagal analisis gap");
      
      const data = await res.json();
      setAnalysis(data.analysis);
      setNewPath(data.newLearningPath);
      toast.success("Analisis berhasil!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan analisis. Coba lagi!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdatePath = () => {
    if (newPath) {
      setLearningPath(newPath);
      toast.success("Learning path berhasil diupdate!");
      router.push('/dashboard');
    }
  };

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <Target className="h-16 w-16 text-foreground/20 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Kamu belum punya profil</h2>
        <p className="text-foreground/60 mb-6">Selesaikan onboarding dulu untuk menggunakan fitur ini.</p>
        <Link href="/onboarding" className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium">Mulai Onboarding</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 flex flex-col min-h-[80vh]">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors w-fit mb-8">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          Skill Gap Detector
        </h1>
        <p className="text-foreground/60 text-lg">Sesuaikan perjalanan belajarmu dengan kebutuhan industri secara spesifik.</p>
      </div>

      {!analysis ? (
        <div className="space-y-6">
          <div className="bg-background border border-black/10 dark:border-white/10 rounded-2xl p-1 shadow-sm">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste Job Description (kualifikasi, syarat, atau tanggung jawab) impianmu di sini..."
              className="w-full h-64 p-5 rounded-xl bg-transparent focus:outline-none resize-none"
              disabled={isAnalyzing}
            />
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={!jobDescription.trim() || isAnalyzing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI sedang menganalisis...
              </>
            ) : (
              <>
                <Briefcase className="h-5 w-5" />
                Analisis Gap-ku
              </>
            )}
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background border border-black/5 dark:border-white/5 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-foreground/50" />
                Dibutuhkan Industri
              </h3>
              <ul className="space-y-2">
                {analysis.requiredSkills.map((skill, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 mt-1.5 shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Kemungkinan Dimiliki
              </h3>
              <ul className="space-y-2">
                {analysis.currentSkills.map((skill, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-accent/10 border border-accent/20 p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-accent" />
                Skill Gap (Perlu Dipelajari)
              </h3>
              <ul className="space-y-2">
                {analysis.gapSkills.map((skill, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-foreground text-background p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">AI sudah merancang roadmap baru!</h3>
              <p className="text-background/70">Roadmap 7 hari ke depan sudah disesuaikan agar kamu lebih siap melamar pekerjaan ini.</p>
            </div>
            <button
              onClick={handleUpdatePath}
              className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg"
            >
              Update Learning Path-ku
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <button 
            onClick={() => setAnalysis(null)}
            className="text-foreground/50 hover:text-foreground text-sm font-medium underline underline-offset-4"
          >
            Coba analisis lowongan lain
          </button>
        </motion.div>
      )}
    </div>
  );
}
