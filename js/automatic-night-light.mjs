const validLux=samples=>Array.isArray(samples)&&samples.length>=1&&samples.length<=300&&samples.every(value=>Number.isFinite(value)&&value>=0&&value<=200000);
export function runAutomaticNightLight(project) {
  const cfg=project?.automaticNightLight;
  if(cfg?.kind!=="lux-threshold-switch"||!Number.isFinite(cfg.thresholdLux)||cfg.thresholdLux<=0||cfg.thresholdLux>200000||!validLux(cfg.luxSamples))
    return {state:"blocked",engine:"Automatic night-light threshold concept",message:"Provide a threshold above 0 and up to 200,000 lux, plus 1–300 valid lux samples.",errors:[{code:"NIGHT_LIGHT_CONFIGURATION",message:"The lux threshold or sample array is invalid."}],warnings:[],result:null};
  const frames=cfg.luxSamples.map((lux,index)=>({step:index+1,lux,ledOn:lux<cfg.thresholdLux,condition:lux<cfg.thresholdLux?"dark":"daylight"}));
  return {state:"complete",engine:"Deterministic lux-threshold switch",message:"The logical LED command is on below the configured lux threshold and off at or above it.",errors:[],warnings:[{code:"NIGHT_LIGHT_CONCEPT_ONLY",message:"Synthetic lux inputs and a Boolean LED command only; no LDR curve, spectral response, ambient placement, comparator circuit, dimming, or real illumination is modeled."}],result:{kind:"night-light-lux-threshold",thresholdLux:cfg.thresholdLux,sampleCount:frames.length,ledOnSamples:frames.filter(frame=>frame.ledOn).length,frames}};
}
