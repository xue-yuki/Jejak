import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { input, profile } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is not set." }, 
        { status: 500 }
      );
    }

    const prompt = `
Kamu adalah teman belajar AI bernama Jejak.
User sedang belajar untuk menjadi ${profile.goal}.
Hari ini dia laporan tentang belajarnya: "${input}"

Berikan respons singkat yang suportif, personal, dan asyik (seperti teman sendiri). Maksimal 3 kalimat. Bahasa Indonesia yang gaul tapi sopan.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
        }
      })
    });

    if (!response.ok) {
      console.error("Gemini API Error:", await response.text());
      return NextResponse.json({ message: "Wah, keren banget! Tetap semangat ya belajarnya, jangan lupa istirahat kalau capek. Lanjut terus! 🚀" });
    }

    const data = await response.json();
    const textContent = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ message: textContent });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
