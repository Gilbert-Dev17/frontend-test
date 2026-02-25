'use server';

import { createClient } from "@/utils/supabase/server";
import { ClassifyCaseFileInput, ClassificationResult } from "./constant";

class AppError extends Error {
  code: string;

  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

export async function classifyCaseFile(
  input: ClassifyCaseFileInput
): Promise<ClassificationResult> {
  const { doc_id, caseId, filePath } = input;

  if (!filePath || !caseId || !doc_id) {
    throw new AppError("CLASSIFICATION_FAILED");
  }

  const urls = [
    "http://localhost:8000/process-document",
    "http://172.188.242.191:8000/process-document",
  ];

  const requestBody = {
    doc_id,
    case_id: caseId,
    file_url: filePath,
  };

  let lastError: unknown = null;
  let serverWasReachable = false;

  for (const baseUrl of urls) {
    const fullUrl = `${baseUrl}?case_id=${caseId}&file_url=${encodeURIComponent(filePath)}`;

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      serverWasReachable = true;

      if (!response.ok) {
        if (response.status === 409) {
          throw new AppError("FILE_ALREADY_EXISTS");
        }

        console.error("Status:", response.status);
        const text = await response.text();
        console.error("Body:", text);

        throw new AppError("CLASSIFICATION_FAILED");
      }

      const data = await response.json();

      return {
        documentId: data.doc_id,
        predictedTag: data.ai_tag,
        confidence: data.confidence_score,
      };
    } catch (err: any) {
      lastError = err;

      if (err instanceof AppError) {
        throw err;
      }
    }
  }

  console.error("All classification endpoints failed. Cleaning up...", lastError);

  await cleanupFailedUpload(doc_id);

  if (!serverWasReachable) {
    throw new AppError("SERVER_NOT_UP");
  }

  if (lastError instanceof AppError) {
    throw lastError;
  }

  throw new AppError("CLASSIFICATION_FAILED");
}

export async function cleanupFailedUpload(doc_id: string) {
  const supabase = await createClient();

  const { data: filePath, error } = await supabase.rpc(
    "cleanup_failed_upload",
    { p_doc_id: doc_id }
  );

  if (error) throw error;

  if (filePath) {
    const { error: removeErr } = await supabase.storage
      .from("Case-Documents")
      .remove([filePath]);

    if (removeErr) {
      console.error("Failed to delete storage file:", removeErr);
    }
  }
}