-- ==============================================================================
-- Migration: Create police_profiles and accident_cases with Row Level Security
-- Project: AccidentIQ
-- ==============================================================================

-- 1. Create police_profiles table
CREATE TABLE IF NOT EXISTS public.police_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    police_id TEXT,
    full_name TEXT,
    department TEXT,
    rank TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT police_profiles_user_id_key UNIQUE (user_id)
);

-- 2. Create accident_cases table
CREATE TABLE IF NOT EXISTS public.accident_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number TEXT NOT NULL,
    title TEXT,
    accident_type TEXT,
    location TEXT,
    incident_date DATE,
    description TEXT,
    assigned_officer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT accident_cases_case_number_key UNIQUE (case_number)
);

-- 3. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_police_profiles_user_id 
    ON public.police_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_accident_cases_assigned_officer_id 
    ON public.accident_cases(assigned_officer_id);

CREATE INDEX IF NOT EXISTS idx_accident_cases_case_number 
    ON public.accident_cases(case_number);

-- 4. Enable Row Level Security (RLS) on both tables
ALTER TABLE public.police_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accident_cases ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies for police_profiles
-- Rule: An authenticated user can only access/read/insert/update their own profile (user_id = auth.uid())
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'police_profiles' 
          AND policyname = 'Authenticated users can read own police profile'
    ) THEN
        CREATE POLICY "Authenticated users can read own police profile"
            ON public.police_profiles
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'police_profiles' 
          AND policyname = 'Authenticated users can insert own police profile'
    ) THEN
        CREATE POLICY "Authenticated users can insert own police profile"
            ON public.police_profiles
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'police_profiles' 
          AND policyname = 'Authenticated users can update own police profile'
    ) THEN
        CREATE POLICY "Authenticated users can update own police profile"
            ON public.police_profiles
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Row Level Security Policies for accident_cases
-- Rules:
-- - Authenticated user can read cases where assigned_officer_id = auth.uid()
-- - Authenticated user can create a case assigned to themselves
-- - Authenticated user can update their own assigned cases
-- - Anonymous access is completely disallowed (no policies for 'anon')
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'accident_cases' 
          AND policyname = 'Authenticated officers can read their assigned cases'
    ) THEN
        CREATE POLICY "Authenticated officers can read their assigned cases"
            ON public.accident_cases
            FOR SELECT
            TO authenticated
            USING (auth.uid() = assigned_officer_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'accident_cases' 
          AND policyname = 'Authenticated officers can create cases assigned to themselves'
    ) THEN
        CREATE POLICY "Authenticated officers can create cases assigned to themselves"
            ON public.accident_cases
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = assigned_officer_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'accident_cases' 
          AND policyname = 'Authenticated officers can update their assigned cases'
    ) THEN
        CREATE POLICY "Authenticated officers can update their assigned cases"
            ON public.accident_cases
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = assigned_officer_id)
            WITH CHECK (auth.uid() = assigned_officer_id);
    END IF;
END $$;

-- 7. Function and trigger to keep updated_at in sync
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'set_accident_cases_updated_at'
    ) THEN
        CREATE TRIGGER set_accident_cases_updated_at
            BEFORE UPDATE ON public.accident_cases
            FOR EACH ROW
            EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;
