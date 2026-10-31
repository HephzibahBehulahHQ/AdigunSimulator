const RESISTANCE_SCALE=Object.freeze({"Ω":1,ohm:1,kΩ:1e3,MΩ:1e6,mΩ:1e-3});
const CAPACITANCE_SCALE=Object.freeze({F:1,mF:1e-3,"µF":1e-6,"μF":1e-6,uF:1e-6,nF:1e-9,pF:1e-12});

export function calculateRcTiming({resistanceValue,resistanceUnit,capacitanceValue,capacitanceUnit}) {
  if(!Number.isFinite(resistanceValue)||!Number.isFinite(capacitanceValue))return {ok:false,error:"R and C values must be finite numbers."};
  if(resistanceValue<=0||capacitanceValue<=0)return {ok:false,error:"Resistance and capacitance must be greater than zero."};
  const rScale=RESISTANCE_SCALE[resistanceUnit],cScale=CAPACITANCE_SCALE[capacitanceUnit];if(!rScale||!cScale)return {ok:false,error:"Choose supported Ω/kΩ/MΩ and F/mF/µF/nF/pF units."};
  const resistanceOhms=resistanceValue*rScale,capacitanceFarads=capacitanceValue*cScale,timeConstantSeconds=resistanceOhms*capacitanceFarads,cutoffFrequencyHz=1/(2*Math.PI*timeConstantSeconds);
  if(!Number.isFinite(timeConstantSeconds)||!Number.isFinite(cutoffFrequencyHz))return {ok:false,error:"The R-C combination is outside the supported numeric range."};
  return {ok:true,resistanceValue,resistanceUnit,capacitanceValue,capacitanceUnit,resistanceOhms,capacitanceFarads,timeConstantSeconds,cutoffFrequencyHz};
}

export function runRcTimingCalculator(project) {
  const cfg=project?.rcTimingCalculator;if(cfg?.kind!=="rc-timing-cases"||!Array.isArray(cfg.cases)||cfg.cases.length===0)return {state:"blocked",engine:"RC timing calculator",message:"Provide R-C timing cases.",errors:[{code:"RC_TIMING_CONFIGURATION",message:"At least one case is required."}],warnings:[],result:null};
  const results=cfg.cases.map(item=>({id:item.id,...calculateRcTiming(item)}));if(results.some(item=>!item.ok))return {state:"blocked",engine:"RC timing calculator",message:"A case has invalid resistance or capacitance values.",errors:results.filter(item=>!item.ok).map(item=>({code:"RC_TIMING_INVALID",message:item.id+": "+item.error})),warnings:[],result:{kind:"rc-timing-cases",caseCount:results.length,results}};
  return {state:"complete",engine:"First-order RC time constant and cutoff",message:"Computes τ = R × C and the ideal first-order cutoff f = 1/(2πRC) from decimal SI prefixes.",errors:[],warnings:[{code:"IDEAL_RC_MODEL",message:"Ideal first-order response only; capacitor tolerance, ESR, leakage, source impedance, and load are not included."}],result:{kind:"rc-timing-cases",caseCount:results.length,results}};
}