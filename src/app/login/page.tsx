"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Key, AlertCircle, Mail, Lock, ArrowRight, Zap, Star } from "lucide-react";
import toast from "react-hot-toast";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMissingKeys, setIsMissingKeys] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const supabase = createClient();
  
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    // Animate the left banner
    tl.fromTo(".hype-banner", 
      { x: "-100%" }, 
      { x: "0%", duration: 0.8, ease: "power4.out" }
    )
    .fromTo(".hype-content > *",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" },
      "-=0.4"
    )
    // Animate the right form
    .fromTo(".form-container",
      { x: "100%" },
      { x: "0%", duration: 0.8, ease: "power4.out" },
      0 // Start same time as banner
    )
    .fromTo(".form-element",
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" },
      "-=0.4"
    );
  }, { scope: containerRef });

  const handleLogin = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setIsMissingKeys(true);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Gagal login, coba lagi.");
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (isSignUp: boolean) => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setIsMissingKeys(true);
      return;
    }
    if (!email || !password) {
      toast.error("Email dan password wajib diisi!");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Berhasil mendaftar! Silakan login.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal autentikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex bg-white font-sans text-black overflow-hidden">
      
      {/* LEFT: THE HYPE BANNER (Hidden on Mobile) */}
      <div className="hype-banner hidden lg:flex flex-1 bg-[#FFC900] border-r-8 border-black flex-col relative overflow-hidden">
        
        {/* Marquee Background */}
        <div className="absolute top-0 left-0 w-[200%] flex gap-4 -rotate-12 translate-y-[-50%] opacity-20 pointer-events-none whitespace-nowrap text-9xl font-black uppercase">
          <span className="animate-[marquee_20s_linear_infinite]">LEVEL UP YOUR SKILLS • MASTER AI • BUILD THE FUTURE • </span>
          <span className="animate-[marquee_20s_linear_infinite]">LEVEL UP YOUR SKILLS • MASTER AI • BUILD THE FUTURE • </span>
        </div>

        <div className="hype-content relative z-10 flex flex-col items-start justify-center h-full p-20">
          <div className="inline-flex items-center gap-2 bg-white border-4 border-black px-4 py-2 text-xl font-black uppercase shadow-[6px_6px_0px_#000] mb-8 -rotate-2">
            <Zap className="w-6 h-6 fill-[#FF5F56] text-[#FF5F56]" />
            THE ULTIMATE PLATFORM
          </div>
          
          <h1 className="text-8xl font-black uppercase leading-none mb-6">
            ENTER <br />
            <span className="text-white drop-shadow-[4px_4px_0px_#000]">THE</span> <br />
            ARENA.
          </h1>
          
          <p className="text-2xl font-bold max-w-lg border-l-8 border-black pl-6">
            Akses ribuan materi pembelajaran AI yang disesuaikan secara ajaib khusus untukmu.
          </p>

          <div className="absolute top-40 right-40 bg-[#00E5FF] border-4 border-black px-6 py-3 font-black text-2xl uppercase shadow-[6px_6px_0px_#000] rotate-12">
            100% FREE!
          </div>
        </div>

      </div>

      {/* RIGHT: THE ACTION ZONE (Form) */}
      <div className="form-container flex-1 lg:max-w-xl bg-[#FDF6E3] flex flex-col justify-center p-8 md:p-16 relative">
        
        <div className="max-w-md w-full mx-auto">
          
          <div className="form-element flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-[#38E54D] border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center -rotate-6">
              <Key className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black uppercase">JEJAK.AI</h2>
              <p className="font-bold text-black/60 uppercase text-sm">Authentication Gateway</p>
            </div>
          </div>

          {isMissingKeys && (
            <div className="form-element bg-[#FF5F56] text-white border-4 border-black p-4 mb-8 shadow-[4px_4px_0px_#000] flex gap-3 animate-pulse">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div className="text-sm font-bold">
                Kunci Supabase belum diset! Masukkan <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>ANON_KEY</code> di file <code>.env.local</code>.
              </div>
            </div>
          )}

          <div className="space-y-6 mb-8">
            <div className="form-element relative group">
              <div className="absolute -inset-1 bg-black rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-200"></div>
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-6 h-6 text-black/50" />
                <input 
                  type="email" 
                  placeholder="ALAMAT EMAIL" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-4 border-black bg-white rounded-none px-12 py-4 font-black uppercase outline-none focus:bg-[#FF90E8] transition-colors shadow-[6px_6px_0px_#000] placeholder:text-black/30"
                />
              </div>
            </div>

            <div className="form-element relative group">
              <div className="absolute -inset-1 bg-black rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-200"></div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-6 h-6 text-black/50" />
                <input 
                  type="password" 
                  placeholder="PASSWORD" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-4 border-black bg-white rounded-none px-12 py-4 font-black uppercase outline-none focus:bg-[#00E5FF] transition-colors shadow-[6px_6px_0px_#000] placeholder:text-black/30"
                />
              </div>
            </div>

            <div className="form-element flex gap-4 pt-4">
              <button
                onClick={() => handleEmailAuth(false)}
                disabled={isLoading}
                className="flex-1 bg-black text-white px-6 py-4 font-black text-xl uppercase border-4 border-black shadow-[6px_6px_0px_#38E54D] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#38E54D] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                LOGIN
              </button>
              <button
                onClick={() => handleEmailAuth(true)}
                disabled={isLoading}
                className="flex-1 bg-[#FFC900] text-black px-6 py-4 font-black text-xl uppercase border-4 border-black shadow-[6px_6px_0px_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                REGISTER
              </button>
            </div>
          </div>

          <div className="form-element flex items-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-black"></div>
            <span className="font-black uppercase tracking-widest">ATAU</span>
            <div className="h-1 flex-1 bg-black"></div>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="form-element w-full flex items-center justify-center gap-4 bg-white text-black px-6 py-5 font-black text-xl uppercase border-4 border-black shadow-[8px_8px_0px_#000] hover:bg-[#F3F4F6] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Menghubungkan...</span>
            ) : (
              <>
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
