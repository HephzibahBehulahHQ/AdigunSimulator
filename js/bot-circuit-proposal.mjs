import { runSupportedAnalysis, updateComponent, validateProject } from "./core.mjs";

const E12=[1,1.2,1.5,1.8,2.2,2.7,3.3,3.9,4.7,5.6,6.8,8.2];

function calculate(values) {
  const {supplyVoltageV,ledForwardVoltageV,targetCurrentA}=values??{};
  if(![supplyVoltageV,ledForwardVoltageV,targetCurrentA].every(value=>typeof value==="number"&&Number.isFinite(value))||supplyVoltageV<=ledForwardVoltageV||ledForwardVoltageV<0||targetCurrentA<=0) {
    return {ok:false,error:"Supply voltage, LED forward voltage, and target current must be finite and physically ordered positive values."};
  }
  const requiredResistanceOhms=(supplyVoltageV-ledForwardVoltageV)/targetCurrentA;
  const decade=10**Math.floor(Math.log10(requiredResistanceOhms));
  const normalized=requiredResistanceOhms/decade;
  let selected=E12.find(value=>value>=normalized);
  let recommendedResistanceOhms;
  if(selected===undefined)recommendedResistanceOhms=10*decade;
  else recommendedResistanceOhms=selected*decade;
  const estimatedCurrentA=(supplyVoltageV-ledForwardVoltageV)/recommendedResistanceOhms;
  return {ok:true,supplyVoltageV,ledForwardVoltageV,targetCurrentA,requiredResistanceOhms,recommendedResistanceOhms,estimatedCurrentA,resistorDissipationW:estimatedCurrentA**2*recommendedResistanceOhms,assumption:"Ideal DC source and nominal LED forward voltage; next E12 value not below the calculated minimum."};
}

function fingerprint(project) {
  return JSON.stringify(project);
}

export function buildBotCircuitProposal(project) {
  const cfg=project?.botCircuitProposal;
  if(cfg?.kind!=="12v-led-proposal")return {ok:false,error:"A 12 V LED proposal configuration is required."};
  const calculated=calculate(cfg);
  if(!calculated.ok)return calculated;
  const source=project.components.find(item=>item.libraryId==="power.dc-source");
  const resistor=project.components.find(item=>item.libraryId==="passive.resistor");
  const led=project.components.find(item=>item.libraryId==="diode.led-red");
  if(!source||!resistor||!led)return {ok:false,error:"The preview needs a supported source, resistor, red LED, and existing connected circuit."};
  try {
    const baseFingerprint=fingerprint(project);
    let candidate=updateComponent(project,source.instanceId,{value:calculated.supplyVoltageV+" V"});
    candidate=updateComponent(candidate,resistor.instanceId,{value:(calculated.recommendedResistanceOhms>=1000?calculated.recommendedResistanceOhms/1000+" kΩ":calculated.recommendedResistanceOhms+" Ω")});
    candidate=updateComponent(candidate,led.instanceId,{value:"Vf "+calculated.ledForwardVoltageV.toFixed(1)+" V"});
    candidate={...candidate,metadata:{...candidate.metadata,name:"Adigun BOT · 12 V LED proposal"}};
    delete candidate.botCircuitProposal;
    const validation=validateProject(candidate);
    if(!validation.valid)return {ok:false,error:"The proposed project failed native schema validation.",validation};
    const simulation=runSupportedAnalysis(candidate);
    if(simulation.state!=="complete")return {ok:false,error:"The proposed circuit does not pass the supported analysis.",simulation};
    return {ok:true,baseFingerprint,candidate,validation,simulation,calculated,proposal:{source:calculated.supplyVoltageV+" V",resistor:calculated.recommendedResistanceOhms+" Ω",ledVf:calculated.ledForwardVoltageV+" V",estimatedCurrentA:calculated.estimatedCurrentA,resistorDissipationW:calculated.resistorDissipationW},warning:"Ideal estimate only. Confirm the actual LED forward-voltage/current limits, resistor power rating and derating, supply tolerance, and circuit purpose before building."};
  } catch(error) {
    return {ok:false,error:error instanceof Error?error.message:"Circuit proposal could not be built."};
  }
}

export function applyBotCircuitProposal(project,preview,{confirmed=false}={}) {
  if(!confirmed)return {ok:false,applied:false,project,message:"No change made; explicit confirmation is required."};
  if(!preview?.ok||preview.baseFingerprint!==fingerprint(project))return {ok:false,applied:false,project,message:"The proposal is invalid or the project changed. Rebuild and review it."};
  if(!validateProject(preview.candidate).valid||runSupportedAnalysis(preview.candidate).state!=="complete")return {ok:false,applied:false,project,message:"The proposed project no longer passes validation and supported analysis."};
  return {ok:true,applied:true,project:preview.candidate,message:"Confirmed circuit proposal applied locally."};
}

export function runBotCircuitProposal(project) {
  const preview=buildBotCircuitProposal(project);
  if(!preview.ok)return {state:"blocked",engine:"Adigun BOT 12 V LED circuit proposal",message:preview.error,errors:[{code:"BOT_CIRCUIT_PROPOSAL",message:preview.error}],warnings:[],result:null};
  return {state:"complete",engine:"Adigun BOT 12 V LED circuit proposal",message:"Schema-validated local preview only. The original project remains unchanged until you explicitly confirm.",errors:[],warnings:[{code:"BOT_CIRCUIT_PROPOSAL_REQUIRES_REVIEW",message:preview.warning}],result:{kind:"bot-12v-led-circuit-proposal",proposal:preview.proposal,analysisState:preview.simulation.state,applied:false},preview};
}
