/**
 * Returns how many slots are left given the number used and the total available.
 */
export function remainingSlots(used: number, total: number): number {
  return total - used;
}
