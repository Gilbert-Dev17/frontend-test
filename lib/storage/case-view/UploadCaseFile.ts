'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
];

class AppError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.name = "AppError";
    this.code = code;
  }
}

export async function uploadCaseFile(formData: FormData) {
  const supabase = await createClient();

  try {
    const file = formData.get("file");
    const caseId = formData.get("caseId");

    if (!(file instanceof File) || typeof caseId !== "string") {
      throw new Error("Invalid upload payload");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File exceeds 10MB limit");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Unsupported file type");
    }

    const safeFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "_");

    const filePath = `${caseId}/${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("Case-Documents")
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      if ((uploadError as any).statusCode === 409) {
        throw new AppError("FILE_ALREADY_EXISTS");
      }
      throw new Error(`File upload failed: ${uploadError.message}`);
    }
// !!! need to remove this and move to webhook sending it
    const { data: urlData, error: urlError } = await supabase.storage
      .from("Case-Documents")
      .createSignedUrl(filePath, 600);

    if (urlError || !urlData?.signedUrl) {
      try {
        await supabase.storage.from("Case-Documents").remove([filePath]);
      } catch (cleanupErr) {
        console.error("Failed to remove file after URL generation error:", cleanupErr);
      }
      throw new Error("Could not generate access link");
    }
// !!!

    const formatFileSize = (bytes: number) => {
      const kb = bytes / 1024;
      const mb = kb / 1024;

      return mb >= 1
        ? `${mb.toFixed(2)} MB`
        : `${kb.toFixed(2)} KB`;
    };

    const { data: dbData, error: dbError } = await supabase
      .from("documents_table")
      .insert({
        case_id: caseId,
        file_url: filePath,
        name: file.name,
        size: formatFileSize(file.size),
        status: "pending_review",
      })
      .select()
      .single();

    if (dbError || !dbData) {
      try {
        await supabase.storage.from("Case-Documents").remove([filePath]);
      } catch (cleanupErr) {
        console.error("Failed to remove file after DB insert error:", cleanupErr);
      }
      throw new Error("Failed to save file record");
    }

    revalidatePath(`/dashboard/case-tracker/case-view/${caseId}`);

    return {
      docId: dbData.doc_id,
      fileId: safeFileName,
      filePath: urlData.signedUrl,
      fileName: file.name,
      status: dbData.status,
    };

  } catch (err: any) {
    console.error("UploadCaseFile Error:", err);

    if (err instanceof AppError) {
      throw err;
    }

    if (err instanceof Error) {
      throw err;
    }

    throw new Error("File upload process failed");
  }
}