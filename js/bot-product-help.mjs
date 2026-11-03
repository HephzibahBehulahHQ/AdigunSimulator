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

export function answerBotProductQuestion(query, locale = "en") {
  const text = String(query ?? "").trim();
  if (!text) return null;
  const copy = LOCALES[locale] ?? LOCALES.en;
  if (/\b(?:show|open|switch(?: to)?|go to|display|view|how (?:do|can) i view|please open)\b/i.test(text)) {
    const target = VIEW_PATTERNS.find(([, pattern]) => pattern.test(text));
    if (target) return { action: "switch-view", view: target[0], answer: copy[target[0]] };
  }
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

