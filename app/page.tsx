import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Take the 2-Week No Sugar Challenge
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Transform your health, reduce cravings, and boost energy by
                  eliminating sugar for just 14 days.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/sign-up">
                  <Button size="lg" className="mt-4">
                    Start Your Challenge
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  How It Works
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Our simple 3-step process to help you break free from sugar
                  addiction
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
              <Card className="flex flex-col items-center text-center">
                <CardContent className="pt-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">1. Create Your Profile</h3>
                  <p className="text-muted-foreground">
                    Sign up and complete your profile with basic information and
                    a photo for biological age calculation.
                  </p>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center text-center">
                <CardContent className="pt-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">2. Log Daily Progress</h3>
                  <p className="text-muted-foreground">
                    Track your sugar intake, weight, mood, energy levels, and
                    more every day for 14 days.
                  </p>
                </CardContent>
              </Card>
              <Card className="flex flex-col items-center text-center">
                <CardContent className="pt-6">
                  <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6"
                    >
                      <path d="m12 14 4-4" />
                      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                      <path d="M16 16v4" />
                      <path d="M12 14v10" />
                      <path d="M8 16v4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">3. See Your Results</h3>
                  <p className="text-muted-foreground">
                    Visualize your progress and see how eliminating sugar
                    impacts your health and wellbeing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 md:py-24 bg-muted">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Benefits of Going Sugar-Free
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Experience these transformative changes in just 14 days
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-12">
              <div className="flex flex-col space-y-2">
                <h3 className="text-xl font-bold">Reduced Cravings</h3>
                <p className="text-muted-foreground">
                  Break the cycle of sugar addiction and experience fewer
                  cravings for sweets and processed foods.
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <h3 className="text-xl font-bold">Increased Energy</h3>
                <p className="text-muted-foreground">
                  Say goodbye to energy crashes and enjoy stable, sustained
                  energy throughout the day.
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <h3 className="text-xl font-bold">Better Sleep</h3>
                <p className="text-muted-foreground">
                  Experience improved sleep quality and wake up feeling more
                  refreshed.
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <h3 className="text-xl font-bold">Weight Management</h3>
                <p className="text-muted-foreground">
                  Many participants notice weight loss and improved body
                  composition within just two weeks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to Transform Your Health?
                </h2>
                <p className="mx-auto max-w-[700px] md:text-xl">
                  Join thousands who have successfully completed the 2-week no
                  sugar challenge
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/sign-up">
                  <Button size="lg" variant="secondary" className="mt-4">
                    Start Your Challenge Today
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container mx-auto flex flex-col gap-2 py-6 md:flex-row md:items-center md:justify-between max-w-7xl px-4 md:px-6">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2025 ElevateHealth. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-4 md:justify-end">
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:underline"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-sm text-muted-foreground hover:underline"
            >
              Join Challenge
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
