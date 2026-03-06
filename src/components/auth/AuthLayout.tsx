"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-bold"
            >
              <Clock className="h-8 w-8 text-primary" />
              <span>TimeTracker</span>
            </Link>
            {children}
          </div>
        </div>
      </div>

      {/* Right side - Hero */}
      <div className="hidden lg:block relative bg-muted">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Track Your Time, Boost Your Productivity
            </h2>
            <p className="text-muted-foreground">
              Join thousands of professionals who use TimeTracker to manage
              their work hours, projects, and productivity.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-8">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">
                  Active Users
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">500k+</div>
                <div className="text-sm text-muted-foreground">
                  Hours Tracked
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
