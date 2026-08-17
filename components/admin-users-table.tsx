"use client";

import { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { updateUserRole, createAdminUser } from "@/lib/actions/users";
import { Shield, ShieldAlert, UserPlus, Search, MoreVertical, Loader2, User as UserIcon } from "lucide-react";

interface AdminUserItem {
  id: string;
  username: string | null;
  name: string | null;
  role: "USER" | "ADMIN";
  createdAt: Date | string;
  _count?: {
    submissions: number;
  };
}

interface AdminUsersTableProps {
  initialUsers: AdminUserItem[];
  currentUserId: string;
}

export function AdminUsersTable({ initialUsers, currentUserId }: AdminUsersTableProps) {
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // New admin form state
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleRoleChange = (userId: string, currentRole: "USER" | "ADMIN") => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const actionName = newRole === "ADMIN" ? "promote to Admin" : "demote to User";

    if (!confirm(`Are you sure you want to ${actionName}?`)) return;

    startTransition(async () => {
      try {
        const res = await updateUserRole(userId, newRole);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        toast.success(`User role updated to ${newRole}.`);
      } catch (err: any) {
        toast.error(err.message || "Failed to update user role.");
      }
    });
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUsername.trim() || newUsername.length < 3) {
      toast.error("Username must be at least 3 characters.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsCreating(true);
    toast.loading("Creating admin account...", { id: "createAdmin" });

    try {
      const res = await createAdminUser({
        username: newUsername,
        name: newName || undefined,
        password: newPassword,
      });

      if (res?.error) {
        toast.error(res.error, { id: "createAdmin" });
        return;
      }

      toast.success(`Admin @${newUsername} created successfully!`, { id: "createAdmin" });

      if (res.user) {
        setUsers((prev) => [
          {
            id: res.user.id,
            username: res.user.username,
            name: res.user.name,
            role: "ADMIN",
            createdAt: new Date(),
          },
          ...prev,
        ]);
      }

      setIsAddModalOpen(false);
      setNewUsername("");
      setNewName("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to create admin.", { id: "createAdmin" });
    } finally {
      setIsCreating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q)
    );
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Stats & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 bg-background">
            <UserIcon className="size-3.5 text-primary" /> Total Users: <strong className="text-foreground">{totalUsers}</strong>
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
            <Shield className="size-3.5" /> Admins: <strong className="text-foreground">{adminCount}</strong>
          </Badge>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="h-11 px-4 text-xs font-semibold gap-2">
          <UserPlus data-icon="inline-start" />
          Add New Admin
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by username or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users Table & Mobile Cards */}
      <Card className="overflow-hidden border shadow-sm">
        {/* Mobile View (< md) */}
        <div className="md:hidden divide-y divide-border">
          {filteredUsers.map((item) => (
            <div key={item.id} className="p-4 flex flex-col gap-3 bg-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <UserIcon className="size-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-tight font-mono">
                      @{item.username || "no_username"}
                      {item.id === currentUserId && (
                        <span className="ml-1.5 text-[10px] text-muted-foreground font-normal font-sans">(You)</span>
                      )}
                    </span>
                    {item.name && <span className="text-xs text-muted-foreground">{item.name}</span>}
                  </div>
                </div>

                <div>
                  {item.role === "ADMIN" ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-[11px] py-1 px-2.5">
                      <Shield className="size-3" /> Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-[11px] py-1 px-2.5">
                      User
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1 text-xs text-muted-foreground pt-1 border-t">
                <p>Joined: <span className="text-foreground">{new Date(item.createdAt).toLocaleDateString()}</span></p>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center justify-end pt-2">
                <Button
                  variant={item.role === "ADMIN" ? "outline" : "default"}
                  size="sm"
                  className={cn(
                    "h-10 px-4 text-xs font-semibold gap-2 w-full sm:w-auto",
                    item.role === "ADMIN" ? "text-rose-600 border-rose-200 hover:bg-rose-50" : "bg-amber-600 hover:bg-amber-700 text-white"
                  )}
                  onClick={() => handleRoleChange(item.id, item.role)}
                  disabled={isPending || item.id === currentUserId}
                >
                  {item.role === "ADMIN" ? (
                    <>
                      <ShieldAlert className="size-4" /> Demote to Standard User
                    </>
                  ) : (
                    <>
                      <Shield className="size-4" /> Promote to Admin
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <UserIcon className="size-4 text-muted-foreground" />
                      <span>@{item.username || "no_username"}</span>
                      {item.id === currentUserId && (
                        <span className="text-[10px] text-muted-foreground font-normal font-sans">(You)</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {item.name || "—"}
                  </TableCell>

                  <TableCell>
                    {item.role === "ADMIN" ? (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-[11px]">
                        <Shield className="size-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-[11px]">
                        User
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-9")}>
                        <MoreVertical className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>Role Management</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(item.id, item.role)}
                          disabled={isPending || item.id === currentUserId}
                          className="min-h-[44px]"
                        >
                          {item.role === "ADMIN" ? (
                            <>
                              <ShieldAlert data-icon="inline-start" className="text-rose-500 size-4" />
                              Demote to Standard User
                            </>
                          ) : (
                            <>
                              <Shield data-icon="inline-start" className="text-amber-500 size-4" />
                              Promote to Admin
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add New Admin Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5 text-amber-500" />
              Add New Admin
            </DialogTitle>
            <DialogDescription>
              Create a new user account with pre-assigned Administrator privileges.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAdmin} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                placeholder="e.g. ali_coadmin"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                disabled={isCreating}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-name">Display Name (Optional)</Label>
              <Input
                id="admin-name"
                placeholder="e.g. Ali Co-Admin"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isCreating}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isCreating}
              />
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || !newUsername}>
                {isCreating ? (
                  <>
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus data-icon="inline-start" />
                    Create Admin User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
