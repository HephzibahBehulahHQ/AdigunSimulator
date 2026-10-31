const COEFFICIENTS=Object.freeze({external:0.048,internal:0.024});
const SOURCE="IPC-2221 legacy empirical current/temperature-rise estimate";

export function calculatePcbTraceWidth({currentA,copperThicknessUm,temperatureRiseC,layerType}) {
  const values=[currentA,copperThicknessUm,temperatureRiseC];if(!values.every(value=>typeof value==="number"&&Number.isFinite(value)))return {ok:false,error:"Current, copper thickness, and temperature rise must be finite numbers."};
  if(currentA<=0||copperThicknessUm<=0||temperatureRiseC<=0)return {ok:false,error:"Current, copper thickness, and temperature rise must be greater than zero."};
  const k=COEFFICIENTS[layerType];if(!k)return {ok:false,error:"Layer type must be external or internal."};
  const crossSectionMil2=(currentA/(k*temperatureRiseC**0.44))**(1/0.725),copperThicknessMil=copperThicknessUm/25.4,widthMil=crossSectionMil2/copperThicknessMil,widthMm=widthMil*0.0254;
  if(!Number.isFinite(widthMm)||widthMm<=0)return {ok:false,error:"Calculated width is outside the supported numeric range."};
  return {ok:true,currentA,copperThicknessUm,temperatureRiseC,layerType,crossSectionMil2,widthMil,widthMm,model:SOURCE,coefficient:k};
}

export function runPcbTraceWidthAdvisor(project) {
  const cfg=project?.pcbTraceWidthAdvisor;if(cfg?.kind!=="trace-width-cases"||!Array.isArray(cfg.cases)||cfg.cases.length===0)return {state:"blocked",engine:"PCB trace-width advisory",message:"Provide trace sizing cases.",errors:[{code:"TRACE_WIDTH_CONFIGURATION",message:"At least one case is required."}],warnings:[],result:null};
  const results=cfg.cases.map(item=>({id:item.id,...calculatePcbTraceWidth(item)}));if(results.some(item=>!item.ok))return {state:"blocked",engine:"PCB trace-width advisory",message:"A case contains invalid sizing inputs.",errors:results.filter(item=>!item.ok).map(item=>({code:"TRACE_WIDTH_INVALID",message:item.id+": "+item.error})),warnings:[],result:{kind:"pcb-trace-width-advisory",caseCount:results.length,results,source:SOURCE}};
  return {state:"complete",engine:SOURCE,message:"Provides an educational width estimate only; it is not a standards-compliance decision or fabrication approval.",errors:[],warnings:[{code:"TRACE_WIDTH_ADVISORY_ONLY",message:"IPC-2152 and the current IPC design process use broader board and thermal context. Verify the stackup, copper, planes, vias, ambient, duty cycle, voltage drop, fabrication tolerances, and safety requirements."}],result:{kind:"pcb-trace-width-advisory",caseCount:results.length,results,source:SOURCE,standardLimitation:"Do not treat this legacy equation as IPC-2152 analysis, IPC compliance, a DRC result, or a manufacturing recommendation."}};
}