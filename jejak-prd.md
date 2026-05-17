# 📄 Product Requirements Document (PRD)
## Jejak — AI-Powered Adaptive Learning Path

**Versi:** 1.0  
**Tanggal:** Mei 2026  
**Event:** JuaraVibeCoding by Google for Developers  
**Tim:** Erlangga

---

## 1. Overview

### Tagline
> *"Jejak — Karena setiap perjalanan belajar meninggalkan jejaknya sendiri."*

### Problem Statement
Banyak pelajar dan mahasiswa Indonesia yang ingin belajar skill baru (web development, AI engineering, dll) tapi tidak tahu harus mulai dari mana. Learning path yang tersedia saat ini bersifat generik, tidak personal, dan tidak mempertimbangkan kondisi nyata user — seperti waktu yang tersedia, skill awal, dan tujuan karier spesifik.

### Solution
Jejak adalah aplikasi web berbasis AI yang menghasilkan learning path **personal dan adaptif** untuk setiap user berdasarkan tujuan karier, skill saat ini, dan waktu yang tersedia. Dilengkapi dengan Skill Gap Detector yang menganalisis job description impian user dan menyesuaikan path secara otomatis.

---

## 2. Target User

- Pelajar SMA/SMK yang ingin belajar skill teknologi
- Mahasiswa yang ingin masuk dunia kerja tech
- Career switcher yang ingin pindah ke bidang IT
- Siapapun yang mau belajar mandiri tapi bingung mulai dari mana

---

## 3. Fitur Utama (MVP)

### 3.1 Smart Onboarding ⭐ CORE
User menjawab 3 pertanyaan singkat:
- **Tujuan:** Mau jadi apa? (Web Developer, AI Engineer, Mobile Dev, Data Analyst, dll)
- **Level:** Skill sekarang di mana? (Pemula / Menengah / Sudah punya dasar)
- **Waktu:** Bisa belajar berapa jam per hari?

**Output:** Learning path personal hari ke hari yang di-generate Gemini AI, lengkap dengan resource belajar berbahasa Indonesia (Dicoding, BuildWith Angga, Sanbercode, dll)

---

### 3.2 Skill Gap Detector ⭐ KILLER FEATURE
- User paste job description dari lowongan impian mereka
- AI menganalisis skill yang dibutuhkan vs skill user saat ini
- Learning path otomatis disesuaikan untuk menutup gap tersebut
- Output: *"Kamu butuh belajar X, Y, Z untuk posisi ini. Ini roadmap 60 hari pertamamu."*

---

### 3.3 Daily Check-in
- Setiap hari AI menanyakan progress belajar user
- User bisa report: sudah belajar apa, stuck di mana, atau skip hari ini
- AI memberikan respons adaptif — motivasi, saran, atau penyesuaian jadwal

---

### 3.4 Progress Visualizer
- Dashboard menampilkan progress journey user
- Hari ke berapa dari total path
- Streak belajar harian
- Persentase completion per topik

---

### 3.5 Resource Lokal Indonesia
- Semua rekomendasi resource mengutamakan konten Bahasa Indonesia
- Dicoding, BuildWith Angga, Sanbercode, Petani Kode, dll
- Dilengkapi link langsung ke resource

---

## 4. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| AI Engine | Google Gemini API (via Google AI Studio) |
| Builder | Antigravity |
| Database | Supabase (optional for MVP) |
| Deploy | Vercel |

---

## 5. Design System

### Color Palette

**Light Mode**
- Background: `#F0FDF4`
- Primary: `#065F46`
- Accent: `#10B981`
- Text: `#022C22`

**Dark Mode**
- Background: `#022C22`
- Primary: `#34D399`
- Accent: `#F59E0B`
- Text: `#F0FDF4`

### Typography
- Font: Inter atau Geist (Next.js default)
- Heading: Bold, besar, impactful
- Body: Regular, readable

### Vibe
- Clean, minimal, tidak overwhelming
- Terasa seperti teman belajar, bukan aplikasi korporat
- Dual mode: Light & Dark

---

## 6. User Flow

```
Landing Page
    ↓
Klik "Mulai Perjalananmu"
    ↓
Smart Onboarding (3 pertanyaan)
    ↓
AI Generate Learning Path Personal
    ↓
Dashboard — Lihat Path Hari ke Hari
    ↓
[Opsional] Skill Gap Detector — Paste Job Description
    ↓
Path Disesuaikan Otomatis
    ↓
Daily Check-in Harian
    ↓
Progress Visualizer
```

---

## 7. Pages & Components

### 7.1 Landing Page (`/`)
- Hero section dengan tagline
- Problem statement yang relatable
- CTA: "Mulai Perjalananmu"
- Preview dashboard (screenshot/mockup)

### 7.2 Onboarding (`/onboarding`)
- Step 1: Pilih tujuan karier
- Step 2: Pilih level skill
- Step 3: Input waktu tersedia per hari
- Loading animation saat AI generate path

### 7.3 Dashboard (`/dashboard`)
- Header: nama user + hari ke berapa
- Learning path card per hari (scrollable)
- Streak counter
- Progress bar per topik
- Tombol Skill Gap Detector

### 7.4 Skill Gap Detector (`/skill-gap`)
- Textarea untuk paste job description
- Tombol analisis
- Hasil: skill yang dibutuhkan vs yang dimiliki
- CTA: Update learning path

### 7.5 Daily Check-in (modal/page)
- Pertanyaan AI: "Hari ini belajar apa?"
- Input bebas dari user
- Respons AI yang personal

---

## 8. Out of Scope (MVP)

- Authentication / login sistem
- Fitur komunitas / leaderboard
- Mobile app (Native)
- Notifikasi push / email reminder
- Monetisasi

---

## 9. Success Metrics (untuk presentasi juri)

- Demo berjalan smooth end-to-end
- Skill Gap Detector menghasilkan output yang relevan dan impressive
- UI terlihat polished dan profesional
- Story: *"Aku buat ini karena aku sendiri butuh ini"*

---

## 10. Diferensiasi dari Kompetitor

| Fitur | Jejak | Roadmap.sh | Dicoding | ChatGPT |
|-------|-------|------------|----------|---------|
| Personal & Adaptif | ✅ | ❌ | ❌ | Partial |
| Skill Gap Detector | ✅ | ❌ | ❌ | ❌ |
| Resource Lokal ID | ✅ | ❌ | ✅ | ❌ |
| Daily Check-in | ✅ | ❌ | ❌ | ❌ |
| Bahasa Indonesia | ✅ | ❌ | ✅ | Partial |

---

*PRD ini dibuat untuk keperluan JuaraVibeCoding by Google for Developers — 2026*
