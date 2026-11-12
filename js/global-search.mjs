export function searchGlobalActions(actions, query = "") {
  const terms = String(query).trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return actions.filter((action) => {
    const searchableText = [action.label, action.keywords].filter(Boolean).join(" ").toLocaleLowerCase();
    return terms.every((term) => searchableText.includes(term));
  });
}

export function isGlobalSearchShortcut(event) {
  return Boolean((event.ctrlKey || event.metaKey) && !event.altKey && String(event.key).toLowerCase() === "k");
}
