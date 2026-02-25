'use server'

import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";

export async function viewCaseFiles(caseId: string) {
  const supabase = await createClient();

  // 1. Fetch from the DATABASE, not Storage
  const { data, error } = await supabase
    .from("documents_table")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents from DB:", error);
    throw error;
  }

  return data.map((doc) => {
    // Determine file type from the name stored in DB
    const extension = doc.name?.split(".").pop()?.toLowerCase();
    const fileType = extension === "pdf" ? "pdf" : (extension === "docx" || extension === "doc" ? "doc" : "other");

    return {
      id: doc.doc_id, // Use the UUID
      name: doc.name,
      size: doc.size || "0.00 MB",
      date: doc.created_at ? format(new Date(doc.created_at), "MMM dd, yyyy") : "N/A",
      fileType,
      status: doc.status,      // 🔑 Now we have the status!
      caseType: doc.human_tag, // 🔑 Now we have the confirmed tag!
    };
  });
}