/**
 * The object goes into the basket.
 *
 * Adding to a cart is the one moment a shop has to feel physical, so the drawn
 * item is cloned, lifted out of its plate, thrown along an arc and dropped into
 * the basket control, which then takes the knock. Two deliberate decisions:
 *
 * - It runs on the Web Animations API against a detached clone, outside React.
 *   The cart state has already changed by the time this is called, so nothing
 *   here can delay or break the actual add.
 * - It refuses to run at all under reduced motion, where a thing flying across
 *   the screen is exactly what was asked not to happen. The basket still takes
 *   its knock, because that is feedback rather than decoration.
 */
export function flyToBasket(
  id: string,
  from: Element | null | undefined,
  basket: HTMLElement | null,
  reduced: boolean,
): void {
  if (!basket) return;

  const knock = () => {
    basket.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.9) translateY(2px)", offset: 0.4 },
        { transform: "scale(1.06)", offset: 0.7 },
        { transform: "scale(1)" },
      ],
      { duration: reduced ? 1 : 420, easing: "cubic-bezier(0.34, 1.5, 0.5, 1)" },
    );
  };

  if (reduced || !from || typeof (from as HTMLElement).animate !== "function") {
    knock();
    return;
  }

  const start = from.getBoundingClientRect();
  const end = basket.getBoundingClientRect();
  if (start.width === 0 || end.width === 0) {
    knock();
    return;
  }

  const clone = from.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.style.cssText = `
    position: fixed;
    left: ${start.left}px;
    top: ${start.top}px;
    width: ${start.width}px;
    height: ${start.height}px;
    margin: 0;
    z-index: 900;
    pointer-events: none;
    will-change: transform, opacity;
  `;
  clone.dataset.flight = id;
  document.body.appendChild(clone);

  const dx = end.left + end.width / 2 - (start.left + start.width / 2);
  const dy = end.top + end.height / 2 - (start.top + start.height / 2);

  const flight = clone.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
      {
        // The apex: thrown up and out before it falls into the basket, which is
        // what makes it read as weight rather than as a tween.
        transform: `translate(${dx * 0.45}px, ${dy * 0.28 - 90}px) scale(0.72) rotate(-14deg)`,
        opacity: 1,
        offset: 0.55,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(0.12) rotate(6deg)`,
        opacity: 0.15,
      },
    ],
    { duration: 640, easing: "cubic-bezier(0.5, 0, 0.35, 1)", fill: "forwards" },
  );

  flight.onfinish = () => {
    clone.remove();
    knock();
  };
  // A cancelled animation (tab hidden mid-flight) must still clean up.
  flight.oncancel = () => clone.remove();
}
