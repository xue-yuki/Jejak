import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { goal, level, hoursPerDay } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is not set in environment variables." }, 
        { status: 500 }
      );
    }

    const prompt = `You are an expert curriculum designer. 
Create a comprehensive 90-day (3 months) learning path for a student who wants to achieve this goal: "${goal}".
The student's current skill level is: "${level}".
They have ${hoursPerDay} hours available per day to study.

CRITICAL INSTRUCTIONS:
1. You MUST generate exactly 90 days of content.
2. Group the journey logically into phases (e.g., Fundamentals, Intermediate, Advanced, Projects).
3. To keep the daily workload realistic and prevent AI generation timeouts, provide exactly 1 to 2 highly focused topics per day.
4. Each topic should include 1-2 practical resources (like a Youtube search query, documentation link, or practice exercise).
5. Output ONLY a valid JSON array matching the schema precisely.

Output Schema (Array of Objects):
[
  {
    "day": <number 1-90>,
    "topics": [
      {
        "title": "<string>",
        "description": "<string>",
        "resources": [ { "title": "<string>", "url": "<string>", "type": "video" | "article" | "course" } ]
      }
    ]
  }
]`;

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
      // Fallback if API fails (e.g. quota limit)
      return NextResponse.json({
        learningPath: [
          {
            day: 1,
            isCompleted: false,
            topics: [
              {
                title: "Pengenalan Dasar",
                description: "Pahami konsep dasar sebelum melangkah lebih jauh.",
                estimatedHours: 1,
                completed: false,
                resources: [
                  { title: "Materi Dasar Lengkap", url: "https://www.youtube.com", type: "Video" }
                ]
              }
            ]
          },
          {
            day: 2,
            isCompleted: false,
            topics: [
              {
                title: "Latihan Praktek",
                description: "Mulai mempraktekkan apa yang sudah dipelajari.",
                estimatedHours: 1.5,
                completed: false,
                resources: [
                  { title: "Tutorial Praktis", url: "https://www.dicoding.com", type: "Artikel" }
                ]
              }
            ]
          }
        ]
      });
    }

    const data = await response.json();
    const textContent = data.candidates[0].content.parts[0].text;
    
    // Safety check parsing
    const jsonResult = JSON.parse(textContent);

    return NextResponse.json(jsonResult);
  } catch (error) {
    console.error("Generate path error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
