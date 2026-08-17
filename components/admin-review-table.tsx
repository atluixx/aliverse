"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { approveSubmission, rejectSubmission, deleteSubmission } from "@/lib/actions/submissions";
import { Check, X, MoreVertical, Trash2, Shield, User as UserIcon, Eye } from "lucide-react";

interface AdminSubmission {
  id: string;
  imageUrl: string;
  caption: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: Date | string;
  reviewedAt?: Date | string | null;
  user: {
    username?: string | null;
    name?: string | null;
  };
  reviewer?: {
    name: string | null;
  } | null;
}

interface AdminReviewTableProps {
  initialSubmissions: AdminSubmission[];
}

export function AdminReviewTable({ initialSubmissions }: AdminReviewTableProps) {
  const [submissions, setSubmissions] = useState<AdminSubmission[]>(initialSubmissions);
  const [activeTab, setActiveTab] = useState<string>("PENDING");
  const [previewItem, setPreviewItem] = useState<AdminSubmission | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(async () => {
      try {
        const res = await approveSubmission(id);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        setSubmissions((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "APPROVED", reviewedAt: new Date() } : item
          )
        );
        toast.success("Photo submission approved!");
      } catch (err: any) {
        toast.error(err.message || "Failed to approve photo.");
      }
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      try {
        const res = await rejectSubmission(id);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        setSubmissions((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "REJECTED", reviewedAt: new Date() } : item
          )
        );
        toast.info("Photo submission rejected.");
      } catch (err: any) {
        toast.error(err.message || "Failed to reject photo.");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this submission permanently?")) return;

    startTransition(async () => {
      try {
        const res = await deleteSubmission(id);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        setSubmissions((prev) => prev.filter((item) => item.id !== id));
        toast.success("Submission deleted.");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete submission.");
      }
    });
  };

  const filteredSubmissions = submissions.filter((item) => {
    if (activeTab === "ALL") return true;
    return item.status === activeTab;
  });

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const approvedCount = submissions.filter((s) => s.status === "APPROVED").length;
  const rejectedCount = submissions.filter((s) => s.status === "REJECTED").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Summary Surface */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className={cn(
            "p-4 cursor-pointer transition-all border shadow-xs hover:border-amber-500/50",
            activeTab === "PENDING" && "bg-amber-500/5 border-amber-500/30"
          )}
          onClick={() => setActiveTab("PENDING")}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Queue</span>
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              {pendingCount}
            </Badge>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{pendingCount}</p>
        </Card>

        <Card
          className={cn(
            "p-4 cursor-pointer transition-all border shadow-xs hover:border-emerald-500/50",
            activeTab === "APPROVED" && "bg-emerald-500/5 border-emerald-500/30"
          )}
          onClick={() => setActiveTab("APPROVED")}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Approved Gallery</span>
            <Badge variant="outline" className="border-emerald-500 text-emerald-600">
              {approvedCount}
            </Badge>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{approvedCount}</p>
        </Card>

        <Card
          className={cn(
            "p-4 cursor-pointer transition-all border shadow-xs hover:border-rose-500/50",
            activeTab === "REJECTED" && "bg-rose-500/5 border-rose-500/30"
          )}
          onClick={() => setActiveTab("REJECTED")}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Rejected</span>
            <Badge variant="outline" className="border-rose-500 text-rose-600">
              {rejectedCount}
            </Badge>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{rejectedCount}</p>
        </Card>
      </div>

      {/* Moderation Tabs Bar */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-md h-11">
            <TabsTrigger value="PENDING" className="text-xs min-h-[36px]">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="APPROVED" className="text-xs min-h-[36px]">
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="text-xs min-h-[36px]">
              Rejected ({rejectedCount})
            </TabsTrigger>
            <TabsTrigger value="ALL" className="text-xs min-h-[36px]">
              All ({submissions.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Submissions Table & Mobile Cards */}
      <Card className="overflow-hidden border shadow-sm">
        {filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-2">
            <Shield className="size-8 text-muted-foreground/50" />
            <p className="font-medium">No submissions in this view</p>
            <p className="text-xs">Select another tab to inspect submitted photos.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card List View (< md) */}
            <div className="md:hidden divide-y divide-border">
              {filteredSubmissions.map((item) => {
                const userTag = item.user.username ? `@${item.user.username}` : item.user.name || "Anonymous";
                return (
                  <div key={item.id} className="p-4 flex flex-col gap-3 bg-card">
                    {/* Item Header: Submitter info & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <UserIcon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-semibold leading-tight">{userTag}</span>
                      </div>

                      <div>
                        {item.status === "PENDING" && (
                          <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30">
                            Pending
                          </Badge>
                        )}
                        {item.status === "APPROVED" && (
                          <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                            Approved
                          </Badge>
                        )}
                        {item.status === "REJECTED" && (
                          <Badge variant="outline" className="border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30">
                            Rejected
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Photo & Caption */}
                    <div className="flex gap-3 items-center">
                      <div
                        className="relative size-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
                        onClick={() => setPreviewItem(item)}
                      >
                        <Image src={item.imageUrl} alt={item.caption} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <p className="text-sm line-clamp-2 text-foreground font-medium">{item.caption}</p>
                        <span className="text-[11px] text-muted-foreground mt-1">
                          Submitted {new Date(item.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Actions Bar */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-3 text-xs gap-1.5"
                        onClick={() => setPreviewItem(item)}
                      >
                        <Eye className="size-4" />
                        Inspect
                      </Button>

                      {item.status !== "APPROVED" && (
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-emerald-600 hover:bg-emerald-700 h-10 px-4 text-xs font-semibold gap-1.5 min-w-[90px]"
                          onClick={() => handleApprove(item.id)}
                          disabled={isPending}
                        >
                          <Check className="size-4" />
                          Approve
                        </Button>
                      )}

                      {item.status !== "REJECTED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 h-10 px-3.5 text-xs font-semibold gap-1.5"
                          onClick={() => handleReject(item.id)}
                          disabled={isPending}
                        >
                          <X className="size-4" />
                          Reject
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-10 rounded-lg")}>
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive min-h-[44px]"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 data-icon="inline-start" className="size-4" /> Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Preview</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="max-w-[300px]">Caption</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((item) => {
                    const userTag = item.user.username ? `@${item.user.username}` : item.user.name || "Anonymous";
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div
                            className="relative size-14 rounded-md overflow-hidden bg-muted cursor-pointer border hover:opacity-90"
                            onClick={() => setPreviewItem(item)}
                          >
                            <Image src={item.imageUrl} alt={item.caption} fill className="object-cover" />
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserIcon className="size-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">{userTag}</span>
                          </div>
                        </TableCell>

                        <TableCell className="max-w-[300px]">
                          <p className="text-sm line-clamp-2">{item.caption}</p>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(item.submittedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>

                        <TableCell>
                          {item.status === "PENDING" && (
                            <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30">
                              Pending
                            </Badge>
                          )}
                          {item.status === "APPROVED" && (
                            <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                              Approved
                            </Badge>
                          )}
                          {item.status === "REJECTED" && (
                            <Badge variant="outline" className="border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30">
                              Rejected
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status !== "APPROVED" && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-emerald-600 hover:bg-emerald-700 h-9 px-3 text-xs font-semibold gap-1"
                                onClick={() => handleApprove(item.id)}
                                disabled={isPending}
                              >
                                <Check className="size-3.5" /> Approve
                              </Button>
                            )}

                            {item.status !== "REJECTED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 h-9 px-3 text-xs font-semibold gap-1"
                                onClick={() => handleReject(item.id)}
                                disabled={isPending}
                              >
                                <X className="size-3.5" /> Reject
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-9")}>
                                <MoreVertical className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive min-h-[44px]"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 data-icon="inline-start" className="size-4" /> Delete Permanently
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </Card>

      {/* Inspect Photo Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {previewItem && (
            <div className="flex flex-col">
              <DialogHeader className="p-4 border-b">
                <DialogTitle className="text-lg font-serif font-bold">Inspect Photo Submission</DialogTitle>
                <DialogDescription>
                  Submitted by {previewItem.user.username ? `@${previewItem.user.username}` : previewItem.user.name || "Anonymous"}
                </DialogDescription>
              </DialogHeader>

              <div className="relative aspect-[4/3] w-full bg-black">
                <Image src={previewItem.imageUrl} alt={previewItem.caption} fill className="object-contain" />
              </div>

              <div className="p-4 flex flex-col gap-3 bg-background">
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Caption</h4>
                  <p className="text-sm font-medium mt-1">{previewItem.caption}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>
                    Submitted: {new Date(previewItem.submittedAt).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    {previewItem.status !== "APPROVED" && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 h-9 px-3 text-xs"
                        onClick={() => {
                          handleApprove(previewItem.id);
                          setPreviewItem(null);
                        }}
                      >
                        <Check className="size-3.5 mr-1" /> Approve
                      </Button>
                    )}
                    {previewItem.status !== "REJECTED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 h-9 px-3 text-xs"
                        onClick={() => {
                          handleReject(previewItem.id);
                          setPreviewItem(null);
                        }}
                      >
                        <X className="size-3.5 mr-1" /> Reject
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
