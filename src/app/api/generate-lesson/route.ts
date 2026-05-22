import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    // SECURITY CHECK: Verify Supabase Session
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { goal, level, topicTitle, topicDescription } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is not set in environment variables." }, 
        { status: 500 }
      );
    }

    const prompt = `You are an energetic, highly skilled programming mentor. 
Your student's ultimate learning goal is: "${goal}" and their current level is: "${level}".

They are about to learn this specific topic:
Title: "${topicTitle}"
Description: "${topicDescription}"

Write a highly engaging, SUPER COMPLETE, and incredibly comprehensive markdown tutorial for this topic. 
Your tone should be Neo-Brutalist: extremely bold, direct, slightly humorous, no fluff, and highly practical.

CRITICAL INSTRUCTIONS (MUST BE FOLLOWED STRICTLY):
1. ALL CONTENT MUST BE WRITTEN IN INDONESIAN (BAHASA INDONESIA). This is non-negotiable.
2. Buatlah konten pembelajaran (Magic Lesson) yang **SUPER LENGKAP, MENDALAM, DAN KOMPREHENSIF** tentang topik ini.
- Materi harus panjang, detail, dan mencakup banyak contoh (minimal 1000 kata).
- Jelaskan konsep dari dasar hingga lanjutan.
- Jangan gunakan placeholder. Tuliskan kodenya secara lengkap.
- Gunakan bahasa kasual, asyik, dan memotivasi.
- Gaya visual/format harus Neo-Brutalism (gunakan kapitalisasi tebal, peringatan dengan gaya alert, dll).
- WAJIB BERIKAN 5 rekomendasi video YouTube yang sangat relevan. Jika tidak ada URL spesifik, susunkan URL pencarian YouTube.
3. Explain the core concepts using simple, real-world analogies. Use formatting aggressively: **bold**, blockquotes, lists, and tables.
4. PENTING: Pisahkan setiap bagian atau sub-topik materi (contoh: dari Pendahuluan ke Praktik) menggunakan pembatas Horizontal Rule (\`---\`). Ini akan digunakan oleh sistem kami untuk membagi konten menjadi halaman-halaman paginasi!
5. The quiz MUST contain exactly 3 to 5 multiple-choice questions to test the user's understanding of the markdown text.
6. The youtubeVideos MUST contain exactly 5 recommended YouTube videos for further learning.

OUTPUT FORMAT:
You MUST format your entire response using the exact delimiters below. Do not use JSON format.

===MARKDOWN===
[Tuliskan seluruh materi markdown super lengkap Anda di sini]
===END_MARKDOWN===

===YOUTUBE===
[Judul Video 1] | [URL Video 1]
[Judul Video 2] | [URL Video 2]
[Judul Video 3] | [URL Video 3]
[Judul Video 4] | [URL Video 4]
[Judul Video 5] | [URL Video 5]
===END_YOUTUBE===

===QUIZ===
Q: [Pertanyaan 1]
A: [Opsi A]
B: [Opsi B]
C: [Opsi C]
D: [Opsi D]
CORRECT: [A / B / C / D]
EXPLANATION: [Penjelasan singkat]

Q: [Pertanyaan 2]
...
===END_QUIZ===`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      return NextResponse.json({
        content: `# 💥 KONEKSI TERPUTUS 💥\n\nMaaf, sepertinya AI sedang kewalahan. Coba klik tombol generate sekali lagi!`
      }, { status: 500 });
    }

    const data = await response.json();
    let textContent = data.candidates[0].content.parts[0].text || "";
    
    // Parse MARKDOWN (resilient to cut-offs)
    let markdown = "";
    const mdMatch = textContent.match(/===MARKDOWN===([\s\S]*?)(?:===END_MARKDOWN===|$)/);
    if (mdMatch) {
      markdown = mdMatch[1].trim();
    }
    
    // Parse YOUTUBE
    const youtubeVideos = [];
    const ytMatch = textContent.match(/===YOUTUBE===([\s\S]*?)(?:===END_YOUTUBE===|$)/);
    if (ytMatch) {
      const lines = ytMatch[1].trim().split('\n');
      for (const line of lines) {
        if (line.includes('|')) {
          const [title, url] = line.split('|').map((s: string) => s.trim());
          if (title && url) youtubeVideos.push({ title, url });
        }
      }
    }

    // Parse QUIZ
    const quiz = [];
    const quizMatch = textContent.match(/===QUIZ===([\s\S]*?)(?:===END_QUIZ===|$)/);
    if (quizMatch) {
      // Split by double newline to get each question block
      const blocks = quizMatch[1].trim().split(/\n\s*\n/);
      for (const block of blocks) {
        const lines = block.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
        const qObj: any = { options: [] };
        
        let correctLetter = 'A';
        for (const line of lines) {
          if (line.startsWith('Q:')) qObj.question = line.substring(2).trim();
          else if (line.startsWith('A:')) qObj.options.push(line.substring(2).trim());
          else if (line.startsWith('B:')) qObj.options.push(line.substring(2).trim());
          else if (line.startsWith('C:')) qObj.options.push(line.substring(2).trim());
          else if (line.startsWith('D:')) qObj.options.push(line.substring(2).trim());
          else if (line.startsWith('CORRECT:')) correctLetter = line.substring(8).trim().toUpperCase();
          else if (line.startsWith('EXPLANATION:')) qObj.explanation = line.substring(12).trim();
        }
        
        if (correctLetter === 'A') qObj.correctAnswerIndex = 0;
        else if (correctLetter === 'B') qObj.correctAnswerIndex = 1;
        else if (correctLetter === 'C') qObj.correctAnswerIndex = 2;
        else if (correctLetter === 'D') qObj.correctAnswerIndex = 3;
        else qObj.correctAnswerIndex = 0;

        if (qObj.question && qObj.options.length > 0) {
          quiz.push(qObj);
        }
      }
    }
    
    // Fallback if delimiters completely failed
    if (!markdown && textContent.length > 100) {
       markdown = textContent;
    }
    
    return NextResponse.json({ markdown, youtubeVideos, quiz });
  } catch (error) {
    console.error("Generate lesson error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
