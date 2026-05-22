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
    const { goal, level, hoursPerDay, startDay = 1 } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is not set in environment variables." }, 
        { status: 500 }
      );
    }

    const endDay = startDay + 29;
    let phaseContext = "";
    if (startDay === 1) {
      phaseContext = "This is Phase 1 (Days 1-30). Focus on Fundamentals and Basics.";
    } else if (startDay === 31) {
      phaseContext = "The student has successfully completed Phase 1 (Days 1-30) of fundamentals. This is Phase 2 (Days 31-60). Focus on Intermediate concepts, deeper understanding, and slightly larger applications.";
    } else if (startDay === 61) {
      phaseContext = "The student has successfully completed Phase 2 (Days 1-60). This is Phase 3 (Days 61-90). Focus on Advanced concepts, architecture, and building production-ready projects.";
    }

    const prompt = `You are an expert curriculum designer. 
Create a comprehensive 30-day learning path for a student who wants to achieve this goal: "${goal}".
The student's current skill level is: "${level}".
They have ${hoursPerDay} hours available per day to study.

${phaseContext}

CRITICAL INSTRUCTIONS:
1. You MUST generate exactly 30 days of content starting from Day ${startDay} up to Day ${endDay}. Do not start from Day 1 if startDay is not 1!
2. ALL CONTENT MUST BE WRITTEN IN INDONESIAN (BAHASA INDONESIA).
3. Group the journey logically into phases appropriate for these days.
4. To keep the daily workload realistic, provide exactly 1 to 2 highly focused topics per day.
5. Each topic should include 1-2 practical resources (like a Youtube search query, documentation link, or practice exercise).
6. Output ONLY a valid JSON array matching the schema precisely.

Output Schema (Array of Objects):
[
  {
    "day": <number ${startDay}-${endDay}>,
    "topics": [
      {
        "title": "<string>",
        "description": "<string>",
        "explanation": "<string> (Provide a detailed, easy-to-understand 2-3 paragraph summary/explanation of the core concepts for this topic, so the student can learn the basics directly from this text)",
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
      return NextResponse.json({ error: "API AI Google sedang sibuk atau limit harian habis. Coba lagi dalam beberapa detik." }, { status: 500 });
    }

    const data = await response.json();
    const textContent = data.candidates[0].content.parts[0].text;
    
    // Safety check parsing
    const jsonResult = JSON.parse(textContent);
    
    // Validate if the AI actually returned 30 days
    const pathArray = Array.isArray(jsonResult) ? jsonResult : jsonResult.learningPath;
    if (!pathArray || pathArray.length < 10) {
      console.error("AI returned too few days:", pathArray?.length);
      return NextResponse.json({ error: "AI menghasilkan data yang tidak lengkap. Coba generate ulang." }, { status: 500 });
    }

    return NextResponse.json(jsonResult);
  } catch (error) {
    console.error("Generate path error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
