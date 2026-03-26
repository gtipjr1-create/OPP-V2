import { supabase } from "../lib/supabase";

export function getTodayISODate() {
  return new Date().toISOString().slice(0, 10);
}

export async function loadTodayTasks(userId, date = getTodayISODate()) {
  const { data, error } = await supabase
    .from("today_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Today tasks load failed: ${error.message}`);
  }

  return data || [];
}

export async function createTodayTask({ userId, label, sortOrder, date = getTodayISODate() }) {
  const { data, error } = await supabase
    .from("today_tasks")
    .insert({
      user_id: userId,
      date,
      label,
      done: false,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Today task create failed: ${error.message}`);
  }

  return data;
}

export async function updateTodayTaskDone(id, done) {
  const { error } = await supabase
    .from("today_tasks")
    .update({ done })
    .eq("id", id);

  if (error) {
    throw new Error(`Today task update failed: ${error.message}`);
  }
}

export async function deleteTodayTask(id) {
  const { error } = await supabase
    .from("today_tasks")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Today task delete failed: ${error.message}`);
  }
}

export async function updateTodayTaskSortOrders(tasks) {
  const updates = tasks.map((task, index) =>
    supabase
      .from("today_tasks")
      .update({ sort_order: index })
      .eq("id", task.id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(`Today task reorder failed: ${failed.error.message}`);
  }
}
