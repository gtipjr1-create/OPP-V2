import { supabase } from "../lib/supabase";

export async function loadDomains(userId) {
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Domains load failed: ${error.message}`);
  }

  return data || [];
}

export async function seedDefaultDomains(userId, domains) {
  const seedRows = domains.map((domain) => ({
    user_id: userId,
    name: domain.name,
    slug: domain.slug,
  }));

  const { error } = await supabase
    .from("domains")
    .upsert(seedRows, { onConflict: "user_id,slug" });

  if (error) {
    throw new Error(`Domains seed failed: ${error.message}`);
  }
}

export async function updateDomain({ id, status, focus }) {
  const { data, error } = await supabase
    .from("domains")
    .update({
      status,
      focus,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Domain update failed: ${error.message}`);
  }

  return data;
}
