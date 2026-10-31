const E12=[1,1.2,1.5,1.8,2.2,2.7,3.3,3.9,4.7,5.6,6.8,8.2];

function nextE12Resistance(requiredOhms) {
  for(let decade=-1;decade<=9;decade++)for(const base of E12){const candidate=base*10**decade;if(candidate>=requiredOhms)return candidate;}
  return null;
}

export function calculateLedSeriesResistor({supplyVoltageV,ledForwardVoltageV,targetCurrentmA,resistorPowerRatingW,ledMaxCurrentmA=20}) {
  const values=[supplyVoltageV,ledForwardVoltageV,targetCurrentmA,resistorPowerRatingW,ledMaxCurrentmA];if(!values.every(Number.isFinite))return {ok:false,error:"All electrical values must be finite numbers."};
  if(supplyVoltageV<=0||ledForwardVoltageV<0||supplyVoltageV<=ledForwardVoltageV)return {ok:false,error:"Supply voltage must be greater than the nonnegative LED forward voltage."};
  if(targetCurrentmA<=0||resistorPowerRatingW<=0||ledMaxCurrentmA<=0)return {ok:false,error:"Target current, resistor power rating, and LED current limit must be positive."};
  const voltageAcrossResistorV=supplyVoltageV-ledForwardVoltageV,requiredResistanceOhms=voltageAcrossResistorV/(targetCurrentmA/1000),recommendedResistanceOhms=nextE12Resistance(requiredResistanceOhms);
  if(!recommendedResistanceOhms)return {ok:false,error:"Required resistance is outside the supported E12 range."};
  const estimatedCurrentmA=voltageAcrossResistorV/recommendedResistanceOhms*1000,resistorDissipationW=voltageAcrossResistorV**2/recommendedResistanceOhms;
  const warnings=[];if(resistorDissipationW>resistorPowerRatingW)warnings.push({code:"RESISTOR_POWER_EXCEEDED",message:"Estimated resistor dissipation exceeds the entered power rating."});else if(resistorDissipationW>=resistorPowerRatingW*0.8)warnings.push({code:"RESISTOR_POWER_MARGIN_LOW",message:"Estimated resistor dissipation uses at least 80% of the entered power rating; review derating and ambient conditions."});
  if(estimatedCurrentmA>ledMaxCurrentmA)warnings.push({code:"LED_CURRENT_LIMIT_EXCEEDED",message:"Estimated LED current exceeds the entered LED current limit."});
  return {ok:true,supplyVoltageV,ledForwardVoltageV,targetCurrentmA,ledMaxCurrentmA,voltageAcrossResistorV,requiredResistanceOhms,recommendedResistanceOhms,estimatedCurrentmA,resistorDissipationW,resistorPowerRatingW,warnings};
}

export function runLedResistorCalculator(project) {
  const cfg=project?.ledResistorCalculator;if(cfg?.kind!=="led-series-resistor-cases"||!Array.isArray(cfg.cases)||cfg.cases.length===0)return {state:"blocked",engine:"LED series-resistor calculator",message:"Provide LED resistor calculation cases.",errors:[{code:"LED_RESISTOR_CONFIGURATION",message:"At least one case is required."}],warnings:[],result:null};
  const results=cfg.cases.map(item=>({id:item.id,...calculateLedSeriesResistor(item)}));if(results.some(item=>!item.ok))return {state:"blocked",engine:"LED series-resistor calculator",message:"A case has invalid source, LED, current, or power-rating values.",errors:results.filter(item=>!item.ok).map(item=>({code:"LED_RESISTOR_INVALID",message:item.id+": "+item.error})),warnings:[],result:{kind:"led-series-resistor-cases",caseCount:results.length,results}};
  return {state:"complete",engine:"Ohm-law resistor sizing with upward E12 recommendation",message:"Each suggested standard resistor is at or above the ideal minimum so the ideal current estimate does not exceed the target.",errors:[],warnings:[],result:{kind:"led-series-resistor-cases",caseCount:results.length,powerWarningCount:results.filter(item=>item.warnings.some(warning=>warning.code.startsWith("RESISTOR_POWER"))).length,results}};
}