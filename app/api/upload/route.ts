import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized upload request" }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";

  // Handle direct file upload via FormData (Data URL fallback for serverless compatibility)
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || "image/jpeg";
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      return NextResponse.json({ url: dataUrl });
    } catch (err: any) {
      console.error("Data URL upload error:", err);
      return NextResponse.json({ error: err.message || "Upload processing failed" }, { status: 500 });
    }
  }

  // Vercel Blob Handle Upload for production direct client upload if token exists
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const body = (await request.json()) as HandleUploadBody;
      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => {
          return {
            allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
            maximumSizeInBytes: 15 * 1024 * 1024,
            tokenPayload: JSON.stringify({ userId: session.user.id }),
          };
        },
        onUploadCompleted: async ({ blob }) => {
          console.log("Blob upload completed:", blob.url);
        },
      });

      return NextResponse.json(jsonResponse);
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }
  }

  return NextResponse.json(
    { error: "Vercel Blob storage is not configured, please upload via form data." },
    { status: 400 }
  );
}
