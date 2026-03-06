import { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In - TimeTracker",
  description: "Sign in to your TimeTracker account",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignInForm />
    </div>
  );
}
