"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Sparkles, Upload, Shield, Images, UserCheck, LogOut, LogIn, UserPlus, Users } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  const navItems = [
    { href: "/gallery", label: "Gallery", icon: Images },
    { href: "/submit", label: "Submit Photo", icon: Upload },
    { href: "/my-submissions", label: "My Submissions", icon: UserCheck },
  ];

  if (isAdmin) {
    navItems.push({ href: "/admin/review", label: "Moderation", icon: Shield });
    navItems.push({ href: "/admin/users", label: "Manage Admins", icon: Users });
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Logo */}
        <Link href="/gallery" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="size-5" />
          </div>
          <span>Aliverso</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({
                    variant: isActive ? "secondary" : "ghost",
                    size: "sm",
                  }),
                  "gap-2"
                )}
              >
                <Icon data-icon="inline-start" />
                {item.label}
                {item.href.startsWith("/admin") && (
                  <Badge variant="destructive" className="ml-0.5 text-[10px] px-1.5 py-0">
                    Admin
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-3">
          {status === "authenticated" && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="relative size-10 rounded-full p-0">
                  <Avatar className="size-10 border border-border">
                    <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                    <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || "AL"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">{user.name || `@${user.username}`}</p>
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
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/my-submissions" className="w-full">
                    My Submissions
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem>
                      <Link href="/admin/review" className="w-full">
                        Admin Moderation Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/admin/users" className="w-full">
                        Manage Admins & Roles
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/gallery" })}
                >
                  <LogOut data-icon="inline-start" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/signin" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <LogIn data-icon="inline-start" />
                Sign In
              </Link>
              <Link href="/auth/signup" className={buttonVariants({ size: "sm" })}>
                <UserPlus data-icon="inline-start" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
