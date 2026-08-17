"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles, Calendar, Tag, Upload, Images } from "lucide-react";

interface SubmissionItem {
  id: string;
  imageUrl: string;
  caption: string;
  submittedAt: Date | string;
  user: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
  moment?: {
    id: string;
    caption: string;
    tags: string[];
  } | null;
}

interface GalleryGridProps {
  submissions: SubmissionItem[];
}

export function GalleryGrid({ submissions }: GalleryGridProps) {
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [activePhoto, setActivePhoto] = useState<SubmissionItem | null>(null);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(
      submissions.flatMap((sub) => sub.moment?.tags || [])
    )
  );

  const filteredSubmissions =
    selectedTag === "all"
      ? submissions
      : submissions.filter((sub) => sub.moment?.tags.includes(selectedTag));

  return (
    <div className="flex flex-col gap-8">
      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mr-2">
            <Tag className="size-3.5" /> Filter by:
          </span>
          <Badge
            variant={selectedTag === "all" ? "default" : "outline"}
            className="cursor-pointer transition-colors"
            onClick={() => setSelectedTag("all")}
          >
            All Photos ({submissions.length})
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer transition-colors capitalize"
              onClick={() => setSelectedTag(tag)}
            >
              #{tag}
            </Badge>
          ))}
          <Separator className="mt-2" />
        </div>
      )}

      {/* Gallery Grid */}
      {filteredSubmissions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed gap-4">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Images className="size-6" />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="text-lg font-bold">No approved photos yet</h3>
            <p className="text-sm text-muted-foreground">
              The public gallery is clean and ready for real photos. Be the first contributor to submit a photo!
            </p>
          </div>
          <Link href="/submit" className={buttonVariants({ size: "sm" })}>
            <Upload data-icon="inline-start" />
            Submit a Photo
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubmissions.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden cursor-pointer transition-all hover:shadow-lg border-border/80 flex flex-col justify-between"
              onClick={() => setActivePhoto(item)}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <Image
                  src={item.imageUrl}
                  alt={item.caption}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {item.moment?.tags && item.moment.tags.length > 0 && (
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    <Badge className="bg-background/90 text-foreground backdrop-blur border text-[11px]">
                      #{item.moment.tags[0]}
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-sm font-medium line-clamp-2 text-foreground mb-3">
                  {item.caption}
                </p>
              </CardContent>

              <CardFooter className="px-4 py-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={item.user.image || undefined} />
                    <AvatarFallback>{item.user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground truncate max-w-[120px]">
                    {item.user.name || "Anonymous"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <Calendar className="size-3" />
                  <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Photo Modal View */}
      <Dialog open={!!activePhoto} onOpenChange={(open) => !open && setActivePhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden sm:max-h-[90vh] flex flex-col">
          {activePhoto && (
            <>
              <DialogHeader className="p-6 pb-2 border-b">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="size-5 text-primary" />
                  {activePhoto.caption}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Detailed view of submission by {activePhoto.user.name}
                </DialogDescription>
              </DialogHeader>

              <div className="relative w-full aspect-[16/10] bg-black max-h-[500px]">
                <Image
                  src={activePhoto.imageUrl}
                  alt={activePhoto.caption}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div className="p-6 flex flex-col gap-4 bg-background">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border">
                      <AvatarImage src={activePhoto.user.image || undefined} />
                      <AvatarFallback>{activePhoto.user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{activePhoto.user.name || "Anonymous Contributor"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3" />
                        Submitted on {new Date(activePhoto.submittedAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                      </p>
                    </div>
                  </div>

                  {activePhoto.moment?.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {activePhoto.moment.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {activePhoto.moment?.caption && (
                  <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Featured Moment: </span>
                    {activePhoto.moment.caption}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
