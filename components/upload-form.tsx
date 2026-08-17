"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createSubmission } from "@/lib/actions/submissions";
import { Upload, Image as ImageIcon, Loader2, Sparkles, X, Link as LinkIcon, Clipboard } from "lucide-react";

interface MomentOption {
  id: string;
  caption: string;
}

interface UploadFormProps {
  moments: MomentOption[];
}

async function compressImage(file: File, maxDim = 1920, quality = 0.82): Promise<File> {
  if (file.size < 350 * 1024) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = Math.round((height * maxDim) / width);
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressed);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export function UploadForm({ moments }: UploadFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"file" | "url">("file");

  const [file, setFile] = useState<File | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [momentId, setMomentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle Clipboard Copy-Paste globally on the page
  const processPastedFile = useCallback((pastedFile: File) => {
    setFile(pastedFile);
    setImageUrlInput("");
    setActiveTab("file");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(pastedFile));
    toast.success("Image pasted from clipboard!");
  }, [previewUrl]);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const fileFromPaste = item.getAsFile();
          if (fileFromPaste) {
            e.preventDefault();
            processPastedFile(fileFromPaste);
            return;
          }
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [processPastedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrlInput("");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUrlInputChange = (url: string) => {
    setImageUrlInput(url);
    if (url.trim().startsWith("http://") || url.trim().startsWith("https://") || url.trim().startsWith("data:image/")) {
      setPreviewUrl(url.trim());
      setFile(null);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearImage = () => {
    setFile(null);
    setImageUrlInput("");
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file && !imageUrlInput.trim()) {
      toast.error("Please upload, paste, or provide an image link.");
      return;
    }

    if (!caption.trim()) {
      toast.error("Please provide a caption describing your photo.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Processing and submitting photo...", { id: "uploading" });

    try {
      let finalImageUrl = "";

      if (file) {
        // Compress image client-side to ensure fast upload and small payload
        const optimizedFile = await compressImage(file);

        // Upload file via FormData endpoint
        const formData = new FormData();
        formData.append("file", optimizedFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to upload image");
        finalImageUrl = data.url;
      } else if (imageUrlInput.trim()) {
        const rawUrl = imageUrlInput.trim();

        // Try downloading remote image to host in Vercel Blob, fallback to raw URL if CORS blocks
        try {
          const fetchRes = await fetch(rawUrl);
          if (fetchRes.ok) {
            const blob = await fetchRes.blob();
            const remoteFile = new File([blob], "remote_image.jpg", { type: blob.type || "image/jpeg" });
            const optimizedFile = await compressImage(remoteFile);

            const formData = new FormData();
            formData.append("file", optimizedFile);
            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              finalImageUrl = uploadData.url;
            } else {
              finalImageUrl = rawUrl;
            }
          } else {
            finalImageUrl = rawUrl;
          }
        } catch {
          // If remote fetch fails due to CORS, use direct image link
          finalImageUrl = rawUrl;
        }
      }

      // Create submission row in DB via Server Action
      const cleanMomentId = (momentId && momentId !== "none") ? momentId : undefined;
      const resResult = await createSubmission({
        imageUrl: finalImageUrl,
        caption: caption.trim(),
        momentId: cleanMomentId,
      });

      if (resResult?.error) {
        throw new Error(resResult.error);
      }

      toast.success("Photo submitted for admin review!", { id: "uploading" });
      router.push("/my-submissions");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err.message || "Something went wrong uploading your photo.", { id: "uploading" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasSelectedImage = !!file || !!imageUrlInput.trim();

  return (
    <Card className="w-full max-w-xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-serif font-bold flex items-center gap-2.5">
          <Sparkles className="size-5 text-primary" />
          Submit a Photo to Aliverso
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          Upload a file, paste an image from your clipboard (<kbd className="px-1.5 py-0.5 text-[11px] font-mono bg-muted border rounded">Ctrl+V</kbd>), or paste an image link.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-6">
          {/* Photo Source Input Methods (Tabs & Clipboard Paste) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Photo Source</Label>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clipboard className="size-3.5" /> Direct paste enabled
              </span>
            </div>

            {previewUrl ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-black/95 flex items-center justify-center p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Upload preview" className="w-full h-full object-contain" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3 size-10 rounded-full shadow-lg border border-white/20 active:scale-95 transition-transform cursor-pointer"
                  onClick={clearImage}
                  aria-label="Remove image preview"
                >
                  <X className="size-5" />
                </Button>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "file" | "url")} className="w-full">
                <TabsList className="grid grid-cols-2 w-full h-11 rounded-xl p-1 bg-muted/60">
                  <TabsTrigger value="file" className="rounded-lg text-xs font-medium gap-2">
                    <ImageIcon className="size-4" /> File / Paste (Ctrl+V)
                  </TabsTrigger>
                  <TabsTrigger value="url" className="rounded-lg text-xs font-medium gap-2">
                    <LinkIcon className="size-4" /> Image Web Link
                  </TabsTrigger>
                </TabsList>

                {/* File Upload / Drag & Drop / Clipboard Zone */}
                <TabsContent value="file" className="mt-3">
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full min-h-[190px] p-6 border-2 border-dashed rounded-2xl cursor-pointer bg-muted/20 hover:bg-muted/40 active:bg-muted/60 transition-colors border-muted-foreground/30 text-center"
                  >
                    <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-xs">
                      <ImageIcon className="size-7" />
                    </div>
                    <p className="mb-1 text-sm font-semibold text-foreground">
                      Tap to select file, or press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted border rounded">Ctrl+V</kbd> to paste
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP or GIF (No saving needed)
                    </p>
                    <Input
                      id="image"
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/gif"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                    />
                  </label>
                </TabsContent>

                {/* Direct Image Link Input Zone */}
                <TabsContent value="url" className="mt-3">
                  <div className="flex flex-col gap-3 p-4 border rounded-2xl bg-muted/20">
                    <Label htmlFor="image-url" className="text-xs font-medium text-muted-foreground">
                      Paste direct image web address (URL)
                    </Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="image-url"
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        className="pl-9 h-11 rounded-xl text-sm"
                        value={imageUrlInput}
                        onChange={(e) => handleUrlInputChange(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Supports any web image URL ending in .jpg, .png, .webp or image link.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Caption Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="caption" className="text-sm font-semibold">Caption & Title</Label>
            <Textarea
              id="caption"
              placeholder="Title for this photo (e.g. Ali Teletubbie, Ali Scooby Doo...)"
              rows={3}
              className="text-base sm:text-sm p-3 rounded-xl"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Optional Moment Selector */}
          {moments.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="moment" className="text-sm font-semibold">Associated Moment (Optional)</Label>
              <Select value={momentId} onValueChange={(val) => setMomentId(val || "")} disabled={isSubmitting}>
                <SelectTrigger id="moment" className="h-11 rounded-xl text-base sm:text-sm">
                  <SelectValue placeholder="Select a moment category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General Submission</SelectItem>
                  {moments.map((moment) => (
                    <SelectItem key={moment.id} value={moment.id}>
                      {moment.caption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <Button type="button" variant="outline" className="w-full sm:w-auto h-11 px-6 text-sm rounded-xl" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto h-11 px-6 text-sm font-semibold gap-2 rounded-xl cursor-pointer" disabled={isSubmitting || !hasSelectedImage}>
            {isSubmitting ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin size-4" />
                Uploading...
              </>
            ) : (
              <>
                <Upload data-icon="inline-start" className="size-4" />
                Submit Photo
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
