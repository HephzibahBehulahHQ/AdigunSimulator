const STATES=new Set(["vacant","occupied","fault"]);
export function runWarehouseBeacon(project) {
  const cfg=project?.warehouseBeacon,samples=cfg?.samples;
  if(cfg?.kind!=="occupancy-status-beacon"||!Array.isArray(samples)||samples.length<1||samples.length>300||samples.some(state=>!STATES.has(state)))
    return {state:"blocked",engine:"Warehouse occupancy beacon concept",message:"Provide 1–300 vacant, occupied, or fault input states.",errors:[{code:"WAREHOUSE_BEACON_CONFIGURATION",message:"The occupancy state sequence is invalid."}],warnings:[],result:null};
  let transitions=0;const frames=samples.map((state,index)=>{if(index>0&&samples[index-1]!==state)transitions+=1;return {step:index+1,state,greenOn:state==="vacant",redOn:state==="occupied",amberOn:state==="fault",buzzerOn:state==="fault"};});
  const oneStatusPerFrame=frames.every(frame=>Number(frame.greenOn)+Number(frame.redOn)+Number(frame.amberOn)===1);
  return {state:"complete",engine:"Deterministic occupancy-to-beacon mapping",message:"Vacant, occupied, and fault states map to distinct beacon outputs.",errors:[],warnings:[{code:"WAREHOUSE_BEACON_CONCEPT_ONLY",message:"Synthetic status inputs and LED/buzzer commands only; no sensor, machine interface, visibility range, sound level, installation, or industrial safety behavior is modeled."}],result:{kind:"warehouse-beacon-state-sequence",sampleCount:frames.length,transitionCount:transitions,oneStatusPerFrame,frames}};
}
