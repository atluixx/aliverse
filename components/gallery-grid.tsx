"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar,
  Tag,
  Upload,
  Images,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(9);

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

  // Reset to page 1 whenever tag filter or items per page changes
  useEffect(() => {
    setCurrentPage(1);
    setActivePhotoIndex(null);
  }, [selectedTag, itemsPerPage]);

  // Calculate pagination bounds
  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredSubmissions.length);
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, endIndex);

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

  const goToPage = (page: number) => {
    const target = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(target);
    const gridElem = document.getElementById("gallery-grid-anchor");
    if (gridElem) {
      gridElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="gallery-grid-anchor" className="flex flex-col gap-8">
      {/* Tag Filters & Per-Page Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b">
        {allTags.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <Tag className="size-3.5" /> Filter:
            </span>
            <Badge
              variant={selectedTag === "all" ? "default" : "outline"}
              className="cursor-pointer transition-colors py-1.5 px-3 shrink-0 text-xs min-h-[36px] flex items-center"
              onClick={() => setSelectedTag("all")}
            >
              All Photos ({submissions.length})
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer transition-colors capitalize py-1.5 px-3 shrink-0 text-xs min-h-[36px] flex items-center"
                onClick={() => setSelectedTag(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        ) : (
          <div />
        )}

        {/* Per-Page Limit Selectors */}
        {filteredSubmissions.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 self-end sm:self-auto">
            <span className="font-medium">Per page:</span>
            {[9, 18, 27].map((limit) => (
              <Button
                key={limit}
                variant={itemsPerPage === limit ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5 text-xs font-mono rounded-md"
                onClick={() => setItemsPerPage(limit)}
              >
                {limit}
              </Button>
            ))}
          </div>
        )}
      </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {paginatedSubmissions.map((item, pageItemIndex) => {
            const globalIndex = startIndex + pageItemIndex;
            const photoNumber = globalIndex + 1;
            const author = item.user.username ? `@${item.user.username}` : item.user.name || "Anonymous";

            return (
              <div key={item.id} className="flex flex-col group">
                {/* Photo Card Container (Contains ONLY the photo image) */}
                <Card
                  tabIndex={0}
                  role="button"
                  aria-label={`View photo #${photoNumber}: ${item.caption}`}
                  className="overflow-hidden cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none p-0 rounded-2xl"
                  onClick={() => setActivePhotoIndex(globalIndex)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActivePhotoIndex(globalIndex);
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
                </Card>

                {/* H2 Title and Author Handle Outside Card */}
                <div className="mt-3 flex flex-col gap-1 px-1">
                  <h2
                    className="text-base sm:text-lg font-serif font-bold text-foreground leading-snug line-clamp-2 cursor-pointer group-hover:text-primary transition-colors"
                    onClick={() => setActivePhotoIndex(globalIndex)}
                  >
                    #{photoNumber}: {item.caption}
                  </h2>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-0.5">
                    <span className="flex items-center gap-1.5 text-foreground font-semibold">
                      <UserIcon className="size-3.5 text-primary shrink-0" />
                      {author}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="size-3" />
                      {new Date(item.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredSubmissions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
          <p className="text-xs text-muted-foreground font-medium">
            Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
            <span className="font-semibold text-foreground">{filteredSubmissions.length}</span> photos
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-lg"
                disabled={validCurrentPage === 1}
                onClick={() => goToPage(1)}
                aria-label="First Page"
              >
                <ChevronsLeft className="size-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-lg"
                disabled={validCurrentPage === 1}
                onClick={() => goToPage(validCurrentPage - 1)}
                aria-label="Previous Page"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={validCurrentPage === pageNum ? "default" : "ghost"}
                      size="sm"
                      className="size-9 p-0 font-mono text-xs rounded-lg"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-lg"
                disabled={validCurrentPage === totalPages}
                onClick={() => goToPage(validCurrentPage + 1)}
                aria-label="Next Page"
              >
                <ChevronRight className="size-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-lg"
                disabled={validCurrentPage === totalPages}
                onClick={() => goToPage(totalPages)}
                aria-label="Last Page"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Detailed Photo Lightbox Modal View */}
      <Dialog open={activePhotoIndex !== null} onOpenChange={(open) => !open && setActivePhotoIndex(null)}>
        <DialogContent className="w-[95vw] max-w-2xl sm:w-[90vw] p-0 overflow-hidden max-h-[94vh] flex flex-col rounded-2xl border shadow-2xl">
          {activePhoto && activePhotoIndex !== null && (
            <div className="flex flex-col max-h-[94vh] overflow-y-auto">
              <DialogHeader className="p-4 sm:p-5 pb-3 border-b sticky top-0 bg-background/95 backdrop-blur z-10 flex flex-row items-center justify-between gap-4">
                <DialogTitle className="text-lg sm:text-xl font-serif font-bold flex items-center gap-2 pr-8 min-w-0">
                  <span className="truncate">#{activePhotoIndex + 1}: {activePhoto.caption}</span>
                </DialogTitle>
                <Badge variant="outline" className="text-[11px] font-mono px-2.5 py-1 shrink-0 bg-muted/50">
                  {activePhotoIndex + 1} / {filteredSubmissions.length}
                </Badge>
                <DialogDescription className="sr-only">
                  Detailed view of submission #{activePhotoIndex + 1} by {activePhoto.user.username || activePhoto.user.name}
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
