"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/types";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

let cachedRawUser: string | null = null;
let cachedParsedUser: User | null = null;

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredUserSnapshot(): User | null {
  if (typeof window === "undefined") return null;
  const rawUser = localStorage.getItem("meu-ingresso-user");

  if (rawUser === cachedRawUser) {
    return cachedParsedUser;
  }

  cachedRawUser = rawUser;
  if (!rawUser) {
    cachedParsedUser = null;
    return null;
  }

  try {
    cachedParsedUser = JSON.parse(rawUser) as User;
    return cachedParsedUser;
  } catch {
    cachedParsedUser = null;
    return null;
  }
}

function getServerSnapshot(): User | null {
  return null;
}

function useStoredUser() {
  return useSyncExternalStore(subscribe, getStoredUserSnapshot, getServerSnapshot);
}

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const user = useStoredUser();

  useEffect(() => {
    if (!user || user.role !== "ORGANIZER") {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user || user.role !== "ORGANIZER") {
    return (
      <Container size="md" className="py-20 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <ShieldAlert className="size-8" />
        </div>
        <Heading variant="h2">Acesso Restrito</Heading>
        <Text variant="muted" className="mt-2 mb-6">
          Esta área é exclusiva para organizadores de eventos cadastrados na plataforma.
        </Text>
        <Button onClick={() => router.replace("/login")}>
          Ir para Login
        </Button>
      </Container>
    );
  }

  const navItems = [
    {
      label: "Painel Geral",
      href: "/organizer/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Novo Evento",
      href: "/organizer/events/new",
      icon: PlusCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="border-b border-border bg-card/60 backdrop-blur-md sticky top-16 z-40">
        <Container size="xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-3">
              <Avatar size="md">
                <AvatarFallback name={user.name} />
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-card-foreground">
                    {user.name}
                  </h2>
                  <Badge variant="default" className="text-xs">
                    ORGANIZADOR
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="gap-2 text-xs sm:text-sm font-medium"
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-4" />
                Sair
              </Button>
            </nav>
          </div>
        </Container>
      </div>

      <main className="flex-1 py-8">
        <Container size="xl">{children}</Container>
      </main>
    </div>
  );
}
