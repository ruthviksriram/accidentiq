-- ==============================================================================
-- Migration: Create analysis_results table with Row Level Security (RLS)
-- Project: AccidentIQ
-- Purpose: Store Gemini multimodal accident evidence analysis results
-- ==============================================================================

-- 1. Create analysis_results table
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.accident_cases(id) ON DELETE CASCADE,
    analyzed_by UUID REFERENCES auth.users(id),
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analysis_results_case_id 
    ON public.analysis_results(case_id);

CREATE INDEX IF NOT EXISTS idx_analysis_results_analyzed_by 
    ON public.analysis_results(analyzed_by);

CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at 
    ON public.analysis_results(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies:
-- An authenticated officer can only access analysis results belonging to cases assigned to that officer.

DO $$
BEGIN
    -- SELECT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analysis_results' 
        AND policyname = 'Officers can view analysis results for assigned cases'
    ) THEN
        CREATE POLICY "Officers can view analysis results for assigned cases"
        ON public.analysis_results FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.accident_cases ac
                WHERE ac.id = analysis_results.case_id
                AND ac.assigned_officer_id = auth.uid()
            )
        );
    END IF;

    -- INSERT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analysis_results' 
        AND policyname = 'Officers can insert analysis results for assigned cases'
    ) THEN
        CREATE POLICY "Officers can insert analysis results for assigned cases"
        ON public.analysis_results FOR INSERT
        TO authenticated
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.accident_cases ac
                WHERE ac.id = analysis_results.case_id
                AND ac.assigned_officer_id = auth.uid()
            )
        );
    END IF;

    -- UPDATE policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analysis_results' 
        AND policyname = 'Officers can update analysis results for assigned cases'
    ) THEN
        CREATE POLICY "Officers can update analysis results for assigned cases"
        ON public.analysis_results FOR UPDATE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.accident_cases ac
                WHERE ac.id = analysis_results.case_id
                AND ac.assigned_officer_id = auth.uid()
            )
        );
    END IF;

    -- DELETE policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analysis_results' 
        AND policyname = 'Officers can delete analysis results for assigned cases'
    ) THEN
        CREATE POLICY "Officers can delete analysis results for assigned cases"
        ON public.analysis_results FOR DELETE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.accident_cases ac
                WHERE ac.id = analysis_results.case_id
                AND ac.assigned_officer_id = auth.uid()
            )
        );
    END IF;
END $$;
