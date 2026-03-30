
-- Fix: restrict log insertion to only the current user
DROP POLICY "System can insert logs" ON public.logs_auditoria;

CREATE POLICY "Authenticated users can insert own logs"
  ON public.logs_auditoria FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
