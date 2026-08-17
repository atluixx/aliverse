import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized upload request" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      // If Vercel Blob storage is configured, upload directly to Vercel Blob CDN
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const blob = await put(`submissions/${Date.now()}-${cleanName}`, file, {
          access: "public",
        });
        return NextResponse.json({ url: blob.url });
      }

      // Fallback: Data URL (for local development or environments without Blob storage)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/jpeg";
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({ url: dataUrl });
    } catch (err: any) {
      console.error("Upload route error:", err);
      return NextResponse.json({ error: err.message || "Upload processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "Invalid upload request content type." },
    { status: 400 }
  );
}
