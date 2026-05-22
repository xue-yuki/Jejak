import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { history, message, context } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is not set in environment variables." }, 
        { status: 500 }
      );
    }

    const systemInstruction = `Kamu adalah 'Rubber Duck', tutor AI asisten belajar bergaya Neo-Brutalist (blak-blakan, to-the-point, asyik, dan suka pakai perumpamaan lucu). 
Tugasmu:
- Menjawab pertanyaan terkait apa saja yang sedang dipelajari pengguna.
- Beri respons ringkas, maksimal 2-3 paragraf.
- Jangan kaku, gunakan bahasa gaul Indonesia (lo, gue, bro, cuy) kalau perlu, tapi tetap cerdas dan edukatif.
- Jika pengguna meminta kode, berikan blok kode langsung tanpa basa-basi panjang.
- Konteks pengguna saat ini: ${context || 'Belajar secara mandiri'}`;

    // Format for Gemini API
    const contents = [];
    
    // Convert history
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      return NextResponse.json({ error: "Empty response from AI." }, { status: 500 });
    }

    return NextResponse.json({ reply: replyText });

  } catch (error: any) {
    console.error("Rubber Duck API Error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
