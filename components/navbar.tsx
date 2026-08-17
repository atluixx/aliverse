"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Upload, Shield, UserCheck, LogOut, LogIn, Users, User as UserIcon, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const usernameDisplay = user?.username ? `@${user.username}` : user?.name || "User";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo (Tight typography, zero badge icon) */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-10 rounded-lg text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>

          <Link href="/gallery" className="text-2xl font-black tracking-tighter text-foreground hover:opacity-90 transition-opacity py-1">
            aliverso
          </Link>
        </div>

        {/* Right Section: Theme Toggle + User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* User Auth Section */}
          {status === "authenticated" && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex items-center gap-2 h-9 px-3 rounded-full border bg-muted/40 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none cursor-pointer transition-colors text-xs font-semibold">
                <UserIcon className="size-3.5 text-primary" />
                <span>{usernameDisplay}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 shadow-lg rounded-xl">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold leading-none">{usernameDisplay}</p>
                    {isAdmin ? (
                      <Badge variant="default" className="text-[10px] bg-amber-500 hover:bg-amber-600">
                        ADMIN
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        USER
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/submit" className="w-full flex items-center gap-2.5 py-2 min-h-[40px]" />}>
                  <Upload className="size-4 text-muted-foreground" /> Submit Photo
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/my-submissions" className="w-full flex items-center gap-2.5 py-2 min-h-[40px]" />}>
                  <UserCheck className="size-4 text-muted-foreground" /> My Submissions
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/admin/review" className="w-full flex items-center gap-2.5 py-2 min-h-[40px]" />}>
                      <Shield className="size-4 text-amber-500" /> Moderation Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/admin/users" className="w-full flex items-center gap-2.5 py-2 min-h-[40px]" />}>
                      <Users className="size-4 text-amber-500" /> Manage Admins
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer min-h-[40px] py-2"
                  onClick={() => signOut({ callbackUrl: "/gallery" })}
                >
                  <LogOut data-icon="inline-start" className="size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/auth/signin" className={buttonVariants({ variant: "ghost", size: "sm", className: "h-9 px-3 text-xs sm:text-sm font-medium" })}>
                <LogIn data-icon="inline-start" className="size-4" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/98 backdrop-blur px-4 pt-3 pb-6 flex flex-col gap-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1">
            <Link
              href="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                pathname === "/gallery" || pathname === "/"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-foreground hover:bg-muted active:bg-muted/80"
              )}
            >
              <span>Gallery</span>
            </Link>

            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                pathname === "/submit"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-foreground hover:bg-muted active:bg-muted/80"
              )}
            >
              <Upload className="size-4 text-muted-foreground" />
              <span>Submit Photo</span>
            </Link>

            {status === "authenticated" && (
              <Link
                href="/my-submissions"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                  pathname === "/my-submissions"
                    ? "bg-muted text-foreground font-semibold"
                    : "text-foreground hover:bg-muted active:bg-muted/80"
                )}
              >
                <UserCheck className="size-4 text-muted-foreground" />
                <span>My Submissions</span>
              </Link>
            )}

            {isAdmin && (
              <>
                <div className="border-t my-1 pt-1">
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider px-3 py-1">
                    Admin Tools
                  </p>
                </div>
                <Link
                  href="/admin/review"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                    pathname === "/admin/review"
                      ? "bg-amber-500/10 text-amber-600 font-semibold"
                      : "text-foreground hover:bg-muted active:bg-muted/80"
                  )}
                >
                  <Shield className="size-4 text-amber-500" />
                  <span>Moderation Dashboard</span>
                </Link>

                <Link
                  href="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
                    pathname === "/admin/users"
                      ? "bg-amber-500/10 text-amber-600 font-semibold"
                      : "text-foreground hover:bg-muted active:bg-muted/80"
                  )}
                >
                  <Users className="size-4 text-amber-500" />
                  <span>Manage Admins</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
