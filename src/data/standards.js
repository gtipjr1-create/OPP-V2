import { supabase } from "../lib/supabase";

function isMissingColumnError(error, columnName) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes(columnName.toLowerCase());
}

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

export async function createStandard({
  userId,
  text,
  sortOrder,
  category = "Execution",
  lastReviewedAt = null,
}) {
  const payloadWithDepth = {
    user_id: userId,
    text,
    sort_order: sortOrder,
    category,
    last_reviewed_at: lastReviewedAt,
  };

  const primary = await supabase
    .from("standards")
    .insert(payloadWithDepth)
    .select()
    .single();

  if (!primary.error) {
    return primary.data;
  }

  if (
    isMissingColumnError(primary.error, "category") ||
    isMissingColumnError(primary.error, "last_reviewed_at")
  ) {
    const fallback = await supabase
      .from("standards")
      .insert({
        user_id: userId,
        text,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (fallback.error) {
      throw new Error(`Standard create failed: ${fallback.error.message}`);
    }

    return fallback.data;
  }

  throw new Error(`Standard create failed: ${primary.error.message}`);
}

export async function updateStandardText({ id, userId, text, category }) {
  const baseUpdate = {
    text,
    updated_at: new Date().toISOString(),
  };

  const primaryUpdate = {
    ...baseUpdate,
    ...(category ? { category } : {}),
  };

  const primary = await supabase
    .from("standards")
    .update(primaryUpdate)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (!primary.error) {
    return primary.data;
  }

  if (category && isMissingColumnError(primary.error, "category")) {
    const fallback = await supabase
      .from("standards")
      .update(baseUpdate)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (fallback.error) {
      throw new Error(`Standard update failed: ${fallback.error.message}`);
    }

    return fallback.data;
  }

  throw new Error(`Standard update failed: ${primary.error.message}`);
}

export async function markStandardReviewed({ id, userId, reviewedAt }) {
  const timestamp = reviewedAt || new Date().toISOString();

  const primary = await supabase
    .from("standards")
    .update({
      last_reviewed_at: timestamp,
      updated_at: timestamp,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (!primary.error) {
    return primary.data;
  }

  if (isMissingColumnError(primary.error, "last_reviewed_at")) {
    const fallback = await supabase
      .from("standards")
      .update({ updated_at: timestamp })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (fallback.error) {
      throw new Error(`Standard review failed: ${fallback.error.message}`);
    }

    return fallback.data;
  }

  throw new Error(`Standard review failed: ${primary.error.message}`);
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
