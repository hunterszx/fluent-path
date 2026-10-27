import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { LunariLogo } from "@/components/lunari-logo";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/pendente")({
  head: () => ({ meta: [{ title: "Cadastro em análise — Lunari" }, { name: "description", content: "Cadastro em análise na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:title", content: "Cadastro em análise — Lunari" }, { property: "og:description", content: "Cadastro em análise na Lunari, plataforma de aprendizado de inglês com flashcards, pronúncia e aulas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PendingPage,
});

function PendingPage() {
  const { user, loading, logout, refresh } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (user.teacherStatus !== "pending") {
      navigate({ to: `/${user.activeRole}` });
    }
  }, [user, loading, navigate]);

  async function handleLogout() {
    await logout();
    navigate({ to: "/" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-hero-radial p-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border bg-card/80 p-8 shadow-xl backdrop-blur"
      >
        <div className="flex items-center gap-3">
          <LunariLogo size={40} />
          <span className="font-display text-xl font-bold">Lunari</span>
        </div>

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 18 }}
          className="mt-8 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-brand-2/10 ring-1 ring-primary/20"
        >
          <Clock className="h-8 w-8 text-primary" />
        </motion.div>

        <h1 className="mt-6 font-display text-2xl font-bold">Cadastro em análise</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Recebemos sua solicitação para ensinar na Lunari. Nossa equipe está avaliando seu perfil
          e em breve você receberá uma resposta por e-mail.
        </p>

        <div className="mt-6 rounded-xl border bg-muted/40 p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-xs font-semibold text-warning">
              Aguardando aprovação
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-muted-foreground">Perfil</span>
            <span className="font-medium">Professor</span>
          </div>
          {user?.email && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">E-mail</span>
              <span className="truncate font-medium">{user.email}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => refresh()}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:translate-y-0 active:scale-[0.99]"
          >
            <RefreshCw className="h-4 w-4" /> Verificar status
          </button>
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground hover:shadow-md active:translate-y-0 active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </motion.div>
    </div>
  );
}