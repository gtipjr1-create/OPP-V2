import { supabase } from "../lib/supabase";

export async function loadStandards(userId) {
  const { data, error } = await supabase
    .from("standards")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Standards load failed: ${error.message}`);
  }

  return data || [];
}

export async function createStandard({ userId, text, sortOrder }) {
  const { data, error } = await supabase
    .from("standards")
    .insert({
      user_id: userId,
      text,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Standard create failed: ${error.message}`);
  }

  return data;
}

export async function updateStandardText({ id, userId, text }) {
  const { data, error } = await supabase
    .from("standards")
    .update({
      text,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Standard update failed: ${error.message}`);
  }

  return data;
}

export async function deleteStandard(id, userId) {
  const { error } = await supabase
    .from("standards")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Standard delete failed: ${error.message}`);
  }
}

export async function normalizeStandardSortOrders(standards, userId) {
  for (let index = 0; index < standards.length; index += 1) {
    const standard = standards[index];
    const temporarySortOrder = 1000 + index;

    const { error: bumpError } = await supabase
      .from("standards")
      .update({
        sort_order: temporarySortOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", standard.id)
      .eq("user_id", userId);

    if (bumpError) {
      throw new Error(`Standard temporary reorder failed: ${bumpError.message}`);
    }
  }

  for (let index = 0; index < standards.length; index += 1) {
    const standard = standards[index];

    const { error: finalError } = await supabase
      .from("standards")
      .update({
        sort_order: index,
        updated_at: new Date().toISOString(),
      })
      .eq("id", standard.id)
      .eq("user_id", userId);

    if (finalError) {
      throw new Error(`Standard final reorder failed: ${finalError.message}`);
    }
  }
}
