-- ==============================================================================
-- Migration: Create evidence table and accident-evidence storage bucket with RLS
-- Project: AccidentIQ
-- ==============================================================================

-- 1. Create evidence table
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.accident_cases(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('photo', 'dashcam_video', 'cctv_video', 'voice_statement')),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_evidence_case_id 
    ON public.evidence(case_id);

CREATE INDEX IF NOT EXISTS idx_evidence_uploaded_by 
    ON public.evidence(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_evidence_evidence_type 
    ON public.evidence(evidence_type);

CREATE INDEX IF NOT EXISTS idx_evidence_created_at 
    ON public.evidence(created_at DESC);

-- 3. Enable Row Level Security (RLS) on evidence
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies on evidence:
-- An authenticated officer can only access evidence belonging to cases assigned to that officer.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'evidence' 
          AND policyname = 'Authenticated officers can view evidence for assigned cases'
    ) THEN
        CREATE POLICY "Authenticated officers can view evidence for assigned cases"
            ON public.evidence
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.accident_cases
                    WHERE accident_cases.id = evidence.case_id
                      AND accident_cases.assigned_officer_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'evidence' 
          AND policyname = 'Authenticated officers can insert evidence for assigned cases'
    ) THEN
        CREATE POLICY "Authenticated officers can insert evidence for assigned cases"
            ON public.evidence
            FOR INSERT
            TO authenticated
            WITH CHECK (
                auth.uid() = uploaded_by
                AND EXISTS (
                    SELECT 1 FROM public.accident_cases
                    WHERE accident_cases.id = evidence.case_id
                      AND accident_cases.assigned_officer_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'evidence' 
          AND policyname = 'Authenticated officers can update evidence for assigned cases'
    ) THEN
        CREATE POLICY "Authenticated officers can update evidence for assigned cases"
            ON public.evidence
            FOR UPDATE
            TO authenticated
            USING (
                auth.uid() = uploaded_by
                AND EXISTS (
                    SELECT 1 FROM public.accident_cases
                    WHERE accident_cases.id = evidence.case_id
                      AND accident_cases.assigned_officer_id = auth.uid()
                )
            )
            WITH CHECK (
                auth.uid() = uploaded_by
                AND EXISTS (
                    SELECT 1 FROM public.accident_cases
                    WHERE accident_cases.id = evidence.case_id
                      AND accident_cases.assigned_officer_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'evidence' 
          AND policyname = 'Authenticated officers can delete evidence for assigned cases'
    ) THEN
        CREATE POLICY "Authenticated officers can delete evidence for assigned cases"
            ON public.evidence
            FOR DELETE
            TO authenticated
            USING (
                auth.uid() = uploaded_by
                AND EXISTS (
                    SELECT 1 FROM public.accident_cases
                    WHERE accident_cases.id = evidence.case_id
                      AND accident_cases.assigned_officer_id = auth.uid()
                )
            );
    END IF;
END $$;

-- 5. Create private Supabase Storage bucket for accident evidence (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'accident-evidence',
    'accident-evidence',
    false,
    104857600, -- 100MB limit
    ARRAY[
        'image/jpeg', 'image/png', 'image/webp', 'image/heic',
        'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska',
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/m4a', 'audio/webm', 'audio/ogg', 'audio/aac'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 104857600;

-- 6. Storage Object RLS Policies on storage.objects for accident-evidence bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects' 
          AND policyname = 'Authenticated officers can upload accident evidence'
    ) THEN
        CREATE POLICY "Authenticated officers can upload accident evidence"
            ON storage.objects
            FOR INSERT
            TO authenticated
            WITH CHECK (
                bucket_id = 'accident-evidence'
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects' 
          AND policyname = 'Authenticated officers can view accident evidence'
    ) THEN
        CREATE POLICY "Authenticated officers can view accident evidence"
            ON storage.objects
            FOR SELECT
            TO authenticated
            USING (
                bucket_id = 'accident-evidence'
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects' 
          AND policyname = 'Authenticated officers can update accident evidence'
    ) THEN
        CREATE POLICY "Authenticated officers can update accident evidence"
            ON storage.objects
            FOR UPDATE
            TO authenticated
            USING (
                bucket_id = 'accident-evidence'
            )
            WITH CHECK (
                bucket_id = 'accident-evidence'
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
          AND tablename = 'objects' 
          AND policyname = 'Authenticated officers can delete accident evidence'
    ) THEN
        CREATE POLICY "Authenticated officers can delete accident evidence"
            ON storage.objects
            FOR DELETE
            TO authenticated
            USING (
                bucket_id = 'accident-evidence'
            );
    END IF;
END $$;
