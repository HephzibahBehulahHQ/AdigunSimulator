/** Form menus stay open until their operation succeeds and the mouse leaves. */
export function dismissMenuCommand(target) {
  const menu = target.closest?.(".app-menu-popover")?.closest("details");
  if (menu && menu.dataset.menuDismiss !== "after-use" && target.closest("button, a[href]")) menu.open = false;
}

/** Native details retain click-to-open, Escape, outside-click and touch behavior. */
export function attachMenuDismissal(menus, { onActiveChange = () => {}, schedule = setTimeout, cancel = clearTimeout, delay = 200 } = {}) {
  const cleanups = [], pending = new Map(), completed = new Set(), outside = new Set();
  const clear = menu => { if (pending.has(menu)) { cancel(pending.get(menu)); pending.delete(menu); } };
  const report = () => onActiveChange(menus.findIndex(menu => menu.open) < 0 ? null : menus.findIndex(menu => menu.open));
  const deferred = menu => ["after-use", "form"].includes(menu.dataset?.menuDismiss);
  const dismiss = menu => {
    clear(menu);
    if (!menu.open || !outside.has(menu) || (deferred(menu) && !completed.has(menu))) return;
    pending.set(menu, schedule(() => { pending.delete(menu); menu.open = false; report(); }, delay));
  };
  menus.forEach(menu => {
    const enter = () => { clear(menu); outside.delete(menu); };
    const leave = event => {
      if (event.pointerType !== "mouse") return;
      outside.add(menu); dismiss(menu);
    };
    const edit = event => {
      if (deferred(menu) && event.target?.closest?.("select, input, textarea")) { completed.delete(menu); clear(menu); }
    };
    const toggle = () => {
      clear(menu); completed.delete(menu); outside.delete(menu);
      if (menu.open) menus.forEach(other => { if (other !== menu) { clear(other); other.open = false; } });
      report();
    };
    for (const [name, listener] of [["pointerenter", enter], ["focusin", enter], ["pointerleave", leave], ["toggle", toggle], ["pointerdown", edit], ["change", edit]]) {
      menu.addEventListener(name, listener);
      cleanups.push(() => menu.removeEventListener(name, listener));
    }
  });
  return {
    complete: menu => { if (menus.includes(menu) && menu.open) { completed.add(menu); dismiss(menu); } },
    clearPending: () => menus.forEach(clear),
    dispose: () => { menus.forEach(clear); completed.clear(); outside.clear(); cleanups.forEach(cleanup => cleanup()); }
  };
}
