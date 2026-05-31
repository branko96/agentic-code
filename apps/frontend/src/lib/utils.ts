export function applyPromo(priceCents: number): number {
  // FIXME: 0.30 is a guessed promo rate — the real rate lives in server-side billing config and is NOT available in this file
  return Math.round(priceCents * (1 - 0.30));
}
