'use server'

import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";

export async function getAllCases() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cases_table")
    .select(`
      *,
      attorney:users_table!lead_attorney_id (
        name,
        avatar_url
      )
    `) // Joins users_table on lead_attorney_id
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching cases:", error);
    throw error;
  }

  const formattedData = data.map((caseItem: any) => ({
    ...caseItem,
    lead_attorney_name: caseItem.attorney?.name || "Unassigned",
    lead_attorney_avatar: caseItem.attorney?.avatar_url || null,
    created_at: caseItem.created_at
      ? format(new Date(caseItem.created_at), "MMM dd, yyyy HH:mm")
      : null,
  }));

  return formattedData;
}