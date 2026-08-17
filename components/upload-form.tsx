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
      await createSubmission({
        imageUrl: finalImageUrl,
        caption: caption.trim(),
        momentId: momentId || undefined,
      });

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
            <Label htmlFor="image">Photo</Label>
            {previewUrl ? (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border bg-black">
                <Image src={previewUrl} alt="Upload preview" fill className="object-contain" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 size-8 rounded-full shadow-md"
                  onClick={clearFile}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/60 transition-colors border-muted-foreground/30"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    <ImageIcon className="size-6" />
                  </div>
                  <p className="mb-1 text-sm font-semibold text-foreground">
                    Click to select photo or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP up to 15MB
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
            <Label htmlFor="caption">Caption & Memory</Label>
            <Textarea
              id="caption"
              placeholder="What makes this moment special in the Aliverso?"
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Optional Moment Selector */}
          {moments.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="moment">Associated Moment (Optional)</Label>
              <Select value={momentId} onValueChange={(val) => setMomentId(val || "")} disabled={isSubmitting}>
                <SelectTrigger id="moment">
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

        <CardFooter className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !file}>
            {isSubmitting ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload data-icon="inline-start" />
                Submit Photo
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
