"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ReactNode } from 'react';

export default function GamesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col items-center p-4 sm:p-6 md:p-8 bg-background">
      <Tabs value={pathname} className="w-full max-w-lg mb-6 sm:mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="/pi-finder" asChild>
            <Link href="/pi-finder">Pi Finder</Link>
          </TabsTrigger>
          <TabsTrigger value="/dice-roller" asChild>
            <Link href="/dice-roller">Dice Roller</Link>
          </TabsTrigger>
          <TabsTrigger value="/number-guesser" asChild>
            <Link href="/number-guesser">Number Guesser</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <main className="w-full flex justify-center">
        {children}
      </main>
    </div>
  );
}
