import { supabase } from "../lib/supabase";

export async function loadWeeklyAnchors(userId) {
  const { data, error } = await supabase
    .from("weekly_anchors")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Weekly anchors load failed: ${error.message}`);
  }

  return data || [];
}

export async function createWeeklyAnchor({ userId, text, sortOrder }) {
  const { data, error } = await supabase
    .from("weekly_anchors")
    .insert({
      user_id: userId,
      text,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Weekly anchor create failed: ${error.message}`);
  }

  return data;
}

export async function updateWeeklyAnchorText({ id, userId, text }) {
  const { data, error } = await supabase
    .from("weekly_anchors")
    .update({ text })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Weekly anchor update failed: ${error.message}`);
  }

  return data;
}

export async function deleteWeeklyAnchor(id, userId) {
  const { error } = await supabase
    .from("weekly_anchors")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Weekly anchor delete failed: ${error.message}`);
  }
}

export async function updateWeeklyAnchorSortOrders(anchors, userId) {
  for (let index = 0; index < anchors.length; index += 1) {
    const anchor = anchors[index];

    if (anchor.sortOrder !== index) {
      const { error } = await supabase
        .from("weekly_anchors")
        .update({ sort_order: index })
        .eq("id", anchor.id)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Weekly anchor reorder failed: ${error.message}`);
      }
    }
  }
}
