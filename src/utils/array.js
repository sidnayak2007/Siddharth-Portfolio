/* =========================================================
   ARRAY HELPERS
========================================================= */

export function moveArrayItem(
  items,
  index,
  direction
) {
  if (!Array.isArray(items)) {
    return [];
  }

  const targetIndex =
    index + direction;

  if (
    index < 0 ||
    index >= items.length ||
    targetIndex < 0 ||
    targetIndex >= items.length
  ) {
    return [...items];
  }

  const nextItems =
    [...items];

  const [
    movedItem,
  ] = nextItems.splice(
    index,
    1
  );

  nextItems.splice(
    targetIndex,
    0,
    movedItem
  );

  return nextItems;
}