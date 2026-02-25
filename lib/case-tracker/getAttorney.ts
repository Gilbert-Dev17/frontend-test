"use server";

import { createClient } from "@/utils/supabase/server";

export async function getAttorneys() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users_table")
    .select("user_id, name")
    .in("role", ["Attorney"]);

  if (error) throw error;
  return data;
}
