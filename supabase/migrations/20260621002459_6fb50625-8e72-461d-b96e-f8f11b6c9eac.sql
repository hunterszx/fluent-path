-- Tabela para limitar tentativas de OTP e reenvio
CREATE TABLE IF NOT EXISTS public.otp_attempts (
  email text PRIMARY KEY,
  attempts int NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_sent_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.otp_attempts TO service_role;

ALTER TABLE public.otp_attempts ENABLE ROW LEVEL SECURITY;

-- Sem políticas para usuários: somente service_role (via server functions) acessa.

CREATE TRIGGER otp_attempts_set_updated_at
BEFORE UPDATE ON public.otp_attempts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();