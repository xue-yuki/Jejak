"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Map, CheckCircle2, Zap, Star, ChevronDown, Rocket, Code2, Trophy, Terminal, MessageSquare, Camera } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  // FAQ State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useGSAP(() => {
    // 1. Hero Reveal Animation
    const heroTimeline = gsap.timeline();
    
    heroTimeline.fromTo(".hero-badge", 
      { y: -50, opacity: 0, rotate: 10 }, 
      { y: 0, opacity: 1, rotate: -2, duration: 0.6, ease: "back.out(1.5)" }
    )
    .fromTo(".hero-title", 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    )
    .fromTo(".hero-desc", 
      { scale: 0.9, opacity: 0 }, 
      { scale: 1, opacity: 1, rotate: 1, duration: 0.5, ease: "back.out(1.5)" },
      "-=0.5"
    )
    .fromTo(".hero-cta", 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" },
      "-=0.3"
    );

    // 2. Scroll Animations for Sections
    const sections = gsap.utils.toArray<HTMLElement>(".reveal-section");
    
    sections.forEach((section) => {
      gsap.fromTo(section,
        { y: 100, opacity: 0 },
        {
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%", // reveals when top of section hits 85% of viewport
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // 3. Stagger Animation for Feature Cards
    gsap.fromTo(".feature-card",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 0.6,
        ease: "back.out(1.5)",
        scrollTrigger: {
          trigger: ".features-container",
          start: "top 80%",
        }
      }
    );

    // 4. Stagger Animation for Steps
    gsap.fromTo(".step-card",
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        stagger: 0.3,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".steps-container",
          start: "top 75%",
        }
      }
    );

    // 5. About Section Animations
    gsap.fromTo(".about-quote-card", 
      { x: -50, opacity: 0, rotate: -5 },
      {
        x: 0, opacity: 1, rotate: -2, duration: 0.8, ease: "back.out(1.5)",
        scrollTrigger: { trigger: ".about-section", start: "top 75%" }
      }
    );
    gsap.fromTo(".about-text-content > *",
      { x: 50, opacity: 0 },
      {
        x: 0, opacity: 1, stagger: 0.15, duration: 0.6, ease: "power3.out",
        scrollTrigger: { trigger: ".about-section", start: "top 75%" }
      }
    );

  }, { scope: containerRef });

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Apakah Jejak.AI benar-benar gratis?",
      a: "Tentu! Saat ini kami masih dalam tahap beta, jadi seluruh fitur mulai dari generate kurikulum sampai misi harian bisa digunakan 100% gratis tanpa batasan."
    },
    {
      q: "Berapa lama waktu yang dibutuhkan untuk menyelesaikan kurikulum?",
      a: "Sistem kami secara default akan memecah perjalanan belajarmu ke dalam 90 hari (3 Bulan). Namun, semua akan disesuaikan kembali dengan seberapa banyak waktu luangmu per hari!"
    },
    {
      q: "Apakah resource belajarnya pakai bahasa Indonesia?",
      a: "Yes! AI kami memprioritaskan rekomendasi materi dari platform lokal seperti WPU, Dicoding, BuildWith Angga, atau konten kreator Indonesia di YouTube."
    },
    {
      q: "Kalau hari ini bolos belajar, apa yang terjadi?",
      a: "Streak kamu akan terputus! Layaknya game, konsistensi adalah kunci. Tapi jangan khawatir, kamu selalu bisa melanjutkannya besok tanpa kehilangan progress materimu."
    }
  ];

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen bg-[#FDF6E3] text-black font-sans overflow-x-hidden">
      {/* CSS for specific neo-brutalist effects */}
      <style dangerouslySetInnerHTML={{__html: `
        .text-shadow-neo {
          text-shadow: 4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 2px 2px 0px #000;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          white-space: nowrap;
          animation: marquee 15s linear infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 7s ease-in-out 3s infinite;
        }
        @keyframes spin-slow {
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        @keyframes sweep {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .group:hover .animate-sweep {
          animation: sweep 1s ease-in-out forwards;
        }
      `}} />

      {/* Neo-Brutalist Navbar */}
      <header className="w-full sticky top-0 z-50 border-b-[6px] border-black bg-white px-4 md:px-8 py-4 flex justify-between items-center shadow-[0_8px_0px_rgba(0,0,0,1)]">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-1 group cursor-pointer" 
          onClick={() => window.scrollTo({top:0, behavior:'smooth'})}
        >
          <div className="bg-black text-white font-black text-xl md:text-3xl uppercase tracking-tighter px-3 py-1 -rotate-2 group-hover:rotate-0 transition-transform">
            JEJAK
          </div>
          <div className="bg-[#FFC900] border-4 border-black text-black font-black text-xl md:text-3xl uppercase tracking-tighter px-3 py-1 rotate-2 group-hover:rotate-0 transition-transform shadow-[4px_4px_0px_#000]">
            .AI
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex gap-8 font-black uppercase text-base">
          <button onClick={() => document.getElementById('why-use')?.scrollIntoView({behavior: 'smooth'})} className="relative group">
            <span className="relative z-10 hover:-translate-y-1 block transition-transform">Mengapa Kami?</span>
            <span className="absolute bottom-1 left-0 w-full h-3 bg-[#FF90E8] -z-10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left border-2 border-black"></span>
          </button>
          <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({behavior: 'smooth'})} className="relative group">
            <span className="relative z-10 hover:-translate-y-1 block transition-transform">Cara Kerja</span>
            <span className="absolute bottom-1 left-0 w-full h-3 bg-[#00E5FF] -z-10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left border-2 border-black"></span>
          </button>
          <button onClick={() => document.getElementById('faq')?.scrollIntoView({behavior: 'smooth'})} className="relative group">
            <span className="relative z-10 hover:-translate-y-1 block transition-transform">FAQ</span>
            <span className="absolute bottom-1 left-0 w-full h-3 bg-[#38E54D] -z-10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left border-2 border-black"></span>
          </button>
        </nav>

        {/* CTA */}
        <Link 
          href="/onboarding" 
          className="bg-[#38E54D] border-4 border-black px-6 py-3 font-black uppercase text-sm md:text-base shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 group"
        >
          START NOW <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-24 md:py-40 flex flex-col items-center text-center border-b-4 border-black bg-[#FDF6E3] overflow-hidden">
        
        {/* 1. Neo-Brutalist Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)', backgroundSize: '60px 60px' }}></div>
        
        {/* 2. Floating Geometric Shapes */}
        <div className="absolute top-20 left-[10%] w-24 h-24 bg-[#FF90E8] border-4 border-black rounded-full shadow-[8px_8px_0px_#000] animate-float hidden md:block"></div>
        <div className="absolute bottom-32 right-[10%] w-32 h-32 bg-[#00E5FF] border-4 border-black shadow-[8px_8px_0px_#000] rotate-12 animate-float-delayed hidden md:block"></div>
        <div className="absolute top-32 right-[15%] w-16 h-16 bg-[#FFC900] border-4 border-black shadow-[4px_4px_0px_#000] rotate-45 animate-spin hidden md:block" style={{ animationDuration: '10s' }}></div>
        <div className="absolute bottom-24 left-[15%] w-28 h-12 bg-[#38E54D] border-4 border-black shadow-[8px_8px_0px_#000] -rotate-12 animate-float hidden md:block"></div>

        {/* 3. Emojis Accents */}
        <div className="absolute top-32 left-[25%] text-6xl opacity-90 rotate-12 drop-shadow-[4px_4px_0px_#000] animate-float-delayed">🎯</div>
        <div className="absolute bottom-40 right-[25%] text-6xl opacity-90 -rotate-12 drop-shadow-[4px_4px_0px_#000] animate-float">🚀</div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="hero-badge inline-block px-4 py-2 bg-[#FFC900] border-4 border-black font-black text-sm uppercase mb-8 shadow-[4px_4px_0px_#000]">
            AI-POWERED LEARNING PATH 🧠
          </div>
          
          <h1 className="hero-title text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            HACK YOUR <br /> 
            <span className="text-white text-shadow-neo">LEARNING</span> <br /> 
            JOURNEY.
          </h1>
          
          <p className="hero-desc text-xl md:text-2xl font-bold max-w-2xl mx-auto mb-12 border-2 border-black bg-white p-6 shadow-[8px_8px_0px_#000]">
            Berhenti pusing mencari tutorial. AI kami akan membuatkan <span className="bg-[#FF90E8] px-2 border-2 border-black inline-block -rotate-2">kurikulum 90 hari</span> khusus untukmu, lengkap dengan tugas harian & resource!
          </p>
          
          <div className="hero-cta">
            <Link 
              href="/onboarding" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-[#38E54D] text-black border-4 border-black rounded-full font-black text-2xl uppercase shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:shadow-[12px_12px_0px_#000] active:translate-y-2 active:shadow-none transition-all group"
            >
              MULAI SEKARANG 
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="w-full bg-[#00E5FF] border-b-4 border-black py-4 flex overflow-hidden whitespace-nowrap relative z-20 shadow-[0_8px_0px_#000]">
        <div className="animate-marquee font-black text-2xl uppercase gap-8 items-center">
          <span>🔥 FULLSTACK WEB DEV</span>
          <Star className="fill-black w-6 h-6 inline-block mx-4" />
          <span>🚀 DATA SCIENTIST</span>
          <Star className="fill-black w-6 h-6 inline-block mx-4" />
          <span>📱 FLUTTER EXPERT</span>
          <Star className="fill-black w-6 h-6 inline-block mx-4" />
          <span>🎨 UI/UX DESIGNER</span>
          <Star className="fill-black w-6 h-6 inline-block mx-4" />
          <span>🤖 AI ENGINEER</span>
          <Star className="fill-black w-6 h-6 inline-block mx-4" />
          <span>🔥 FULLSTACK WEB DEV</span>
          <Star className="fill-black w-6 h-6 inline-block mx-4" />
          <span>🚀 DATA SCIENTIST</span>
          <Star className="fill-black w-6 h-6 inline-block mx-4" />
          <span>📱 FLUTTER EXPERT</span>
          <Star className="fill-black w-6 h-6 inline-block mx-4" />
          <span>🎨 UI/UX DESIGNER</span>
          <Star className="fill-black w-6 h-6 inline-block mx-4" />
          <span>🤖 AI ENGINEER</span>
          <Star className="fill-black w-6 h-6 inline-block mx-4" />
        </div>
      </div>

      {/* Features Section */}
      <section id="why-use" className="reveal-section min-h-screen py-32 px-4 bg-white relative border-b-4 border-black overflow-hidden flex flex-col justify-center">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="max-w-6xl w-full mx-auto features-container relative z-10">
          <div className="text-center mb-20 relative">
            <h2 className="text-5xl font-black uppercase mb-6 inline-block bg-[#FF90E8] border-4 border-black px-6 py-3 shadow-[8px_8px_0px_#000] -rotate-2 relative z-10">
              WHY USE JEJAK?
            </h2>
            {/* Decorative Stars */}
            <Star className="absolute top-0 left-1/4 w-12 h-12 fill-[#FFC900] -rotate-12 animate-pulse hidden md:block" />
            <Star className="absolute bottom-0 right-1/4 w-8 h-8 fill-[#00E5FF] rotate-45 animate-bounce hidden md:block" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 mt-12">
            
            {/* Card 1 */}
            <div className="feature-card bg-white border-4 border-black shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:rotate-1 hover:shadow-[12px_12px_0px_#000] transition-all cursor-pointer flex flex-col group relative mt-4 md:mt-0">
              <div className="bg-[#FFC900] border-b-4 border-black p-3 flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
              </div>
              <div className="p-8 relative flex-1 flex flex-col">
                <div className="absolute -top-12 right-6 w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000] group-hover:scale-110 group-hover:-rotate-12 transition-all">
                  <Map className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-black uppercase mb-4 mt-2">90-DAY ADAPTIVE PATH</h3>
                <p className="font-bold text-lg leading-relaxed text-black/80">
                  Kurikulum 3 bulan yang dicetak khusus oleh AI berdasarkan sisa waktumu per hari. Tidak ada lagi pusing mikir urutan belajar.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="feature-card bg-white border-4 border-black shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:-rotate-1 hover:shadow-[12px_12px_0px_#000] transition-all cursor-pointer flex flex-col group relative mt-8 md:mt-0">
              <div className="bg-[#00E5FF] border-b-4 border-black p-3 flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
              </div>
              <div className="p-8 relative flex-1 flex flex-col">
                <div className="absolute -top-12 right-6 w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000] group-hover:scale-110 group-hover:rotate-12 transition-all">
                  <CheckCircle2 className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-black uppercase mb-4 mt-2">LOCAL RESOURCES</h3>
                <p className="font-bold text-lg leading-relaxed text-black/80">
                  Rekomendasi materi dari YouTube & platform Indonesia terbaik. Belajar jadi lebih mudah dipahami tanpa kendala bahasa.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="feature-card bg-white border-4 border-black shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:rotate-1 hover:shadow-[12px_12px_0px_#000] transition-all cursor-pointer flex flex-col group relative mt-8 md:mt-0">
              <div className="bg-[#FF90E8] border-b-4 border-black p-3 flex gap-2 items-center">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
                <div className="w-3 h-3 rounded-full bg-white border-2 border-black"></div>
              </div>
              <div className="p-8 relative flex-1 flex flex-col">
                <div className="absolute -top-12 right-6 w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000] group-hover:scale-110 group-hover:rotate-45 transition-all">
                  <Zap className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-black uppercase mb-4 mt-2">GAMIFIED EXPERIENCE</h3>
                <p className="font-bold text-lg leading-relaxed text-black/80">
                  Selesaikan misi harian, kumpulkan streak, dan naik level! Belajar coding sekarang se-adiktif main game.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="reveal-section min-h-screen py-32 px-4 bg-[#FFC900] relative border-b-4 border-black overflow-hidden flex flex-col justify-center">
        {/* Background decorative stripes */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)' }}></div>
        
        <div className="max-w-5xl w-full mx-auto relative z-10 steps-container">
          <div className="text-center mb-24 relative">
            <h2 className="text-5xl md:text-6xl font-black uppercase inline-block bg-white border-4 border-black px-8 py-4 shadow-[12px_12px_0px_#000] rotate-2 relative z-10">
              HOW IT WORKS ⚙️
            </h2>
          </div>

          <div className="relative">
            {/* The Connecting Dashed Line (Desktop) */}
            <div className="absolute left-[3.25rem] md:left-1/2 top-10 bottom-10 w-0 border-l-8 border-dashed border-black/30 hidden md:block md:-translate-x-1/2 z-0"></div>

            <div className="space-y-16 relative z-10">
              
              {/* Step 1 */}
              <div className="step-card flex flex-col md:flex-row items-center gap-8 bg-white border-[6px] border-black p-8 shadow-[12px_12px_0px_#000] hover:-translate-y-2 hover:shadow-[16px_16px_0px_#000] transition-all relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 text-[15rem] font-black opacity-5 leading-none pointer-events-none group-hover:scale-110 transition-transform">1</div>
                <div className="w-24 h-24 shrink-0 bg-[#00E5FF] border-[6px] border-black flex items-center justify-center shadow-[6px_6px_0px_#000] text-5xl font-black rotate-[-5deg] group-hover:rotate-0 transition-all">
                  1
                </div>
                <div className="flex-1 text-center md:text-left relative z-10">
                  <h3 className="text-3xl font-black uppercase mb-3 bg-[#FF90E8] inline-block px-2 border-2 border-black -rotate-1">Tentukan Misi Utamamu</h3>
                  <p className="font-bold text-xl text-black/80">Beritahu AI apa yang ingin kamu kuasai, levelmu saat ini, dan berapa jam kamu bisa nge-grind setiap harinya.</p>
                </div>
                <Rocket className="w-20 h-20 hidden md:block text-black drop-shadow-[4px_4px_0px_#FFC900] group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform" />
              </div>

              {/* Step 2 */}
              <div className="step-card flex flex-col md:flex-row-reverse items-center gap-8 bg-[#FF90E8] border-[6px] border-black p-8 shadow-[12px_12px_0px_#000] hover:-translate-y-2 hover:shadow-[16px_16px_0px_#000] transition-all md:translate-x-12 relative overflow-hidden group">
                <div className="absolute -left-10 -bottom-10 text-[15rem] font-black opacity-10 text-white leading-none pointer-events-none group-hover:scale-110 transition-transform">2</div>
                <div className="w-24 h-24 shrink-0 bg-[#38E54D] border-[6px] border-black flex items-center justify-center shadow-[6px_6px_0px_#000] text-5xl font-black rotate-[5deg] group-hover:rotate-0 transition-all">
                  2
                </div>
                <div className="flex-1 text-center md:text-right relative z-10">
                  <h3 className="text-3xl font-black uppercase mb-3 bg-white inline-block px-2 border-2 border-black rotate-1">AI Meracik Peta Perjalanan</h3>
                  <p className="font-bold text-xl text-black/90">Dalam 15 detik, AI akan membangun kurikulum spesifik selama 90 Hari yang dipotong menjadi misi harian seukuran gigitan.</p>
                </div>
                <Code2 className="w-20 h-20 hidden md:block text-black drop-shadow-[4px_4px_0px_#00E5FF] group-hover:-translate-x-4 group-hover:-translate-y-4 transition-transform" />
              </div>

              {/* Step 3 */}
              <div className="step-card flex flex-col md:flex-row items-center gap-8 bg-[#00E5FF] border-[6px] border-black p-8 shadow-[12px_12px_0px_#000] hover:-translate-y-2 hover:shadow-[16px_16px_0px_#000] transition-all relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 text-[15rem] font-black opacity-10 text-white leading-none pointer-events-none group-hover:scale-110 transition-transform">3</div>
                <div className="w-24 h-24 shrink-0 bg-[#FFC900] border-[6px] border-black flex items-center justify-center shadow-[6px_6px_0px_#000] text-5xl font-black rotate-[-5deg] group-hover:rotate-0 transition-all">
                  3
                </div>
                <div className="flex-1 text-center md:text-left relative z-10">
                  <h3 className="text-3xl font-black uppercase mb-3 bg-white inline-block px-2 border-2 border-black -rotate-1">Selesaikan & Naik Level</h3>
                  <p className="font-bold text-xl text-black/90">Tonton tutorial, kerjakan tugas, dan kumpulkan centang hijau setiap hari untuk menjaga api belajarmu tetap menyala!</p>
                </div>
                <Trophy className="w-20 h-20 hidden md:block text-black drop-shadow-[4px_4px_0px_#FF90E8] group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform" />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section py-32 px-4 bg-[#FDF6E3] relative border-b-4 border-black overflow-hidden">
        {/* Background decorative dots */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#10B981 3px, transparent 3px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            
            {/* Left Column: Developer ID Card Style */}
            <div className="about-quote-card bg-white border-4 border-black shadow-[16px_16px_0px_#000] -rotate-2 hover:rotate-0 hover:-translate-y-2 hover:shadow-[20px_20px_0px_#000] transition-all duration-300 w-full max-w-sm mx-auto md:mx-0 relative flex flex-col items-center">
              
              {/* Lanyard Clip (Fake hole) */}
              <div className="w-24 h-5 bg-[#FDF6E3] border-4 border-black rounded-full absolute -top-3 left-1/2 -translate-x-1/2 z-20 shadow-inner"></div>
              
              {/* Card Header */}
              <div className="w-full bg-[#10B981] border-b-4 border-black p-4 text-center pt-8">
                <div className="font-black text-2xl uppercase tracking-widest text-white text-shadow-neo">CREATOR PASS</div>
                <div className="font-bold text-xs uppercase mt-1 text-black tracking-widest">ACCESS LEVEL: OMNIPOTENT</div>
              </div>

              {/* Photo */}
              <div className="w-full p-6 pb-2">
                <div className="border-4 border-black overflow-hidden relative aspect-square bg-[#FFC900] w-full shadow-[4px_4px_0px_#000]">
                  <img 
                    src="/erlangga.jpeg" 
                    alt="Erlangga - Juara Vibe Coding" 
                    className="w-full h-full object-cover filter contrast-[1.15] saturate-[1.1]"
                  />
                  {/* Small badge on photo */}
                  <div className="absolute top-2 right-2 bg-white border-2 border-black px-2 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_#000]">
                    ID: 505
                  </div>
                </div>
              </div>
              
              {/* Name & Quote */}
              <div className="w-full px-6 py-6 text-center flex-1 flex flex-col justify-center">
                <h3 className="font-black text-4xl uppercase mb-3 text-shadow-neo text-[#FFC900]">ERLANGGA</h3>
                <div className="w-full h-1 bg-black mb-5"></div>
                <p className="font-black text-xl uppercase leading-snug text-black/90">
                  "Tidak ada lagi pelajar yang berhenti belajar hanya karena tidak tahu harus mulai dari mana."
                </p>
              </div>

              {/* Fake Barcode Footer */}
              <div className="w-full border-t-4 border-black p-4 flex flex-col items-center bg-[#FFC900]">
                {/* Simulated barcode lines */}
                <div className="flex items-end justify-center h-12 w-full gap-[3px] opacity-80">
                  <div className="w-2 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-3 h-full bg-black"></div>
                  <div className="w-1 h-3/4 bg-black"></div>
                  <div className="w-2 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-4 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-2 h-3/4 bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-3 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-2 h-full bg-black"></div>
                  <div className="w-1 h-3/4 bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-4 h-full bg-black"></div>
                  <div className="w-2 h-full bg-black"></div>
                </div>
                <div className="font-black text-xs tracking-[0.2em] mt-2">GOOGLE FOR DEVELOPERS</div>
              </div>
            </div>

            {/* Right Column: Text Content */}
            <div className="about-text-content space-y-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase mb-2 inline-block bg-[#FF90E8] border-4 border-black px-4 py-2 shadow-[6px_6px_0px_#000] rotate-1">
                  Dibuat oleh pelajar,
                </h2>
                <br/>
                <h2 className="text-4xl md:text-5xl font-black uppercase inline-block bg-[#FFC900] border-4 border-black px-4 py-2 shadow-[6px_6px_0px_#000] -rotate-1">
                  untuk pelajar.
                </h2>
              </div>
              
              <p className="text-xl font-bold border-l-8 border-[#10B981] pl-4">
                Bukan perusahaan besar. Bukan tim puluhan orang. Cuma seorang siswa SMK yang pernah bingung, dan memutuskan untuk bikin solusinya sendiri.
              </p>
              
              <div className="space-y-4 font-bold text-lg leading-relaxed text-black/90 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
                <p>Namaku Erlangga. Kelas XI di SMK Telkom Purwokerto.</p>
                <p>Suatu hari aku buka laptop, niat banget mau belajar jadi Web Developer. Tapi yang aku temukan justru kebingungan, ratusan resource, puluhan roadmap, ribuan video. Semuanya tersebar. Tidak ada yang nemenin. Tidak ada yang bilang &apos;mulai dari sini dulu.&apos;</p>
                <p>Dari situlah Jejak lahir. Bukan aplikasi buatan perusahaan yang tidak tahu rasanya jadi pelajar Indonesia di kota kecil. Tapi aplikasi yang dibangun dari pengalaman nyata, dengan satu tujuan utama.</p>
              </div>

              {/* Badge */}
              <div className="pt-4">
                <div className="inline-flex items-center gap-3 px-6 py-4 border-4 border-[#10B981] bg-white rounded-full font-black text-sm md:text-base shadow-[4px_4px_0px_#10B981] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#10B981] transition-all text-black">
                  <Rocket className="w-6 h-6 text-[#10B981]" />
                  Dibangun untuk #JuaraVibeCoding — Google for Developers Indonesia
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="reveal-section py-32 px-4 bg-[#FDF6E3] relative border-b-4 border-black overflow-hidden">
        {/* Decorative Background Texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute -right-20 top-20 text-[20rem] font-black text-black opacity-5 pointer-events-none rotate-12">?</div>
        <div className="absolute -left-20 bottom-20 text-[20rem] font-black text-black opacity-5 pointer-events-none -rotate-12">?</div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-[1fr_2fr] gap-16 items-start">
            
            {/* Left Column: Sticky Title */}
            <div className="md:sticky md:top-32 text-center md:text-left">
              <div className="inline-block bg-[#00E5FF] border-4 border-black p-8 shadow-[12px_12px_0px_#000] -rotate-3 hover:rotate-0 transition-all duration-300 cursor-default">
                <h2 className="text-6xl md:text-7xl font-black uppercase leading-[0.9] mb-6">
                  GOT <br className="hidden md:block" /> Q'S?
                </h2>
                <div className="w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center text-5xl shadow-[4px_4px_0px_#000] mx-auto md:mx-0 animate-bounce" style={{ animationDuration: '3s' }}>
                  🤔
                </div>
              </div>
            </div>

            {/* Right Column: Accordion List */}
            <div className="space-y-6">
              {faqs.map((faq, index) => {
                const isOpen = activeFaq === index;
                // Cycle through vibrant colors for active state
                const activeColors = ['bg-[#FF90E8]', 'bg-[#FFC900]', 'bg-[#38E54D]', 'bg-[#00E5FF]'];
                const bgColor = activeColors[index % activeColors.length];
                
                return (
                  <div 
                    key={index} 
                    className={`border-4 border-black transition-all duration-300 overflow-hidden ${isOpen ? `${bgColor} shadow-[12px_12px_0px_#000] -translate-y-2` : 'bg-white hover:bg-gray-100 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000]'}`}
                  >
                    <button 
                      onClick={() => toggleFaq(index)}
                      className="w-full flex justify-between items-center p-6 md:p-8 focus:outline-none"
                    >
                      <span className="font-black text-xl md:text-2xl text-left uppercase pr-4">{faq.q}</span>
                      <div className={`w-12 h-12 shrink-0 border-4 border-black rounded-full flex items-center justify-center bg-white transition-all duration-500 ${isOpen ? 'rotate-180 shadow-none' : 'shadow-[4px_4px_0px_#000]'}`}>
                        <ChevronDown className="w-6 h-6" />
                      </div>
                    </button>
                    
                    {/* CSS transition for accordion body */}
                    <div 
                      className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="p-6 md:p-8 pt-0">
                        <p className="font-bold text-lg md:text-xl leading-relaxed bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000]">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="reveal-section min-h-screen py-32 px-4 bg-[#FFC900] relative border-b-4 border-black text-center overflow-hidden flex flex-col justify-center items-center">
        {/* Danger Tape Background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000, #000 40px, transparent 40px, transparent 80px)' }}></div>
        
        {/* Giant Decorative Elements */}
        <Star className="absolute top-10 left-10 w-64 h-64 fill-[#FF90E8] text-black stroke-[4px] opacity-80 animate-spin-slow hidden md:block" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#00E5FF] border-8 border-black opacity-80 animate-spin-slow" style={{ animationDuration: '20s' }}></div>

        <div className="max-w-4xl w-full mx-auto relative z-10">
          <div className="bg-white border-[8px] border-black p-8 md:p-16 shadow-[16px_16px_0px_#000] md:-rotate-2 hover:rotate-0 transition-all duration-300 relative">
            
            {/* Screw heads (Industrial vibe) */}
            <div className="absolute top-4 left-4 w-6 h-6 bg-gray-300 border-4 border-black rounded-full flex items-center justify-center rotate-45"><div className="w-full h-[4px] bg-black"></div></div>
            <div className="absolute top-4 right-4 w-6 h-6 bg-gray-300 border-4 border-black rounded-full flex items-center justify-center -rotate-12"><div className="w-full h-[4px] bg-black"></div></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 bg-gray-300 border-4 border-black rounded-full flex items-center justify-center rotate-90"><div className="w-full h-[4px] bg-black"></div></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 bg-gray-300 border-4 border-black rounded-full flex items-center justify-center rotate-0"><div className="w-full h-[4px] bg-black"></div></div>

            <h2 className="text-6xl md:text-[6rem] font-black uppercase tracking-tighter leading-none mb-10 text-black">
              STOP PLANNING. <br/> 
              <span className="inline-block bg-[#00E5FF] px-6 py-2 mt-4 border-[6px] border-black rotate-1 shadow-[8px_8px_0px_#000]">START DOING.</span>
            </h2>
            
            <p className="text-xl md:text-2xl font-bold mb-16 max-w-2xl mx-auto border-l-8 border-[#38E54D] pl-6 text-left bg-[#FDF6E3] p-6 border-y-4 border-r-4 border-black shadow-[4px_4px_0px_#000]">
              Tidak ada lagi pusing terjebak di <span className="bg-[#FF90E8] px-2 italic border-2 border-black">tutorial hell</span>. Kurikulum 90 harimu sudah siap dieksekusi. Waktunya berubah hari ini!
            </p>
            
            <div>
              <Link 
                href="/onboarding" 
                className="inline-flex items-center gap-4 px-8 md:px-12 py-6 bg-[#38E54D] text-black border-[6px] border-black font-black text-2xl md:text-4xl uppercase shadow-[12px_12px_0px_#000] hover:-translate-y-2 hover:shadow-[20px_20px_0px_#000] active:translate-y-2 active:shadow-none transition-all group relative overflow-hidden"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full -translate-x-full animate-sweep z-0 pointer-events-none"></div>
                
                <span className="relative z-10">UBAH HIDUPKU!</span>
                <Rocket className="w-10 h-10 relative z-10 group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black text-white border-t-[8px] border-black pt-20 pb-8 px-4 overflow-hidden relative">
        {/* Infinite Marquee Banner */}
        <div className="absolute top-0 left-0 w-full bg-[#FF90E8] text-black font-black text-xl md:text-2xl py-3 border-b-[6px] border-black flex overflow-hidden whitespace-nowrap z-10">
          <div className="animate-marquee inline-flex items-center">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4 flex items-center gap-4">
                🔥 NO MORE TUTORIAL HELL <span className="w-3 h-3 bg-black rounded-full inline-block"></span> JUST GRIND <span className="w-3 h-3 bg-black rounded-full inline-block"></span> 90 DAYS CHALLENGE
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="text-center md:text-left">
              <h2 className="text-6xl md:text-[7rem] font-black uppercase tracking-tighter leading-none mb-4 -rotate-2">
                JEJAK<span className="text-[#FFC900]">.AI</span>
              </h2>
              <p className="text-xl font-bold text-gray-300 max-w-md mx-auto md:mx-0 border-l-4 border-[#38E54D] pl-4">
                Peta perjalanan belajar coding untuk pelajar Indonesia. Berhenti bingung, mulai eksekusi.
              </p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-6">
              <div className="flex gap-4">
                <a href="https://github.com/erlangga" target="_blank" rel="noopener noreferrer" className="w-16 h-16 bg-[#00E5FF] border-[4px] border-black text-black flex items-center justify-center shadow-[4px_4px_0px_#fff] hover:-translate-y-2 hover:shadow-[8px_8px_0px_#fff] hover:rotate-12 transition-all">
                  <Terminal className="w-8 h-8" />
                </a>
                <a href="#" className="w-16 h-16 bg-[#FFC900] border-[4px] border-black text-black flex items-center justify-center shadow-[4px_4px_0px_#fff] hover:-translate-y-2 hover:shadow-[8px_8px_0px_#fff] hover:-rotate-12 transition-all">
                  <MessageSquare className="w-8 h-8" />
                </a>
                <a href="#" className="w-16 h-16 bg-[#FF90E8] border-[4px] border-black text-black flex items-center justify-center shadow-[4px_4px_0px_#fff] hover:-translate-y-2 hover:shadow-[8px_8px_0px_#fff] hover:rotate-6 transition-all">
                  <Camera className="w-8 h-8" />
                </a>
              </div>
              <a href="mailto:hello@jejak.ai" className="inline-block bg-white text-black border-4 border-black px-6 py-3 font-black uppercase text-xl hover:bg-[#38E54D] shadow-[6px_6px_0px_#fff] hover:shadow-[8px_8px_0px_#fff] hover:-translate-y-1 transition-all">
                hello@jejak.ai
              </a>
            </div>
          </div>
          
          <div className="border-t-[4px] border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="font-bold text-gray-400 text-lg">
              © {new Date().getFullYear()} Jejak.AI. Dibuat dengan ☕ oleh <span className="text-white underline decoration-wavy decoration-[#FF90E8]">Erlangga</span>.
            </p>
            <div className="flex gap-6 font-bold text-gray-400">
              <a href="#" className="hover:text-[#00E5FF] transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-[#FFC900] transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
