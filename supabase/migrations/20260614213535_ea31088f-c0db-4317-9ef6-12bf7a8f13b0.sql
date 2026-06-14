
REVOKE EXECUTE ON FUNCTION public.approve_teacher(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reject_teacher(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_teacher(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.reject_teacher(uuid) TO service_role;
