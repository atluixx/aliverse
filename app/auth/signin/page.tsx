"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Shield, User, LogIn, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/gallery";
  const error = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCustomSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await signIn("credentials", { email, callbackUrl });
    setLoading(false);
  };

  return (
    <CardContent className="flex flex-col gap-6">
      {error === "UnauthorizedAdminAccess" && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            Admin authorization is required to access the moderation dashboard. Please sign in as Ali or another admin.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Dev Preset Logins */}
      <div className="flex flex-col gap-3">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Dev Sign-In
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-1.5 h-auto py-3 border-amber-500/40 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            onClick={() => signIn("credentials", { email: "ali@aliverso.com", callbackUrl: "/admin/review" })}
          >
            <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 text-xs">
              <Shield className="size-3.5" />
              Ali (Admin)
            </div>
            <span className="text-[10px] text-muted-foreground">ali@aliverso.com</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center gap-1.5 h-auto py-3"
            onClick={() => signIn("credentials", { email: "user@aliverso.com", callbackUrl })}
          >
            <div className="flex items-center gap-1 font-semibold text-xs">
              <User className="size-3.5" />
              Contributor
            </div>
            <span className="text-[10px] text-muted-foreground">user@aliverso.com</span>
          </Button>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t"></div>
        </div>
        <span className="relative bg-background px-2 text-xs text-muted-foreground uppercase">
          Or sign in with email
        </span>
      </div>

      {/* Email Login Form */}
      <form onSubmit={handleCustomSignIn} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          <LogIn data-icon="inline-start" />
          Sign In with Email
        </Button>
      </form>
    </CardContent>
  );
}

function SignInSkeleton() {
  return (
    <CardContent className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  );
}

export default function SignInPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] px-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Sparkles className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Aliverso</CardTitle>
          <CardDescription>
            Sign in to submit photos and participate in Ali&apos;s shared universe.
          </CardDescription>
        </CardHeader>

        <Suspense fallback={<SignInSkeleton />}>
          <SignInForm />
        </Suspense>

        <CardFooter className="text-center justify-center text-xs text-muted-foreground">
          Aliverso — Celebrating shared moments and memories.
        </CardFooter>
      </Card>
    </div>
  );
}
