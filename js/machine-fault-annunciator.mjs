const validFaultId=id=>typeof id==="string"&&/^[A-Z0-9_-]{1,20}$/.test(id);
export function runMachineFaultAnnunciator(project) {
  const cfg=project?.machineFaultAnnunciator,events=cfg?.events;
  const validEvent=event=>event?.action==="ack"||(event?.action==="update"&&Array.isArray(event.activeFaults)&&event.activeFaults.length<=100&&event.activeFaults.every(validFaultId)&&new Set(event.activeFaults).size===event.activeFaults.length);
  if(cfg?.kind!=="latched-fault-acknowledge-clear"||!Array.isArray(events)||events.length<1||events.length>300||events.some(event=>!validEvent(event)))
    return {state:"blocked",engine:"Machine fault annunciator logic concept",message:"Provide 1–300 acknowledge or valid active-fault update events.",errors:[{code:"FAULT_ANNUNCIATOR_CONFIGURATION",message:"The fault list or event sequence is invalid."}],warnings:[],result:null};
  const faults=new Map(),frames=[];
  const clearAcknowledged=()=>{for(const [id,state] of faults)if(!state.active&&state.acknowledged)faults.delete(id);};
  events.forEach((event,index)=>{if(event.action==="update"){const active=new Set(event.activeFaults);for(const [id,state] of faults)state.active=active.has(id);for(const id of active){if(!faults.has(id))faults.set(id,{active:true,acknowledged:false});else faults.get(id).active=true;}clearAcknowledged();}
    else{for(const state of faults.values())state.acknowledged=true;clearAcknowledged();}
    const latchedFaults=[...faults.keys()].sort();const buzzerOn=[...faults.values()].some(state=>!state.acknowledged);
    frames.push({step:index+1,action:event.action,activeFaults:event.action==="update"?[...event.activeFaults]:[...faults].filter(([,state])=>state.active).map(([id])=>id).sort(),latchedFaults,acknowledgedFaults:[...faults].filter(([,state])=>state.acknowledged).map(([id])=>id).sort(),faultLampOn:latchedFaults.length>0,buzzerOn,healthyLampOn:latchedFaults.length===0});});
  return {state:"complete",engine:"Deterministic latched-fault acknowledgement concept",message:"Faults remain annunciated until both the input has cleared and an acknowledgement has been received.",errors:[],warnings:[{code:"FAULT_ANNUNCIATOR_CONCEPT_ONLY",message:"Logical latching and indicators only; no industrial input circuits, alarm priorities, audible levels, safety function, machine-control interlock, or reliability standard is modeled."}],result:{kind:"machine-fault-latched-sequence",frameCount:frames.length,frames}};
}
