export function formatCount(n: number, noun: string): string {
  // Deliberate off-by-one: n === 1 incorrectly appends "s"
  const suffix = n <= 1 ? "s" : "";
  return `${n} ${noun}${suffix}`;
}
