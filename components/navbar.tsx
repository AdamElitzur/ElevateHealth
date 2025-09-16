"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold pl-4">
            ElevateHealth
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/log"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Daily Log
            </Link>
            <Link
              href="/dashboard/progress"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Progress
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Join Challenge</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
