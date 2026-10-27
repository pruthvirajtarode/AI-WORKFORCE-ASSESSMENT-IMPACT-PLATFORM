# SUROJ × BE10X — AI Workforce Assessment & Impact Platform

A production-ready, enterprise-grade AI workforce assessment and analytics platform built for **Suroj Buildcon** employees who have completed the 3-day Generative AI training conducted by **Be10x**.

---

## 🚀 Live Demo

> Deploy via Vercel — see deployment instructions below.

**Demo Credentials**

| Portal | Email | Password |
|--------|-------|----------|
| Admin | `admin@surojbuildcon.com` | `Admin@2024` |

These admin demo credentials work only when Supabase is not configured. With Supabase enabled, use an administrator account provisioned in that Supabase project.

Employees do not need an account or password. They select **Start Assessment**, enter their name and department, then choose one of the six assessment sessions.

---

## 🎯 Purpose

The employee portal provides six assessment sessions from the six source HTML files in the project root. Employees enter their name and department, select a session, review its instructions, and start the assessment. Each employee can submit each session once; progress is saved per employee and session.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| Auth | Supabase Auth (with offline demo fallback) |
| Database | Supabase (PostgreSQL) |
| Icons | Lucide React |
| Forms | React Hook Form |

---

## 📁 Project Structure

```
src/
├── contexts/          # AuthContext with Supabase + demo bypass
├── components/
│   ├── layout/        # AdminLayout, EmployeeLayout
│   └── ui/            # Badge, Modal, ProgressBar, TimerBar, etc.
├── data/
│   └── questions/     # Department-specific question banks
│       ├── common.ts  # Cross-department AI fundamentals
│       ├── epc.ts     # EPC Bids & Tendering
│       ├── accounts.ts
│       ├── people.ts
│       ├── other-depts.ts  # CPS, PRO, DDQ
│       └── practical.ts    # Practical scenario supplements
├── hooks/
│   ├── useSessionAssessments.ts # Session attempts, local recovery and Supabase persistence
│   └── useAdminData.ts        # Mock analytics data generator
├── lib/
│   ├── constants.ts   # Departments, routes, assessment config
│   ├── utils.ts       # Formatters, score helpers, readiness levels
│   └── supabase.ts    # Supabase client
├── pages/
│   ├── LandingPage.tsx
│   ├── EmployeeLoginPage.tsx
│   ├── AdminLoginPage.tsx
│   ├── NotFoundPage.tsx
│   ├── employee/
│   │   ├── EmployeeDashboard.tsx
│   │   ├── AssessmentStartPage.tsx
│   │   ├── AssessmentPage.tsx         # Full timed test engine
│   │   ├── AssessmentResultPage.tsx
│   │   └── EmployeeResultsPage.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── AdminEmployeesPage.tsx
│       ├── AdminEmployeeDetailPage.tsx
│       ├── AdminSubmissionsPage.tsx
│       ├── AdminAnalyticsPage.tsx
│       ├── AdminAssessmentsPage.tsx
│       ├── AdminQuestionsPage.tsx
│       └── AdminSettingsPage.tsx
└── types/index.ts
```

---

## 🧠 Department Sessions

The original assessment HTML files are authoritative. `npm run dev` and `npm run build` extract their assessment titles, section briefs, questions, options, IDs, optional/manual markers, scoring identifiers and source timer into `src/data/departmentalAssessments.json`; do not edit that generated file by hand. The source files intentionally keep trainer answer keys in their external trainer-only store, so answer keys are not bundled into the employee app.

Attempts are keyed by the guest employee profile and session. Browser storage provides immediate draft recovery; when Supabase is configured, anonymous employee sessions save profiles, answers, and submission status to `public.assessment_attempts`, where administrators can review them from another device.

### Supabase setup

Apply all migrations in `supabase/migrations/` to the Supabase project in filename order, then configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These migrations create assessment attempts, support guest employee registration, allow employees to take the six sessions, and grant administrator-only result reads/evaluation updates through RLS. Demo mode uses per-browser storage and does not share employee records with Supabase.

The admin dashboard, employee list, submission list, analytics, and employee result detail now read live Supabase data and show empty states when no records exist. Trainer evaluation is an explicit admin action because the source HTML answer keys are maintained outside this repository; the client never invents objective marks.

No transactional cleanup is performed by the frontend. Before a fresh production test, an authorized Supabase administrator should review and remove only confirmed demo attempts/employees using a separately approved SQL script. The repository does not contain live Supabase credentials, so no database records were deleted during development.

---

## ⚡ Deployment on Vercel

### 1. Fork / Push to GitHub (already done)

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import `AI-WORKFORCE-ASSESSMENT-IMPACT-PLATFORM` from GitHub
3. Vercel auto-detects Vite — keep defaults

### 3. Add Environment Variables (optional — for Supabase)

In Vercel project settings → **Environment Variables**, add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> Without these, the platform runs in **browser-only demo mode**. Employee profiles and submissions are not shared with administrators on other devices. Configure Supabase and apply the repository migrations for shared employee records and results.

### 4. Deploy

Click **Deploy** — Vercel will build and publish automatically.

### Build Command
```bash
npm run build
```

### Output Directory
```
dist
```

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 🔐 AI Readiness Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| 🔴 Needs Development | 0–39% | Foundational AI skill building required |
| 🟠 Developing | 40–59% | Building core AI competencies |
| 🔵 Operational | 60–74% | Capable of everyday AI-assisted work |
| 🟢 Advanced | 75–89% | Proficient in AI-driven workflows |
| 🟣 AI Leader | 90–100% | Exemplary AI adoption and advocacy |

---

## 👥 Departments

| Code | Department |
|------|-----------|
| EPC | EPC Bids & Design-Build / Tendering & Contracts |
| ACC | Accounts & Finance |
| PAC | People, Admin & Communication |
| CPS | Cost, Planning & Systems |
| PRO | Procurement & Stores |
| DDQ | Design, Drawings & Quantities |

---

## 📄 License

Proprietary — Suroj Buildcon × Be10x. All rights reserved.
