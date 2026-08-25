/**
 * Delays the fixed commerce header until the first shop heading starts to
 * enter the viewport, keeping the campaign image open on first arrival.
 */
export function getHeaderTransitionThreshold(heroHeight: number, viewportHeight: number) {
  return Math.max(96, heroHeight - viewportHeight + 112);
}
