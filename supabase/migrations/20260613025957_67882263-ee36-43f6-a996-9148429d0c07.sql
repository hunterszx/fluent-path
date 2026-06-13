
-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.app_role AS ENUM ('aluno', 'professor', 'admin');
CREATE TYPE public.card_visibility AS ENUM ('private', 'shared', 'public');
CREATE TYPE public.card_source AS ENUM ('platform', 'teacher', 'student');
CREATE TYPE public.review_status AS ENUM ('new', 'learning', 'hard', 'mastered');
CREATE TYPE public.session_type AS ENUM ('quick', 'spaced', 'deck', 'hard');
CREATE TYPE public.cefr_level AS ENUM ('A1','A2','B1','B2','C1','C2');

-- =========================
-- updated_at helper
-- =========================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- =========================
-- PROFILES
-- =========================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  native_language text DEFAULT 'pt-BR',
  english_level public.cefr_level,
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone signed in"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- USER ROLES
-- =========================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =========================
-- Trigger: on auth.users insert -> profile + default role
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_name text;
  v_avatar text;
  v_role public.app_role;
  v_role_text text;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'display_name',
                     NEW.raw_user_meta_data->>'name',
                     NEW.raw_user_meta_data->>'full_name',
                     split_part(NEW.email, '@', 1));
  v_avatar := NEW.raw_user_meta_data->>'avatar_url';
  v_role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'aluno');
  BEGIN
    v_role := v_role_text::public.app_role;
  EXCEPTION WHEN others THEN
    v_role := 'aluno';
  END;
  -- Don't allow self-assigning admin via metadata
  IF v_role = 'admin' THEN v_role := 'aluno'; END IF;

  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, v_name, v_avatar)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================
-- FLASHCARD DECKS
-- =========================
CREATE TABLE public.flashcard_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  level public.cefr_level,
  topic text,
  source_type public.card_source NOT NULL DEFAULT 'teacher',
  visibility public.card_visibility NOT NULL DEFAULT 'private',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  lesson_id uuid,
  cover_emoji text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_decks_owner ON public.flashcard_decks(owner_id);
CREATE INDEX idx_decks_student ON public.flashcard_decks(student_id);
CREATE INDEX idx_decks_visibility ON public.flashcard_decks(visibility);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_decks TO authenticated;
GRANT ALL ON public.flashcard_decks TO service_role;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read decks: public, owned, shared-to-me, or admin"
  ON public.flashcard_decks FOR SELECT TO authenticated USING (
    visibility = 'public'
    OR owner_id = auth.uid()
    OR student_id = auth.uid()
    OR teacher_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Teachers/students create their own decks"
  ON public.flashcard_decks FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner updates own deck; admin updates any"
  ON public.flashcard_decks FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner deletes own deck; admin deletes any"
  ON public.flashcard_decks FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER decks_set_updated_at
  BEFORE UPDATE ON public.flashcard_decks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- FLASHCARDS
-- =========================
CREATE TABLE public.flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front_text text NOT NULL,
  back_text text NOT NULL,
  example_sentence text,
  translation text,
  audio_url text,
  image_url text,
  difficulty smallint NOT NULL DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 5),
  tags text[] NOT NULL DEFAULT '{}',
  source_type public.card_source NOT NULL DEFAULT 'teacher',
  visibility public.card_visibility NOT NULL DEFAULT 'private',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cards_deck ON public.flashcards(deck_id);
CREATE INDEX idx_cards_owner ON public.flashcards(owner_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcards TO authenticated;
GRANT ALL ON public.flashcards TO service_role;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read cards via deck access"
  ON public.flashcards FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.flashcard_decks d
      WHERE d.id = deck_id AND (
        d.visibility = 'public'
        OR d.owner_id = auth.uid()
        OR d.student_id = auth.uid()
        OR d.teacher_id = auth.uid()
        OR public.has_role(auth.uid(), 'admin')
      )
    )
  );
CREATE POLICY "Owner inserts cards into own deck"
  ON public.flashcards FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.flashcard_decks d WHERE d.id = deck_id AND d.owner_id = auth.uid())
  );
CREATE POLICY "Owner updates own cards; admin updates any"
  ON public.flashcards FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner deletes own cards; admin deletes any"
  ON public.flashcards FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER cards_set_updated_at
  BEFORE UPDATE ON public.flashcards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- FLASHCARD REVIEWS (spaced repetition state per user/card)
-- =========================
CREATE TABLE public.flashcard_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_id uuid NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.review_status NOT NULL DEFAULT 'new',
  last_reviewed_at timestamptz,
  next_review_at timestamptz DEFAULT now(),
  correct_count int NOT NULL DEFAULT 0,
  wrong_count int NOT NULL DEFAULT 0,
  mastery_score numeric(5,2) NOT NULL DEFAULT 0,
  interval_days int NOT NULL DEFAULT 0,
  ease numeric(4,2) NOT NULL DEFAULT 2.5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (flashcard_id, user_id)
);
CREATE INDEX idx_reviews_user_next ON public.flashcard_reviews(user_id, next_review_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_reviews TO authenticated;
GRANT ALL ON public.flashcard_reviews TO service_role;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User manages own reviews"
  ON public.flashcard_reviews FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER reviews_set_updated_at
  BEFORE UPDATE ON public.flashcard_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- STUDENT FLASHCARDS (personal library)
-- =========================
CREATE TABLE public.student_flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id uuid REFERENCES public.flashcards(id) ON DELETE CASCADE,
  deck_id uuid REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  source_type public.card_source NOT NULL DEFAULT 'platform',
  status text NOT NULL DEFAULT 'saved',
  saved_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  UNIQUE (user_id, flashcard_id),
  UNIQUE (user_id, deck_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_flashcards TO authenticated;
GRANT ALL ON public.student_flashcards TO service_role;
ALTER TABLE public.student_flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student manages own library"
  ON public.student_flashcards FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================
-- PRONUNCIATION ATTEMPTS
-- =========================
CREATE TABLE public.pronunciation_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id uuid REFERENCES public.flashcards(id) ON DELETE SET NULL,
  audio_url text,
  transcript text,
  score numeric(5,2),
  feedback_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pron_user ON public.pronunciation_attempts(user_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.pronunciation_attempts TO authenticated;
GRANT ALL ON public.pronunciation_attempts TO service_role;
ALTER TABLE public.pronunciation_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User manages own pronunciation attempts"
  ON public.pronunciation_attempts FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =========================
-- REVIEW SESSIONS
-- =========================
CREATE TABLE public.review_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id uuid REFERENCES public.flashcard_decks(id) ON DELETE SET NULL,
  session_type public.session_type NOT NULL DEFAULT 'spaced',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  xp_earned int NOT NULL DEFAULT 0,
  cards_reviewed int NOT NULL DEFAULT 0,
  cards_correct int NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE ON public.review_sessions TO authenticated;
GRANT ALL ON public.review_sessions TO service_role;
ALTER TABLE public.review_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User manages own sessions"
  ON public.review_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
