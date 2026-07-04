/* ============================================================================
   Repair Desk — the interactive estimator (the site's centerpiece).

   Flow: pick a garment → add repairs (click) → optionally mark WHERE each
   problem is on the garment (click to drop a numbered pin, drag to reposition)
   → a live worksheet totals the fixed service price + turnaround, then hands
   off to the order form. State lives in the estimate store so it survives
   navigation and prefills the order.

   Accessibility: adding/removing repairs is fully keyboard-operable (buttons,
   aria-pressed, aria-live). Placing a pin is an optional pointer enhancement;
   the same location can be described in words on the order form.
   ========================================================================== */

import { h, clear } from "../../lib/dom";
import { S } from "../../i18n/strings";
import { estimate } from "../../lib/store";
import {
  GARMENTS,
  garmentById,
  repairById,
  repairsFor,
  priceOf,
  totalPrice,
  turnaroundFor,
  fmtEur,
  type GarmentId,
  type RepairId,
} from "../../content/pricing";
import { garmentSvg } from "./garment";

const clamp = (n: number): number => Math.min(1, Math.max(0, n));

export function buildEstimator(pendingAdd?: RepairId): HTMLElement {
  let pending: RepairId | null = pendingAdd ?? null;
  // The repair currently waiting for a location click on the garment.
  let placing: RepairId | null = null;

  const deskSvgWrap = h("div.desk__garment");
  const markerLayer = h("div.desk__markers");
  const trayEl = h("div.tray__tools", { role: "group", "aria-label": S.estimator.step2 });
  const worksheetEl = h("div.worksheet__body");
  const totalPriceEl = h("span.worksheet__total-value.num");
  const totalDaysEl = h("span.worksheet__eta-value.num");
  const ctaEl = h("a.btn.btn--accent.worksheet__cta", { href: "/uzsakymas" });
  const live = h("p.est__live.visually-hidden", { role: "status", "aria-live": "polite" });
  const deskHint = h("p.desk__hint.spec");
  const garmentPickerEl = h("div.picker__grid", { role: "radiogroup", "aria-label": S.estimator.step1 });

  const announce = (msg: string): void => {
    live.textContent = "";
    requestAnimationFrame(() => (live.textContent = msg));
  };

  const repairIndex = (rid: RepairId): number => estimate.get().repairs.indexOf(rid) + 1;

  // --- Garment picker -----------------------------------------------------
  function renderPicker(): void {
    clear(garmentPickerEl);
    const { garment } = estimate.get();
    for (const g of GARMENTS) {
      const active = garment === g.id;
      const card = h(
        "button.picker__card",
        {
          type: "button",
          role: "radio",
          "aria-checked": String(active),
          "data-garment": g.id,
          onclick: () => selectGarment(g.id),
        },
        h("span.picker__icon", { role: "presentation" }),
        h("span.picker__label", {}, g.label),
        h("span.picker__desc", {}, g.desc),
      );
      card.querySelector(".picker__icon")?.replaceChildren(garmentSvg(g.id, { className: "picker__svg" }));
      card.classList.toggle("is-active", active);
      garmentPickerEl.appendChild(card);
    }
  }

  function selectGarment(id: GarmentId): void {
    const prev = estimate.get().garment;
    estimate.setGarment(id);
    if (prev !== id) {
      const valid = repairsFor(id).map((r) => r.id);
      estimate.setRepairs(estimate.get().repairs.filter((r) => valid.includes(r)));
      placing = null;
    }
    if (pending) {
      if (priceOf(pending, id) != null && !estimate.hasRepair(pending)) {
        estimate.toggleRepair(pending);
        placing = pending;
      }
      pending = null;
    }
    renderAll();
    announce(`${S.estimator.liveGarment}: ${garmentById(id).label}`);
  }

  // --- Tool tray ----------------------------------------------------------
  function renderTray(): void {
    clear(trayEl);
    const { garment } = estimate.get();
    if (!garment) {
      trayEl.appendChild(h("p.tray__empty", {}, S.estimator.lockedServices));
      return;
    }
    const list = repairsFor(garment);
    for (const r of list) {
      const price = priceOf(r.id, garment);
      const active = estimate.hasRepair(r.id);
      const tool = h(
        "button.tool",
        {
          type: "button",
          "aria-pressed": String(active),
          "data-repair": r.id,
          title: r.desc,
          onclick: () => toggleRepair(r.id),
        },
        h("span.tool__dot", { "aria-hidden": "true" }),
        h("span.tool__label", {}, r.label),
        h(
          "span.tool__price.num",
          {},
          price != null ? fmtEur(price) : "—",
        ),
      );
      tool.classList.toggle("is-active", active);
      trayEl.appendChild(tool);
    }
  }

  function toggleRepair(id: RepairId): void {
    const { garment } = estimate.get();
    if (!garment) {
      announce(S.estimator.garmentHint);
      garmentPickerEl.scrollIntoView({ behavior: "smooth", block: "center" });
      garmentPickerEl.classList.remove("picker--nudge");
      void garmentPickerEl.offsetWidth;
      garmentPickerEl.classList.add("picker--nudge");
      return;
    }
    if (priceOf(id, garment) == null) return;
    const wasActive = estimate.hasRepair(id);
    estimate.toggleRepair(id);
    // Adding a repair invites the user to mark its location.
    placing = wasActive ? (placing === id ? null : placing) : id;
    renderAll();
    const label = repairById(id).label;
    announce(
      `${label} ${wasActive ? S.estimator.removed : S.estimator.added}. ${S.common.total} ${fmtEur(currentTotal())}`,
    );
  }

  const currentTotal = (): number => {
    const { garment, repairs } = estimate.get();
    return garment ? totalPrice(garment, repairs) : 0;
  };

  function startPlacing(id: RepairId): void {
    placing = id;
    renderDesk();
    deskSvgWrap.closest(".desk__mat")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // --- Desk (garment + placed pins) --------------------------------------
  function renderDesk(): void {
    const { garment, repairs, spots } = estimate.get();
    clear(deskSvgWrap);
    if (garment) {
      deskSvgWrap.appendChild(garmentSvg(garment, { className: "desk__svg" }));
    } else {
      deskSvgWrap.appendChild(h("div.desk__placeholder", {}, h("span.spec", {}, S.estimator.garmentHint)));
    }

    clear(markerLayer);
    if (garment) {
      repairs.forEach((rid) => {
        const spot = spots[rid];
        if (!spot) return;
        markerLayer.appendChild(buildPin(rid, spot.x, spot.y));
      });
    }

    // Hint / cursor state
    dropZone.classList.toggle("is-placing", placing != null && garment != null);
    if (!garment) {
      deskHint.hidden = true;
      deskHint.textContent = "";
    } else if (placing) {
      deskHint.hidden = false;
      deskHint.textContent = `${S.estimator.placePrompt} ${repairById(placing).label.toLowerCase()}`;
    } else if (repairs.some((r) => !spots[r])) {
      deskHint.hidden = false;
      deskHint.textContent = S.estimator.placeIdle;
    } else if (repairs.length) {
      deskHint.hidden = false;
      deskHint.textContent = S.estimator.placeDone;
    } else {
      deskHint.hidden = false;
      deskHint.textContent = S.estimator.toolHint;
    }
  }

  function buildPin(rid: RepairId, x: number, y: number): HTMLElement {
    const pin = h(
      "button.pin",
      {
        type: "button",
        style: { left: `${x * 100}%`, top: `${y * 100}%` },
        "aria-label": `${repairById(rid).label} — ${S.estimator.movePin}`,
        title: repairById(rid).label,
      },
      h("span.pin__num.num", {}, String(repairIndex(rid))),
    );

    let dragging = false;
    let moved = false;
    pin.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      dragging = true;
      moved = false;
      pin.setPointerCapture(e.pointerId);
      pin.classList.add("is-dragging");
    });
    pin.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      moved = true;
      const rect = dropZone.getBoundingClientRect();
      const nx = clamp((e.clientX - rect.left) / rect.width);
      const ny = clamp((e.clientY - rect.top) / rect.height);
      pin.style.left = `${nx * 100}%`;
      pin.style.top = `${ny * 100}%`;
      estimate.setSpot(rid, { x: nx, y: ny });
    });
    const end = (e: PointerEvent): void => {
      if (!dragging) return;
      dragging = false;
      pin.classList.remove("is-dragging");
      try {
        pin.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    pin.addEventListener("pointerup", end);
    pin.addEventListener("pointercancel", end);
    // A plain click (no drag) re-enters placing for this repair.
    pin.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!moved) startPlacing(rid);
    });
    return pin;
  }

  // --- Worksheet ----------------------------------------------------------
  function renderWorksheet(): void {
    clear(worksheetEl);
    const { garment, repairs, spots } = estimate.get();

    if (repairs.length === 0) {
      worksheetEl.appendChild(h("p.worksheet__empty", {}, S.estimator.emptyWorksheet));
    } else {
      const list = h("ul.worksheet__list");
      repairs.forEach((rid, i) => {
        const price = garment ? priceOf(rid, garment) : null;
        const placed = !!spots[rid];
        const line = h(
          "li.worksheet__line",
          {},
          h("span.worksheet__num.num", {}, String(i + 1)),
          h("div.worksheet__line-main", {},
            h("span.worksheet__line-name", {}, repairById(rid).label),
            h(
              "button.worksheet__place",
              {
                type: "button",
                onclick: () => startPlacing(rid),
              },
              placed ? S.estimator.placedChange : S.estimator.placeAction,
            ),
          ),
          h("span.worksheet__line-price.num", {}, price != null ? fmtEur(price) : "—"),
          h(
            "button.worksheet__remove",
            {
              type: "button",
              "aria-label": `${S.estimator.remove}: ${repairById(rid).label}`,
              onclick: () => toggleRepair(rid),
            },
            "✕",
          ),
        );
        line.classList.toggle("is-placed", placed);
        list.appendChild(line);
      });
      worksheetEl.appendChild(list);
    }

    totalPriceEl.textContent = fmtEur(currentTotal());
    const [lo, hi] = turnaroundFor(repairs);
    totalDaysEl.textContent = `${lo}–${hi} ${S.common.days}`;

    const empty = repairs.length === 0;
    ctaEl.classList.toggle("is-disabled", empty);
    ctaEl.setAttribute("aria-disabled", String(empty));
    ctaEl.textContent = empty ? S.estimator.ctaEmpty : S.estimator.cta;
  }

  ctaEl.addEventListener("click", (e) => {
    if (ctaEl.classList.contains("is-disabled")) e.preventDefault();
  });

  function renderAll(): void {
    renderPicker();
    renderTray();
    renderDesk();
    renderWorksheet();
  }

  // --- Desk click = place the active repair -------------------------------
  const dropZone = h("div.desk__drop", {}, deskSvgWrap, markerLayer);
  dropZone.addEventListener("click", (e) => {
    if (!placing || !estimate.get().garment) return;
    const rect = dropZone.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width);
    const y = clamp((e.clientY - rect.top) / rect.height);
    const rid = placing;
    estimate.setSpot(rid, { x, y });
    placing = null;
    renderDesk();
    renderWorksheet();
    announce(`${repairById(rid).label}: ${S.estimator.placedOk}`);
  });

  const desk = h(
    "div.desk",
    {},
    h("div.desk__mat", {}, dropZone),
    deskHint,
  );

  const left = h(
    "div.est__left",
    {},
    h("div.est__block", {},
      h("h2.est__step.spec", {}, S.estimator.step1),
      h("p.est__step-hint", {}, S.estimator.garmentHint),
      garmentPickerEl,
    ),
    desk,
  );

  const worksheet = h(
    "aside.worksheet",
    { "aria-label": S.estimator.worksheetTitle },
    h("h2.est__step.spec", {}, S.estimator.step2),
    h("div.est__step-spacer", { "aria-hidden": "true" }),
    trayEl,
    h("div.worksheet__panel", {},
      h("h3.worksheet__title", {}, S.estimator.worksheetTitle),
      worksheetEl,
      h("div.worksheet__totals", {},
        h("div.worksheet__total", {},
          h("span.worksheet__total-label.spec", {}, S.common.estimate),
          totalPriceEl,
        ),
        h("div.worksheet__eta", {},
          h("span.worksheet__eta-label.spec", {}, S.common.turnaround),
          totalDaysEl,
        ),
      ),
      h("p.worksheet__note", {}, S.estimator.estimateNote),
      ctaEl,
    ),
  );

  const root = h("div.est__stage", {}, left, worksheet, live);
  renderAll();
  return root;
}
