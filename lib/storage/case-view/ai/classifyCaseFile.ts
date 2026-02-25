'use server';

import { createClient } from "@/utils/supabase/server";
import { ClassifyCaseFileInput, ClassificationResult } from "./constant";
import { performance } from "perf_hooks"; // Node.js performance API

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

  // Start total timer
  const totalStart = performance.now();

  for (const baseUrl of urls) {
    const fullUrl = `${baseUrl}?case_id=${caseId}&file_url=${encodeURIComponent(filePath)}`;

    try {
      const requestStart = performance.now();

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const requestEnd = performance.now();
      console.info(`Request to ${baseUrl} took ${(requestEnd - requestStart).toFixed(2)} ms`);

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

      const parseStart = performance.now();
      const data = await response.json();
      const parseEnd = performance.now();

      console.info(`Response parsing took ${(parseEnd - parseStart).toFixed(2)} ms`);

      const totalEnd = performance.now();
      console.info(`Total classifyCaseFile runtime: ${(totalEnd - totalStart).toFixed(2)} ms`);

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

  const cleanupStart = performance.now();
  await cleanupFailedUpload(doc_id);
  const cleanupEnd = performance.now();
  console.info(`Cleanup operation took ${(cleanupEnd - cleanupStart).toFixed(2)} ms`);

  const totalEnd = performance.now();
  console.info(`Total classifyCaseFile runtime (including cleanup): ${(totalEnd - totalStart).toFixed(2)} ms`);

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