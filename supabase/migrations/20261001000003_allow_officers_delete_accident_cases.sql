-- Migration: 20261001000003_allow_officers_delete_accident_cases.sql
-- Allow authenticated assigned officers to delete their own accident cases.
-- Evidence and analysis_results have ON DELETE CASCADE so related records are removed.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'accident_cases' 
          AND policyname = 'Authenticated officers can delete their assigned cases'
    ) THEN
        CREATE POLICY "Authenticated officers can delete their assigned cases"
            ON public.accident_cases
            FOR DELETE
            TO authenticated
            USING (auth.uid() = assigned_officer_id);
    END IF;
END $$;
