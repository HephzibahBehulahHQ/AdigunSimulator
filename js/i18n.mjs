Warning: truncated output (original token count: 63936)
Total output lines: 1203

export const UI_LOCALES = Object.freeze(["en", "de", "yo", "pcm"]);

export const UI_KEYS = Object.freeze([
  "skipToWorkspace", "searchGlobal", "theme", "help", "simulationMenu", "pcbMenu", "runPcbChecks", "exportPcbFiles", "toolsMenu", "fileMenu", "editMenu", "helpMenu", "implementationStatus", "implementationStatusBody", "exampleSelector", "examplePickerHelp", "exampleReversePolarity", "exampleSurgeProtectedInput", "exampleSingleSidedLedPcb", "example555TimerPcb", "exampleOpAmpFilterPcb", "exampleArduinoShield", "exampleUsbCBreakout", "exampleBme280Breakout", "exampleRelayModulePcb", "exampleAudioAmplifierPcb", "exampleBuckConverterPcb", "exampleFourLayerMcuPlan", "exampleUsbDifferentialPair", "exampleQfnFootprintValidation", "exampleBgaEscapeConcept", "examplePanelMountController", "exampleMcuTestPointCoverage", "exampleManufacturingExportPack", "exampleAssemblyVariantBoard", "exampleNetClassRuleDemo", "exampleCopperZoneDemo", "examplePcbSchematicReconciliation", "exampleDcVoltmeterUse", "exampleDcAmmeterUse", "exampleOscilloscopeTrigger", "exampleTwoChannelPhase", "exampleLogicAnalyzerCapture", "exampleFrequencyCounter", "exampleRcBodePlot", "exampleRlcTransientResponse", "exampleParameterSweep", "exampleMonteCarloTolerance", "exampleThermalWarningBoundary", "exampleConvergenceFailureStudy", "exampleFloatingNodeDiagnosis", "exampleShortCircuitDiagnosis", "exampleMissingGroundDiagnosis", "exampleModelUnavailableDiagnosis", "exampleNetProbeCrossProbe", "exampleComponentPropertyAudit", "exportSimulationReport", "exampleSimulationReportExport", "verifyRunLock", "exampleReproducibleRunLockfile", "examplePlcStartStopMotorConcept", "examplePlcTrafficLight", "examplePlcTankLevelController", "examplePlcConveyorCounter", "examplePlcStarDeltaStarter", "examplePlcForwardReverseMotor", "examplePlcEmergencyStopConcept", "examplePlcDoorInterlockConcept", "exampleTemperatureAlarm", "exampleWaterLeakAlarm", "exampleFanThermostat", "examplePwmFanController", "exampleAutomaticNightLight", "exampleSmartIrrigation", "exampleGarageDoorConcept", "exampleElevatorCallQueue", "exampleFireAlarmZone", "exampleAccessStrikeLock", "exampleWarehouseBeacon", "exampleMachineFaultAnnunciator", "exampleBreadboardSchematicSync", "exampleSchematicPcbSync", "exampleThreeViewLedProject", "exampleUnsupportedBreadboardPackage", "exampleMissingFootprintWorkflow", "examplePinIncompatibleSubstitution", "exampleUnitConversionCalculator", "exampleResistorColorCodeReader", "exampleLedResistorCalculator", "exampleVoltageDividerCalculator", "exampleRcTimingCalculator", "exampleOpAmpGainCalculator", "examplePcbTraceWidthAdvisor", "exportBomCsv", "exampleBomExportCostPlaceholder", "exampleBotExplainComponent", "botGroundedMode", "botGroundedPrivacy", "botExplainPlaceholder", "botExplainButton", "botResponseDefault", "botRepairApply", "exampleBotFloatingNodeRepair", "botProposalApply", "exampleBotCircuitProposal", "exampleFourLanguageUiSweep", "exampleLocalOfflineRecovery", "exampleReleaseCandidateE2E", "exampleHotSwapProtection", "exampleElectronicLoad", "exampleInverterWaveform", "exampleUpsTransfer", "exampleSsrAcSwitch", "exampleTriacAcDimmer", "exampleIgbtInverterLeg", "workspaceNotes", "modelNotes",
  "corporateLogoAlt", "corporateWebsite", "documentation", "support", "personalProfile", "allRightsReserved", "officialLinks", "linkedinPersonalProfile", "productTagline",
  "newProject", "import", "validate", "validation", "undo", "redo", "open", "save", "export", "components", "properties",
  "searchLibrary", "libraryNotice", "componentCategories", "allComponents", "powerGround", "passive",
  "starterLibraryMode", "manufacturerEvidenceMode", "componentCatalogueLabel", "searchManufacturerParts", "evidenceLibraryNotice", "candidateStatus", "verifiedStatus", "packageUnknown", "lifecycleLabel", "simulationLabel", "reviewBlockersLabel", "humanReviewRequired", "openDatasheet", "noManufacturerMatches", "none", "unknown",
  "active", "inputs", "instruments", "connectors", "protection", "sensors", "selectComponent", "noPartSelected", "libraryHelp",
  "addToProject", "breadboard", "schematic", "pcb", "select", "pan", "zoomOut", "zoomIn", "snap",
  "grid", "simulationOutput", "errors", "warnings", "component", "project", "simulation", "type",
  "reference", "value", "libraryStatus", "applyProperties", "projectName", "locale", "applyProject",
  "simulationControl", "availableAnalysis", "runCalculation", "stopSimulation", "simulationLimit",
  "runValidation", "validationHelp", "botAssistant", "botUnavailable", "botPrivacy", "botPlaceholder",
  "close", "collapseLibrary", "collapseProperties", "maximizeSchematic", "maximizePcb",
  "releasedExamples", "examplePwmLedDimmer", "exampleBatteryDischargeMonitor", "exampleLinearSupply", "exampleUsbLed", "exampleSolarGardenLight", "exampleSupercapHoldUp", "examplePassiveToneControl", "exampleBridgeRectifier", "exampleSmoothingCapacitor", "exampleZenerShuntRegulator", "exampleTvsSurgeClamp", "exampleNtcTemperatureDivider", "exampleLdrNightLight", "exampleNe555Astable", "exampleNe555Monostable", "exampleNe556DualTimer", "exampleOpAmpNonInverting", "exampleOpAmpInverting", "exampleOpAmpVoltageFollower", "exampleComparatorThreshold", "exampleSchmittTrigger", "exampleWindowComparator", "exampleReferenceBuffer", "exampleNpnCommonEmitter", "exampleEmitterFollower", "exampleNmosLowSide", "examplePmosHighSide", "exampleNpnRelayDriver", "exampleHbridgeMotor", "exampleElectretAudioPreamp", "exampleAudioPowerAmplifier", "exampleActiveLowPass", "exampleWienOscillator", "exampleAndGate", "exampleOrGate", "exampleXorParity", "exampleSrLatchNor", "exampleDFlipFlop", "exampleJkToggleDivider", "exampleFourBitCounter", "exampleBcdDisplay", "exampleTrafficLightFsm", "exampleDebouncedInput", "exampleShiftRegisterChaser", "exampleMultiplexerSelector", "exampleDecoderLeds", "examplePriorityEncoder", "exampleAluAddSubtract", "exampleUartTransmitter", "exampleUartReceiver", "exampleI2cSensorRead", "exampleSpiDisplay", "exampleEepromDataLogger", "exampleArduinoBlink", "exampleArduinoButtonDebounce", "exampleArduinoPwmDimmer", "exampleArduinoTemperatureMonitor", "exampleArduinoUltrasonicRanger", "exampleArduinoServoControl", "exampleArduinoStepperDriver", "exampleEsp32TelemetryMock", "examplePicoAdcVoltmeter", "exampleStm32TimerPwm", "examplePicAdcBargraph", "exampleAvrIrReceiver", "exampleMcuWatchdog", "exampleCanNodePair", "exampleRs485SensorNetwork", "exampleGpsNmeaDisplay", "exampleRfidAccessReader", "exampleNfcUidDisplay", "exampleEepromRingLogger", "exampleLowPowerSleepWake", "exampleBleBeaconConfiguration", "exampleLoraSensorNode", "exampleGsmAlarmNotifier", "exampleWifiRelayController", "exampleEthernetSensorNode", "exampleIrRemoteActions", "exampleFmFrontEnd", "exampleRfidInventory", "exampleI2cLevelShifter", "exampleUsbUartConsole", "exampleElectretMicMeter", "exampleAudioToneGenerator", "exampleGuitarPedalBuffer", "exampleSimpleAudioMixer", "examplePwmAudioDac", "exampleDigitalVolumeControl", "exampleRgbLedController", "exampleOledStatusPanel", "exampleEpaperDisplayUpdater", "exampleSevenSegmentClock", "exampleBuckConverter", "exampleBoostConverter", "exampleBuckBoostSupply", "exampleLiionCharger", "exampleBmsCellMonitor", "exampleSolarMppSweep", "exampleUsbCSink", "exampleUsbCSource", "examplePoePdInput", "exampleCcLedDriver", "exampleMosfetHalfBridge", "loadTestedStarter", "loadSelectedExample", "morePlannedExamples", "electricalConnections", "firstPin", "secondPin", "connectPins", "noConnectedNets", "disconnect", "removeComponent"
, "breadboardEditor", "breadboardComponentPin", "breadboardHole", "breadboardAssignPin", "breadboardJumperFrom", "breadboardJumperTo", "breadboardAddJumper", "breadboardComplete", "breadboardBlocked", "breadboardIncomplete", "breadboardMappedPins", "breadboardJumpers", "breadboardRemovePlacement", "breadboardNoPlacements", "breadboardRemoveJumper", "breadboardNoJumpers", "breadboardInvalidHole", "breadboardUnknownPin", "breadboardInvalidJumper", "breadboardPhysicalMapLabel", "breadboardNoPhysicalMapLabel", "breadboardPackageNote", "breadboardSyncReview", "breadboardSyncApply", "breadboardSyncDefault", "breadboardSyncReady", "breadboardSyncDiff", "breadboardSyncMerged", "breadboardSyncSplit", "breadboardSyncStale", "breadboardSyncBlocked", "breadboardSyncNoNets", "breadboardClickPlace", "breadboardSelectPinFirst", "breadboardPlacementActive", "schematicWireMode", "schematicWireStart", "schematicWireNext", "schematicWireFailed", "pcbStoredLayoutPreview", "pcbNoFootprintData", "pcbMoveOutOfBounds", "pcbMoveNoFootprint", "pcbMoveComplete", "pcbFootprintProperties", "pcbFootprintPackage", "pcbFootprintPosition", "pcbFootprintPadCount", "pcbFootprintRouteCount", "pcbRoute", "pcbRouteAria", "pcbRouteStart", "pcbRouteWaypoint", "pcbRouteReady", "pcbRouteDifferentNet", "pcbRouteBlocked", "pcbRouteComplete"]);

export const TRANSLATIONS = Object.freeze({
  en: {
    skipToWorkspace: "Skip to workspace", searchGlobal: "Search components, tools, or help…", theme: "Switch colour theme", help: "Open implementation status", simulationMenu: "Simulation", pcbMenu: "PCB", toolsMenu: "Tools",
    newProject: "New Project", import: "Import", validate: "Validate", validation: "Validation", undo: "Undo", redo: "Redo", open: "Open", save: "Save", export: "Export", components: "Components", properties: "Properties",
    searchLibrary: "Search starter library…", libraryNotice: "Starter generic library — not the verified 1,000-part catalogue.", componentCategories: "Component categories", allComponents: "All Components", powerGround: "Power & Ground", passive: "Passive", active: "Active", inputs: "Inputs", instruments: "Instruments", connectors: "Connectors", selectComponent: "Select a component", noPartSelected: "No part selected", libraryHelp: "Search the available starter library.", addToProject: "Add to project", starterLibraryMode: "Starter parts", manufacturerEvidenceMode: "Manufacturer evidence", componentCatalogueLabel: "Component catalogue mode", searchManufacturerParts: "Search manufacturer parts…", evidenceLibraryNotice: "Part evidence records are browsable here. Candidates remain unverified and cannot be simulated or added to a project.", candidateStatus: "Candidate · unverified", verifiedStatus: "Verified", packageUnknown: "Package not recorded", lifecycleLabel: "Lifecycle", simulationLabel: "Simulator model", reviewBlockersLabel: "Evidence blockers", humanReviewRequired: "Human review and sign-off required", openDatasheet: "Open manufacturer datasheet", noManufacturerMatches: "No part records match this search.", none: "None", unknown: "Unknown",
    breadboard: "Breadboard View", schematic: "Schematic View", pcb: "PCB View", select: "Select", pan: "Pan", zoomOut: "Zoom out", zoomIn: "Zoom in", snap: "Snap", grid: "Grid", simulationOutput: "Simulation Output", errors: "Errors", warnings: "Warnings", component: "Component", project: "Project", simulation: "Simulation", type: "Type", reference: "Reference", value: "Value", libraryStatus: "Library status", applyProperties: "Apply properties", projectName: "Project name", locale: "Locale", applyProject: "Apply project settings", simulationControl: "Simulation Control", availableAnalysis: "Available analyses: LED current limiter and unloaded two-resistor voltage divider.", runCalculation: "Run calculation", stopSimulation: "Stop", simulationLimit: "General SPICE, digital and mixed-signal engines are not implemented yet.", runValidation: "Run validation", validationHelp: "Run validation to inspect project issues.", botAssistant: "Your AI engineering assistant", botUnavailable: "Not configured.", botPrivacy: "This local foundation does not connect to an AI service or send project data externally.", botPlaceholder: "AI service not configured", close: "Close", collapseLibrary: "Collapse component library", collapseProperties: "Collapse properties", maximizeSchematic: "Maximize schematic view", maximizePcb: "Maximize PCB view"
  },
  de: {
    skipToWorkspace: "Zum Arbeitsbereich springen", searchGlobal: "Bauteile, Werkzeuge oder Hilfe suchen…", theme: "Farbschema wechseln", help: "Umsetzungsstatus öffnen", simulationMenu: "Simulation", pcbMenu: "Leiterplatte", toolsMenu: "Werkzeuge",
    newProject: "Neues Projekt", import: "Importieren", validate: "Prüfen", validation: "Prüfung", undo: "Rückgängig", redo: "Wiederholen", open: "Öffnen", save: "Speichern", export: "Exportieren", components: "Bauteile", properties: "Eigenschaften",
    searchLibrary: "Starter-Bibliothek durchsuchen…", libraryNotice: "Generische Starter-Bibliothek — nicht der verifizierte Katalog mit 1.000 Teilen.", componentCategories: "Bauteilkategorien", allComponents: "Alle Bauteile", powerGround: "Versorgung & Masse", passive: "Passiv", active: "Aktiv", inputs: "Eingänge", instruments: "Messgeräte", connectors: "Steckverbinder", selectComponent: "Bauteil auswählen", noPartSelected: "Kein Bauteil ausgewählt", libraryHelp: "Die verfügbare Starter-Bibliothek durchsuchen.", addToProject: "Zum Projekt hinzufügen", starterLibraryMode: "Starterbauteile", manufacturerEvidenceMode: "Herstellerbelege", componentCatalogueLabel: "Komponentenbibliothek-Modus", searchManufacturerParts: "Herstellerteile suchen…", evidenceLibraryNotice: "Bauteilnachweise sind hier einsehbar. Kandidaten sind nicht verifiziert und können weder simuliert noch zum Projekt hinzugefügt werden.", candidateStatus: "Kandidat · unverifiziert", verifiedStatus: "Verifiziert", packageUnknown: "Gehäuse nicht erfasst", lifecycleLabel: "Lebenszyklus", simulationLabel: "Simulationsmodell", reviewBlockersLabel: "Fehlende Nachweise", humanReviewRequired: "Menschliche Prüfung und Freigabe erforderlich", openDatasheet: "Herstellerdatenblatt öffnen", noManufacturerMatches: "Keine passenden Teileinträge gefunden.", none: "Keine", unknown: "Unbekannt",
    breadboard: "Steckbrett", schematic: "Schaltplan", pcb: "Leiterplatte", select: "Auswählen", pan: "Verschieben", zoomOut: "Verkleinern", zoomIn: "Vergrößern", snap: "Einrasten", grid: "Raster", simulationOutput: "Simulationsergebnis", errors: "Fehler", warnings: "Warnungen", component: "Bauteil", project: "Projekt", simulation: "Simulation", type: "Typ", reference: "Referenz", value: "Wert", libraryStatus: "Bibliotheksstatus", applyProperties: "Eigenschaften anwenden", projectName: "Projektname", locale: "Sprache", applyProject: "Projekteinstellungen anwenden", simulationControl: "Simulationssteuerung", availableAnalysis: "Verfügbare Analysen: LED-Strombegrenzer und unbelasteter Zwei-Widerstands-Spannungsteiler.", runCalculation: "Berechnung starten", stopSimulation: "Stopp", simulationLimit: "Allgemeine SPICE-, Digital- und Mixed-Signal-Engines sind noch nicht umgesetzt.", runValidation: "Prüfung starten", validationHelp: "Prüfung starten, um Projektprobleme anzuzeigen.", botAssistant: "Ihr KI-Engineering-Assistent", botUnavailable: "Nicht konfiguriert.", botPrivacy: "Diese lokale Grundlage verbindet sich mit keinem KI-Dienst und überträgt keine Projektdaten.", botPlaceholder: "KI-Dienst nicht konfiguriert", close: "Schließen", collapseLibrary: "Bauteilbibliothek einklappen", collapseProperties: "Eigenschaften einklappen", maximizeSchematic: "Schaltplan maximieren", maximizePcb: "Leiterplatte maximieren"
  },
  yo: {
    skipToWorkspace: "Fo sí ibi iṣẹ́", searchGlobal: "Wá ẹ̀yà, irinṣẹ́, tàbí ìrànlọ́wọ́…", theme: "Yí àwọ̀ ìṣàfihàn padà", help: "Ṣí ipò ìmúṣẹ", simulationMenu: "Ìṣàfihàn", pcbMenu: "PCB", toolsMenu: "Àwọn irinṣẹ́",
    newProject: "Iṣẹ́ tuntun", import: "Gbé wọlé", validate: "Ṣàyẹ̀wò", validation: "Àyẹ̀wò", undo: "Padà", redo: "Tún ṣe", open: "Ṣí", save: "Fipamọ́", export: "Gbé jáde", components: "Àwọn ẹ̀yà", properties: "Àwọn àbùdá",
    searchLibrary: "Wá nínú ilé-ìkàwé ìbẹ̀rẹ̀…", libraryNotice: "Ilé-ìkàwé àpẹẹrẹ ìbẹ̀rẹ̀ — kì í ṣe kátálọ́ọ̀gì ẹ̀yà 1,000 tí a ti fìdí rẹ̀ múlẹ̀.", componentCategories: "Ìsọ̀rí ẹ̀yà", allComponents: "Gbogbo ẹ̀yà", powerGround: "Agbára àti ilẹ̀", passive: "Ẹ̀yà aláìṣiṣẹ́", active: "Ẹ̀yà aláṣiṣẹ́", inputs: "Àwọn ìwọlé", instruments: "Ẹ̀rọ ìwọ̀n", connectors: "Àwọn asopọ", selectComponent: "Yan ẹ̀yà kan", noPartSelected: "A kò yan ẹ̀yà", libraryHelp: "Wá ilé-ìkàwé ìbẹ̀rẹ̀ tó wà.", addToProject: "Fi sí iṣẹ́", starterLibraryMode: "Àwọn ẹ̀yà ìbẹ̀rẹ̀", manufacturerEvidenceMode: "Ẹ̀rí olùṣelọpọ", componentCatalogueLabel: "Ipo kátálọ́ọ̀gì ẹ̀yà", searchManufacturerParts: "Wá ẹ̀yà olùṣelọpọ…", evidenceLibraryNotice: "O lè wo ẹ̀rí ẹ̀yà níbí. A kò tíì fìdí candidate múlẹ̀, a kò sì lè simulate tàbí fi í kún iṣẹ́.", candidateStatus: "Candidate · kò tíì ní ìfìdí", verifiedStatus: "A fìdí rẹ̀ múlẹ̀", packageUnknown: "A kò kọ package sílẹ̀", lifecycleLabel: "Ipò ìgbésí-ayé", simulationLabel: "Model simulator", reviewBlockersLabel: "Ẹ̀rí tó ṣì kù", humanReviewRequired: "Ìṣàyẹ̀wò ènìyàn àti ìfọwọ́sí ṣì pọndandan", openDatasheet: "Ṣí datasheet olùṣelọpọ", noManufacturerMatches: "Kò sí record ẹ̀yà tó bá ìwá yìí mu.", none: "Kò sí", unknown: "A kò mọ̀",
    breadboard: "Pátákó ìdánwò", schematic: "Àwòrán asopọ", pcb: "PCB", select: "Yàn", pan: "Gbé ìwò padà", zoomOut: "Dín ìfẹ̀sí kù", zoomIn: "Mú ìfẹ̀sí pọ̀", snap: "Mú mọ́ ìwọ̀n", grid: "Àwòkọ́sẹ̀", simulationOutput: "Ìtújáde ìṣàfihàn", errors: "Àṣìṣe", warnings: "Ìkìlọ̀", component: "Ẹ̀yà", project: "Iṣẹ́", simulation: "Ìṣàfihàn", type: "Irú", reference: "Ìtọ́kasí", value: "Iye", libraryStatus: "Ipò ilé-ìkàwé", applyProperties: "Lo àwọn àbùdá", projectName: "Orúkọ iṣẹ́", locale: "Èdè", applyProject: "Lo ìṣètò iṣẹ́", simulationControl: "Ìdarí ìṣàfihàn", availableAnalysis: "Ìṣirò tó wà: adín-ìṣàn LED àti voltage-divider olùtakò méjì tí a kò fi ẹrù kún un.", runCalculation: "Ṣe ìṣirò", stopSimulation: "Dúró", simulationLimit: "Ẹ̀rọ SPICE gbogbogbò, díjítàlì àti mixed-signal kò tíì wà.", runValidation: "Ṣe àyẹ̀wò", validationHelp: "Ṣe àyẹ̀wò láti rí ìṣòro nínú iṣẹ́.", botAssistant: "Olùrànlọ́wọ́ ẹ̀rọ AI rẹ", botUnavailable: "A kò ṣètò rẹ̀.", botPrivacy: "Ìpìlẹ̀ àgbègbè yìí kò so mọ́ iṣẹ́ AI, kò sì fi dátà iṣẹ́ ránṣẹ́ síta.", botPlaceholder: "A kò ṣètò iṣẹ́ AI", close: "Pa á", collapseLibrary: "Pa ilé-ìkàwé ẹ̀yà kúrò", collapseProperties: "Pa àwọn àbùdá kúrò", maximizeSchematic: "Mú àwòrán asopọ kún iboju", maximizePcb: "Mú PCB kún iboju"
  },
  pcm: {
    skipToWorkspace: "Go work area", searchGlobal: "Find parts, tools or help…", theme: "Change colour theme", help: "Open wetin don dey work", simulationMenu: "Simulation", pcbMenu: "PCB", toolsMenu: "Tools",
    newProject: "New Project", import: "Bring am enter", validate: "Check am", validation: "Validation", undo: "Undo am", redo: "Do am again", open: "Open", save: "Save", export: "Export", components: "Parts", properties: "Properties",
    searchLibrary: "Search starter library…", libraryNotice: "Starter generic library — no be verified 1,000-part catalogue.", componentCategories: "Part categories", allComponents: "All Parts", powerGround: "Power & Ground", passive: "Passive", active: "Active", inputs: "Inputs", instruments: "Meters", connectors: "Connectors", selectComponent: "Choose a part", noPartSelected: "No part don select", libraryHelp: "Search the starter library wey dey available.", addToProject: "Add am to project", starterLibraryMode: "Starter parts", manufacturerEvidenceMode: "Manufacturer evidence", componentCatalogueLabel: "Component catalogue mode", searchManufacturerParts: "Search manufacturer parts…", evidenceLibraryNotice: "You fit browse part evidence here. Candidates never verified, so you no fit simulate or add dem to project.", candidateStatus: "Candidate · no verify am", verifiedStatus: "Verified", packageUnknown: "Package no dey recorded", lifecycleLabel: "Lifecycle", simulationLabel: "Simulator model", reviewBlockersLabel: "Evidence blockers", humanReviewRequired: "Human review and sign-off still dey required", openDatasheet: "Open manufacturer datasheet", noManufacturerMatches: "No part record match this search.", none: "None", unknown: "Unknown",
    breadboard: "Breadboard View", schematic: "Circuit drawing", pcb: "PCB View", select: "Select", pan: "Move view", zoomOut: "Zoom out", zoomIn: "Zoom in", snap: "Snap", grid: "Grid", simulationOutput: "Simulation Output", errors: "Errors", warnings: "Warnings", component: "Part", project: "Project", simulation: "Simulation", type: "Type", reference: "Reference", value: "Value", libraryStatus: "Library status", applyProperties: "Apply properties", projectName: "Project name", locale: "Language", applyProject: "Apply project settings", simulationControl: "Simulation Control", availableAnalysis: "Analysis wey dey: LED current limiter and unloaded two-resistor voltage divider.", runCalculation: "Run calculation", stopSimulation: "Stop", simulationLimit: "General SPICE, digital and mixed-signal engines never dey yet.", runValidation: "Run validation", validationHelp: "Run validation make you see project issues.", botAssistant: "Your AI engineering assistant", botUnavailable: "E never configure.", botPrivacy: "This local foundation no connect to AI service and no send project data outside.", botPlaceholder: "AI service never configure", close: "Close", collapseLibrary: "Close component library", collapseProperties: "Close properties", maximizeSchematic: "Make circuit drawing full screen", maximizePcb: "Make PCB full screen"
  }
});

Object.assign(TRANSLATIONS.en, { releasedExamples: "Released examples", loadTestedStarter: "Load a tested starter project", loadSelectedExample: "Load selected example", morePlannedExamples: "Seven catalogue projects released; ten supplemental studies are also available. Other catalogue entries are planned and cannot be loaded yet.", electricalConnections: "Electrical connections", firstPin: "First pin", secondPin: "Second pin", connectPins: "Connect pins", noConnectedNets: "No connected nets yet.", disconnect: "Disconnect", removeComponent: "Remove component" });
Object.assign(TRANSLATIONS.de, { releasedExamples: "Veröffentlichte Beispiele", loadTestedStarter: "Geprüftes Starterprojekt laden", loadSelectedExample: "Ausgewähltes Beispiel laden", morePlannedExamples: "Sieben Katalogprojekte veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogeinträge sind geplant und noch nicht ladbar.", electricalConnections: "Elektrische Verbindungen", firstPin: "Erster Pin", secondPin: "Zweiter Pin", connectPins: "Pins verbinden", noConnectedNets: "Noch keine verbundenen Netze.", disconnect: "Trennen", removeComponent: "Bauteil entfernen" });
Object.assign(TRANSLATIONS.yo, { releasedExamples: "Àwọn àpẹẹrẹ tí a tú síta", loadTestedStarter: "Ṣí iṣẹ́ àpẹẹrẹ tí a ti dán wò", loadSelectedExample: "Ṣí àpẹẹrẹ yìí", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù méje síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", electricalConnections: "Àwọn ìsopọ̀ iná mànàmáná", firstPin: "Pinni àkọ́kọ́", secondPin: "Pinni kejì", connectPins: "So àwọn pinni pọ̀", noConnectedNets: "Kò sí nẹ́tìwọ́ọ̀kì tó so pọ̀ síbẹ̀.", disconnect: "Yọ ìsopọ̀", removeComponent: "Yọ ẹ̀yà kúrò" });
Object.assign(TRANSLATIONS.pcm, { releasedExamples: "Examples wey don release", loadTestedStarter: "Load tested starter project", loadSelectedExample: "Load selected example", morePlannedExamples: "Seven catalogue projects don release; ten extra studies dey available too. Other catalogue projects never ready to load.", electricalConnections: "Electrical connections", firstPin: "First pin", secondPin: "Second pin", connectPins: "Connect pins", noConnectedNets: "No connected nets yet.", disconnect: "Disconnect", removeComponent: "Remove part" });

Object.assign(TRANSLATIONS.en, { availableAnalysis: "Available analyses: LED current limiter, unloaded voltage divider, linear DC resistor networks, and a single-pole RC step response." });
Object.assign(TRANSLATIONS.de, { availableAnalysis: "Verfügbar: LED-Strombegrenzung, unbelasteter Spannungsteiler, lineare Gleichstrom-Widerstandsnetze und eine RC-Sprungantwort erster Ordnung." });
Object.assign(TRANSLATIONS.yo, { availableAnalysis: "Ìṣirò tó wà: ààlà ìṣàn LED, voltage-divider tí kò ní ẹrù, àwọn nẹ́tìwọ́ọ̀kì DC olùtakò, àti ìdáhùn ìgbésẹ̀ RC kan." });
Object.assign(TRANSLATIONS.pcm, { availableAnalysis: "Analysis wey dey: LED current limiter, unloaded voltage divider, DC resistor networks, and one RC step response." });

Object.assign(TRANSLATIONS.en, { availableAnalysis: "Available analyses: LED current limiter, unloaded voltage divider, linear DC resistor networks, and first-order RC and RL step responses, plus RC low-pass/high-pass and RL low-pass frequency response." });
Object.assign(TRANSLATIONS.de, { availableAnalysis: "Verfügbar: LED-Strombegrenzung, unbelasteter Spannungsteiler, lineare Gleichstrom-Widerstandsnetze, RC- und RL-Sprungantworten erster Ordnung sowie RC-Tiefpass-, RC-Hochpass- und RL-Tiefpass-Frequenzgänge." });
Object.assign(TRANSLATIONS.yo, { availableAnalysis: "Ìṣirò tó wà: ààlà ìṣàn LED, voltage-divider tí kò ní ẹrù, àwọn nẹ́tìwọ́ọ̀kì DC olùtakò, ìdáhùn ìgbésẹ̀ RC àti RL, àti ìṣirò RC low-pass àti high-pass pẹ̀lú RL low-pass." });
Object.assign(TRANSLATIONS.pcm, { availableAnalysis: "Analysis wey dey: LED current limiter, unloaded voltage divider, DC resistor networks, and first-order RC and RL step responses, plus RC low-pass/high-pass and RL low-pass frequency response." });

export function translate(locale, key) {
  return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS.en[key] ?? key;
}
Object.assign(TRANSLATIONS.en, { corporateLogoAlt: "Official Hephzibah Behulah corporate logo", corporateWebsite: "Corporate website", documentation: "Documentation", support: "Support", personalProfile: "(personal profile)", allRightsReserved: "All rights reserved." });
Object.assign(TRANSLATIONS.de, { corporateLogoAlt: "Offizielles Unternehmenslogo von Hephzibah Behulah", corporateWebsite: "Unternehmenswebsite", documentation: "Dokumentation", support: "Support", personalProfile: "(persönliches Profil)", allRightsReserved: "Alle Rechte vorbehalten." });
Object.assign(TRANSLATIONS.yo, { corporateLogoAlt: "Àmì àjọ Hephzibah Behulah tó jẹ́ ti òfin", corporateWebsite: "Ojúlé àjọ", documentation: "Ìwé ìtọ́sọ́nà", support: "Ìrànlọ́wọ́", personalProfile: "(àkọọ́lẹ̀ ẹni kọọkan)", allRightsReserved: "Gbogbo ẹ̀tọ́ wà ní ìpamọ́." });
Object.assign(TRANSLATIONS.pcm, { corporateLogoAlt: "Official Hephzibah Behulah company logo", corporateWebsite: "Company website", documentation: "Documentation", support: "Support", personalProfile: "(personal profile)", allRightsReserved: "All rights reserved." });
Object.assign(TRANSLATIONS.en, { officialLinks: "Official company links", linkedinPersonalProfile: "LinkedIn personal profile", productTagline: "Design · Analyze · Prototype" });
Object.assign(TRANSLATIONS.de, { officialLinks: "Offizielle Unternehmenslinks", linkedinPersonalProfile: "Persönliches LinkedIn-Profil", productTagline: "Entwerfen · Analysieren · Prototypisieren" });
Object.assign(TRANSLATIONS.yo, { officialLinks: "Àwọn ìjápọ̀ àjọ tó jẹ́ ti òfin", linkedinPersonalProfile: "Àkọọ́lẹ̀ LinkedIn ẹni kọọkan", productTagline: "Ṣe àwòrán · Ṣe àyẹ̀wò · Ṣe àpẹẹrẹ" });
Object.assign(TRANSLATIONS.pcm, { officialLinks: "Official company links", linkedinPersonalProfile: "LinkedIn personal profile", productTagline: "Design · Analyze · Prototype" });

Object.assign(TRANSLATIONS.en, { examplePwmLedDimmer: "5 V PWM LED dimmer", exampleBatteryDischargeMonitor: "9 V battery discharge monitor", exampleLinearSupply: "5 V linear supply model", morePlannedExamples: "Ten of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include ideal PWM LED average-current, low-battery comparator, and linear-supply ripple/dropout models; no PWM switching waveform is simulated." });
Object.assign(TRANSLATIONS.de, { examplePwmLedDimmer: "5-V-PWM-LED-Dimmer", exampleBatteryDischargeMonitor: "9-V-Batterieentladeanzeige", exampleLinearSupply: "5-V-Linearnetzteilmodell", morePlannedExamples: "Zehn der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind ideale PWM-LED-Mittelstrom-, Unterspannungs-Komparator- und Netzteil-Ripple/Dropout-Modelle; eine PWM-Schaltkurve wird nicht simuliert." });
Object.assign(TRANSLATIONS.yo, { examplePwmLedDimmer: "PWM dimmer LED 5 V", exampleBatteryDischargeMonitor: "Atẹ̀jáde batiri 9 V", exampleLinearSupply: "Àwòṣe ipese iná 5 V", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù mẹ́wàá nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, comparator batiri-kékeré, àti ripple/dropout ipese iná wà; a kò ṣe àfihàn ìgbìyànjú PWM." });
Object.assign(TRANSLATIONS.pcm, { examplePwmLedDimmer: "5 V PWM LED dimmer", exampleBatteryDischargeMonitor: "9 V battery discharge monitor", exampleLinearSupply: "5 V linear supply model", morePlannedExamples: "Ten out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "Ideal PWM LED average-current, low-battery comparator and linear-supply ripple/dropout models dey; e no simulate PWM switching waveform." });

Object.assign(TRANSLATIONS.en, { exampleUsbLed: "USB-powered LED with PTC warning", morePlannedExamples: "Eleven of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, and a USB LED cold-state PTC warning." });
Object.assign(TRANSLATIONS.de, { exampleUsbLed: "USB-LED mit PTC-Warnmodell", morePlannedExamples: "Elf der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout und eine USB-LED-PTC-Kaltzustandswarnung." });
Object.assign(TRANSLATIONS.yo, { exampleUsbLed: "LED USB pẹ̀lú ìkìlọ̀ PTC", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù mọ́kànlá nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri-kékeré, ripple/dropout ipese iná, àti ìkìlọ̀ PTC USB wà." });
Object.assign(TRANSLATIONS.pcm, { exampleUsbLed: "USB LED with PTC warning", morePlannedExamples: "Eleven out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, and USB LED cold-state PTC warning models dey." });

Object.assign(TRANSLATIONS.en, { exampleSolarGardenLight: "Solar garden light day/night model", morePlannedExamples: "Twelve of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, and solar garden-light day/night estimates." });
Object.assign(TRANSLATIONS.de, { exampleSolarGardenLight: "Solar-Gartenleuchte Tag/Nacht-Modell", morePlannedExamples: "Zwölf der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung und Solar-Gartenleuchten-Schätzungen für Tag und Nacht." });
Object.assign(TRANSLATIONS.yo, { exampleSolarGardenLight: "Àwòṣe iná ọgbà oòrùn lọ́sàn àti lálẹ́", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù méjìlá nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri-kékeré, ripple/dropout, ìkìlọ̀ USB PTC, àti ìṣírò iná oòrùn lọ́sàn/lálẹ́ wà." });
Object.assign(TRANSLATIONS.pcm, { exampleSolarGardenLight: "Solar garden light day/night model", morePlannedExamples: "Twelve out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, and solar garden-light day/night estimates dey." });

Object.assign(TRANSLATIONS.en, { exampleSupercapHoldUp: "Supercapacitor hold-up after power loss", morePlannedExamples: "Thirteen of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, solar day/night estimates, and supercapacitor hold-up." });
Object.assign(TRANSLATIONS.de, { exampleSupercapHoldUp: "Superkondensator-Überbrückung nach Stromausfall", morePlannedExamples: "Dreizehn der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung, Solar-Tag/Nacht und Superkondensator-Überbrückung." });
Object.assign(TRANSLATIONS.yo, { exampleSupercapHoldUp: "Ìdúró iná supercapacitor lẹ́yìn pípa iná", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù mẹ́tàlá nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri, ripple/dropout, ìkìlọ̀ USB PTC, ìṣírò oòrùn lọ́sàn/lálẹ́, àti ìdúró supercapacitor wà." });
Object.assign(TRANSLATIONS.pcm, { exampleSupercapHoldUp: "Supercapacitor hold-up after power loss", morePlannedExamples: "Thirteen out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, and supercapacitor hold-up models dey." });

Object.assign(TRANSLATIONS.en, { examplePassiveToneControl: "Passive treble-cut tone control", morePlannedExamples: "Fourteen of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, and passive RC tone control." });
Object.assign(TRANSLATIONS.de, { examplePassiveToneControl: "Passiver Höhenregler", morePlannedExamples: "Vierzehn der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung, Solar-Tag/Nacht, Superkondensator-Überbrückung und passiver RC-Klangregler." });
Object.assign(TRANSLATIONS.yo, { examplePassiveToneControl: "Àwòṣe ìṣàkóso ohùn treble", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù mẹ́rìnlá nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri, ripple/dropout, ìkìlọ̀ USB PTC, oòrùn lọ́sàn/lálẹ́, supercapacitor, àti ìṣàkóso ohùn RC wà." });
Object.assign(TRANSLATIONS.pcm, { examplePassiveToneControl: "Passive treble-cut tone control", morePlannedExamples: "Fourteen out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, and passive RC tone control dey." });

Object.assign(TRANSLATIONS.en, { exampleBridgeRectifier: "Full-wave bridge rectifier", morePlannedExamples: "Fifteen of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, and sampled full-wave bridge rectification." });
Object.assign(TRANSLATIONS.de, { exampleBridgeRectifier: "Vollweggleichrichter", morePlannedExamples: "Fünfzehn der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung, Solar-Tag/Nacht, Superkondensator-Überbrückung, passiver RC-Klangregler und simulierte Vollweggleichrichtung." });
Object.assign(TRANSLATIONS.yo, { exampleBridgeRectifier: "Àwòṣe bridge rectifier full-wave", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù mẹ́ẹ̀ẹ́dógún nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri, ripple/dropout, ìkìlọ̀ USB PTC, oòrùn lọ́sàn/lálẹ́, supercapacitor, ìṣàkóso ohùn RC, àti bridge rectifier full-wave wà." });
Object.assign(TRANSLATIONS.pcm, { exampleBridgeRectifier: "Full-wave bridge rectifier", morePlannedExamples: "Fifteen out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, and sampled full-wave bridge rectifier models dey." });

Object.assign(TRANSLATIONS.en, { exampleSmoothingCapacitor: "Rectifier smoothing capacitor", morePlannedExamples: "Sixteen of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, sampled bridge rectification, and reservoir-capacitor ripple estimates." });
Object.assign(TRANSLATIONS.de, { exampleSmoothingCapacitor: "Siebelko am Gleichrichter", morePlannedExamples: "Sechzehn der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung, Solar-Tag/Nacht, Superkondensator-Überbrückung, passiver RC-Klangregler, simulierte Gleichrichtung und Siebelko-Ripple-Schätzungen." });
Object.assign(TRANSLATIONS.yo, { exampleSmoothingCapacitor: "Capacitor ìdín ripple rectifier", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù mẹ́rìndínlógún nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri, ripple/dropout, ìkìlọ̀ USB PTC, oòrùn lọ́sàn/lálẹ́, supercapacitor, ìṣàkóso ohùn RC, bridge rectifier, àti ìṣírò ripple capacitor wà." });
Object.assign(TRANSLATIONS.pcm, { exampleSmoothingCapacitor: "Rectifier smoothing capacitor", morePlannedExamples: "Sixteen out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, sampled bridge rectification, and reservoir-capacitor ripple estimates dey." });

Object.assign(TRANSLATIONS.en, { exampleZenerShuntRegulator: "Zener shunt regulator", morePlannedExamples: "Seventeen of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, sampled bridge rectification, reservoir-capacitor ripple, and ideal Zener shunt regulation." });
Object.assign(TRANSLATIONS.de, { exampleZenerShuntRegulator: "Zener-Shuntregler", morePlannedExamples: "Siebzehn der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung, Solar-Tag/Nacht, Superkondensator-Überbrückung, passiver RC-Klangregler, simulierte Gleichrichtung, Siebelko-Ripple und idealisierte Zener-Shunt-Regelung." });
Object.assign(TRANSLATIONS.yo, { exampleZenerShuntRegulator: "Àwòṣe Zener shunt regulator", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù mẹ́tàdínlógún nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri, ripple/dropout, ìkìlọ̀ USB PTC, oòrùn lọ́sàn/lálẹ́, supercapacitor, ìṣàkóso ohùn RC, bridge rectifier, ripple capacitor, àti Zener shunt regulation wà." });
Object.assign(TRANSLATIONS.pcm, { exampleZenerShuntRegulator: "Zener shunt regulator", morePlannedExamples: "Seventeen out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, sampled bridge rectification, reservoir-capacitor ripple, and ideal Zener shunt-regulator estimates dey." });

Object.assign(TRANSLATIONS.en, { protection: "Protection" });
Object.assign(TRANSLATIONS.de, { protection: "Schutz" });
Object.assign(TRANSLATIONS.yo, { protection: "Ìdábòbò" });
Object.assign(TRANSLATIONS.pcm, { protection: "Protection" });

Object.assign(TRANSLATIONS.en, { exampleTvsSurgeClamp: "TVS surge clamp", morePlannedExamples: "Eighteen of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, sampled bridge rectification, reservoir-capacitor ripple, ideal Zener shunt regulation, and single-pulse TVS clamp estimates." });
Object.assign(TRANSLATIONS.de, { exampleTvsSurgeClamp: "TVS-Überspannungsschutz", morePlannedExamples: "Achtzehn der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung, Solar-Tag/Nacht, Superkondensator-Überbrückung, passiver RC-Klangregler, simulierte Gleichrichtung, Siebelko-Ripple, idealisierte Zener-Shunt-Regelung und TVS-Einzelimpuls-Schätzungen." });
Object.assign(TRANSLATIONS.yo, { exampleTvsSurgeClamp: "Àwòṣe ìdábòbò TVS surge", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù méjìdínlógún nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri, ripple/dropout, ìkìlọ̀ USB PTC, oòrùn lọ́sàn/lálẹ́, supercapacitor, ìṣàkóso ohùn RC, bridge rectifier, ripple capacitor, Zener shunt, àti ìṣírò ìdábòbò TVS pulse kan wà." });
Object.assign(TRANSLATIONS.pcm, { exampleTvsSurgeClamp: "TVS surge clamp", morePlannedExamples: "Eighteen out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, sampled bridge rectification, reservoir-capacitor ripple, ideal Zener regulation, and single-pulse TVS clamp estimates dey." });

Object.assign(TRANSLATIONS.en, { sensors: "Sensors" });
Object.assign(TRANSLATIONS.de, { sensors: "Sensoren" });
Object.assign(TRANSLATIONS.yo, { sensors: "Àwọn sensọ" });
Object.assign(TRANSLATIONS.pcm, { sensors: "Sensors" });

Object.assign(TRANSLATIONS.en, { exampleNtcTemperatureDivider: "NTC temperature divider", morePlannedExamples: "Nineteen of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, bridge rectification and reservoir ripple, Zener regulation, TVS pulse clamping, and NTC temperature-divider estimates." });
Object.assign(TRANSLATIONS.de, { exampleNtcTemperatureDivider: "NTC-Temperaturteiler", morePlannedExamples: "Neunzehn der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung, Solar-Tag/Nacht, Superkondensator-Überbrückung, passiver RC-Klangregler, Gleichrichtung und Siebelko-Ripple, Zener-Regelung, TVS-Impulsklemmung und NTC-Temperaturteiler." });
Object.assign(TRANSLATIONS.yo, { exampleNtcTemperatureDivider: "Àwòṣe NTC temperature divider", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù mọ́kàndínlógún nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri, ripple/dropout, ìkìlọ̀ USB PTC, oòrùn lọ́sàn/lálẹ́, supercapacitor, ìṣàkóso ohùn RC, bridge rectification, Zener, TVS pulse, àti NTC temperature divider wà." });
Object.assign(TRANSLATIONS.pcm, { exampleNtcTemperatureDivider: "NTC temperature divider", morePlannedExamples: "Nineteen out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, bridge and reservoir-capacitor models, Zener regulation, TVS pulse clamp, and NTC temperature-divider estimates dey." });

Object.assign(TRANSLATIONS.en, { exampleLdrNightLight: "LDR comparator night light", morePlannedExamples: "Twenty of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, bridge rectification and reservoir ripple, Zener regulation, TVS pulse clamping, NTC temperature dividers, and LDR comparator night lights." });
Object.assign(TRANSLATIONS.de, { exampleLdrNightLight: "LDR-Komparator-Nachtlicht", morePlannedExamples: "Zwanzig der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung, Solar-Tag/Nacht, Superkondensator-Überbrückung, passiver RC-Klangregler, Gleichrichtung und Siebelko-Ripple, Zener-Regelung, TVS-Impulsklemmung, NTC-Temperaturteiler und LDR-Komparator-Nachtlichter." });
Object.assign(TRANSLATIONS.yo, { exampleLdrNightLight: "LDR comparator night light", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù ogún nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri, ripple/dropout, ìkìlọ̀ USB PTC, oòrùn lọ́sàn/lálẹ́, supercapacitor, ìṣàkóso ohùn RC, bridge rectification, Zener, TVS pulse, NTC temperature divider, àti LDR night light wà." });
Object.assign(TRANSLATIONS.pcm, { exampleLdrNightLight: "LDR comparator night light", morePlannedExamples: "Twenty out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, bridge and reservoir models, Zener regulation, TVS pulse clamp, NTC divider, and LDR comparator night-light estimates dey." });

Object.assign(TRANSLATIONS.en, { exampleNe555Astable: "555 astable LED blinker", morePlannedExamples: "Twenty-one of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, bridge rectification and reservoir ripple, Zener regulation, TVS pulse clamping, NTC/LDR sensor dividers, and ideal NE555 astable timing." });
Object.assign(TRANSLATIONS.de, { exampleNe555Astable: "555-LED-Blinker im astabilen Betrieb", morePlannedExamples: "Einundzwanzig der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung, Solar-Tag/Nacht, Superkondensator-Überbrückung, passiver RC-Klangregler, Gleichrichtung und Siebelko-Ripple, Zener-Regelung, TVS-Impulsklemmung, NTC/LDR-Sensorteiler und idealisierte NE555-Astable-Timing-Analysen." });
Object.assign(TRANSLATIONS.yo, { exampleNe555Astable: "555 astable LED blinker", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù mọ́kànlélógún nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri, ripple/dropout, ìkìlọ̀ USB PTC, oòrùn lọ́sàn/lálẹ́, supercapacitor, ìṣàkóso ohùn RC, bridge rectification, Zener, TVS pulse, NTC/LDR divider, àti 555 astable timing wà." });
Object.assign(TRANSLATIONS.pcm, { exampleNe555Astable: "555 astable LED blinker", morePlannedExamples: "Twenty-one out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, bridge/reservoir models, Zener regulation, TVS pulse clamp, NTC/LDR sensor dividers, and ideal NE555 astable timing dey." });

Object.assign(TRANSLATIONS.en, { exampleNe555Monostable: "555 monostable LED pulse", morePlannedExamples: "Twenty-two of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, bridge/reservoir models, Zener regulation, TVS pulse clamping, NTC/LDR sensors, and ideal NE555 astable and monostable timing." });
Object.assign(TRANSLATIONS.de, { exampleNe555Monostable: "555-LED-Monoflopimpuls", morePlannedExamples: "Zweiundzwanzig der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung, Solar-Tag/Nacht, Superkondensator-Überbrückung, passiver RC-Klangregler, Gleichrichtung/Siebelko, Zener-Regelung, TVS-Impulsklemmung, NTC/LDR-Sensoren sowie idealisierte NE555-Astable- und Monoflop-Timing-Analysen." });
Object.assign(TRANSLATIONS.yo, { exampleNe555Monostable: "555 monostable LED pulse", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù méjìlélógún nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri, ripple/dropout, ìkìlọ̀ USB PTC, oòrùn lọ́sàn/lálẹ́, supercapacitor, ìṣàkóso ohùn RC, bridge/Zener/TVS, NTC/LDR sensors, àti 555 astable àti monostable timing wà." });
Object.assign(TRANSLATIONS.pcm, { exampleNe555Monostable: "555 monostable LED pulse", morePlannedExamples: "Twenty-two out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, bridge/reservoir, Zener, TVS, NTC/LDR sensor, and ideal NE555 astable/monostable timing models dey." });


Object.assign(TRANSLATIONS.en, { exampleNe556DualTimer: "NE556 dual timer: two independent astables", morePlannedExamples: "Twenty-three of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, linear-supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, bridge/reservoir models, Zener regulation, TVS pulse clamping, NTC/LDR sensors, NE555 astable/monostable, and independent NE556 dual-astable timing." });
Object.assign(TRANSLATIONS.de, { exampleNe556DualTimer: "NE556-Doppelzeitgeber: zwei unabhängige Astabilen", morePlannedExamples: "Dreiundzwanzig der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar.", availableAnalysis: "Verfügbar sind PWM-LED-Mittelstrom, Unterspannungsüberwachung, Netzteil-Ripple/Dropout, USB-PTC-Warnung, Solar-Tag/Nacht, Superkondensator-Überbrückung, passiver RC-Klangregler, Gleichrichter/Siebung, Zener-Regelung, TVS-Impulsklemmung, NTC/LDR-Sensoren, NE555-Astable/Monoflop und unabhängige NE556-Astable-Timing-Analysen." });
Object.assign(TRANSLATIONS.yo, { exampleNe556DualTimer: "NE556 dual timer: àwòṣe astable méjì ọ̀tọ̀ọ̀tọ̀", morePlannedExamples: "A ti tú iṣẹ́ kátàlọ́ọ̀gù mẹ́tàlélógún nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí.", availableAnalysis: "Àwọn àwòṣe ìṣàn PWM LED, ìṣọ́ batiri, ripple/dropout, ìkìlọ̀ USB PTC, oòrùn lọ́sàn/lálẹ́, supercapacitor, ìṣàkóso ohùn RC, bridge/reservoir, Zener, TVS pulse, sensọ NTC/LDR, NE555 astable/monostable, àti NE556 astable méjì ọ̀tọ̀ọ̀tọ̀ wà." });
Object.assign(TRANSLATIONS.pcm, { exampleNe556DualTimer: "NE556 dual timer: two independent astable circuits", morePlannedExamples: "Twenty-three out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load.", availableAnalysis: "PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, bridge/reservoir, Zener, TVS pulse, NTC/LDR sensors, NE555 astable/monostable, and independent NE556 dual-astable models dey." });


Object.assign(TRANSLATIONS.en, { exampleOpAmpNonInverting: "Op-amp non-inverting amplifier", morePlannedExamples: "Twenty-four of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet.", availableAnalysis: "Available analyses include PWM LED average current, low-battery monitoring, supply ripple/dropout, USB PTC warning, solar day/night, supercapacitor hold-up, passive RC tone control, bridge/reservoir models, Zener, TVS, NTC/LDR sensors, NE555/NE556 timing, and ideal…33936 tokens truncated…itch:"SSR ìṣàkóso ẹrù AC"});

Object.assign(TRANSLATIONS.pcm, {exampleSsrAcSwitch:"SSR AC load switch"});

Object.assign(TRANSLATIONS.en, {morePlannedExamples:"114 of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet."});

Object.assign(TRANSLATIONS.de, {morePlannedExamples:"114 der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar."});

Object.assign(TRANSLATIONS.yo, {morePlannedExamples:"A ti tú iṣẹ́ kátàlọ́ọ̀gù 114 nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí."});

Object.assign(TRANSLATIONS.pcm, {morePlannedExamples:"114 out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load."});

Object.assign(TRANSLATIONS.en, {exampleUpsTransfer:"Battery-powered UPS"});

Object.assign(TRANSLATIONS.de, {exampleUpsTransfer:"Batterie-USV mit Netzausfall"});

Object.assign(TRANSLATIONS.yo, {exampleUpsTransfer:"UPS batiri nígbà tí iná bá lọ"});

Object.assign(TRANSLATIONS.pcm, {exampleUpsTransfer:"Battery-powered UPS"});

Object.assign(TRANSLATIONS.en, {morePlannedExamples:"115 of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet."});

Object.assign(TRANSLATIONS.de, {morePlannedExamples:"115 der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar."});

Object.assign(TRANSLATIONS.yo, {morePlannedExamples:"A ti tú iṣẹ́ kátàlọ́ọ̀gù 115 nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí."});

Object.assign(TRANSLATIONS.pcm, {morePlannedExamples:"115 out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load."});

Object.assign(TRANSLATIONS.en, {exampleInverterWaveform:"Inverter waveform concept"});

Object.assign(TRANSLATIONS.de, {exampleInverterWaveform:"Wechselrichter-Wellenformkonzept"});

Object.assign(TRANSLATIONS.yo, {exampleInverterWaveform:"Àwòṣe ìgbì inverter"});

Object.assign(TRANSLATIONS.pcm, {exampleInverterWaveform:"Inverter waveform concept"});

Object.assign(TRANSLATIONS.en, {morePlannedExamples:"116 of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet."});

Object.assign(TRANSLATIONS.de, {morePlannedExamples:"116 der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar."});

Object.assign(TRANSLATIONS.yo, {morePlannedExamples:"A ti tú iṣẹ́ kátàlọ́ọ̀gù 116 nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí."});

Object.assign(TRANSLATIONS.pcm, {morePlannedExamples:"116 out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load."});

Object.assign(TRANSLATIONS.en, {exampleElectronicLoad:"Electronic load"});

Object.assign(TRANSLATIONS.de, {exampleElectronicLoad:"Elektronische Last"});

Object.assign(TRANSLATIONS.yo, {exampleElectronicLoad:"Ẹrù ẹ̀rọ itanna"});

Object.assign(TRANSLATIONS.pcm, {exampleElectronicLoad:"Electronic load"});

Object.assign(TRANSLATIONS.en, {morePlannedExamples:"117 of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet."});

Object.assign(TRANSLATIONS.de, {morePlannedExamples:"117 der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar."});

Object.assign(TRANSLATIONS.yo, {morePlannedExamples:"A ti tú iṣẹ́ kátàlọ́ọ̀gù 117 nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí."});

Object.assign(TRANSLATIONS.pcm, {morePlannedExamples:"117 out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load."});

Object.assign(TRANSLATIONS.en, {exampleHotSwapProtection:"Hot-swap input protection"});

Object.assign(TRANSLATIONS.de, {exampleHotSwapProtection:"Hot-Swap-Eingangsschutz"});

Object.assign(TRANSLATIONS.yo, {exampleHotSwapProtection:"Ààbò hot-swap ìwọlé"});

Object.assign(TRANSLATIONS.pcm, {exampleHotSwapProtection:"Hot-swap input protection"});

Object.assign(TRANSLATIONS.en, {morePlannedExamples:"118 of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet."});

Object.assign(TRANSLATIONS.de, {morePlannedExamples:"118 der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar."});

Object.assign(TRANSLATIONS.yo, {morePlannedExamples:"A ti tú iṣẹ́ kátàlọ́ọ̀gù 118 nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí."});

Object.assign(TRANSLATIONS.pcm, {morePlannedExamples:"118 out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load."});

Object.assign(TRANSLATIONS.en, {exampleReversePolarity:"Reverse-polarity protection",exampleSurgeProtectedInput:"Surge-protected input"});

Object.assign(TRANSLATIONS.de, {exampleReversePolarity:"Verpolungsschutz",exampleSurgeProtectedInput:"Überspannungsgeschützter Eingang"});

Object.assign(TRANSLATIONS.yo, {exampleReversePolarity:"Ààbò polarity tí kò tọ́",exampleSurgeProtectedInput:"Ààbò ìwọlé sí ìgbéga foliteji"});

Object.assign(TRANSLATIONS.pcm, {exampleReversePolarity:"Reverse-polarity protection",exampleSurgeProtectedInput:"Surge-protected input"});

Object.assign(TRANSLATIONS.en, {morePlannedExamples:"124 of the 200 catalogue projects are released; ten supplemental studies are also available. The remaining catalogue projects are planned and cannot be loaded yet."});

Object.assign(TRANSLATIONS.de, {morePlannedExamples:"124 der 200 Katalogprojekte sind veröffentlicht; zehn ergänzende Studien sind ebenfalls verfügbar. Die übrigen Katalogprojekte sind geplant und noch nicht ladbar."});

Object.assign(TRANSLATIONS.yo, {morePlannedExamples:"A ti tú iṣẹ́ kátàlọ́ọ̀gù 124 nínú 200 síta; àfikún ìwádìí mẹ́wàá tún wà. A ti ṣètò àwọn tó kù, wọn kò tíì ṣe é ṣí."});

Object.assign(TRANSLATIONS.pcm, {morePlannedExamples:"124 out of 200 catalogue projects don release; ten extra studies dey available too. The remaining catalogue projects never ready to load."});

Object.assign(TRANSLATIONS.en, {runPcbChecks:"Run PCB checks",exportPcbFiles:"Export Gerber / drill / BOM"});
Object.assign(TRANSLATIONS.de, {runPcbChecks:"PCB prüfen",exportPcbFiles:"Gerber / Bohrdaten / Stückliste exportieren"});
Object.assign(TRANSLATIONS.yo, {runPcbChecks:"Ṣàyẹ̀wò PCB",exportPcbFiles:"Gbé Gerber / ihò / BOM jáde"});
Object.assign(TRANSLATIONS.pcm, {runPcbChecks:"Run PCB checks",exportPcbFiles:"Export Gerber / drill / BOM"});

Object.assign(TRANSLATIONS.en, {exampleSingleSidedLedPcb:"Single-sided LED PCB",example555TimerPcb:"555 timer PCB",exampleOpAmpFilterPcb:"Op-amp filter PCB",exampleArduinoShield:"Arduino Uno R3 shield"});
Object.assign(TRANSLATIONS.de, {exampleSingleSidedLedPcb:"Einseitige LED-Leiterplatte",example555TimerPcb:"555-Timer-Leiterplatte",exampleOpAmpFilterPcb:"Operationsverstärker-Filter-Leiterplatte",exampleArduinoShield:"Arduino-Uno-R3-Shield"});
Object.assign(TRANSLATIONS.yo, {exampleSingleSidedLedPcb:"PCB LED alákòkò kan",example555TimerPcb:"PCB alákòkò 555",exampleOpAmpFilterPcb:"PCB àlẹ̀mọ́ op-amp",exampleArduinoShield:"Shield Arduino Uno R3"});
Object.assign(TRANSLATIONS.pcm, {exampleSingleSidedLedPcb:"Single-sided LED PCB",example555TimerPcb:"555 timer PCB",exampleOpAmpFilterPcb:"Op-amp filter PCB",exampleArduinoShield:"Arduino Uno R3 shield"});

Object.assign(TRANSLATIONS.en, {exampleUsbCBreakout:"USB-C USB 2.0 breakout"});
Object.assign(TRANSLATIONS.de, {exampleUsbCBreakout:"USB-C-USB-2.0-Breakout"});
Object.assign(TRANSLATIONS.yo, {exampleUsbCBreakout:"USB-C USB 2.0 breakout"});
Object.assign(TRANSLATIONS.pcm, {exampleUsbCBreakout:"USB-C USB 2.0 breakout"});

Object.assign(TRANSLATIONS.en, {exampleBme280Breakout:"BME280 I²C sensor breakout"});
Object.assign(TRANSLATIONS.de, {exampleBme280Breakout:"BME280-I²C-Sensor-Breakout"});
Object.assign(TRANSLATIONS.yo, {exampleBme280Breakout:"BME280 I²C sensor breakout"});
Object.assign(TRANSLATIONS.pcm, {exampleBme280Breakout:"BME280 I²C sensor breakout"});

Object.assign(TRANSLATIONS.en, {exampleRelayModulePcb:"Low-voltage relay module PCB"});
Object.assign(TRANSLATIONS.de, {exampleRelayModulePcb:"Niederspannungs-Relaismodul-PCB"});
Object.assign(TRANSLATIONS.yo, {exampleRelayModulePcb:"PCB modulu relay foliteji kékeré"});
Object.assign(TRANSLATIONS.pcm, {exampleRelayModulePcb:"Low-voltage relay module PCB"});
Object.assign(TRANSLATIONS.en, {exampleAudioAmplifierPcb:"Low-voltage LM386 audio amplifier PCB"});
Object.assign(TRANSLATIONS.de, {exampleAudioAmplifierPcb:"Niederspannungs-Audioverstärkerplatine mit LM386"});
Object.assign(TRANSLATIONS.yo, {exampleAudioAmplifierPcb:"Pátákì amúgbóhùn LM386 foliteji kékeré"});
Object.assign(TRANSLATIONS.pcm, {exampleAudioAmplifierPcb:"Low-voltage LM386 audio amplifier PCB"});
Object.assign(TRANSLATIONS.en, {exampleBuckConverterPcb:"12 V to 5 V buck converter PCB"});
Object.assign(TRANSLATIONS.de, {exampleBuckConverterPcb:"12-V-zu-5-V-Abwärtswandlerplatine"});
Object.assign(TRANSLATIONS.yo, {exampleBuckConverterPcb:"Pátákì buck 12 V sí 5 V"});
Object.assign(TRANSLATIONS.pcm, {exampleBuckConverterPcb:"12 V to 5 V buck converter PCB"});
Object.assign(TRANSLATIONS.en, {exampleFourLayerMcuPlan:"Four-layer STM32 MCU board plan"});
Object.assign(TRANSLATIONS.de, {exampleFourLayerMcuPlan:"Vierlagiger STM32-MCU-Platinenplan"});
Object.assign(TRANSLATIONS.yo, {exampleFourLayerMcuPlan:"Eto pátákì MCU STM32 pẹ̀lú fẹ́lẹ̀ mẹ́rin"});
Object.assign(TRANSLATIONS.pcm, {exampleFourLayerMcuPlan:"Four-layer STM32 MCU board plan"});
Object.assign(TRANSLATIONS.en, {exampleUsbDifferentialPair:"USB Full-Speed differential pair demo"});
Object.assign(TRANSLATIONS.de, {exampleUsbDifferentialPair:"USB-Full-Speed-Differentialpaar-Demo"});
Object.assign(TRANSLATIONS.yo, {exampleUsbDifferentialPair:"Àpẹẹrẹ USB Full-Speed differential pair"});
Object.assign(TRANSLATIONS.pcm, {exampleUsbDifferentialPair:"USB Full-Speed differential pair demo"});

Object.assign(TRANSLATIONS.en, {exampleQfnFootprintValidation:"QFN footprint validation — exposed thermal pad"});
Object.assign(TRANSLATIONS.de, {exampleQfnFootprintValidation:"QFN-Footprintprüfung — freiliegendes Wärmeleitpad"});
Object.assign(TRANSLATIONS.yo, {exampleQfnFootprintValidation:"Ìmúdájú QFN footprint — exposed thermal pad"});
Object.assign(TRANSLATIONS.pcm, {exampleQfnFootprintValidation:"QFN footprint check — exposed thermal pad"});

Object.assign(TRANSLATIONS.en, {exampleBgaEscapeConcept:"BGA escape concept — capability disclosure"});
Object.assign(TRANSLATIONS.de, {exampleBgaEscapeConcept:"BGA-Escape-Konzept — Funktionsgrenzen"});
Object.assign(TRANSLATIONS.yo, {exampleBgaEscapeConcept:"Èrò BGA escape — àlàyé ààlà iṣẹ́"});
Object.assign(TRANSLATIONS.pcm, {exampleBgaEscapeConcept:"BGA escape concept — wetin system fit do"});

Object.assign(TRANSLATIONS.en, {examplePanelMountController:"Panel-mount controller mechanical plan"});
Object.assign(TRANSLATIONS.de, {examplePanelMountController:"Mechanikplan für Panel-Steuerung"});
Object.assign(TRANSLATIONS.yo, {examplePanelMountController:"Ètò ẹrọ fún controller panel"});
Object.assign(TRANSLATIONS.pcm, {examplePanelMountController:"Panel controller mechanical plan"});

Object.assign(TRANSLATIONS.en, {exampleMcuTestPointCoverage:"STM32 MCU board test-point coverage"});
Object.assign(TRANSLATIONS.de, {exampleMcuTestPointCoverage:"Testpunktabdeckung der STM32-MCU-Platine"});
Object.assign(TRANSLATIONS.yo, {exampleMcuTestPointCoverage:"Àwọn test point fún board STM32"});
Object.assign(TRANSLATIONS.pcm, {exampleMcuTestPointCoverage:"STM32 board test-point coverage"});

Object.assign(TRANSLATIONS.en, {exampleManufacturingExportPack:"Single-sided PCB manufacturing export pack"});
Object.assign(TRANSLATIONS.de, {exampleManufacturingExportPack:"Fertigungs-Exportpaket für einseitige Leiterplatte"});
Object.assign(TRANSLATIONS.yo, {exampleManufacturingExportPack:"Àpò ìtẹ̀jáde iṣelọpọ fún pátákì ẹ̀gbẹ́ kan"});
Object.assign(TRANSLATIONS.pcm, {exampleManufacturingExportPack:"Manufacturing export pack for one-sided PCB"});

Object.assign(TRANSLATIONS.en, {exampleAssemblyVariantBoard:"LED assembly variant board"});
Object.assign(TRANSLATIONS.de, {exampleAssemblyVariantBoard:"LED-Baugruppe mit Bestückungsvarianten"});
Object.assign(TRANSLATIONS.yo, {exampleAssemblyVariantBoard:"Pátákì LED pẹ̀lú oríṣìíríṣìí assembly"});
Object.assign(TRANSLATIONS.pcm, {exampleAssemblyVariantBoard:"LED board with different assembly options"});

Object.assign(TRANSLATIONS.en, {exampleNetClassRuleDemo:"Power and signal net-class rule demo"});
Object.assign(TRANSLATIONS.de, {exampleNetClassRuleDemo:"Netzklassenregeln für Leistung und Signal"});
Object.assign(TRANSLATIONS.yo, {exampleNetClassRuleDemo:"Àpẹẹrẹ net-class fún power àti signal"});
Object.assign(TRANSLATIONS.pcm, {exampleNetClassRuleDemo:"Power and signal net-class rule demo"});

Object.assign(TRANSLATIONS.en, {exampleCopperZoneDemo:"Ground copper-zone refill demo"});
Object.assign(TRANSLATIONS.de, {exampleCopperZoneDemo:"Vorschau einer GND-Kupferfläche"});
Object.assign(TRANSLATIONS.yo, {exampleCopperZoneDemo:"Àpẹẹrẹ àgbègbè copper ilẹ̀"});
Object.assign(TRANSLATIONS.pcm, {exampleCopperZoneDemo:"Ground copper-zone refill demo"});

Object.assign(TRANSLATIONS.en, {examplePcbSchematicReconciliation:"PCB to schematic reconciliation"});
Object.assign(TRANSLATIONS.de, {examplePcbSchematicReconciliation:"Abgleich zwischen PCB und Schaltplan"});
Object.assign(TRANSLATIONS.yo, {examplePcbSchematicReconciliation:"Ìbámu PCB pẹ̀lú schematic"});
Object.assign(TRANSLATIONS.pcm, {examplePcbSchematicReconciliation:"PCB to schematic check"});

Object.assign(TRANSLATIONS.en, {exampleDcVoltmeterUse:"DC voltmeter use"});
Object.assign(TRANSLATIONS.de, {exampleDcVoltmeterUse:"Gleichspannungsmessung mit Voltmeter"});
Object.assign(TRANSLATIONS.yo, {exampleDcVoltmeterUse:"Lílo foliteji DC pẹ̀lú voltmeter"});
Object.assign(TRANSLATIONS.pcm, {exampleDcVoltmeterUse:"DC voltmeter use"});

Object.assign(TRANSLATIONS.en, {exampleDcAmmeterUse:"DC ammeter use"});
Object.assign(TRANSLATIONS.de, {exampleDcAmmeterUse:"Gleichstrommessung mit Amperemeter"});
Object.assign(TRANSLATIONS.yo, {exampleDcAmmeterUse:"Lílo current DC pẹ̀lú ammeter"});
Object.assign(TRANSLATIONS.pcm, {exampleDcAmmeterUse:"DC ammeter use"});

Object.assign(TRANSLATIONS.en, {exampleOscilloscopeTrigger:"Oscilloscope trigger"});
Object.assign(TRANSLATIONS.de, {exampleOscilloscopeTrigger:"Oszilloskop-Trigger"});
Object.assign(TRANSLATIONS.yo, {exampleOscilloscopeTrigger:"Trigger oscilloscope"});
Object.assign(TRANSLATIONS.pcm, {exampleOscilloscopeTrigger:"Oscilloscope trigger"});

Object.assign(TRANSLATIONS.en, {exampleTwoChannelPhase:"Two-channel phase measurement"});
Object.assign(TRANSLATIONS.de, {exampleTwoChannelPhase:"Zweikanalige Phasenmessung"});
Object.assign(TRANSLATIONS.yo, {exampleTwoChannelPhase:"Ìwọ̀n phase ikanni méjì"});
Object.assign(TRANSLATIONS.pcm, {exampleTwoChannelPhase:"Two-channel phase measurement"});

Object.assign(TRANSLATIONS.en, {exampleLogicAnalyzerCapture:"Logic analyser capture"});
Object.assign(TRANSLATIONS.de, {exampleLogicAnalyzerCapture:"Logikanalysator-Aufzeichnung"});
Object.assign(TRANSLATIONS.yo, {exampleLogicAnalyzerCapture:"Ìgbasilẹ logic analyzer"});
Object.assign(TRANSLATIONS.pcm, {exampleLogicAnalyzerCapture:"Logic analyser capture"});

Object.assign(TRANSLATIONS.en, {exampleFrequencyCounter:"Frequency counter"});
Object.assign(TRANSLATIONS.de, {exampleFrequencyCounter:"Frequenzzähler"});
Object.assign(TRANSLATIONS.yo, {exampleFrequencyCounter:"Frequency counter"});
Object.assign(TRANSLATIONS.pcm, {exampleFrequencyCounter:"Frequency counter"});

Object.assign(TRANSLATIONS.en, {exampleRcBodePlot:"RC low-pass Bode plot"});
Object.assign(TRANSLATIONS.de, {exampleRcBodePlot:"Bode-Diagramm eines RC-Tiefpasses"});
Object.assign(TRANSLATIONS.yo, {exampleRcBodePlot:"Bode plot RC low-pass"});
Object.assign(TRANSLATIONS.pcm, {exampleRcBodePlot:"RC low-pass Bode plot"});

Object.assign(TRANSLATIONS.en, {exampleRlcTransientResponse:"Transient RLC pulse response"});
Object.assign(TRANSLATIONS.de, {exampleRlcTransientResponse:"Transientantwort eines RLC-Kreises"});
Object.assign(TRANSLATIONS.yo, {exampleRlcTransientResponse:"Ìdáhùn transient RLC pulse"});
Object.assign(TRANSLATIONS.pcm, {exampleRlcTransientResponse:"Transient RLC pulse response"});

Object.assign(TRANSLATIONS.en, {exampleParameterSweep:"LED current parameter sweep"});
Object.assign(TRANSLATIONS.de, {exampleParameterSweep:"LED-Strom-Parametersweep"});
Object.assign(TRANSLATIONS.yo, {exampleParameterSweep:"Ìdánwò iye resistor fún LED"});
Object.assign(TRANSLATIONS.pcm, {exampleParameterSweep:"LED current parameter sweep"});

Object.assign(TRANSLATIONS.en, {exampleMonteCarloTolerance:"Monte Carlo resistor tolerance"});
Object.assign(TRANSLATIONS.de, {exampleMonteCarloTolerance:"Monte-Carlo-Widerstandstoleranz"});
Object.assign(TRANSLATIONS.yo, {exampleMonteCarloTolerance:"Ìdánwò Monte Carlo fún tolerance resistor"});
Object.assign(TRANSLATIONS.pcm, {exampleMonteCarloTolerance:"Monte Carlo resistor tolerance"});

Object.assign(TRANSLATIONS.en, {exampleThermalWarningBoundary:"Thermal warning boundary"});
Object.assign(TRANSLATIONS.de, {exampleThermalWarningBoundary:"Thermische Warnschwelle"});
Object.assign(TRANSLATIONS.yo, {exampleThermalWarningBoundary:"Ààlà ìkìlọ̀ ooru"});
Object.assign(TRANSLATIONS.pcm, {exampleThermalWarningBoundary:"Thermal warning boundary"});

Object.assign(TRANSLATIONS.en, {exampleConvergenceFailureStudy:"Convergence failure study"});
Object.assign(TRANSLATIONS.de, {exampleConvergenceFailureStudy:"Konvergenzfehlerstudie"});
Object.assign(TRANSLATIONS.yo, {exampleConvergenceFailureStudy:"Ìkẹ́kọ̀ọ́ convergence solver"});
Object.assign(TRANSLATIONS.pcm, {exampleConvergenceFailureStudy:"Convergence failure study"});

Object.assign(TRANSLATIONS.en, {exampleFloatingNodeDiagnosis:"Floating-node diagnosis"});
Object.assign(TRANSLATIONS.de, {exampleFloatingNodeDiagnosis:"Diagnose eines schwebenden Knotens"});
Object.assign(TRANSLATIONS.yo, {exampleFloatingNodeDiagnosis:"Ìwádìí node tí kò ní DC reference"});
Object.assign(TRANSLATIONS.pcm, {exampleFloatingNodeDiagnosis:"Floating-node diagnosis"});

Object.assign(TRANSLATIONS.en, {exampleShortCircuitDiagnosis:"Short-circuit diagnosis"});
Object.assign(TRANSLATIONS.de, {exampleShortCircuitDiagnosis:"Kurzschlussdiagnose"});
Object.assign(TRANSLATIONS.yo, {exampleShortCircuitDiagnosis:"Ìwádìí short circuit"});
Object.assign(TRANSLATIONS.pcm, {exampleShortCircuitDiagnosis:"Short-circuit diagnosis"});

Object.assign(TRANSLATIONS.en, {exampleMissingGroundDiagnosis:"Missing-ground diagnosis"});
Object.assign(TRANSLATIONS.de, {exampleMissingGroundDiagnosis:"Diagnose fehlender Masse-Referenz"});
Object.assign(TRANSLATIONS.yo, {exampleMissingGroundDiagnosis:"Ìwádìí reference ground tó sọnù"});
Object.assign(TRANSLATIONS.pcm, {exampleMissingGroundDiagnosis:"Missing-ground diagnosis"});

Object.assign(TRANSLATIONS.en, {exampleModelUnavailableDiagnosis:"Model-unavailable diagnosis"});
Object.assign(TRANSLATIONS.de, {exampleModelUnavailableDiagnosis:"Diagnose fehlender Bauteilmodelle"});
Object.assign(TRANSLATIONS.yo, {exampleModelUnavailableDiagnosis:"Ìwádìí model component tí kò sí"});
Object.assign(TRANSLATIONS.pcm, {exampleModelUnavailableDiagnosis:"Model-unavailable diagnosis"});

Object.assign(TRANSLATIONS.en, {exampleNetProbeCrossProbe:"Net-probe cross-probe"});
Object.assign(TRANSLATIONS.de, {exampleNetProbeCrossProbe:"Netübergreifende Ansichtsprüfung"});
Object.assign(TRANSLATIONS.yo, {exampleNetProbeCrossProbe:"Ìfihàn net káàkiri àwọn view"});
Object.assign(TRANSLATIONS.pcm, {exampleNetProbeCrossProbe:"Net-probe cross-probe"});

Object.assign(TRANSLATIONS.en, {exampleComponentPropertyAudit:"Component property audit"});
Object.assign(TRANSLATIONS.de, {exampleComponentPropertyAudit:"Bauteileigenschaften prüfen"});
Object.assign(TRANSLATIONS.yo, {exampleComponentPropertyAudit:"Ìṣàyẹ̀wò property component"});
Object.assign(TRANSLATIONS.pcm, {exampleComponentPropertyAudit:"Component property audit"});

Object.assign(TRANSLATIONS.en, {exportSimulationReport:"Export Report",exampleSimulationReportExport:"Simulation report export"});
Object.assign(TRANSLATIONS.de, {exportSimulationReport:"Bericht exportieren",exampleSimulationReportExport:"Simulationsergebnisbericht"});
Object.assign(TRANSLATIONS.yo, {exportSimulationReport:"Gbe report jáde",exampleSimulationReportExport:"Gbigbe report simulation"});
Object.assign(TRANSLATIONS.pcm, {exportSimulationReport:"Export Report",exampleSimulationReportExport:"Simulation report export"});

Object.assign(TRANSLATIONS.en, {verifyRunLock:"Verify Run Lock",exampleReproducibleRunLockfile:"Reproducible run lockfile"});
Object.assign(TRANSLATIONS.de, {verifyRunLock:"Run-Lock prüfen",exampleReproducibleRunLockfile:"Reproduzierbare Run-Sperrdatei"});
Object.assign(TRANSLATIONS.yo, {verifyRunLock:"Ṣàyẹ̀wò run lock",exampleReproducibleRunLockfile:"Run lock tí a lè tún ṣe"});
Object.assign(TRANSLATIONS.pcm, {verifyRunLock:"Verify Run Lock",exampleReproducibleRunLockfile:"Reproducible run lockfile"});

Object.assign(TRANSLATIONS.en, {examplePlcStartStopMotorConcept:"PLC start/stop motor concept"});
Object.assign(TRANSLATIONS.de, {examplePlcStartStopMotorConcept:"SPS-Motorsteuerung Start/Stopp"});
Object.assign(TRANSLATIONS.yo, {examplePlcStartStopMotorConcept:"PLC motor start/stop concept"});
Object.assign(TRANSLATIONS.pcm, {examplePlcStartStopMotorConcept:"PLC start/stop motor concept"});

Object.assign(TRANSLATIONS.en, {examplePlcTrafficLight:"PLC traffic light"});
Object.assign(TRANSLATIONS.de, {examplePlcTrafficLight:"SPS-Ampelsteuerung"});
Object.assign(TRANSLATIONS.yo, {examplePlcTrafficLight:"PLC traffic light"});
Object.assign(TRANSLATIONS.pcm, {examplePlcTrafficLight:"PLC traffic light"});

Object.assign(TRANSLATIONS.en, {examplePlcTankLevelController:"PLC tank-level controller"});
Object.assign(TRANSLATIONS.de, {examplePlcTankLevelController:"SPS-Tankfüllstandsregelung"});
Object.assign(TRANSLATIONS.yo, {examplePlcTankLevelController:"PLC tank level controller"});
Object.assign(TRANSLATIONS.pcm, {examplePlcTankLevelController:"PLC tank level controller"});

Object.assign(TRANSLATIONS.en, {examplePlcConveyorCounter:"PLC conveyor counter"});
Object.assign(TRANSLATIONS.de, {examplePlcConveyorCounter:"SPS-Förderbandzähler"});
Object.assign(TRANSLATIONS.yo, {examplePlcConveyorCounter:"PLC conveyor counter"});
Object.assign(TRANSLATIONS.pcm, {examplePlcConveyorCounter:"PLC conveyor counter"});

Object.assign(TRANSLATIONS.en, {examplePlcStarDeltaStarter:"Star-delta starter concept"});
Object.assign(TRANSLATIONS.de, {examplePlcStarDeltaStarter:"Stern-Dreieck-Anlaufkonzept"});
Object.assign(TRANSLATIONS.yo, {examplePlcStarDeltaStarter:"Star-delta starter concept"});
Object.assign(TRANSLATIONS.pcm, {examplePlcStarDeltaStarter:"Star-delta starter concept"});

Object.assign(TRANSLATIONS.en, {examplePlcForwardReverseMotor:"Forward/reverse motor concept"});
Object.assign(TRANSLATIONS.de, {examplePlcForwardReverseMotor:"SPS-Motorsteuerung vorwärts/rückwärts"});
Object.assign(TRANSLATIONS.yo, {examplePlcForwardReverseMotor:"Forward/reverse motor concept"});
Object.assign(TRANSLATIONS.pcm, {examplePlcForwardReverseMotor:"Forward/reverse motor concept"});

Object.assign(TRANSLATIONS.en, {examplePlcEmergencyStopConcept:"Emergency-stop latch concept"});
Object.assign(TRANSLATIONS.de, {examplePlcEmergencyStopConcept:"Not-Halt-Verriegelungskonzept"});
Object.assign(TRANSLATIONS.yo, {examplePlcEmergencyStopConcept:"Emergency-stop latch concept"});
Object.assign(TRANSLATIONS.pcm, {examplePlcEmergencyStopConcept:"Emergency-stop latch concept"});

Object.assign(TRANSLATIONS.en, {examplePlcDoorInterlockConcept:"Door interlock concept"});
Object.assign(TRANSLATIONS.de, {examplePlcDoorInterlockConcept:"Türschutz-Verriegelungskonzept"});
Object.assign(TRANSLATIONS.yo, {examplePlcDoorInterlockConcept:"Door interlock concept"});
Object.assign(TRANSLATIONS.pcm, {examplePlcDoorInterlockConcept:"Door interlock concept"});

Object.assign(TRANSLATIONS.en, {exampleTemperatureAlarm:"Temperature alarm"});
Object.assign(TRANSLATIONS.de, {exampleTemperatureAlarm:"Temperaturalarm"});
Object.assign(TRANSLATIONS.yo, {exampleTemperatureAlarm:"Temperature alarm"});
Object.assign(TRANSLATIONS.pcm, {exampleTemperatureAlarm:"Temperature alarm"});

Object.assign(TRANSLATIONS.en, {exampleWaterLeakAlarm:"Water leak alarm"});
Object.assign(TRANSLATIONS.de, {exampleWaterLeakAlarm:"Wasseraustrittsalarm"});
Object.assign(TRANSLATIONS.yo, {exampleWaterLeakAlarm:"Water leak alarm"});
Object.assign(TRANSLATIONS.pcm, {exampleWaterLeakAlarm:"Water leak alarm"});

Object.assign(TRANSLATIONS.en, {exampleFanThermostat:"Fan thermostat"});
Object.assign(TRANSLATIONS.de, {exampleFanThermostat:"Lüfterthermostat"});
Object.assign(TRANSLATIONS.yo, {exampleFanThermostat:"Fan thermostat"});
Object.assign(TRANSLATIONS.pcm, {exampleFanThermostat:"Fan thermostat"});

Object.assign(TRANSLATIONS.en, {examplePwmFanController:"PWM fan controller"});
Object.assign(TRANSLATIONS.de, {examplePwmFanController:"PWM-Lüftersteuerung"});
Object.assign(TRANSLATIONS.yo, {examplePwmFanController:"PWM fan controller"});
Object.assign(TRANSLATIONS.pcm, {examplePwmFanController:"PWM fan controller"});

Object.assign(TRANSLATIONS.en, {exampleAutomaticNightLight:"Automatic night light"});
Object.assign(TRANSLATIONS.de, {exampleAutomaticNightLight:"Automatisches Nachtlicht"});
Object.assign(TRANSLATIONS.yo, {exampleAutomaticNightLight:"Automatic night light"});
Object.assign(TRANSLATIONS.pcm, {exampleAutomaticNightLight:"Automatic night light"});

Object.assign(TRANSLATIONS.en, {exampleSmartIrrigation:"Smart irrigation model"});
Object.assign(TRANSLATIONS.de, {exampleSmartIrrigation:"Intelligentes Bewässerungsmodell"});
Object.assign(TRANSLATIONS.yo, {exampleSmartIrrigation:"Smart irrigation model"});
Object.assign(TRANSLATIONS.pcm, {exampleSmartIrrigation:"Smart irrigation model"});

Object.assign(TRANSLATIONS.en, {exampleGarageDoorConcept:"Garage-door concept"});
Object.assign(TRANSLATIONS.de, {exampleGarageDoorConcept:"Garagentor-Konzept"});
Object.assign(TRANSLATIONS.yo, {exampleGarageDoorConcept:"Garage-door concept"});
Object.assign(TRANSLATIONS.pcm, {exampleGarageDoorConcept:"Garage-door concept"});

Object.assign(TRANSLATIONS.en, {exampleElevatorCallQueue:"Elevator call logic concept"});
Object.assign(TRANSLATIONS.de, {exampleElevatorCallQueue:"Aufzugsruf-Warteschlangenmodell"});
Object.assign(TRANSLATIONS.yo, {exampleElevatorCallQueue:"Elevator call logic concept"});
Object.assign(TRANSLATIONS.pcm, {exampleElevatorCallQueue:"Elevator call logic concept"});

Object.assign(TRANSLATIONS.en, {exampleFireAlarmZone:"Fire-alarm zone concept"});
Object.assign(TRANSLATIONS.de, {exampleFireAlarmZone:"Brandmelder-Zonenkonzept"});
Object.assign(TRANSLATIONS.yo, {exampleFireAlarmZone:"Fire-alarm zone concept"});
Object.assign(TRANSLATIONS.pcm, {exampleFireAlarmZone:"Fire-alarm zone concept"});

Object.assign(TRANSLATIONS.en, {exampleAccessStrikeLock:"Access-control strike lock"});
Object.assign(TRANSLATIONS.de, {exampleAccessStrikeLock:"Zutrittskontrolle mit Türöffner"});
Object.assign(TRANSLATIONS.yo, {exampleAccessStrikeLock:"Access-control strike lock"});
Object.assign(TRANSLATIONS.pcm, {exampleAccessStrikeLock:"Access-control strike lock"});

Object.assign(TRANSLATIONS.en, {exampleWarehouseBeacon:"Warehouse beacon concept"});
Object.assign(TRANSLATIONS.de, {exampleWarehouseBeacon:"Lagerstatus-Leuchtmelderkonzept"});
Object.assign(TRANSLATIONS.yo, {exampleWarehouseBeacon:"Warehouse beacon concept"});
Object.assign(TRANSLATIONS.pcm, {exampleWarehouseBeacon:"Warehouse beacon concept"});

Object.assign(TRANSLATIONS.en, {exampleMachineFaultAnnunciator:"Machine fault annunciator"});
Object.assign(TRANSLATIONS.de, {exampleMachineFaultAnnunciator:"Maschinen-Fehleranzeige"});
Object.assign(TRANSLATIONS.yo, {exampleMachineFaultAnnunciator:"Machine fault annunciator"});
Object.assign(TRANSLATIONS.pcm, {exampleMachineFaultAnnunciator:"Machine fault annunciator"});

Object.assign(TRANSLATIONS.en, {exampleBreadboardSchematicSync:"Breadboard-to-schematic sync"});
Object.assign(TRANSLATIONS.de, {exampleBreadboardSchematicSync:"Steckbrett-zu-Schaltplan-Abgleich"});
Object.assign(TRANSLATIONS.yo, {exampleBreadboardSchematicSync:"Breadboard-to-schematic sync"});
Object.assign(TRANSLATIONS.pcm, {exampleBreadboardSchematicSync:"Breadboard-to-schematic sync"});

Object.assign(TRANSLATIONS.en, {exampleSchematicPcbSync:"Schematic-to-PCB sync"});
Object.assign(TRANSLATIONS.de, {exampleSchematicPcbSync:"Schaltplan-zu-PCB-Abgleich"});
Object.assign(TRANSLATIONS.yo, {exampleSchematicPcbSync:"Schematic-to-PCB sync"});
Object.assign(TRANSLATIONS.pcm, {exampleSchematicPcbSync:"Schematic-to-PCB sync"});

Object.assign(TRANSLATIONS.en, {exampleThreeViewLedProject:"Three-view LED project"});
Object.assign(TRANSLATIONS.de, {exampleThreeViewLedProject:"LED-Projekt in drei Ansichten"});
Object.assign(TRANSLATIONS.yo, {exampleThreeViewLedProject:"LED project in breadboard, schematic and PCB views"});
Object.assign(TRANSLATIONS.pcm, {exampleThreeViewLedProject:"LED project for breadboard, schematic and PCB views"});

Object.assign(TRANSLATIONS.en, {exampleUnsupportedBreadboardPackage:"Unsupported breadboard package"});
Object.assign(TRANSLATIONS.de, {exampleUnsupportedBreadboardPackage:"Nicht unterstütztes Steckbrett-Bauteil"});
Object.assign(TRANSLATIONS.yo, {exampleUnsupportedBreadboardPackage:"Unsupported breadboard package"});
Object.assign(TRANSLATIONS.pcm, {exampleUnsupportedBreadboardPackage:"Unsupported breadboard package"});

Object.assign(TRANSLATIONS.en, {exampleMissingFootprintWorkflow:"Missing-footprint workflow"});
Object.assign(TRANSLATIONS.de, {exampleMissingFootprintWorkflow:"Workflow für fehlenden Footprint"});
Object.assign(TRANSLATIONS.yo, {exampleMissingFootprintWorkflow:"Missing-footprint workflow"});
Object.assign(TRANSLATIONS.pcm, {exampleMissingFootprintWorkflow:"Missing-footprint workflow"});

Object.assign(TRANSLATIONS.en, {examplePinIncompatibleSubstitution:"Pin-incompatible substitution"});
Object.assign(TRANSLATIONS.de, {examplePinIncompatibleSubstitution:"Pin-inkompatibler Ersatz"});
Object.assign(TRANSLATIONS.yo, {examplePinIncompatibleSubstitution:"Pin-incompatible substitution"});
Object.assign(TRANSLATIONS.pcm, {examplePinIncompatibleSubstitution:"Pin-incompatible substitution"});

Object.assign(TRANSLATIONS.en, {exampleUnitConversionCalculator:"Unit conversion calculator"});
Object.assign(TRANSLATIONS.de, {exampleUnitConversionCalculator:"Einheitenumrechner"});
Object.assign(TRANSLATIONS.yo, {exampleUnitConversionCalculator:"Unit conversion calculator"});
Object.assign(TRANSLATIONS.pcm, {exampleUnitConversionCalculator:"Unit conversion calculator"});

Object.assign(TRANSLATIONS.en, {exampleResistorColorCodeReader:"Resistor colour-code reader"});
Object.assign(TRANSLATIONS.de, {exampleResistorColorCodeReader:"Widerstands-Farbcodetabelle"});
Object.assign(TRANSLATIONS.yo, {exampleResistorColorCodeReader:"Resistor colour-code reader"});
Object.assign(TRANSLATIONS.pcm, {exampleResistorColorCodeReader:"Resistor colour-code reader"});

Object.assign(TRANSLATIONS.en, {exampleLedResistorCalculator:"LED series-resistor calculator"});
Object.assign(TRANSLATIONS.de, {exampleLedResistorCalculator:"LED-Vorwiderstandsrechner"});
Object.assign(TRANSLATIONS.yo, {exampleLedResistorCalculator:"LED series-resistor calculator"});
Object.assign(TRANSLATIONS.pcm, {exampleLedResistorCalculator:"LED series-resistor calculator"});

Object.assign(TRANSLATIONS.en, {exampleVoltageDividerCalculator:"Voltage-divider calculator"});
Object.assign(TRANSLATIONS.de, {exampleVoltageDividerCalculator:"Spannungsteiler-Rechner"});
Object.assign(TRANSLATIONS.yo, {exampleVoltageDividerCalculator:"Voltage-divider calculator"});
Object.assign(TRANSLATIONS.pcm, {exampleVoltageDividerCalculator:"Voltage-divider calculator"});

Object.assign(TRANSLATIONS.en, {exampleRcTimingCalculator:"RC timing calculator"});
Object.assign(TRANSLATIONS.de, {exampleRcTimingCalculator:"RC-Zeitkonstanten-Rechner"});
Object.assign(TRANSLATIONS.yo, {exampleRcTimingCalculator:"RC timing calculator"});
Object.assign(TRANSLATIONS.pcm, {exampleRcTimingCalculator:"RC timing calculator"});

Object.assign(TRANSLATIONS.en, {exampleOpAmpGainCalculator:"Op-amp gain calculator"});
Object.assign(TRANSLATIONS.de, {exampleOpAmpGainCalculator:"Operationsverstärker-Verstärkungsrechner"});
Object.assign(TRANSLATIONS.yo, {exampleOpAmpGainCalculator:"Op-amp gain calculator"});
Object.assign(TRANSLATIONS.pcm, {exampleOpAmpGainCalculator:"Op-amp gain calculator"});

Object.assign(TRANSLATIONS.en, {examplePcbTraceWidthAdvisor:"PCB trace-width advisor"});
Object.assign(TRANSLATIONS.de, {examplePcbTraceWidthAdvisor:"PCB-Leiterbahnbreiten-Assistent"});
Object.assign(TRANSLATIONS.yo, {examplePcbTraceWidthAdvisor:"PCB trace-width advisor"});
Object.assign(TRANSLATIONS.pcm, {examplePcbTraceWidthAdvisor:"PCB trace-width advisor"});

Object.assign(TRANSLATIONS.en, {exportBomCsv:"Export BOM CSV",exampleBomExportCostPlaceholder:"BOM export and cost placeholder"});
Object.assign(TRANSLATIONS.de, {exportBomCsv:"BOM als CSV exportieren",exampleBomExportCostPlaceholder:"BOM-Export und Kostenplatzhalter"});
Object.assign(TRANSLATIONS.yo, {exportBomCsv:"Gbe BOM CSV jáde",exampleBomExportCostPlaceholder:"Gbigbe BOM jáde àti ààyè iye owó"});
Object.assign(TRANSLATIONS.pcm, {exportBomCsv:"Export BOM CSV",exampleBomExportCostPlaceholder:"BOM export and cost placeholder"});

Object.assign(TRANSLATIONS.en, {exampleBotExplainComponent:"Adigun BOT explains a component",botGroundedMode:"Local facts mode",botGroundedPrivacy:"Answers use only selected-project and checked-in library fields; missing details are called unknown.",botExplainPlaceholder:"Explain selected component",botExplainButton:"Explain",botResponseDefault:"Select a component and ask Adigun BOT for a source-grounded explanation."});
Object.assign(TRANSLATIONS.de, {exampleBotExplainComponent:"Adigun BOT erklärt ein Bauteil",botGroundedMode:"Lokaler Faktenmodus",botGroundedPrivacy:"Antworten verwenden nur Projekt- und Bibliotheksdaten; fehlende Angaben werden als unbekannt markiert.",botExplainPlaceholder:"Ausgewähltes Bauteil erklären",botExplainButton:"Erklären",botResponseDefault:"Bauteil auswählen und Adigun BOT um eine quellenbasierte Erklärung bitten."});
Object.assign(TRANSLATIONS.yo, {exampleBotExplainComponent:"Adigun BOT ṣàlàyé component",botGroundedMode:"Ipo facts lórí ẹrọ",botGroundedPrivacy:"Ìdáhùn lo project àti library fields nìkan; a máa sọ ohun tí kò sí di unknown.",botExplainPlaceholder:"Ṣàlàyé component tí a yan",botExplainButton:"Ṣàlàyé",botResponseDefault:"Yan component kí o sì béèrè fún àlàyé tó ní orísun."});
Object.assign(TRANSLATIONS.pcm, {exampleBotExplainComponent:"Adigun BOT explain component",botGroundedMode:"Local facts mode",botGroundedPrivacy:"Answer use selected project and library fields only; anything missing go show as unknown.",botExplainPlaceholder:"Explain selected component",botExplainButton:"Explain",botResponseDefault:"Select component and ask Adigun BOT for explanation wey show source."});

Object.assign(TRANSLATIONS.en, {botAssistant:"Local project explainer"});
Object.assign(TRANSLATIONS.de, {botAssistant:"Lokaler Projekterklärer"});
Object.assign(TRANSLATIONS.yo, {botAssistant:"Àlàyé project lórí ẹrọ"});
Object.assign(TRANSLATIONS.pcm, {botAssistant:"Local project explainer"});

Object.assign(TRANSLATIONS.en, {botRepairApply:"Review and apply repair preview",exampleBotFloatingNodeRepair:"Adigun BOT floating-node repair preview"});
Object.assign(TRANSLATIONS.de, {botRepairApply:"Reparaturvorschau prüfen und anwenden",exampleBotFloatingNodeRepair:"Adigun BOT: Vorschau für schwebenden Knoten"});
Object.assign(TRANSLATIONS.yo, {botRepairApply:"Ṣàyẹ̀wò kí o sì fi repair preview sílò",exampleBotFloatingNodeRepair:"Adigun BOT repair preview fún floating node"});
Object.assign(TRANSLATIONS.pcm, {botRepairApply:"Review and apply repair preview",exampleBotFloatingNodeRepair:"Adigun BOT floating-node repair preview"});

Object.assign(TRANSLATIONS.en, {botProposalApply:"Review and apply circuit proposal",exampleBotCircuitProposal:"Adigun BOT 12 V LED circuit proposal"});
Object.assign(TRANSLATIONS.de, {botProposalApply:"Schaltungsvorschlag prüfen und anwenden",exampleBotCircuitProposal:"Adigun BOT: 12-V-LED-Schaltungsvorschlag"});
Object.assign(TRANSLATIONS.yo, {botProposalApply:"Ṣàyẹ̀wò kí o sì fi circuit proposal sílò",exampleBotCircuitProposal:"Adigun BOT circuit proposal fún LED 12 V"});
Object.assign(TRANSLATIONS.pcm, {botProposalApply:"Review and apply circuit proposal",exampleBotCircuitProposal:"Adigun BOT 12 V LED circuit proposal"});

Object.assign(TRANSLATIONS.en, {exampleFourLanguageUiSweep:"Four-language UI sweep"});
Object.assign(TRANSLATIONS.de, {exampleFourLanguageUiSweep:"UI-Prüfung für vier Sprachen"});
Object.assign(TRANSLATIONS.yo, {exampleFourLanguageUiSweep:"Ìṣàyẹ̀wò UI ní èdè mẹ́rin"});
Object.assign(TRANSLATIONS.pcm, {exampleFourLanguageUiSweep:"Four-language UI sweep"});

Object.assign(TRANSLATIONS.en, {exampleLocalOfflineRecovery:"Local offline recovery"});
Object.assign(TRANSLATIONS.de, {exampleLocalOfflineRecovery:"Lokale Offline-Wiederherstellung"});
Object.assign(TRANSLATIONS.yo, {exampleLocalOfflineRecovery:"Ìmúpadà project láìsí internet"});
Object.assign(TRANSLATIONS.pcm, {exampleLocalOfflineRecovery:"Local offline recovery"});

Object.assign(TRANSLATIONS.en, {exampleReleaseCandidateE2E:"Release candidate end-to-end"});
Object.assign(TRANSLATIONS.de, {exampleReleaseCandidateE2E:"End-to-End-Prüfung des Release-Kandidaten"});
Object.assign(TRANSLATIONS.yo, {exampleReleaseCandidateE2E:"Ìdánwò release candidate láti ìbẹ̀rẹ̀ dé òpin"});
Object.assign(TRANSLATIONS.pcm, {exampleReleaseCandidateE2E:"Release candidate end-to-end"});

Object.assign(TRANSLATIONS.en, {morePlannedExamples:"All 200 catalogue projects are released; ten supplemental studies are also available."});
Object.assign(TRANSLATIONS.de, {morePlannedExamples:"Alle 200 Katalogprojekte sind veröffentlicht; zusätzlich sind zehn ergänzende Studien verfügbar."});
Object.assign(TRANSLATIONS.yo, {morePlannedExamples:"A ti tú gbogbo iṣẹ́ kátàlọ́ọ̀gù 200 síta; àfikún ìwádìí mẹ́wàá tún wà."});
Object.assign(TRANSLATIONS.pcm, {morePlannedExamples:"All 200 catalogue projects don release; ten extra studies dey available too."});

Object.assign(TRANSLATIONS.en, {"breadboardEditor":"Physical breadboard","breadboardComponentPin":"Component pin","breadboardHole":"Breadboard hole","breadboardAssignPin":"Place pin","breadboardJumperFrom":"Jumper from hole","breadboardJumperTo":"Jumper to hole","breadboardAddJumper":"Add jumper","breadboardComplete":"Physical net map complete","breadboardBlocked":"Physical short or invalid placement","breadboardIncomplete":"Physical map incomplete","breadboardMappedPins":"mapped pins","breadboardJumpers":"jumpers","breadboardRemovePlacement":"Remove placement","breadboardNoPlacements":"No physical pin placements.","breadboardRemoveJumper":"Remove jumper","breadboardNoJumpers":"No physical jumpers.","breadboardInvalidHole":"Enter a valid physical hole from A1–J30 or TP/TM/BP/BM1–30.","breadboardUnknownPin":"Choose a pin that belongs to a component in this project.","breadboardInvalidJumper":"Choose two different valid breadboard holes.","breadboardPhysicalMapLabel":"Physical breadboard pins and jumper wiring · generic board geometry","breadboardNoPhysicalMapLabel":"Breadboard preview · place component pins in physical holes before relying on wiring."});
Object.assign(TRANSLATIONS.de, {"breadboardEditor":"Physisches Steckbrett","breadboardComponentPin":"Bauteilpin","breadboardHole":"Steckbrettloch","breadboardAssignPin":"Pin platzieren","breadboardJumperFrom":"Jumper von Loch","breadboardJumperTo":"Jumper zu Loch","breadboardAddJumper":"Jumper hinzufügen","breadboardComplete":"Physischer Netzplan vollständig","breadboardBlocked":"Physischer Kurzschluss oder ungültige Platzierung","breadboardIncomplete":"Physischer Plan unvollständig","breadboardMappedPins":"zugeordnete Pins","breadboardJumpers":"Jumper","breadboardRemovePlacement":"Platzierung entfernen","breadboardNoPlacements":"Keine physischen Pinplatzierungen.","breadboardRemoveJumper":"Jumper entfernen","breadboardNoJumpers":"Keine physischen Jumper.","breadboardInvalidHole":"Gültiges physisches Loch eingeben: A1–J30 oder TP/TM/BP/BM1–30.","breadboardUnknownPin":"Einen Pin dieses Projekts auswählen.","breadboardInvalidJumper":"Zwei unterschiedliche gültige Steckbrettlöcher auswählen.","breadboardPhysicalMapLabel":"Physische Steckbrettpins und Jumper · generische Platinengeometrie","breadboardNoPhysicalMapLabel":"Steckbrettvorschau · Pins zuerst physischen Löchern zuordnen."});
Object.assign(TRANSLATIONS.yo, {"breadboardEditor":"Physical breadboard","breadboardComponentPin":"Component pin","breadboardHole":"Breadboard hole","breadboardAssignPin":"Place pin","breadboardJumperFrom":"Jumper from hole","breadboardJumperTo":"Jumper to hole","breadboardAddJumper":"Add jumper","breadboardComplete":"Physical net map complete","breadboardBlocked":"Physical short or invalid placement","breadboardIncomplete":"Physical map incomplete","breadboardMappedPins":"mapped pins","breadboardJumpers":"jumpers","breadboardRemovePlacement":"Remove placement","breadboardNoPlacements":"No physical pin placements.","breadboardRemoveJumper":"Remove jumper","breadboardNoJumpers":"No physical jumpers.","breadboardInvalidHole":"Enter a valid physical hole from A1–J30 or TP/TM/BP/BM1–30.","breadboardUnknownPin":"Choose a pin that belongs to a component in this project.","breadboardInvalidJumper":"Choose two different valid breadboard holes.","breadboardPhysicalMapLabel":"Physical breadboard pins and jumper wiring · generic board geometry","breadboardNoPhysicalMapLabel":"Breadboard preview · place component pins in physical holes before relying on wiring."});
Object.assign(TRANSLATIONS.pcm, {"breadboardEditor":"Physical breadboard","breadboardComponentPin":"Component pin","breadboardHole":"Breadboard hole","breadboardAssignPin":"Place pin","breadboardJumperFrom":"Jumper from hole","breadboardJumperTo":"Jumper to hole","breadboardAddJumper":"Add jumper","breadboardComplete":"Physical net map complete","breadboardBlocked":"Physical short or invalid placement","breadboardIncomplete":"Physical map incomplete","breadboardMappedPins":"mapped pins","breadboardJumpers":"jumpers","breadboardRemovePlacement":"Remove placement","breadboardNoPlacements":"No physical pin placements.","breadboardRemoveJumper":"Remove jumper","breadboardNoJumpers":"No physical jumpers.","breadboardInvalidHole":"Enter a valid physical hole from A1–J30 or TP/TM/BP/BM1–30.","breadboardUnknownPin":"Choose a pin that belongs to a component in this project.","breadboardInvalidJumper":"Choose two different valid breadboard holes.","breadboardPhysicalMapLabel":"Physical breadboard pins and jumper wiring · generic board geometry","breadboardNoPhysicalMapLabel":"Breadboard preview · place component pins in physical holes before relying on wiring."});

Object.assign(TRANSLATIONS.en, {"breadboardPackageNote":"Body drawings are generic through-hole resistor and 5 mm LED shapes; no manufacturer-specific package is claimed."});
Object.assign(TRANSLATIONS.de, {"breadboardPackageNote":"Die Gehäusezeichnungen sind generische bedrahtete Widerstands- und 5-mm-LED-Formen; es wird kein herstellerspezifisches Gehäuse behauptet."});
Object.assign(TRANSLATIONS.yo, {"breadboardPackageNote":"Àwòrán body jẹ́ generic fún resistor àti LED 5 mm; kì í ṣe package olupese kan pàtó."});
Object.assign(TRANSLATIONS.pcm, {"breadboardPackageNote":"The body drawings na generic resistor and 5 mm LED shape; e no claim any manufacturer package."});

Object.assign(TRANSLATIONS.en, {breadboardPackageNote:"Generic resistor, capacitor, axial diode, LED, and TO-92 body drawings are illustrative, not manufacturer-specific footprints."});

Object.assign(TRANSLATIONS.de, {breadboardPackageNote:"Generische Gehäuseformen für Widerstand, Kondensator, axiale Diode, LED und TO-92 sind illustrative Darstellungen, keine herstellerspezifischen Footprints."});

Object.assign(TRANSLATIONS.yo, {breadboardPackageNote:"Àwòrán generic fún resistor, capacitor, axial diode, LED àti TO-92 jẹ́ àpẹẹrẹ; kì í ṣe footprint olupese pàtó."});

Object.assign(TRANSLATIONS.pcm, {breadboardPackageNote:"The resistor, capacitor, axial diode, LED and TO-92 drawings na generic example; dem no be manufacturer-specific footprint."});

Object.assign(TRANSLATIONS.en, {"breadboardSyncReview":"Preview schematic sync","breadboardSyncApply":"Apply reviewed netlist","breadboardSyncDefault":"Preview how physical wiring would update the shared netlist.","breadboardSyncReady":"Physical wiring matches the schematic netlist.","breadboardSyncDiff":"Preview ready. Shared net identities will change.","breadboardSyncMerged":"net group(s) merged","breadboardSyncSplit":"net group(s) split","breadboardSyncStale":"The project changed; create a fresh preview.","breadboardSyncBlocked":"Place every wired component pin and fix invalid placements first.","breadboardSyncNoNets":"No connected physical nets."});

Object.assign(TRANSLATIONS.de, {"breadboardSyncReview":"Schaltplanabgleich vorschauen","breadboardSyncApply":"Geprüfte Netzliste übernehmen","breadboardSyncDefault":"Vorschau, wie die physische Verdrahtung die gemeinsame Netzliste ändert.","breadboardSyncReady":"Physische Verdrahtung und Schaltplan-Netzliste stimmen überein.","breadboardSyncDiff":"Vorschau bereit. Gemeinsame Netzidentitäten werden geändert.","breadboardSyncMerged":"Netzgruppe(n) zusammengeführt","breadboardSyncSplit":"Netzgruppe(n) getrennt","breadboardSyncStale":"Das Projekt wurde geändert; Vorschau erneut erstellen.","breadboardSyncBlocked":"Alle verdrahteten Pins platzieren und ungültige Platzierungen korrigieren.","breadboardSyncNoNets":"Keine verbundenen physischen Netze."});

Object.assign(TRANSLATIONS.yo, {"breadboardSyncReview":"Ṣàyẹ̀wò ìsopọ̀ schematic","breadboardSyncApply":"Fi netlist tí a ti ṣàyẹ̀wò sílò","breadboardSyncDefault":"Wo bí wiring ti ara ṣe máa yí shared netlist padà.","breadboardSyncReady":"Wiring ti ara bá schematic netlist mu.","breadboardSyncDiff":"Preview ti ṣetán; shared net identities yóò yí padà.","breadboardSyncMerged":"net group ni a so pọ̀","breadboardSyncSplit":"net group ni a yà sílẹ̀","breadboardSyncStale":"Project ti yí padà; tún preview ṣe.","breadboardSyncBlocked":"Gbe gbogbo wired pin sí iho tó yẹ, kí o sì tún placements tí kò tọ́ ṣe.","breadboardSyncNoNets":"Kò sí physical net tó sopọ̀."});

Object.assign(TRANSLATIONS.pcm, {"breadboardSyncReview":"Preview schematic sync","breadboardSyncApply":"Apply reviewed netlist","breadboardSyncDefault":"Preview how physical wiring go update the shared netlist.","breadboardSyncReady":"Physical wiring match the schematic netlist.","breadboardSyncDiff":"Preview ready. Shared net identities go change.","breadboardSyncMerged":"net group merge","breadboardSyncSplit":"net group split","breadboardSyncStale":"The project don change; make fresh preview.","breadboardSyncBlocked":"Place every wired component pin and fix bad placements first.","breadboardSyncNoNets":"No connected physical nets."});

Object.assign(TRANSLATIONS.en, { breadboardClickPlace: "Click a hole to place selected pin", breadboardSelectPinFirst: "Select a component pin before choosing a hole." });
Object.assign(TRANSLATIONS.de, { breadboardClickPlace: "Loch anklicken, um den ausgewählten Pin zu platzieren", breadboardSelectPinFirst: "Wählen Sie zuerst einen Komponentenpin aus." });
Object.assign(TRANSLATIONS.yo, { breadboardClickPlace: "Tẹ iho láti gbe pin tí a yan sí", breadboardSelectPinFirst: "Yan pin component kí o tó yan iho." });
Object.assign(TRANSLATIONS.pcm, { breadboardClickPlace: "Click hole to place the pin wey you select", breadboardSelectPinFirst: "Select component pin before you choose hole." });

Object.assign(TRANSLATIONS.en, { breadboardPlacementActive: "Placement mode active — use arrow keys and Enter, or click a hole; Escape cancels." });
Object.assign(TRANSLATIONS.de, { breadboardPlacementActive: "Platzierungsmodus aktiv — mit Pfeiltasten und Enter navigieren oder Loch anklicken; Escape bricht ab." });
Object.assign(TRANSLATIONS.yo, { breadboardPlacementActive: "Placement mode ti ṣiṣẹ — lo àwọn arrow key àti Enter tàbí tẹ iho; Escape láti fagilé." });
Object.assign(TRANSLATIONS.pcm, { breadboardPlacementActive: "Placement mode dey on — use arrow keys and Enter, or click hole; Escape go cancel." });

Object.assign(TRANSLATIONS.en, { schematicWireMode: "Wire", schematicWireStart: "Choose the first pin, then choose the second.", schematicWireNext: "Choose the second pin; Escape cancels.", schematicWireFailed: "The selected pins could not be connected." });
Object.assign(TRANSLATIONS.de, { schematicWireMode: "Verbinden", schematicWireStart: "Ersten Pin und danach zweiten Pin auswählen.", schematicWireNext: "Zweiten Pin auswählen; Escape bricht ab.", schematicWireFailed: "Die ausgewählten Pins konnten nicht verbunden werden." });
Object.assign(TRANSLATIONS.yo, { schematicWireMode: "So pọ̀", schematicWireStart: "Yan pin àkọ́kọ́, lẹ́yìn náà yan èkejì.", schematicWireNext: "Yan pin kejì; Escape láti fagilé.", schematicWireFailed: "A kò lè so àwọn pin tí o yan pọ̀." });
Object.assign(TRANSLATIONS.pcm, { schematicWireMode: "Connect", schematicWireStart: "Choose first pin, then choose the second one.", schematicWireNext: "Choose second pin; Escape go cancel.", schematicWireFailed: "The pins wey you select no fit connect." });

Object.assign(TRANSLATIONS.en, { pcbStoredLayoutPreview: "PCB preview — stored pads and routes shown; manufacturing validity is not implied.", pcbNoFootprintData: "No footprint, pad, or route data in this project." });
Object.assign(TRANSLATIONS.de, { pcbStoredLayoutPreview: "PCB-Vorschau — gespeicherte Pads und Leiterbahnen; keine Fertigungsfreigabe.", pcbNoFootprintData: "Dieses Projekt enthält keine Footprint-, Pad- oder Routendaten." });
Object.assign(TRANSLATIONS.yo, { pcbStoredLayoutPreview: "PCB preview — pads àti routes tí a fi pamọ́ hàn; èyí kì í ṣe ìjẹ́rìísí iṣẹ́ iṣelọpọ.", pcbNoFootprintData: "Project yìí kò ní footprint, pad tàbí route data." });
Object.assign(TRANSLATIONS.pcm, { pcbStoredLayoutPreview: "PCB preview — e show stored pads and routes; e no mean say e ready for production.", pcbNoFootprintData: "This project no get footprint, pad, or route data." });


Object.assign(TRANSLATIONS.en, { pcbMoveOutOfBounds: "That footprint would extend beyond the board edge.", pcbMoveNoFootprint: "This footprint has no movable pad data.", pcbMoveInvalidGeometry: "The board or footprint has invalid pad geometry; correct its dimensions before moving it.", pcbMoveComplete: "PCB footprint moved; attached route endpoints were updated." });
Object.assign(TRANSLATIONS.de, { pcbMoveOutOfBounds: "Dieser Footprint würde über den Platinenrand hinausragen.", pcbMoveNoFootprint: "Für diesen Footprint sind keine beweglichen Pad-Daten vorhanden.", pcbMoveInvalidGeometry: "Board oder Footprint hat ungültige Pad-Geometrie; korrigieren Sie die Abmessungen vor dem Verschieben.", pcbMoveComplete: "PCB-Footprint verschoben; verbundene Leiterbahnenden wurden aktualisiert." });
Object.assign(TRANSLATIONS.yo, { pcbMoveOutOfBounds: "Footprint náà yóò kọjá etí board.", pcbMoveNoFootprint: "Footprint yìí kò ní data pad tó ṣeé gbé.", pcbMoveInvalidGeometry: "Board tàbí footprint yìí ní geometry pad tí kò tọ́; ṣàtúnṣe ìwọ̀n rẹ̀ kí o tó gbé e.", pcbMoveComplete: "A gbé PCB footprint; a tún àwọn route endpoints tó so mọ́ ọn ṣe." });
Object.assign(TRANSLATIONS.pcm, { pcbMoveOutOfBounds: "That footprint go pass the board edge.", pcbMoveNoFootprint: "This footprint no get movable pad data.", pcbMoveInvalidGeometry: "The board or footprint get bad pad dimensions; correct am before you move the footprint.", pcbMoveComplete: "PCB footprint don move; connected route endpoints don update." });

Object.assign(TRANSLATIONS.en, { pcbFootprintProperties: "PCB footprint", pcbFootprintPackage: "Package", pcbFootprintPosition: "Pad centroid (mm)", pcbFootprintPadCount: "Pads", pcbFootprintRouteCount: "Routes on connected nets" });
Object.assign(TRANSLATIONS.de, { pcbFootprintProperties: "PCB-Footprint", pcbFootprintPackage: "Gehäuse", pcbFootprintPosition: "Pad-Schwerpunkt (mm)", pcbFootprintPadCount: "Pads", pcbFootprintRouteCount: "Leiterbahnen verbundener Netze" });
Object.assign(TRANSLATIONS.yo, { pcbFootprintProperties: "PCB footprint", pcbFootprintPackage: "Package", pcbFootprintPosition: "Aárín pads (mm)", pcbFootprintPadCount: "Pads", pcbFootprintRouteCount: "Routes lórí nets tó so pọ̀" });
Object.assign(TRANSLATIONS.pcm, { pcbFootprintProperties: "PCB footprint", pcbFootprintPackage: "Package", pcbFootprintPosition: "Pad centre point (mm)", pcbFootprintPadCount: "Pads", pcbFootprintRouteCount: "Routes for connected nets" });

Object.assign(TRANSLATIONS.en, { pcbRoute: "Route", pcbRouteAria: "Interactive PCB routing", pcbRouteStart: "Choose a start pad on a stored PCB footprint.", pcbRouteWaypoint: "Choose one or more board points, then choose a pad on the same net.", pcbRouteReady: "Choose a start pad to begin another route.", pcbRouteDifferentNet: "Choose a pad on the same net. Press Escape to cancel this route.", pcbRouteBlocked: "Route blocked by board geometry or the configured trace rules.", pcbRouteComplete: "Copper route added. Run PCB checks before exporting." });
Object.assign(TRANSLATIONS.de, { pcbRoute: "Leiterbahn", pcbRouteAria: "Interaktives PCB-Routing", pcbRouteStart: "Startpad auf einem gespeicherten PCB-Footprint wählen.", pcbRouteWaypoint: "Board-Punkte wählen und danach ein Pad desselben Netzes auswählen.", pcbRouteReady: "Startpad für die nächste Leiterbahn wählen.", pcbRouteDifferentNet: "Pad desselben Netzes wählen. Escape bricht die Leiterbahn ab.", pcbRouteBlocked: "Leiterbahn durch Board-Geometrie oder konfigurierte Regeln blockiert.", pcbRouteComplete: "Leiterbahn hinzugefügt. Vor dem Export PCB-Prüfungen ausführen." });
Object.assign(TRANSLATIONS.yo, { pcbRoute: "Route", pcbRouteAria: "Ṣe PCB route pẹ̀lú ọwọ́", pcbRouteStart: "Yan start pad lórí footprint PCB tí a pamọ́.", pcbRouteWaypoint: "Yan àwọn ibi lórí board, lẹ́yìn náà pad kan lórí net kan náà.", pcbRouteReady: "Yan start pad láti bẹ̀rẹ̀ route míràn.", pcbRouteDifferentNet: "Yan pad lórí net kan náà. Tẹ Escape láti fagilé route yìí.", pcbRouteBlocked: "Board geometry tàbí trace rules dènà route yìí.", pcbRouteComplete: "A fi copper route kún un. Ṣe PCB checks kí o tó export." });
Object.assign(TRANSLATIONS.pcm, { pcbRoute: "Route", pcbRouteAria: "Route PCB with hand", pcbRouteStart: "Choose start pad for stored PCB footprint.", pcbRouteWaypoint: "Choose board points, then choose pad for the same net.", pcbRouteReady: "Choose start pad to begin another route.", pcbRouteDifferentNet: "Choose pad for the same net. Press Escape to cancel this route.", pcbRouteBlocked: "Board shape or configured trace rules block this route.", pcbRouteComplete: "Copper route don add. Run PCB checks before export." });

Object.assign(TRANSLATIONS.en, { implementationStatusBody: "AdigunSimulator is a local-first workspace with four interface languages and 200 released catalogue examples. The generic starter library has 0 of the 1,000 target parts verified. Supported analyses use bounded models; this is not a general SPICE simulator. Projects with mapped PCB data support interactive single-layer F.Cu routing, bounded checks and educational exports. These checks do not certify a board for manufacture. Adigun BOT, accounts and cloud sync are unavailable." });
Object.assign(TRANSLATIONS.de, { implementationStatusBody: "AdigunSimulator ist ein lokaler Arbeitsbereich mit vier Oberflächensprachen und 200 veröffentlichten Katalogprojekten. In der generischen Startbibliothek sind 0 der angestrebten 1.000 Bauteile verifiziert. Unterstützte Analysen verwenden begrenzte Modelle; dies ist kein allgemeiner SPICE-Simulator. Projekte mit zugeordneten PCB-Daten unterstützen interaktives Routing auf einer F.Cu-Lage, begrenzte Prüfungen und Lern-Exporte. Diese Prüfungen zertifizieren keine Platine für die Fertigung. Adigun BOT, Konten und Cloud-Synchronisierung sind nicht verfügbar." });
Object.assign(TRANSLATIONS.yo, { implementationStatusBody: "AdigunSimulator jẹ́ ibi iṣẹ́ tó ń ṣiṣẹ́ lórí ẹ̀rọ agbègbè, ó ní èdè ojú-iṣẹ́ mẹ́rin àti iṣẹ́ kátàlọ́ọ̀gù 200 tó jáde. Nínú starter library gbogbogbo, 0 nínú àfojúsùn apá 1,000 ni a ti fìdí rẹ̀ múlẹ̀. Àwọn ìṣirò tó wà lo àwọn model tó ní ààlà; èyí kì í ṣe SPICE simulator gbogbogbo. Àwọn iṣẹ́ tó ní PCB data tí a ti map lè ṣe interactive routing lórí F.Cu layer kan, àwọn àyẹ̀wò tó ní ààlà àti exports fún ẹ̀kọ́. Àwọn àyẹ̀wò yìí kò jẹ́ ìjẹ́rìí pé board ti ṣetán fún iṣelọpọ. Adigun BOT, àkọọ́lẹ̀ àti cloud sync kò sí." });
Object.assign(TRANSLATIONS.pcm, { implementationStatusBody: "AdigunSimulator na local-first workspace with four interface languages and 200 released catalogue projects. The generic starter library get 0 out of the 1,000 target parts verified. Supported analyses use bounded models; this no be general SPICE simulator. Projects wey get mapped PCB data fit use interactive routing on one F.Cu layer, bounded checks, and learning exports. These checks no certify board for manufacturing. Adigun BOT, accounts, and cloud sync no dey available." });
