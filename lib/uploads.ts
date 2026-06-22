import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseAdmin, hasSupabaseConfig } from "@/lib/supabase";

export async function savePaymentScreenshot(file: File, orderNo: string) {
  if (!file || file.size === 0) return "";

  if (hasSupabaseConfig()) {
    const supabase = getSupabaseAdmin();
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "payments";
    if (supabase) {
      const extension = file.name.split(".").pop() || "png";
      const fileName = `${orderNo}-${Date.now()}.${extension}`;
      const arrayBuffer = await file.arrayBuffer();
      const { error } = await supabase.storage.from(bucket).upload(fileName, Buffer.from(arrayBuffer), {
        contentType: file.type || "image/png",
        upsert: true
      });
      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        return data.publicUrl;
      }
    }
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "";
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const extension = file.name.split(".").pop() || "png";
  const fileName = `${orderNo}-${Date.now()}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  return `/uploads/${fileName}`;
}
