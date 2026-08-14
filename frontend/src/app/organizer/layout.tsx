"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import type { User } from "@/types";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

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
  return useSyncExternalStore(
    subscribe,
    getStoredUserSnapshot,
    getServerSnapshot,
  );
}

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const user = useStoredUser();

  useEffect(() => {
    if (!user || user.role !== "ORGANIZER") {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user || user.role !== "ORGANIZER") {
    return (
      <Container size='md' className='py-20 text-center'>
        <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4'>
          <ShieldAlert className='size-8' />
        </div>
        <Heading variant='h2'>Acesso Restrito</Heading>
        <Text variant='muted' className='mt-2 mb-6'>
          Esta área é exclusiva para organizadores de eventos cadastrados na
          plataforma.
        </Text>
        <Button onClick={() => router.replace("/login")}>Ir para Login</Button>
      </Container>
    );
  }

  return (
    <div className='min-h-screen bg-background text-foreground flex flex-col'>
      <main className='flex-1 py-8'>
        <Container size='xl'>{children}</Container>
      </main>
    </div>
  );
}
