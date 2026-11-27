/**
 * Acceptance formula from prisma/prompt.md Feature 5.1:
 * Shelves count visually matches Math.floor(heightMm / 400) - 1.
 */
export function computeAutoShelvesCount(heightMm: number): number {
  return Math.max(0, Math.floor(heightMm / 400) - 1);
}
