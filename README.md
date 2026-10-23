# SUROJ × BE10X — AI Workforce Assessment & Impact Platform

A production-ready, enterprise-grade AI workforce assessment and analytics platform built for **Suroj Buildcon** employees who have completed the 3-day Generative AI training conducted by **Be10x**.

---

## 🚀 Live Demo

> Deploy via Vercel — see deployment instructions below.

**Demo Credentials**

| Portal | Email | Password |
|--------|-------|----------|
| Employee | `demo@surojbuildcon.com` | `Demo@2024` |
| Admin | `admin@surojbuildcon.com` | `Admin@2024` |

Any `@surojbuildcon.com` email with password `Demo@2024` works as an employee login.

---

## 🎯 Purpose

This platform measures whether 177 Suroj Buildcon employees have genuinely improved their ability to use AI in real, day-to-day professional work after completing a 3-day AI workshop by Be10x.

- **Pre-Training Assessment** — Baseline AI readiness measurement
- **Post-Training Assessment** — Impact measurement and improvement tracking
- **Admin Analytics Portal** — Department-level insights, competency analysis, readiness distribution

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
│   ├── useLocalAssessment.ts  # Offline-capable assessment engine
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

## 🧠 Assessment Engine

- **30 questions per session**, 90-minute time limit
- Question types: MCQ, Multi-select, Short Answer, Long Answer, Scenario, Prompt Writing, Workflow Design, Output Evaluation, Document Analysis, Data Analysis
- **Department-specific question pools** for 6 departments:
  - EPC Bids & Design-Build / Tendering & Contracts
  - Accounts & Finance
  - People, Admin & Communication
  - Cost, Planning & Systems
  - Procurement & Stores
  - Design, Drawings & Quantities
- Competency scoring across 10 AI readiness dimensions
- Offline-capable via `localStorage` — works without Supabase for demo

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

> Without these, the platform runs in **demo mode** with local authentication and question banks.

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
