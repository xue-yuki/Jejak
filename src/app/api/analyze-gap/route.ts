import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobDescription, profile } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API Key is not set." }, 
        { status: 500 }
      );
    }

    const prompt = `
Kamu adalah AI Career Coach dan penyusun kurikulum bernama Jejak.
User sedang belajar menjadi "${profile.goal}" dengan level saat ini "${profile.level}" dan waktu belajar ${profile.hoursPerDay} jam/hari.
Dia baru saja memberikan Job Description impiannya:
"""
${jobDescription}
"""

Tugasmu:
1. Ekstrak skill yang dibutuhkan dari JD.
2. Prediksi skill yang sudah dimiliki user (berdasarkan level "${profile.level}").
3. Identifikasi skill gap (apa yang harus dia pelajari untuk memenuhi JD).
4. Buat penyesuaian learning path 7 hari ke depan untuk fokus menutup gap tersebut.

Format output HARUS JSON MURNI tanpa markdown, dengan struktur:
{
  "analysis": {
    "requiredSkills": ["skill 1", "skill 2"],
    "currentSkills": ["skill A"],
    "gapSkills": ["skill 1", "skill 2"]
  },
  "newLearningPath": [
    {
      "day": 1,
      "isCompleted": false,
      "topics": [
        {
          "title": "Nama Topik (fokus pada gap)",
          "description": "Penjelasan singkat",
          "estimatedHours": 1.5,
          "completed": false,
          "resources": [
            { "title": "Nama Resource Indo", "url": "https://...", "type": "Artikel" }
          ]
        }
      ]
    }
  ]
}
`;

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
      console.error("Gemini API Error:", await response.text());
      return NextResponse.json({
        analysis: {
          requiredSkills: ["Skill Utama 1", "Skill Utama 2", "Skill Tambahan"],
          currentSkills: ["Dasar-dasar"],
          gapSkills: ["Skill Utama 1", "Skill Utama 2"]
        },
        newLearningPath: [
          {
            day: 1,
            isCompleted: false,
            topics: [
              {
                title: "Fokus Skill Gap: Skill Utama 1",
                description: "Mempelajari skill yang spesifik diminta di Job Description.",
                estimatedHours: 2,
                completed: false,
                resources: [
                  { title: "Panduan Lengkap", url: "https://www.google.com", type: "Artikel" }
                ]
              }
            ]
          }
        ]
      });
    }

    const data = await response.json();
    const textContent = data.candidates[0].content.parts[0].text;
    const jsonResult = JSON.parse(textContent);

    return NextResponse.json(jsonResult);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
