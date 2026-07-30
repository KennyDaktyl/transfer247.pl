/** "89.00" -> "89 zł" — DRF serializes DecimalField as a string; these prices
 * are always whole złoty so we drop the trailing ".00" instead of showing it. */
export function formatPrice(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return `${Number.isInteger(n) ? n : n.toFixed(2)} zł`;
}
