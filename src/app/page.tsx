"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Map, CheckCircle2, Zap, Star, ChevronDown, Rocket, Code2, Trophy } from "lucide-react";
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
      `}} />

      {/* Neo-Brutalist Navbar */}
      <header className="w-full border-b-4 border-black bg-white px-6 py-4 flex justify-between items-center z-50 relative">
        <div className="font-black text-2xl uppercase tracking-tighter">
          JEJAK<span className="text-[#FFC900]">.AI</span>
        </div>
        <Link 
          href="/onboarding" 
          className="bg-[#38E54D] border-2 border-black px-6 py-2 rounded-full font-black uppercase text-sm shadow-[4px_4px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-none transition-all"
        >
          LOGIN / START
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 flex flex-col items-center text-center border-b-4 border-black bg-[#FDF6E3] overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl opacity-20 rotate-12">🎯</div>
        <div className="absolute bottom-20 right-10 text-6xl opacity-20 -rotate-12">🚀</div>
        
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
      <section className="reveal-section py-24 px-4 bg-white relative border-b-4 border-black">
        <div className="max-w-6xl mx-auto features-container">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black uppercase mb-6 inline-block bg-[#FF90E8] border-4 border-black px-6 py-3 shadow-[8px_8px_0px_#000] -rotate-2">
              WHY USE JEJAK?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card bg-[#FFC900] border-4 border-black p-8 shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:rotate-2 hover:shadow-[12px_12px_0px_#000] transition-all cursor-pointer">
              <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000]">
                <Map className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">90-DAY ADAPTIVE PATH</h3>
              <p className="font-bold text-lg leading-relaxed">
                Kurikulum 3 bulan yang dicetak khusus oleh AI berdasarkan sisa waktumu per hari. Tidak ada lagi pusing mikir urutan belajar.
              </p>
            </div>

            <div className="feature-card bg-[#00E5FF] border-4 border-black p-8 shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:-rotate-2 hover:shadow-[12px_12px_0px_#000] transition-all cursor-pointer">
              <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">LOCAL RESOURCES</h3>
              <p className="font-bold text-lg leading-relaxed">
                Rekomendasi materi dari YouTube & platform Indonesia terbaik. Belajar jadi lebih mudah dipahami tanpa kendala bahasa.
              </p>
            </div>

            <div className="feature-card bg-[#FF90E8] border-4 border-black p-8 shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:rotate-1 hover:shadow-[12px_12px_0px_#000] transition-all cursor-pointer">
              <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000]">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase mb-4">GAMIFIED EXPERIENCE</h3>
              <p className="font-bold text-lg leading-relaxed">
                Selesaikan misi harian, kumpulkan streak, dan naik level! Belajar coding sekarang se-adiktif main game.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="reveal-section py-24 px-4 bg-[#FFC900] relative border-b-4 border-black overflow-hidden">
        {/* Background decorative stripes */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 10px)' }}></div>
        
        <div className="max-w-5xl mx-auto relative z-10 steps-container">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black uppercase inline-block bg-white border-4 border-black px-6 py-3 shadow-[8px_8px_0px_#000] rotate-2">
              HOW IT WORKS ⚙️
            </h2>
          </div>

          <div className="space-y-8">
            <div className="step-card flex flex-col md:flex-row items-center gap-8 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_#000]">
              <div className="w-20 h-20 shrink-0 bg-[#00E5FF] border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000] text-4xl font-black">
                1
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-black uppercase mb-2">Tentukan Misi Utamamu</h3>
                <p className="font-bold text-lg text-black/70">Beritahu AI apa yang ingin kamu kuasai, levelmu saat ini, dan berapa jam kamu bisa nge-grind setiap harinya.</p>
              </div>
              <Rocket className="w-16 h-16 hidden md:block text-[#FF90E8]" />
            </div>

            <div className="step-card flex flex-col md:flex-row-reverse items-center gap-8 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_#000] md:translate-x-12">
              <div className="w-20 h-20 shrink-0 bg-[#38E54D] border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000] text-4xl font-black">
                2
              </div>
              <div className="flex-1 text-center md:text-right">
                <h3 className="text-3xl font-black uppercase mb-2">AI Meracik Peta Perjalanan</h3>
                <p className="font-bold text-lg text-black/70">Dalam 15 detik, AI akan membangun kurikulum spesifik selama 90 Hari yang dipotong menjadi misi harian seukuran gigitan.</p>
              </div>
              <Code2 className="w-16 h-16 hidden md:block text-[#00E5FF]" />
            </div>

            <div className="step-card flex flex-col md:flex-row items-center gap-8 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_#000]">
              <div className="w-20 h-20 shrink-0 bg-[#FF90E8] border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_#000] text-4xl font-black">
                3
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-black uppercase mb-2">Selesaikan & Naik Level</h3>
                <p className="font-bold text-lg text-black/70">Tonton tutorial, kerjakan tugas, dan kumpulkan centang hijau setiap hari untuk menjaga api belajarmu tetap menyala!</p>
              </div>
              <Trophy className="w-16 h-16 hidden md:block text-[#FFC900]" />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section py-32 px-4 bg-[#FDF6E3] relative border-b-4 border-black overflow-hidden">
        {/* Background decorative dots */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#10B981 3px, transparent 3px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            
            {/* Left Column: Quote Card */}
            <div className="about-quote-card bg-[#10B981] border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_#000] -rotate-2 relative hover:rotate-0 hover:-translate-y-2 hover:shadow-[16px_16px_0px_#000] transition-all duration-300">
              <div className="absolute -top-8 -left-6 text-8xl md:text-9xl text-white font-black opacity-50 select-none">"</div>
              <p className="font-black text-3xl md:text-5xl uppercase leading-tight text-black relative z-10">
                Tidak ada lagi pelajar yang berhenti belajar hanya karena tidak tahu harus mulai dari mana.
              </p>
              <div className="absolute -bottom-16 -right-6 text-8xl md:text-9xl text-white font-black opacity-50 select-none">"</div>
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
                Bukan perusahaan besar. Bukan tim puluhan orang. Cuma seorang siswa SMK yang pernah bingung — dan memutuskan untuk bikin solusinya sendiri.
              </p>
              
              <div className="space-y-4 font-bold text-lg leading-relaxed text-black/90 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_#000]">
                <p>Namaku Erlangga. Kelas XI di SMK Telkom Purwokerto.</p>
                <p>Suatu hari aku buka laptop, niat banget mau belajar jadi Web Developer. Tapi yang aku temukan justru kebingungan — ratusan resource, puluhan roadmap, ribuan video. Semuanya tersebar. Tidak ada yang nemenin. Tidak ada yang bilang &apos;mulai dari sini dulu.&apos;</p>
                <p>Dari situlah Jejak lahir. Bukan aplikasi buatan perusahaan yang tidak tahu rasanya jadi pelajar Indonesia di kota kecil. Tapi aplikasi yang dibangun dari pengalaman nyata — dengan satu tujuan utama.</p>
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
      <section className="reveal-section py-24 px-4 bg-white relative border-b-4 border-black">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black uppercase inline-block bg-[#00E5FF] border-4 border-black px-6 py-3 shadow-[8px_8px_0px_#000] -rotate-1">
              FAQ 🤔
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className={`border-4 border-black transition-all duration-300 ${isOpen ? 'bg-[#FF90E8] shadow-[8px_8px_0px_#000] -translate-y-1' : 'bg-[#FDF6E3] hover:bg-[#FFC900]/20'}`}
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center p-6 focus:outline-none"
                  >
                    <span className="font-black text-xl text-left uppercase">{faq.q}</span>
                    <ChevronDown className={`w-8 h-8 shrink-0 border-2 border-black rounded-full p-1 bg-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* CSS transition for accordion body */}
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-6 pt-0 border-t-4 border-black/10">
                      <p className="font-bold text-lg leading-relaxed bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#000]">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="reveal-section py-32 px-4 bg-[#38E54D] relative border-b-4 border-black text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-10 left-[10%] w-24 h-24 bg-[#FF90E8] border-4 border-black rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 right-[15%] w-16 h-16 bg-[#00E5FF] border-4 border-black animate-spin" style={{ animationDuration: '3s' }}></div>
        </div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-8 text-white text-shadow-neo">
            STOP PLANNING. <br/> START DOING.
          </h2>
          <p className="text-2xl font-bold mb-12 bg-white border-4 border-black p-4 inline-block shadow-[8px_8px_0px_#000] rotate-2">
            Gabung sekarang dan wujudkan mimpimu dalam 90 Hari!
          </p>
          <div>
            <Link 
              href="/onboarding" 
              className="inline-flex items-center gap-3 px-12 py-6 bg-[#FFC900] text-black border-4 border-black font-black text-3xl uppercase shadow-[8px_8px_0px_#000] hover:-translate-y-2 hover:scale-105 hover:shadow-[12px_12px_0px_#000] active:translate-y-2 active:shadow-none transition-all group"
            >
              UBAH HIDUPKU!
              <Rocket className="w-8 h-8 group-hover:-translate-y-2 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 text-center">
        <h2 className="text-4xl font-black uppercase mb-4 tracking-widest text-[#FFC900]">JEJAK.AI</h2>
        <p className="font-bold text-gray-400">BUILD YOUR FUTURE. ONE DAY AT A TIME.</p>
        <p className="mt-8 text-sm font-bold text-gray-600">© 2026 JEJAK AI. ALL RIGHTS RESERVED (FOR NOW).</p>
      </footer>
    </div>
  );
}
