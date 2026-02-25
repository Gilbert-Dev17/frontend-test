'use server'

import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";

// Helper to extract initials
const getInitials = (name: string) => {
    if (!name || name === "Unassigned") return "??";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

export async function getCaseFile(caseId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("cases_table")
        .select(`
            *,
            attorney:users_table!lead_attorney_id (
                name,
                avatar_url
            )
        `) // Join users_table to fetch attorney details
        .eq("case_id", caseId)
        .single();

    if (error) {
        console.error("Error fetching case file:", error);
        throw error;
    }

    const attorneyName = data.attorney?.name || "Unassigned";

    // Map and format the data for the UI
    const formattedData = {
        ...data,
        // Safely extract joined data
        lead_attorney_name: data.attorney?.name || "Unassigned",
        lead_attorney_avatar: data.attorney?.avatar_url || null,
        lead_attorney_initials: getInitials(attorneyName),

        // Formatting dates
        created_at: data.created_at
            ? format(new Date(data.created_at), "MMM dd, yyyy")
            : null,
        nextcourt_date: data.nextcourt_date
            ? format(new Date(data.nextcourt_date), "MMM dd, yyyy")
            : "No date set",
    };

    return formattedData;
}