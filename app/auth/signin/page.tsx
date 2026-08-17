"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Sparkles, Shield, User, LogIn, AlertCircle, KeyRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/gallery";
  const error = searchParams.get("error");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setLoading(true);
    toast.loading("Signing into Aliverso...", { id: "signin" });

    const res = await signIn("credentials", {
      username: username.trim(),
      password,
      callbackUrl,
      redirect: false,
    });

    if (res?.error) {
      toast.error("Invalid username or password.", { id: "signin" });
      setLoading(false);
    } else {
      toast.success("Welcome back!", { id: "signin" });
      window.location.href = callbackUrl;
    }
  };

  return (
    <CardContent className="flex flex-col gap-6">
      {error === "UnauthorizedAdminAccess" && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            Admin authorization is required to access the moderation dashboard. Please sign in as an admin.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Dev Preset Logins */}
      <div className="flex flex-col gap-3">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Dev Credentials
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex flex-col items-center gap-1.5 h-auto py-3 border-primary/30 hover:bg-primary/5 text-left col-span-2"
            onClick={() => {
              setUsername("ali");
              setPassword("alidoaliverso");
            }}
          >
            <div className="flex items-center gap-1.5 font-medium text-primary text-xs">
              <Shield className="size-3.5" />
              Sign in as Ali (Admin)
            </div>
            <span className="text-[10px] text-muted-foreground">ali@aliverso.com / alidoaliverso</span>
          </Button>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t"></div>
        </div>
        <span className="relative bg-background px-2 text-xs text-muted-foreground uppercase">
          Sign In Form
        </span>
      </div>

      {/* Username & Password Form */}
      <form onSubmit={handleSignIn} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Username or Email</Label>
          <Input
            id="username"
            type="text"
            placeholder="ali or ali@aliverso.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full mt-2" disabled={loading}>
          <LogIn data-icon="inline-start" />
          Sign In
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
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] px-4 py-8">
      <Card className="w-full max-w-md shadow-xs border-border">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Sparkles className="size-5" />
          </div>
          <CardTitle className="text-2xl font-serif font-bold">Welcome to Aliverso</CardTitle>
          <CardDescription>
            Sign in with your credentials to submit photos to the community gallery.
          </CardDescription>
        </CardHeader>

        <Suspense fallback={<SignInSkeleton />}>
          <SignInForm />
        </Suspense>

        <CardFooter className="flex flex-col items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
          <p>
            Don&apos;t have an account yet?{" "}
            <Link href="/auth/signup" className="font-semibold text-primary underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
