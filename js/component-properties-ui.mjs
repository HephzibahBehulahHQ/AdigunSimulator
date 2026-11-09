import { componentFields, componentFieldValue } from "./component-edit.mjs";
const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const labels = {
  de: { "Description": "Beschreibung", "Identity": "Identität", "Resistance": "Widerstand", "Capacitance": "Kapazität", "Inductance": "Induktivität", "Voltage": "Spannung", "Unit": "Einheit", "Electrical model": "Elektrisches Modell", "Voltage rating (V)": "Nennspannung (V)", "Current rating (A)": "Nennstrom (A)", "Power rating (W)": "Nennleistung (W)", "Ratings (annotations)": "Nennwerte (Anmerkungen)", "Part number / model": "Teilenummer / Modell", "Manufacturer": "Hersteller", "Part notes": "Bauteilnotizen", "Part (user supplied)": "Bauteil (Benutzerangaben)", "Width": "Breite", "Height": "Höhe", "Rotation (°)": "Drehung (°)", "Schematic geometry (drawing units)": "Schaltplangeometrie (Zeichnungseinheiten)", "Custom annotations": "Eigene Anmerkungen", "Name": "Name", "Value": "Wert", "Add field": "Feld hinzufügen", "Remove field": "Feld entfernen", "Select a component on the canvas to edit its properties.": "Bauteil auf der Zeichenfläche auswählen, um seine Eigenschaften zu bearbeiten.", "Editing updates locally. Ratings, part identity and custom fields are user annotations, not verified specifications or simulation inputs.": "Änderungen gelten lokal. Nennwerte, Bauteildaten und eigene Felder sind Benutzerangaben, keine verifizierten Spezifikationen oder Simulationseingaben.", "Physical layout uses hole and pad constraints; schematic size controls are available in Schematic view.": "Physische Anordnung folgt Loch- und Padregeln; Symbolgrößen sind in der Schaltplanansicht editierbar." },
  yo: { "Description": "Àpèjúwe", "Identity": "Ìdánimọ̀", "Resistance": "Ìdènà", "Capacitance": "Capacitance", "Inductance": "Inductance", "Voltage": "Fólítéèjì", "Unit": "Ẹyọ", "Electrical model": "Àwòṣe iná", "Voltage rating (V)": "Ààlà fólítéèjì (V)", "Current rating (A)": "Ààlà ìṣàn (A)", "Power rating (W)": "Ààlà agbára (W)", "Ratings (annotations)": "Àwọn ààlà (àkọsílẹ̀)", "Part number / model": "Nọ́mbà ẹ̀yà / àwòṣe", "Manufacturer": "Olùpèsè", "Part notes": "Àkọsílẹ̀ ẹ̀yà", "Part (user supplied)": "Ẹ̀yà (láti ọ̀dọ̀ olùlò)", "Width": "Ìbú", "Height": "Gíga", "Rotation (°)": "Yíyí (°)", "Schematic geometry (drawing units)": "Ìwọ̀n àwòrán schematic", "Custom annotations": "Àkọsílẹ̀ àfikún", "Name": "Orúkọ", "Value": "Iye", "Add field": "Fi ààyè kún", "Remove field": "Yọ ààyè", "Select a component on the canvas to edit its properties.": "Yan ẹ̀yà lórí àwòrán láti ṣàtúnṣe àwọn ànímọ́ rẹ̀.", "Editing updates locally. Ratings, part identity and custom fields are user annotations, not verified specifications or simulation inputs.": "Àtúnṣe wà lórí ẹ̀rọ yìí. Àwọn ààlà, ìdánimọ̀ àti àkọsílẹ̀ jẹ́ ti olùlò; a kò tíì fìdí wọn múlẹ̀ fún simulation.", "Physical layout uses hole and pad constraints; schematic size controls are available in Schematic view.": "Ìtòlẹ́sẹẹsẹ ara tẹ̀lé ihò àti pad; ṣàtúnṣe ìwọ̀n àwòrán nínú Schematic." },
  pcm: { "Description": "Description", "Identity": "Part identity", "Resistance": "Resistance", "Capacitance": "Capacitance", "Inductance": "Inductance", "Voltage": "Voltage", "Unit": "Unit", "Electrical model": "Electrical model", "Voltage rating (V)": "Voltage rating (V)", "Current rating (A)": "Current rating (A)", "Power rating (W)": "Power rating (W)", "Ratings (annotations)": "Ratings (your notes)", "Part number / model": "Part number / model", "Manufacturer": "Who make am", "Part notes": "Part notes", "Part (user supplied)": "Part (wetin user enter)", "Width": "Width", "Height": "Height", "Rotation (°)": "Turn angle (°)", "Schematic geometry (drawing units)": "Schematic size (drawing units)", "Custom annotations": "Your extra notes", "Name": "Name", "Value": "Value", "Add field": "Add field", "Remove field": "Remove field", "Select a component on the canvas to edit its properties.": "Select component for canvas to edit im properties.", "Editing updates locally. Ratings, part identity and custom fields are user annotations, not verified specifications or simulation inputs.": "Edit dey update for this device. Ratings, part identity and extra fields na your notes; dem no be verified specs or simulation inputs.", "Physical layout uses hole and pad constraints; schematic size controls are available in Schematic view.": "Physical layout follow hole and pad rules; change symbol size for Schematic view." }
};
export const propertyText = (text, locale) => labels[locale]?.[text] ?? text;

export function createComponentPropertiesUi({ form, getState, commit, customCommit }) {
  const extra = form.querySelector("#component-schema-fields"), empty = form.querySelector("#component-empty"), error = form.querySelector("#component-property-error");
  let signature = "", session = null;
  const component = () => { const state = getState(); return state.project.components.find(item => item.instanceId === state.selectedInstanceId); };
  const resetSession = () => { session = null; };
  function render() {
    const state = getState(), item = component(), text = s => propertyText(s, state.project.metadata.locale);
    empty.textContent = text("Select a component on the canvas to edit its properties.");
    empty.hidden = Boolean(item);
    form.querySelectorAll("[data-component-content]").forEach(node => { node.hidden = !item; });
    if (!item) { signature = ""; extra.innerHTML = ""; error.textContent = ""; return; }
    const fields = componentFields(item, state.activeView);
    const next = `${item.instanceId}|${state.activeView}|${state.project.metadata.locale}|${item.properties?.custom?.length ?? 0}|${fields.map(field=>field.key).join(",")}`;
    if (signature !== next) {
      signature = next; resetSession(); error.textContent = "";
      let section = "";
      extra.innerHTML = fields.map(field => {
        const heading = section !== field.section ? `<h3>${escape(text(field.section))}</h3>` : ""; section = field.section;
        const attributes = `data-component-field="${escape(field.key)}" aria-describedby="component-property-error"`;
        const input = field.type === "textarea" ? `<textarea ${attributes} rows="2" maxlength="4000"></textarea>` : field.type === "select" ? `<select ${attributes}>${field.options.map(option => `<option>${escape(option)}</option>`).join("")}</select>` : `<input ${attributes} type="${field.type}" ${field.type === "number" ? 'step="any"' : 'maxlength="4000"'}>`;
        return `${heading}<label>${escape(text(field.label))}${input}</label>`;
      }).join("") + (state.activeView === "schematic" ? "" : `<p>${escape(text("Physical layout uses hole and pad constraints; schematic size controls are available in Schematic view."))}</p>`) + `<h3>${escape(text("Custom annotations"))}</h3><div class="custom-property-list">${(item.properties?.custom ?? []).map((row, index) => `<div class="custom-property-row"><input data-custom-key="${index}" aria-label="${escape(text("Name"))} ${index + 1}" maxlength="64"><input data-custom-value="${index}" aria-label="${escape(text("Value"))} ${index + 1}" maxlength="4000"><button type="button" data-custom-remove="${index}" aria-label="${escape(text("Remove field"))} ${index + 1}">×</button></div>`).join("")}</div><button type="button" data-custom-add>${escape(text("Add field"))}</button><p class="property-note">${escape(text("Editing updates locally. Ratings, part identity and custom fields are user annotations, not verified specifications or simulation inputs."))}</p>`;
    }
    form.querySelectorAll("[data-component-field]").forEach(input => {
      if (input !== form.ownerDocument.activeElement) input.value = String(componentFieldValue(item, input.dataset.componentField));
    });
    for (const [index, row] of (item.properties?.custom ?? []).entries()) for (const key of ["key", "value"]) {
      const input = extra.querySelector(`[data-custom-${key}="${index}"]`);
      if (input !== form.ownerDocument.activeElement) input.value = row[key];
    }
  }
  function apply(input) {
    const item = component(); if (!item) return;
    const key = input.dataset.componentField ?? (input.dataset.customKey !== undefined || input.dataset.customValue !== undefined ? "custom" : null);
    if (!key) return;
    try {
      const group = `${item.instanceId}:${key}`;
      if (key === "custom") {
        const rows = [...extra.querySelectorAll("[data-custom-key]")].map(node => ({ key: node.value, value: extra.querySelector(`[data-custom-value="${node.dataset.customKey}"]`).value }));
        customCommit(item.instanceId, rows, session !== group);
      } else commit(item.instanceId, key, input.value, session !== group);
      session = group; input.removeAttribute("aria-invalid"); error.textContent = ""; render();
    } catch (failure) { input.setAttribute("aria-invalid", "true"); error.textContent = failure.message; }
  }
  form.addEventListener("input", event => apply(event.target));
  form.addEventListener("change", event => { if (event.target.tagName === "SELECT") apply(event.target); });
  form.addEventListener("focusout", resetSession);
  form.addEventListener("click", event => {
    const add = event.target.closest("[data-custom-add]"), remove = event.target.closest("[data-custom-remove]");
    if (!add && !remove) return;
    const item = component(); if (!item) return;
    const rows = [...(item.properties?.custom ?? [])];
    if (add) { let index = 1; while (rows.some(row => row.key === `field${index}`)) index++; rows.push({ key: `field${index}`, value: "" }); }
    else rows.splice(Number(remove.dataset.customRemove), 1);
    try { customCommit(item.instanceId, rows, true); signature = ""; render(); } catch (failure) { error.textContent = failure.message; }
  });
  return { render, resetSession };
}
