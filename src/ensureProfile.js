import { supabase } from "./lib/supabase";

export async function ensureProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: userError || new Error("No authenticated user.") };
  }

  const { data: existingProfile, error: readError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (readError) {
    return { error: readError };
  }

  if (!existingProfile) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      display_name: user.user_metadata?.display_name || null,
    });

    if (insertError) {
      return { error: insertError };
    }
  }

  return { error: null, user };
}