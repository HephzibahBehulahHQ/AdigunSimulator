export function calculateOpAmpGain({configuration,inputResistanceOhms,feedbackResistanceOhms,groundResistanceOhms}) {
  if(!["inverting","non-inverting"].includes(configuration))return {ok:false,error:"Choose inverting or non-inverting configuration."};
  const required=configuration==="inverting"?[inputResistanceOhms,feedbackResistanceOhms]:[feedbackResistanceOhms,groundResistanceOhms];
  if(!required.every(value=>typeof value==="number"&&Number.isFinite(value)))return {ok:false,error:"Required resistor values must be finite numbers in ohms."};
  if(required.some(value=>value<=0))return {ok:false,error:"Required resistor values must be greater than zero."};
  const gain=configuration==="inverting"?-feedbackResistanceOhms/inputResistanceOhms:1+feedbackResistanceOhms/groundResistanceOhms;
  if(!Number.isFinite(gain))return {ok:false,error:"Calculated gain is outside the finite numeric range."};
  return {ok:true,configuration,inputResistanceOhms:configuration==="inverting"?inputResistanceOhms:null,feedbackResistanceOhms,groundResistanceOhms:configuration==="non-inverting"?groundResistanceOhms:null,gain,magnitude:Math.abs(gain),phaseInverted:gain<0};
}

export function runOpAmpGainCalculator(project) {
  const cfg=project?.opAmpGainCalculator;if(cfg?.kind!=="op-amp-gain-cases"||!Array.isArray(cfg.cases)||cfg.cases.length===0)return {state:"blocked",engine:"Ideal op-amp gain calculator",message:"Provide op-amp gain cases.",errors:[{code:"OPAMP_GAIN_CONFIGURATION",message:"At least one case is required."}],warnings:[],result:null};
  const results=cfg.cases.map(item=>({id:item.id,...calculateOpAmpGain(item)}));if(results.some(item=>!item.ok))return {state:"blocked",engine:"Ideal op-amp gain calculator",message:"A case has invalid topology or resistor values.",errors:results.filter(item=>!item.ok).map(item=>({code:"OPAMP_GAIN_INVALID",message:item.id+": "+item.error})),warnings:[],result:{kind:"op-amp-gain-cases",caseCount:results.length,results}};
  return {state:"complete",engine:"Ideal closed-loop resistor-ratio equations",message:"Reports ideal inverting and non-inverting closed-loop gains from resistor ratios.",errors:[],warnings:[{code:"IDEAL_OPAMP_LIMIT",message:"No op-amp bandwidth, input offset/bias, output swing, slew rate, stability, load, or supply-rail limits are modeled."}],result:{kind:"op-amp-gain-cases",caseCount:results.length,results}};
}