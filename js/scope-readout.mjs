const messages={
 en:{dc:'Steady DC: a horizontal trace is expected.',idle:'Select a project, then click Run calculation.',stopped:'Simulation stopped. Click Run calculation to display the signal.',updating:'Updating the signal…',blocked:'No signal: the calculation did not complete.',unsupported:'This calculation has no time-domain voltage recording. See Simulation Output for its results.'},
 de:{dc:'Gleichspannung: Eine waagerechte Kurve ist zu erwarten.',idle:'Projekt auswählen und Berechnung starten.',stopped:'Simulation gestoppt. Berechnung starten, um das Signal anzuzeigen.',updating:'Signal wird aktualisiert…',blocked:'Kein Signal: Die Berechnung wurde nicht abgeschlossen.',unsupported:'Diese Berechnung enthält keine Spannungsaufzeichnung über der Zeit. Ergebnisse stehen in der Simulationsausgabe.'},
 yo:{dc:'DC tó dúró: ìlà pẹ̀lẹ́bẹ̀ ni a ń retí.',idle:'Yan iṣẹ́, lẹ́yìn náà bẹ̀rẹ̀ ìṣirò.',stopped:'Ìṣirò ti dá dúró. Bẹ̀rẹ̀ ìṣirò láti fi àmì hàn.',updating:'A ń tún àmì ṣe…',blocked:'Kò sí àmì: ìṣirò kò parí.',unsupported:'Ìṣirò yìí kò ní àkọsílẹ̀ foliteji pẹ̀lú àkókò. Wo àbájáde ìṣirò.'},
 pcm:{dc:'Steady DC: na straight horizontal line you suppose see.',idle:'Select project, then click Run calculation.',stopped:'Simulation don stop. Click Run calculation to show signal.',updating:'Signal dey update…',blocked:'No signal: calculation no complete.',unsupported:'This calculation no get voltage recording over time. Check Simulation Output for results.'}
};
export function scopeExplanation({analysis,live,trace,locale='en'}){
 const text=messages[locale]??messages.en;
 if(trace)return trace.kind==='dc'?text.dc:'';
 if(live?.status==='updating')return text.updating;
 if(live?.playback==='stopped')return text.stopped;
 if(!analysis)return text.idle;
 if(analysis.state!=='complete')return [text.blocked,analysis.message].filter(Boolean).join(' ');
 return [analysis.engine,text.unsupported].filter(Boolean).join(' · ');
}
