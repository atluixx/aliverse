"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Sparkles, Upload, Shield, Images, UserCheck, LogOut, LogIn, UserPlus, Users, User as UserIcon, Menu, X } from "lucide-react";

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
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden size-11 rounded-lg text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </Button>

          <Link href="/gallery" className="flex items-center gap-2.5 text-xl font-serif font-bold tracking-tight text-foreground hover:text-primary transition-colors py-1">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="size-4" />
            </div>
            <span>Aliverso</span>
          </Link>

          {/* Clean Desktop Primary Link */}
          <nav className="hidden md:flex items-center ml-2">
            <Link
              href="/gallery"
              className={cn(
                buttonVariants({
                  variant: pathname === "/gallery" || pathname === "/" ? "secondary" : "ghost",
                  size: "sm",
                }),
                "gap-2 h-10 px-3.5 text-sm font-medium"
              )}
            >
              <Images data-icon="inline-start" className="size-4" />
              Gallery
            </Link>
          </nav>
        </div>

        {/* Right Section: Primary CTA + User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Prominent Submit Action Button */}
          <Link
            href="/submit"
            className={buttonVariants({
              size: "sm",
              className: "h-10 px-4 text-xs font-semibold gap-2 shadow-xs",
            })}
          >
            <Upload data-icon="inline-start" className="size-4" />
            <span>Submit Photo</span>
          </Link>

          {/* User Auth Section */}
          {status === "authenticated" && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative flex items-center gap-2 h-10 px-3.5 rounded-full border bg-muted/50 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring outline-none cursor-pointer transition-colors text-xs font-semibold">
                <UserIcon className="size-4 text-primary" />
                <span className="hidden sm:inline">{usernameDisplay}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-2 shadow-lg rounded-xl">
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
                <DropdownMenuItem render={<Link href="/my-submissions" className="w-full flex items-center gap-2.5 py-2.5 min-h-[44px]" />}>
                  <UserCheck className="size-4 text-muted-foreground" /> My Profile & Submissions
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/submit" className="w-full flex items-center gap-2.5 py-2.5 min-h-[44px]" />}>
                  <Upload className="size-4 text-muted-foreground" /> Submit Photo
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/admin/review" className="w-full flex items-center gap-2.5 py-2.5 min-h-[44px]" />}>
                      <Shield className="size-4 text-amber-500" /> Moderation Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/admin/users" className="w-full flex items-center gap-2.5 py-2.5 min-h-[44px]" />}>
                      <Users className="size-4 text-amber-500" /> Manage Admins & Roles
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer min-h-[44px] py-2.5"
                  onClick={() => signOut({ callbackUrl: "/gallery" })}
                >
                  <LogOut data-icon="inline-start" className="size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/auth/signin" className={buttonVariants({ variant: "ghost", size: "sm", className: "h-10 px-3 text-xs sm:text-sm" })}>
                <LogIn data-icon="inline-start" className="size-4" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-Down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/98 backdrop-blur px-4 pt-3 pb-6 flex flex-col gap-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-1 pb-1">
            Navigation Menu
          </p>
          <nav className="flex flex-col gap-1">
            <Link
              href="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3.5 py-3 text-base font-medium transition-colors min-h-[44px]",
                pathname === "/gallery" || pathname === "/"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted active:bg-muted/80"
              )}
            >
              <Images className="size-5 text-primary" />
              <span>Gallery</span>
            </Link>

            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3.5 py-3 text-base font-medium transition-colors min-h-[44px]",
                pathname === "/submit"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted active:bg-muted/80"
              )}
            >
              <Upload className="size-5 text-primary" />
              <span>Submit Photo</span>
            </Link>

            {status === "authenticated" && (
              <Link
                href="/my-submissions"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-3 text-base font-medium transition-colors min-h-[44px]",
                  pathname === "/my-submissions"
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted active:bg-muted/80"
                )}
              >
                <UserCheck className="size-5 text-muted-foreground" />
                <span>My Profile & Submissions</span>
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
                    "flex items-center gap-3 rounded-lg px-3.5 py-3 text-base font-medium transition-colors min-h-[44px]",
                    pathname === "/admin/review"
                      ? "bg-amber-500/10 text-amber-600 font-semibold"
                      : "text-foreground hover:bg-muted active:bg-muted/80"
                  )}
                >
                  <Shield className="size-5 text-amber-500" />
                  <span>Moderation Dashboard</span>
                </Link>

                <Link
                  href="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3.5 py-3 text-base font-medium transition-colors min-h-[44px]",
                    pathname === "/admin/users"
                      ? "bg-amber-500/10 text-amber-600 font-semibold"
                      : "text-foreground hover:bg-muted active:bg-muted/80"
                  )}
                >
                  <Users className="size-5 text-amber-500" />
                  <span>Manage Admins & Roles</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
