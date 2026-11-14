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

export function isGlobalExampleQuery(query) {
  return /^(?:example\s*)?#?\d{1,3}(?:\s*[—–:-].*)?$/i.test(String(query).trim());
}

export function matchGlobalExample(entries, query) {
  const match = String(query).trim().match(/^(?:example\s*)?#?(\d{1,3})(?:\s*[—–:-].*)?$/i);
  if (!match || !Array.isArray(entries)) return null;
  const number = Number(match[1]);
  return entries.find(entry => Number(String(entry?.file ?? "").match(/^(\d+)-/)?.[1]) === number) ?? null;
}
