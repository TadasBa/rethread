/* ============================================================================
   Dark-region detection — flips `body.on-dark-region` when a deep-indigo panel
   sits under the viewport's vertical centre, so the fixed thread spine can
   recolour to read against it. Uses the "-50%/-50%" rootMargin trick to fire
   only when a panel crosses the centre line.
   ========================================================================== */

let observer: IntersectionObserver | null = null;
const active = new Set<Element>();

export function markDarkRegions(root: ParentNode): void {
  observer?.disconnect();
  active.clear();
  document.body.classList.remove("on-dark-region");

  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) active.add(e.target);
        else active.delete(e.target);
      }
      document.body.classList.toggle("on-dark-region", active.size > 0);
    },
    { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
  );

  root
    .querySelectorAll(".panel--indigo, .panel--indigo-deep")
    .forEach((el) => observer?.observe(el));
}
