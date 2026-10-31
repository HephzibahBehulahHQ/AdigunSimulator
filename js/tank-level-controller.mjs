const validSamples=(samples)=>Array.isArray(samples)&&samples.length>=1&&samples.length<=100&&samples.every(value=>Number.isFinite(value)&&value>=0&&value<=100);
export function runTankLevelController(project) {
  const cfg=project?.tankLevelController;
  if(cfg?.kind!=="low-high-hysteresis"||!Number.isFinite(cfg.lowLevelPct)||!Number.isFinite(cfg.highLevelPct)||cfg.lowLevelPct<0||cfg.highLevelPct>100||cfg.lowLevelPct>=cfg.highLevelPct||!validSamples(cfg.levelSamples)||typeof cfg.initialPumpOn!=="boolean")
    return {state:"blocked",engine:"PLC tank-level hysteresis concept",message:"Provide ordered low/high thresholds from 0–100% and 1–100 valid level samples.",errors:[{code:"TANK_LEVEL_CONFIGURATION",message:"The low threshold must be below the high threshold; each level sample must be between 0% and 100%."}],warnings:[],result:null};
  let pumpOn=cfg.initialPumpOn;const frames=[];
  cfg.levelSamples.forEach((levelPct,index)=>{const before=pumpOn;if(levelPct<=cfg.lowLevelPct)pumpOn=true;else if(levelPct>=cfg.highLevelPct)pumpOn=false;frames.push({step:index+1,levelPct,pumpOn,transition:before===pumpOn?"held":pumpOn?"started":"stopped"});});
  return {state:"complete",engine:"Deterministic low/high PLC hysteresis concept",message:"Pump command follows the low/high hysteresis band over the supplied synthetic samples.",errors:[],warnings:[{code:"TANK_CONTROLLER_CONCEPT_ONLY",message:"Synthetic level input and Boolean pump command only; no liquid, pump, sensor, wiring, protection, scan-time, overflow or dry-run model is included."}],result:{kind:"tank-level-hysteresis",lowLevelPct:cfg.lowLevelPct,highLevelPct:cfg.highLevelPct,sampleCount:frames.length,pumpOnSamples:frames.filter(frame=>frame.pumpOn).length,frames}};
}
