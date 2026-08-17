"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { Check, X, MoreVertical, Trash2, Shield, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";

interface AdminSubmission {
  id: string;
  imageUrl: string;
  caption: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: Date | string;
  reviewedAt?: Date | string | null;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
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
        await approveSubmission(id);
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
        await rejectSubmission(id);
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
        await deleteSubmission(id);
        setSubmissions((prev) => prev.filter((item) => item.id !== id));
        toast.success("Submission deleted.");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete submission.");
      }
    });
  };

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const approvedCount = submissions.filter((s) => s.status === "APPROVED").length;
  const rejectedCount = submissions.filter((s) => s.status === "REJECTED").length;

  const filteredSubmissions =
    activeTab === "ALL" ? submissions : submissions.filter((s) => s.status === activeTab);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            <Clock className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Requires admin action</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved Gallery Photos</CardTitle>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">Visible on public gallery</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Submissions</CardTitle>
            <XCircle className="size-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Hidden from public view</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="PENDING" className="gap-2">
              Pending
              {pendingCount > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="APPROVED">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected ({rejectedCount})</TabsTrigger>
            <TabsTrigger value="ALL">All ({submissions.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Submissions Table */}
      <Card className="overflow-hidden border shadow-sm">
        {filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-2">
            <Shield className="size-8 text-muted-foreground/50" />
            <p className="font-medium">No submissions in this view</p>
            <p className="text-xs">Select another tab to inspect submitted photos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Preview</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead className="max-w-[300px]">Caption</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((item) => (
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
                        <Avatar className="size-7">
                          <AvatarImage src={item.user.image || undefined} />
                          <AvatarFallback>{item.user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none">{item.user.name || "Anonymous"}</span>
                          <span className="text-xs text-muted-foreground">{item.user.email}</span>
                        </div>
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
                      <div className="flex items-center justify-end gap-1">
                        {item.status !== "APPROVED" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-emerald-600 hover:bg-emerald-700 h-8 px-2 text-xs"
                            onClick={() => handleApprove(item.id)}
                            disabled={isPending}
                          >
                            <Check data-icon="inline-start" className="size-3.5" />
                            Approve
                          </Button>
                        )}

                        {item.status !== "REJECTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-rose-600 border-rose-200 hover:bg-rose-50 h-8 px-2 text-xs"
                            onClick={() => handleReject(item.id)}
                            disabled={isPending}
                          >
                            <X data-icon="inline-start" className="size-3.5" />
                            Reject
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setPreviewItem(item)}>
                              <Eye data-icon="inline-start" /> Preview Photo
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 data-icon="inline-start" /> Delete Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-2xl">
          {previewItem && (
            <>
              <DialogHeader>
                <DialogTitle>Submission Inspection</DialogTitle>
                <DialogDescription className="sr-only">
                  Inspect photo submitted by {previewItem.user.name}
                </DialogDescription>
              </DialogHeader>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black">
                <Image src={previewItem.imageUrl} alt={previewItem.caption} fill className="object-contain" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold">{previewItem.caption}</p>
                <p className="text-xs text-muted-foreground">
                  By {previewItem.user.name} ({previewItem.user.email}) on{" "}
                  {new Date(previewItem.submittedAt).toLocaleString()}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
