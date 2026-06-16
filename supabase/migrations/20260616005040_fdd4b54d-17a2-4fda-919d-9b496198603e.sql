
-- Audit log for teacher approval/rejection
CREATE TABLE public.teacher_approval_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('approved','rejected')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX teacher_approval_audit_teacher_idx ON public.teacher_approval_audit(teacher_id, created_at DESC);

GRANT SELECT ON public.teacher_approval_audit TO authenticated;
GRANT ALL ON public.teacher_approval_audit TO service_role;

ALTER TABLE public.teacher_approval_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit"
ON public.teacher_approval_audit FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers read own audit"
ON public.teacher_approval_audit FOR SELECT
TO authenticated
USING (auth.uid() = teacher_id);

-- Update approve/reject RPCs to log audit
CREATE OR REPLACE FUNCTION public.approve_teacher(_user_id uuid, _notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve teachers';
  END IF;
  UPDATE public.profiles SET teacher_status = 'approved' WHERE id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'professor')
  ON CONFLICT DO NOTHING;
  INSERT INTO public.teacher_approval_audit (teacher_id, admin_id, action, notes)
  VALUES (_user_id, auth.uid(), 'approved', _notes);
END $$;

CREATE OR REPLACE FUNCTION public.reject_teacher(_user_id uuid, _notes text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can reject teachers';
  END IF;
  UPDATE public.profiles SET teacher_status = 'rejected' WHERE id = _user_id;
  -- Remove professor role if previously granted
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'professor';
  INSERT INTO public.teacher_approval_audit (teacher_id, admin_id, action, notes)
  VALUES (_user_id, auth.uid(), 'rejected', _notes);
END $$;
