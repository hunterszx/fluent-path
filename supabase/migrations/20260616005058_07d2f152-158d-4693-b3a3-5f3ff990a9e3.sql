
REVOKE EXECUTE ON FUNCTION public.approve_teacher(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reject_teacher(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_teacher(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_teacher(uuid, text) TO authenticated;
