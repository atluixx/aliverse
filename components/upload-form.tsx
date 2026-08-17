"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createSubmission } from "@/lib/actions/submissions";
import { Upload, Image as ImageIcon, Loader2, Sparkles, X } from "lucide-react";

interface MomentOption {
  id: string;
  caption: string;
}

interface UploadFormProps {
  moments: MomentOption[];
}

export function UploadForm({ moments }: UploadFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [momentId, setMomentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select an image file to upload.");
      return;
    }

    if (!caption.trim()) {
      toast.error("Please provide a caption describing your photo.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Uploading photo to Aliverso...", { id: "uploading" });

    try {
      // Upload file directly via FormData endpoint (handles Vercel Blob or Base64 Data URL)
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image");
      const finalImageUrl = data.url;

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

  return (
    <Card className="w-full max-w-xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-serif font-bold flex items-center gap-2.5">
          <Sparkles className="size-5 text-primary" />
          Submit a Photo to Aliverso
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
          Share your favorite photo for the Ali Universe gallery. All photos are reviewed by admins before appearing publicly.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-6">
          {/* File Upload Zone */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="image" className="text-sm font-semibold">Photo</Label>
            {previewUrl ? (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border bg-black">
                <Image src={previewUrl} alt="Upload preview" fill className="object-contain" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3 size-11 rounded-full shadow-lg border border-white/20 active:scale-95 transition-transform"
                  onClick={clearFile}
                  aria-label="Remove image preview"
                >
                  <X className="size-5" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full min-h-[180px] p-6 border-2 border-dashed rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/50 active:bg-muted/70 transition-colors border-muted-foreground/30"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-xs">
                    <ImageIcon className="size-7" />
                  </div>
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    Tap to select photo or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP or GIF up to 15MB
                  </p>
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </label>
            )}
          </div>

          {/* Caption Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="caption" className="text-sm font-semibold">Caption & Memory</Label>
            <Textarea
              id="caption"
              placeholder="What makes this moment special in the Aliverso?"
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
          <Button type="button" variant="outline" className="w-full sm:w-auto h-11 px-6 text-sm" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto h-11 px-6 text-sm font-semibold gap-2" disabled={isSubmitting || !file}>
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
