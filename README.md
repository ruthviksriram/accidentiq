# AccidentIQ 🚔🤖

AccidentIQ is a multimodal AI-powered accident investigation and scene reconstruction platform that helps police officers and investigators manage cases, securely organize multimodal scene evidence, and generate structured forensic AI-assisted insights using Google Gemini and Supabase.

---

## 🌟 Key Features

- **Police Case Management**: Create, view, update, and manage official accident investigation cases with unique sequence identifiers (`ACC-YYYY-XXX`).
- **Multimodal Evidence Vault**: Securely upload and store scene photos, dashcam videos, CCTV captures, and audio witness statements into private Supabase Storage.
- **Gemini Multimodal Forensic Analysis**: Automated AI evidence analysis categorizing insights into the 4-Pillar evidentiary model (*Observed*, *Reported*, *Inferred*, *Unknown*).
- **Interactive 2D Scene Reconstruction**: Visual simulation of vehicle trajectories, collision points, point of rest, debris fields, and speed differential estimates.
- **Official Police Case Reports**: Generate and export formal investigation dossiers with incident timelines, participant records, damage assessments, and officer sign-offs.
- **Row-Level Security (RLS)**: Strict database-level authorization ensuring only assigned investigating officers can modify or delete case records.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Vanilla CSS with modern theme tokens (Light & Dark mode support)
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Row-Level Security, Storage, Edge Functions)
- **AI Engine**: Google Gemini Multimodal Vision API (`gemini-3.5-flash`) via Supabase Edge Function

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm / pnpm / yarn
- Supabase account & project

### 2. Environment Setup
Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 3. Installation & Local Development
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
