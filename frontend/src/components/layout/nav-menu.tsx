"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Ticket,
  Home,
  Calendar,
  Sparkles,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface NavMenuProps {
  open: boolean;
  onClose: () => void;
}

export function NavMenu({ open, onClose }: NavMenuProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "ORGANIZER":
        return "default";
      case "GATEKEEPER":
        return "warning";
      case "CUSTOMER":
        return "success";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "ORGANIZER":
        return "Organizador";
      case "GATEKEEPER":
        return "Portaria";
      case "CUSTOMER":
        return "Cliente";
      default:
        return "Visitante";
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] border-r border-border bg-card/95 backdrop-blur-2xl p-6 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-6">
          {/* Header do Menu */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={onClose}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
                <Ticket className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
                Meu<span className="text-primary">Ingresso</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Usuário Logado */}
          {user && (
            <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    <UserIcon className="size-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-bold text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-[10px] uppercase">
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>
          )}

          {/* Navegação Dinâmica baseada na role */}
          <nav className="flex flex-col gap-1.5" aria-label="Navegação principal">
            <Link
              href="/"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                pathname === "/"
                  ? "bg-primary text-primary-foreground font-semibold shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Home className="size-4" />
              Início
            </Link>

            <Link
              href="/client/events"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                pathname.startsWith("/client/events")
                  ? "bg-primary text-primary-foreground font-semibold shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Calendar className="size-4" />
              Catálogo de Eventos
            </Link>

            {user?.role === "CUSTOMER" && (
              <Link
                href="/client/my-tickets"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  pathname === "/client/my-tickets"
                    ? "bg-primary text-primary-foreground font-semibold shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Sparkles className="size-4 text-amber-400" />
                Meus Ingressos
              </Link>
            )}

            {user?.role === "ORGANIZER" && (
              <>
                <Link
                  href="/organizer/dashboard"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    pathname === "/organizer/dashboard"
                      ? "bg-primary text-primary-foreground font-semibold shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <LayoutDashboard className="size-4 text-emerald-400" />
                  Painel do Organizador
                </Link>
                <Link
                  href="/organizer/events/new"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    pathname === "/organizer/events/new"
                      ? "bg-primary text-primary-foreground font-semibold shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <PlusCircle className="size-4 text-cyan-400" />
                  Novo Evento
                </Link>
              </>
            )}

            {user?.role === "GATEKEEPER" && (
              <Link
                href="/gate/validate"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  pathname === "/gate/validate"
                    ? "bg-primary text-primary-foreground font-semibold shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <ShieldCheck className="size-4 text-indigo-400" />
                Validação na Portaria
              </Link>
            )}
          </nav>
        </div>

        {/* Rodapé do Menu */}
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          {user ? (
            <Button
              variant="destructive"
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full justify-center gap-2 font-semibold"
            >
              <LogOut className="size-4" />
              Sair da Conta
            </Button>
          ) : (
            <>
              <Link href="/login" onClick={onClose} className="w-full">
                <Button variant="outline" className="w-full">
                  Entrar
                </Button>
              </Link>
              <Link href="/register" onClick={onClose} className="w-full">
                <Button className="w-full font-semibold">
                  Criar conta
                </Button>
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
