/** Mouse-only grace period; native details and click-outside handling retain keyboard/touch behavior. */
export function attachMenuDismissal(menus, { onActiveChange = () => {}, schedule = setTimeout, cancel = clearTimeout, delay = 200 } = {}) {
  const cleanups = [], pending = new Map();
  const clear = menu => { if (pending.has(menu)) { cancel(pending.get(menu)); pending.delete(menu); } };
  const report = () => onActiveChange(menus.findIndex(menu => menu.open) < 0 ? null : menus.findIndex(menu => menu.open));
  menus.forEach(menu => {
    const enter = () => clear(menu);
    const leave = event => {
      clear(menu);
      if (event.pointerType !== "mouse" || !menu.open) return;
      pending.set(menu, schedule(() => { pending.delete(menu); menu.open = false; report(); }, delay));
    };
    const toggle = () => {
      clear(menu);
      if (menu.open) menus.forEach(other => { if (other !== menu) { clear(other); other.open = false; } });
      report();
    };
    for (const [name, listener] of [["pointerenter", enter], ["focusin", enter], ["pointerleave", leave], ["toggle", toggle]]) {
      menu.addEventListener(name, listener);
      cleanups.push(() => menu.removeEventListener(name, listener));
    }
  });
  return { clearPending: () => menus.forEach(clear), dispose: () => { menus.forEach(clear); cleanups.forEach(cleanup => cleanup()); } };
}
