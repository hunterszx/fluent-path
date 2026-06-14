
-- Teacher status enum
DO $$ BEGIN
  CREATE TYPE public.teacher_status AS ENUM ('none','pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS teacher_status public.teacher_status NOT NULL DEFAULT 'none';

-- Updated handle_new_user: professor signups become pending without professor role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_name text;
  v_avatar text;
  v_role_text text;
  v_teacher_status public.teacher_status := 'none';
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'display_name',
                     NEW.raw_user_meta_data->>'name',
                     NEW.raw_user_meta_data->>'full_name',
                     split_part(NEW.email, '@', 1));
  v_avatar := NEW.raw_user_meta_data->>'avatar_url';
  v_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'aluno');

  IF v_role_text = 'professor' THEN
    v_teacher_status := 'pending';
  END IF;

  INSERT INTO public.profiles (id, display_name, avatar_url, teacher_status)
  VALUES (NEW.id, v_name, v_avatar, v_teacher_status)
  ON CONFLICT (id) DO UPDATE SET teacher_status = EXCLUDED.teacher_status;

  -- Always seed with aluno role; professor role granted only on approval
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'aluno')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END $function$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Approval function (admin only)
CREATE OR REPLACE FUNCTION public.approve_teacher(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can approve teachers';
  END IF;
  UPDATE public.profiles SET teacher_status = 'approved' WHERE id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'professor')
  ON CONFLICT DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.reject_teacher(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can reject teachers';
  END IF;
  UPDATE public.profiles SET teacher_status = 'rejected' WHERE id = _user_id;
END $$;
