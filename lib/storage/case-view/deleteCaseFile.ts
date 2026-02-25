'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache";

export async function DeleteCaseFile(caseId: string, fileName: string, fileId: string) {
    const supabase = await createClient();

     const safeFileName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "_");

    const filePath = `${caseId}/${safeFileName}`;

    const { error } = await supabase.storage
        .from("Case-Documents")
        .remove([filePath]);

    const { error: dbError } = await supabase
        .from("documents_table")
        .delete()
        .eq("doc_id", fileId)
        .eq("case_id", caseId)

    if (error || dbError) {
        console.error("Error deleting file:", error, dbError);
        throw new Error("Could not delete file");
    }

    revalidatePath(`/dashboard/case-tracker/case-view/${caseId}`);

    return { success: true, message: "File deleted successfully" };

}