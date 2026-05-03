export function reorderByIds(items, nextIds) {
  if (!Array.isArray(nextIds) || nextIds.length !== items.length) {
    throw new Error("Reorder list was incomplete.");
  }

  const itemById = new Map(items.map((item) => [item.id, item]));
  const reorderedItems = nextIds.map((id) => itemById.get(id)).filter(Boolean);

  if (reorderedItems.length !== items.length) {
    throw new Error("Reorder list was incomplete.");
  }

  return reorderedItems;
}

