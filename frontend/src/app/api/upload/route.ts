import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE_MB = 4;

async function uploadToCatbox(file: File): Promise<string | null> {
  const uploadData = new FormData();
  uploadData.append("reqtype", "fileupload");
  uploadData.append("fileToUpload", file);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: uploadData,
  });

  if (!response.ok) return null;

  const url = (await response.text()).trim();
  return url.startsWith("http") ? url : null;
}

async function uploadToTmpfiles(file: File): Promise<string | null> {
  const uploadData = new FormData();
  uploadData.append("file", file);

  const response = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: uploadData,
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    status?: string;
    data?: { url?: string };
  };

  const pageUrl = payload.data?.url?.trim();
  if (!pageUrl?.startsWith("http")) return null;

  // tmpfiles serves images from /dl/... not the HTML preview page.
  return pageUrl.replace("tmpfiles.org/", "tmpfiles.org/dl/");
}

async function uploadTo0x0(file: File): Promise<string | null> {
  const uploadData = new FormData();
  uploadData.append("file", file);

  const response = await fetch("https://0x0.st", {
    method: "POST",
    body: uploadData,
  });

  if (!response.ok) return null;

  const url = (await response.text()).trim();
  return url.startsWith("http") ? url : null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Please upload an image file" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Image must be under ${MAX_FILE_SIZE_MB}MB` },
        { status: 400 },
      );
    }

    const url =
      (await uploadToCatbox(file)) ??
      (await uploadToTmpfiles(file)) ??
      (await uploadTo0x0(file));

    if (!url) {
      return NextResponse.json(
        {
          error:
            "Image upload failed. Paste a direct image URL (ending in .jpg or .png) instead.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      {
        error:
          "Image upload failed. Paste a direct image URL (ending in .jpg or .png) instead.",
      },
      { status: 500 },
    );
  }
}
