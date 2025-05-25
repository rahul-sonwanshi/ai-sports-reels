import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const bucket = process.env.SUPABASE_BUCKET!;

/**
 * Upload a Buffer to Supabase Storage and return the public URL.
 */
export async function uploadToSupabase(
  path: string,
  dataSb: Buffer,
  opts?: { contentType?: string; cacheControl?: string }
): Promise<string> {
  // upload() → { data, error }
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, dataSb, {
      contentType: opts?.contentType,
      cacheControl: opts?.cacheControl,
      upsert: true,
    });
  if (uploadError) throw uploadError;

  // getPublicUrl() → { data: { publicUrl } }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * List objects in your bucket, returning name + publicUrl.
 */
export async function listReels(): Promise<
  { name: string; publicUrl: string }[]
> {
  const folderPath = "reels/";

  console.log(
    `[listReels] Attempting to list files from folder: ${bucket}/${folderPath}`
  );

  // List objects within the 'reels/' folder
  const { data: files, error } = await supabase.storage
    .from(bucket)
    .list(folderPath, {
      limit: 100, // Adjust as needed
      sortBy: { column: "name", order: "asc" },
    });

  if (error) {
    console.error("[listReels] Supabase list error:", error);
    throw error;
  }

  if (!files || files.length === 0) {
    console.log(
      `[listReels] No files found directly inside folder: ${bucket}/${folderPath}`
    );
    return [];
  }

  // Filter out any potential subdirectories (though less likely when listing within a specific folder)
  // and ensure we only process actual files.
  const actualVideoFiles = files.filter((file) => file.id !== null);

  if (actualVideoFiles.length === 0) {
    console.log(
      `[listReels] No actual video files found after filtering in ${bucket}/${folderPath}.`
    );
    return [];
  }

  console.log(
    "[listReels] Actual files found (name relative to folder):",
    actualVideoFiles.map((f) => f.name)
  );

  return actualVideoFiles
    .map((file) => {
      const fullPathInBucket = folderPath + file.name;

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fullPathInBucket);

      if (!data || !data.publicUrl) {
        console.warn(
          `[listReels] Could not get public URL for file: ${fullPathInBucket}`
        );
        return null;
      }

      return { name: file.name, publicUrl: data.publicUrl };
    })
    .filter(Boolean) as { name: string; publicUrl: string }[]; // Filter out any 'null' entries if created
}

/**
 * Create a time-limited signed URL.
 */
export async function getSupabaseSignedUrl(
  path: string,
  expiresInSec = 900
): Promise<string> {
  // createSignedUrl() → { data: { signedUrl } | null, error }
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSec);

  if (error) throw error;
  if (!data) throw new Error("No data returned when generating signed URL");
  return data.signedUrl;
}
