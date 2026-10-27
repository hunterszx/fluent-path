DROP POLICY IF EXISTS "Profiles are viewable by everyone signed in" ON public.profiles;
CREATE POLICY "Users and admins read permitted profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()) OR public.has_role((SELECT auth.uid()), 'admin'::public.app_role));