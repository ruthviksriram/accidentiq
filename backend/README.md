# AccidentIQ — Backend (Supabase & Edge Functions)

This directory contains the database migrations, Row Level Security (RLS) policies, and serverless Edge Functions for the AccidentIQ platform.

## Directory Structure

```
backend/
└── supabase/
    ├── config.toml              # Supabase CLI configuration
    ├── migrations/              # PostgreSQL schema migrations & RLS policies
    │   ├── 20261001000000_create_police_profiles_and_accident_cases.sql
    │   ├── 20261001000001_create_evidence_and_storage.sql
    │   ├── 20261001000002_create_analysis_results.sql
    │   └── 20261001000003_allow_officers_delete_accident_cases.sql
    └── functions/
        └── analyze-accident/    # Multimodal Gemini Vision Edge Function (gemini-3.5-flash)
            └── index.ts
```

## Supabase CLI Commands

To manage the backend from this directory or root:

```bash
# Link to remote Supabase project
npx supabase link --project-ref odiwqvhjrrtchzsojfjp

# Deploy Edge Function
npx supabase functions deploy analyze-accident --workdir backend

# Set Edge Function Secrets
npx supabase secrets set GEMINI_API_KEY="your-gemini-key"
```
