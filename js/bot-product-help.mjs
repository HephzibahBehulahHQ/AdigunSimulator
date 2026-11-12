import { MANUFACTURER_PART_RECORDS } from "./part-catalogue.mjs";

const LOCALES = Object.freeze({
  en: {
    breadboard: "Switched to Breadboard. The physical map uses generic placement rules and reports when a part has no supported package drawing.",
    schematic: "Switched to Schematic. This is a shared-net educational view, not a standards-complete schematic editor.",
    pcb: "Switched to PCB. Only stored board data is shown; routing and checks are bounded educational tools, not manufacturing approval.",
    start: "Choose an example in the top selector and select Load example, or choose New Project for a blank design. Save keeps a copy in this browser; File → Export downloads a project file.",
    simulation: "Select an analysis mode in Properties → Simulation, then run the calculation. Results identify their supported model and limits; AdigunSimulator is not a general SPICE replacement.",
    saving: "Save stores the project in this browser. Use File → Export for a downloadable project file. Accounts and cloud synchronization are unavailable.",
    library: "Search the Components panel. Starter parts are generic educational models; manufacturer evidence records are separate, and candidates are not verified parts.",
    bot: "Adigun BOT is a local co-pilot grounded in this project and checked-in library data. It can explain wiring, flag supported findings, and offer reviewed previews; it never edits or saves without your action.",
    language: "Use the compact language selector in the upper-right to choose English (EN), German (DE), Yorùbá (YO), or Nigerian Pidgin (PCM).",
    unknown: "I can help with the editor, simulation limits, parts, saving, languages, or this circuit's wiring. What are you trying to build, or which task should I help with?"
  },
  de: {
    breadboard: "Zur Steckbrettansicht gewechselt. Die physische Zuordnung nutzt generische Platzierungsregeln und meldet nicht unterstützte Gehäuse.",
    schematic: "Zur Schaltplanansicht gewechselt. Dies ist eine gemeinsame Netzansicht zu Lernzwecken, kein normgerechter Schaltplaneditor.",
    pcb: "Zur Leiterplattenansicht gewechselt. Es werden nur gespeicherte Leiterplattendaten angezeigt; Routing und Prüfungen sind begrenzte Lernwerkzeuge und keine Fertigungsfreigabe.",
    start: "Wähle oben ein Beispiel und dann Beispiel laden oder Neues Projekt für einen leeren Entwurf. Speichern legt eine Kopie in diesem Browser ab; Datei → Exportieren lädt eine Projektdatei herunter.",
    simulation: "Wähle unter Eigenschaften → Simulation einen Analysemodus und starte die Berechnung. Ergebnisse nennen Modell und Grenzen; AdigunSimulator ersetzt kein allgemeines SPICE.",
    saving: "Speichern legt das Projekt in diesem Browser ab. Datei → Exportieren lädt eine Projektdatei herunter. Konten und Cloud-Synchronisierung sind nicht verfügbar.",
    library: "Durchsuche die Komponentenansicht. Starterteile sind generische Lernmodelle; Herstellerbelege sind getrennt und Kandidaten gelten nicht als verifizierte Teile.",
    bot: "Adigun BOT ist ein lokaler Co-Pilot auf Basis dieses Projekts und der enthaltenen Bibliothek. Er erklärt Verbindungen, meldet unterstützte Befunde und bietet geprüfte Vorschauen; ohne deine Aktion ändert oder speichert er nichts.",
    language: "Wähle oben rechts Englisch (EN), Deutsch (DE), Yorùbá (YO) oder Nigerianisches Pidgin (PCM).",
    unknown: "Ich kann beim Editor, bei Simulationsgrenzen, Bauteilen, Speichern, Sprachen oder bei der Verdrahtung dieses Projekts helfen. Was möchtest du bauen oder welche Aufgabe soll ich übernehmen?"
  },
  yo: {
    breadboard: "Mo ti ṣí ìwò Breadboard. Ó ń lo ìlànà ìgbékalẹ̀ gbogbogbò, yóò sì sọ fún ọ tí package kò bá ní àwòrán tó ṣe atilẹyin.",
    schematic: "Mo ti ṣí ìwò Schematic. Èyí jẹ́ ìwò net fún ẹ̀kọ́, kì í ṣe olootu schematic tó pé nípa àwọn ìlànà.",
    pcb: "Mo ti ṣí ìwò PCB. A ń fi data board tó wà nìkan hàn; routing àti checks jẹ́ irinṣẹ́ ẹ̀kọ́ tó ní ààlà, kì í ṣe ìfọwọ́sí iṣẹ́ iṣelọpọ.",
    start: "Yan àpẹẹrẹ lókè kí o tẹ Load example, tàbí yan New Project fún iṣẹ́ òfo. Save máa ń tọ́jú ẹ̀dà sínú browser yìí; File → Export máa ń gba fáìlì iṣẹ́ kalẹ̀.",
    simulation: "Yan analysis mode ní Properties → Simulation, lẹ́yìn náà ṣiṣẹ́ iṣirò náà. Abajade máa ń sọ model àti ààlà rẹ̀; AdigunSimulator kì í ṣe àropò SPICE gbogbogbò.",
    saving: "Save máa ń tọ́jú iṣẹ́ sínú browser yìí. Lo File → Export láti gba fáìlì iṣẹ́ kalẹ̀. Account àti ìmúṣiṣẹpọ̀ cloud kò sí.",
    library: "Wa nínú Components. Starter parts jẹ́ àwọn awoṣe ẹ̀kọ́ gbogbogbò; ẹ̀rí olupese wà lọ́tọ̀, candidate kì í ṣe verified part.",
    bot: "Adigun BOT jẹ́ olùrànlọ́wọ́ agbègbè tó dá lórí iṣẹ́ yìí àti data library tó wà. Ó lè ṣàlàyé wiring, tọ́ka sí ìṣòro tó mọ̀, kí ó sì fún ọ ní preview; kò ní yí ohunkóhun padà tàbí save láìsí ìgbésẹ̀ rẹ.",
    language: "Lo language selector lókè ọ̀tún láti yan English (EN), German (DE), Yorùbá (YO), tàbí Nigerian Pidgin (PCM).",
    unknown: "Mo lè ran ọ́ lọ́wọ́ pẹ̀lú editor, ààlà simulation, parts, fífi iṣẹ́ pamọ́, èdè, tàbí wiring iṣẹ́ yìí. Kí ni o fẹ́ kọ, tàbí iṣẹ́ wo ni kí n ràn ọ́ lọ́wọ́?"
  },
  pcm: {
    breadboard: "I don switch to Breadboard view. E dey use general placement rules and go show when part package no get supported drawing.",
    schematic: "I don switch to Schematic view. Na shared-net learning view be this, e no be standards-complete schematic editor.",
    pcb: "I don switch to PCB view. Na stored board data e dey show; routing and checks na bounded learning tools, no be manufacturing approval.",
    start: "Choose example for top selector and press Load example, or choose New Project for empty design. Save dey keep copy for this browser; File → Export go download project file.",
    simulation: "Choose analysis mode for Properties → Simulation, then run calculation. Result go show its model and limits; AdigunSimulator no be general SPICE replacement.",
    saving: "Save dey store project for this browser. Use File → Export to download project file. Account and cloud sync no dey available.",
    library: "Search inside Components panel. Starter parts na generic learning models; manufacturer evidence records dey separate, and candidates no be verified parts.",
    bot: "Adigun BOT na local co-pilot wey use this project and checked-in library data. E fit explain wiring, flag supported findings, and offer reviewed previews; e no go edit or save without your action.",
    language: "Use the small language selector for top-right to choose English (EN), German (DE), Yorùbá (YO), or Nigerian Pidgin (PCM).",
    unknown: "I fit help with the editor, simulation limits, parts, saving, languages, or wiring for this circuit. Wetin you dey try build, or which task make I help with?"
  }
});

const VIEW_PATTERNS = [
  ["breadboard", /\b(?:breadboard|physical board)\b/i],
  ["schematic", /\b(?:schematic|circuit diagram)\b/i],
  ["pcb", /\b(?:pcb|printed circuit board)\b/i]
];

const PART_LOOKUP_COPY = Object.freeze({
  en: { heading: "Checked-in manufacturer record for", manufacturer: "manufacturer not recorded", type: "type not recorded", package: "package", lifecycle: "lifecycle", evidence: "evidence status", simulation: "simulation status", candidate: "Candidate status means this is not a verified part.", otherStatus: "The checked-in ledger records status", notReviewed: "; this is not independent engineering approval.", integration: "This record does not establish integration into the simulator or model fidelity.", pins: "Pin-number map", sources: "Sources", noSources: "No manufacturer source URL is recorded." },
  de: { heading: "Herstellerdatensatz im enthaltenen Belegregister für", manufacturer: "Hersteller nicht erfasst", type: "Typ nicht erfasst", package: "Gehäuse", lifecycle: "Lebenszyklus", evidence: "Belegstatus", simulation: "Simulationsstatus", candidate: "Der Status candidate bedeutet: Dieses Bauteil ist nicht verifiziert.", otherStatus: "Das enthaltene Register führt den Status", notReviewed: "; dies ist keine unabhängige technische Freigabe.", integration: "Der Datensatz belegt weder die Integration in den Simulator noch die Modelltreue.", pins: "Pin-Nummern und Signale", sources: "Quellen", noSources: "Keine Herstellerquelle erfasst." },
  yo: { heading: "Àkọsílẹ̀ olupese tó wà nínú app fún", manufacturer: "a kò kọ olupese sílẹ̀", type: "a kò kọ irú apá sílẹ̀", package: "package", lifecycle: "ipo ìgbésí-ayé", evidence: "ipo ẹ̀rí", simulation: "ipo àfarawé", candidate: "Candidate túmọ̀ sí pé a kò tíì fìdí apá yìí múlẹ̀.", otherStatus: "Àkọsílẹ̀ tó wà nínú app sọ pé ipo rẹ̀ ni", notReviewed: "; èyí kì í ṣe ìfọwọ́sí ẹ̀rọ olómìnira.", integration: "Àkọsílẹ̀ yìí kò fi hàn pé a ti so apá náà mọ́ simulator tàbí pé awoṣe rẹ̀ péye.", pins: "Nọ́mbà pin àti àmì wọn", sources: "Orísun", noSources: "A kò kọ URL orísun olupese sílẹ̀." },
  pcm: { heading: "Manufacturer record wey dey inside app for", manufacturer: "manufacturer no dey for record", type: "type no dey for record", package: "package", lifecycle: "lifecycle", evidence: "evidence status", simulation: "simulation status", candidate: "Candidate mean say dem never verify this part.", otherStatus: "The ledger wey dey inside app list status", notReviewed: "; e no be independent engineering approval.", integration: "This record no prove say simulator don integrate the part or say the model accurate.", pins: "Pin number and signal map", sources: "Sources", noSources: "No manufacturer source URL dey for the record." }
});

function normalizedPartQuery(value) {
  return String(value ?? "").toLocaleLowerCase().replace(/[^a-z0-9]/g, "");
}

function findManufacturerPartInQuestion(query) {
  const normalized = normalizedPartQuery(query);
  if (!normalized) return null;
  return MANUFACTURER_PART_RECORDS.find((record) => [record.manufacturerPartNumber, record.id]
    .filter(Boolean)
    .some((identifier) => normalized.includes(normalizedPartQuery(identifier)))) ?? null;
}

function answerManufacturerPartQuestion(query, locale) {
  const record = findManufacturerPartInQuestion(query);
  if (!record) return null;
  const copy = PART_LOOKUP_COPY[locale] ?? PART_LOOKUP_COPY.en;
  const packageName = record.packageEvidence?.package ?? record.package ?? "not recorded";
  const simulationStatus = record.modelStatus ?? record.simulationModel?.status ?? "not recorded";
  const productUrl = record.manufacturerSources?.find((source) => /manufacturer-(?:product|orderable-part)-page/.test(source.kind))?.url;
  const datasheetUrl = record.datasheet?.url;
  const pinMap = Object.entries(record.symbolPinMap ?? {}).map(([pin, signal]) => `${pin} → ${signal}`).join(", ");
  const pinDetails = /\b(?:pin|pinout|mapping)\b/i.test(query) && pinMap ? ` Pin-number map: ${pinMap}.` : "";
  const sources = [productUrl, datasheetUrl].filter(Boolean);
  const verification = record.verificationStatus === "candidate"
    ? copy.candidate
    : `${copy.otherStatus} ${record.verificationStatus ?? "not recorded"}${copy.notReviewed}`;
  return {
    action: "answer",
    answer: `${copy.heading} ${record.manufacturerPartNumber}: ${record.manufacturer ?? copy.manufacturer}; ${record.type ?? record.category ?? copy.type}; ${copy.package} ${packageName}; ${copy.lifecycle} ${record.lifecycle ?? "not recorded"}; ${copy.evidence} ${record.verificationStatus ?? "not recorded"}; ${copy.simulation} ${simulationStatus}. ${verification} ${copy.integration}${pinDetails ? ` ${copy.pins}: ${pinMap}.` : ""}${sources.length ? ` ${copy.sources}: ${sources.join("; ")}.` : ` ${copy.noSources}`}`
  };
}

export function answerBotProductQuestion(query, locale = "en") {
  const text = String(query ?? "").trim();
  if (!text) return null;
  const copy = LOCALES[locale] ?? LOCALES.en;
  if (/\b(?:show|open|switch(?: to)?|go to|display|view|how (?:do|can) i view|please open)\b/i.test(text)) {
    const target = VIEW_PATTERNS.find(([, pattern]) => pattern.test(text));
    if (target) return { action: "switch-view", view: target[0], answer: copy[target[0]] };
  }
  const manufacturerPartAnswer = answerManufacturerPartQuestion(text, locale);
  if (manufacturerPartAnswer) return manufacturerPartAnswer;
  if (/\b(?:start|begin|new project|example|sample project)\b/i.test(text)) return { action: "answer", answer: copy.start };
  if (/\b(?:pcb|printed circuit board)\b/i.test(text)) return { action: "answer", answer: copy.pcb };
  if (/\b(?:simulation|simulate|calculation|spice|analysis mode)\b/i.test(text)) return { action: "answer", answer: copy.simulation };
  if (/\b(?:save|saved|export|download|account|login|log in|sign in|cloud)\b/i.test(text)) return { action: "answer", answer: copy.saving };
  if (/\b(?:component|part library|parts|manufacturer|verified part|catalogue)\b/i.test(text)) return { action: "answer", answer: copy.library };
  if (/\b(?:adigun bot|co-pilot|copilot|assistant|ai)\b|\bwhat can you do\b|\bhow can you help\b/i.test(text)) return { action: "answer", answer: copy.bot };
  if (/\b(?:language|translate|translation|yoruba|yorùbá|pidgin)\b/i.test(text)) return { action: "answer", answer: copy.language };
  return null;
}

export function getBotQuestionClarification(locale = "en") {
  return (LOCALES[locale] ?? LOCALES.en).unknown;
}

export function isBotProjectGoalStatement(query) {
  return /^(?:my (?:project )?goal(?: is|:)|i(?:'m| am) trying to|i want to (?:build|make|create|design)|we(?:'re| are) building)\b/i.test(String(query ?? "").trim());
}

