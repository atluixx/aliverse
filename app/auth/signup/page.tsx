"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { registerUser } from "@/lib/actions/auth";
import { Sparkles, UserPlus, Loader2, ArrowLeft } from "lucide-react";

function SignUpForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || username.length < 3) {
      toast.error("Username must be at least 3 characters.");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    toast.loading("Creating your Aliverso account...", { id: "register" });

    try {
      await registerUser({
        username,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        password,
      });

      toast.success("Account created successfully! Signing in...", { id: "register" });

      // Automatically sign in
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        router.push("/auth/signin");
      } else {
        router.push("/gallery");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to register account.", { id: "register" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="e.g. cosmic_ali"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Display Name (Optional)</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Ali Fan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email Address (Optional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus data-icon="inline-start" />
              Create Account
            </>
          )}
        </Button>

        <div className="text-center text-xs text-muted-foreground mt-2">
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-semibold text-primary underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}

function SignUpSkeleton() {
  return (
    <CardContent className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  );
}

export default function SignUpPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] px-4 py-8">
      <Card className="w-full max-w-md shadow-xs border-border">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <Sparkles className="size-5" />
          </div>
          <CardTitle className="text-2xl font-serif font-bold">Join the Aliverso</CardTitle>
          <CardDescription>
            Create your username and password to submit photos to the community gallery.
          </CardDescription>
        </CardHeader>

        <Suspense fallback={<SignUpSkeleton />}>
          <SignUpForm />
        </Suspense>
      </Card>
    </div>
  );
}
