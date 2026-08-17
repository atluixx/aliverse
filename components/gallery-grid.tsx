"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles, Calendar, Tag, Upload, Images, User as UserIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface SubmissionItem {
  id: string;
  imageUrl: string;
  caption: string;
  submittedAt: Date | string;
  user: {
    username?: string | null;
    name?: string | null;
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
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

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

  const activePhoto =
    activePhotoIndex !== null && activePhotoIndex < filteredSubmissions.length
      ? filteredSubmissions[activePhotoIndex]
      : null;

  const handlePrev = useCallback(() => {
    setActivePhotoIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : filteredSubmissions.length - 1;
    });
  }, [filteredSubmissions.length]);

  const handleNext = useCallback(() => {
    setActivePhotoIndex((prev) => {
      if (prev === null) return null;
      return prev < filteredSubmissions.length - 1 ? prev + 1 : 0;
    });
  }, [filteredSubmissions.length]);

  // Keyboard navigation for Lightbox modal
  useEffect(() => {
    if (activePhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePhotoIndex, handlePrev, handleNext]);

  return (
    <div className="flex flex-col gap-8">
      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Tag className="size-3.5" /> Filter:
          </span>
          <Badge
            variant={selectedTag === "all" ? "default" : "outline"}
            className="cursor-pointer transition-colors py-1.5 px-3 shrink-0 text-xs min-h-[36px] flex items-center"
            onClick={() => {
              setSelectedTag("all");
              setActivePhotoIndex(null);
            }}
          >
            All Photos ({submissions.length})
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer transition-colors capitalize py-1.5 px-3 shrink-0 text-xs min-h-[36px] flex items-center"
              onClick={() => {
                setSelectedTag(tag);
                setActivePhotoIndex(null);
              }}
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Gallery Grid */}
      {filteredSubmissions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed gap-4 bg-card/60">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Images className="size-6" />
          </div>
          <div className="flex flex-col gap-1.5 max-w-sm">
            <h3 className="text-xl font-serif font-bold text-foreground">No approved photos yet</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
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
          {filteredSubmissions.map((item, index) => {
            const author = item.user.username ? `@${item.user.username}` : item.user.name || "Anonymous";
            return (
              <Card
                key={item.id}
                tabIndex={0}
                role="button"
                aria-label={`View photo titled ${item.caption}`}
                className="group overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-md border-border flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
                onClick={() => setActivePhotoIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActivePhotoIndex(index);
                  }
                }}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  <Image
                    src={item.imageUrl}
                    alt={item.caption}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-sm font-medium leading-snug line-clamp-2 text-foreground mb-2 group-hover:text-primary transition-colors">
                    {item.caption}
                  </p>
                </CardContent>

                <CardFooter className="px-4 py-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 font-medium text-foreground truncate max-w-[140px]">
                    <UserIcon className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{author}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="size-3 text-muted-foreground/70" />
                    <span>{new Date(item.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detailed Photo Modal View with Square Aspect Ratio Lightbox */}
      <Dialog open={activePhotoIndex !== null} onOpenChange={(open) => !open && setActivePhotoIndex(null)}>
        <DialogContent className="w-[95vw] max-w-2xl sm:w-[90vw] p-0 overflow-hidden max-h-[94vh] flex flex-col rounded-2xl border shadow-2xl">
          {activePhoto && activePhotoIndex !== null && (
            <div className="flex flex-col max-h-[94vh] overflow-y-auto">
              <DialogHeader className="p-4 sm:p-5 pb-3 border-b sticky top-0 bg-background/95 backdrop-blur z-10 flex flex-row items-center justify-between gap-4">
                <DialogTitle className="text-lg sm:text-xl font-serif font-bold flex items-center gap-2 pr-8 min-w-0">
                  <span className="truncate">{activePhoto.caption}</span>
                </DialogTitle>
                <Badge variant="outline" className="text-[11px] font-mono px-2.5 py-1 shrink-0 bg-muted/50">
                  {activePhotoIndex + 1} / {filteredSubmissions.length}
                </Badge>
                <DialogDescription className="sr-only">
                  Detailed view of submission by {activePhoto.user.username || activePhoto.user.name}
                </DialogDescription>
              </DialogHeader>

              {/* 1:1 Square Photo Container */}
              <div className="relative w-full aspect-square max-h-[62vh] bg-black/95 flex-shrink-0 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
                <Image
                  src={activePhoto.imageUrl}
                  alt={activePhoto.caption}
                  fill
                  sizes="(max-width: 768px) 95vw, 650px"
                  className="object-contain"
                  priority
                />

                {/* Floating Carousel Navigation Buttons */}
                {filteredSubmissions.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-background/80 backdrop-blur border shadow-md hover:bg-background active:scale-95 transition-all cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      aria-label="Previous photo (Left Arrow)"
                    >
                      <ChevronLeft className="size-6" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-background/80 backdrop-blur border shadow-md hover:bg-background active:scale-95 transition-all cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      aria-label="Next photo (Right Arrow)"
                    >
                      <ChevronRight className="size-6" />
                    </Button>
                  </>
                )}
              </div>

              <div className="p-4 sm:p-6 flex flex-col gap-4 bg-background">
                <p className="text-sm font-medium leading-relaxed text-foreground sm:hidden">
                  {activePhoto.caption}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-2">
                    <UserIcon className="size-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{activePhoto.user.username ? `@${activePhoto.user.username}` : activePhoto.user.name || "Anonymous Contributor"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="size-3" />
                        Submitted on {new Date(activePhoto.submittedAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                      </p>
                    </div>
                  </div>

                  {activePhoto.moment?.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {activePhoto.moment.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {activePhoto.moment?.caption && (
                  <div className="rounded-xl bg-muted/50 p-3.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Featured Moment: </span>
                    {activePhoto.moment.caption}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
