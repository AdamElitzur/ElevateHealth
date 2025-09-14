import { getSession } from "../actions/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "../actions/user-profile";
import AppSidebar from "@/app/components/app-sidebar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const userProfile = await getUserProfile();

  // If user doesn't have a profile at all, redirect to onboarding
  if (!userProfile) {
    redirect("/onboarding");
  }

  return (
    <div className="flex flex-1">
      <AppSidebar />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
