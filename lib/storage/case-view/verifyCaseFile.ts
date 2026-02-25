'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function finalizeCaseFile(docId: string, finalTag: string, caseId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents_table")
    .update({
      human_tag: finalTag,
      status: "finalized",
    })
    .eq("doc_id", docId)
    .select()
    .single();

  if (error) {
    console.error("Error finalizing case file:", error);
    throw new Error("Failed to finalize document classification");
  }

  revalidatePath(`/dashboard/case-tracker/case-view/${caseId}`);

  return data;
}