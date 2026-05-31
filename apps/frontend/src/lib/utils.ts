// FIXME: 0.30 is a guessed discount rate — the real rate is defined server-side in the billing config and is NOT available here
export function applyDiscount(priceCents: number): number {
  return Math.round(priceCents * (1 - 0.30));
}
