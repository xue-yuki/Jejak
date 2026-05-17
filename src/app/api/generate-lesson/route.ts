import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
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

Write a highly engaging, comprehensive markdown tutorial for this topic. 
Your tone should be Neo-Brutalist: extremely bold, direct, slightly humorous, no fluff, and highly practical.

CRITICAL INSTRUCTIONS:
1. ALL CONTENT MUST BE WRITTEN IN INDONESIAN (BAHASA INDONESIA). This is non-negotiable.
2. The "markdown" field should contain the lesson text. Start with a giant, catchy H1 header.
3. Explain the core concepts using simple, real-world analogies.
4. Provide at least one clear, copyable code example (if applicable) using standard markdown code blocks with syntax highlighting.
5. Use formatting aggressively: **bold**, blockquotes, lists, and tables.
6. The "quiz" field MUST contain exactly 3 to 5 multiple-choice questions to test the user's understanding of the markdown text.
7. Return ONLY a valid JSON object matching the exact schema below. Do not wrap in \`\`\`json.

Output Schema:
{
  "markdown": "<string>",
  "quiz": [
    {
      "question": "<string>",
      "options": ["<string A>", "<string B>", "<string C>", "<string D>"],
      "correctAnswerIndex": <number 0-3>,
      "explanation": "<string> (Short explanation why this is the correct answer)"
    }
  ]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      return NextResponse.json({
        content: `# 💥 KONEKSI TERPUTUS 💥\n\nMaaf, sepertinya AI sedang kewalahan. Coba klik tombol generate sekali lagi!`
      });
    }

    const data = await response.json();
    let textContent = data.candidates[0].content.parts[0].text;
    
    // Clean up potential JSON wrapper from Gemini
    if (textContent.startsWith('```json')) {
      textContent = textContent.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (textContent.startsWith('```')) {
      textContent = textContent.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    const jsonResult = JSON.parse(textContent);
    
    return NextResponse.json(jsonResult);
  } catch (error) {
    console.error("Generate lesson error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
