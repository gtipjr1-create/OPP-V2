import { supabase } from "../lib/supabase";

export async function loadPriorities(userId) {
  const { data, error } = await supabase
    .from("priorities")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Priorities load failed: ${error.message}`);
  }

  return data || [];
}

export async function createPriority({
  userId,
  domainId,
  title,
  horizon,
  sortOrder,
}) {
  const { data, error } = await supabase
    .from("priorities")
    .insert({
      user_id: userId,
      domain_id: domainId,
      title,
      description: "",
      status: "active",
      sort_order: sortOrder,
      horizon,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Priority create failed: ${error.message}`);
  }

  return data;
}

export async function deletePriority(id) {
  const { error } = await supabase
    .from("priorities")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Priority delete failed: ${error.message}`);
  }
}

export async function updatePriorityStatus(id, status) {
  const { error } = await supabase
    .from("priorities")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(`Priority status update failed: ${error.message}`);
  }
}

export async function updatePrioritySortOrders(priorities) {
  const updates = priorities.map((priority, index) =>
    supabase
      .from("priorities")
      .update({ sort_order: index })
      .eq("id", priority.id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(`Priority reorder failed: ${failed.error.message}`);
  }
}
