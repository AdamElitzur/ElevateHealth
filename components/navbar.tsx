"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/lib/types";

interface NavbarProps {
  user?: {
    email?: string | null;
    id?: string;
  };
  userProfile?: UserProfile | null;
}

export default function Navbar({ user, userProfile }: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "U";

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold pl-4">
            ElevateHealth
          </Link>
          {user && (
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
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {userProfile?.photo_url ? (
                    <AvatarImage src={userProfile.photo_url} alt="Profile" />
                  ) : (
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm hidden md:inline-block">
                  {user.email}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Join Challenge</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
