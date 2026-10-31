const ACTIONS=new Set(["start","stop","guard-open","guard-close","reset"]);
export function runDoorInterlockConcept(project) {
  const cfg=project?.doorInterlock,events=cfg?.events;
  if(cfg?.kind!=="guard-latched-interlock-concept"||!Array.isArray(events)||events.length<1||events.length>200||events.some(event=>!ACTIONS.has(event?.action)))
    return {state:"blocked",engine:"Guard-door interlock logic concept",message:"Provide 1–200 start, stop, guard-open, guard-close, or reset actions.",errors:[{code:"DOOR_INTERLOCK_CONFIGURATION",message:"The event sequence has an unsupported action or length."}],warnings:[],result:null};
  let guardClosed=cfg.initialGuardClosed===true,faultLatched=false,runRequest=false,loadEnabled=false;const frames=[];
  for(const [index,event] of events.entries()){let resetRejected=false,startRejected=false;
    if(event.action==="guard-open"){guardClosed=false;faultLatched=true;loadEnabled=false;}
    else if(event.action==="guard-close")guardClosed=true;
    else if(event.action==="stop"){runRequest=false;loadEnabled=false;}
    else if(event.action==="reset"){if(!guardClosed)resetRejected=true;else faultLatched=false;}
    else if(event.action==="start"){if(guardClosed&&!faultLatched){runRequest=true;loadEnabled=true;}else startRejected=true;}
    if(!guardClosed||faultLatched)loadEnabled=false;
    frames.push({step:index+1,action:event.action,guardClosed,faultLatched,runRequest,loadEnabled,resetRejected,startRejected});
  }
  return {state:"complete",engine:"Deterministic guard-open latch concept",message:"Opening the guard latches the logical load off; a closed guard, reset, and separate start are required to enable it again.",errors:[],warnings:[{code:"DOOR_INTERLOCK_CONCEPT_ONLY",message:"Not a guard-locking device or safety-rated interlock design; no switch diagnostics, fault tolerance, wiring, actuator, machine risk assessment, or compliance validation is modeled."}],result:{kind:"door-interlock-sequence",frameCount:frames.length,loadAlwaysDisabledWhenOpen:frames.filter(frame=>!frame.guardClosed).every(frame=>!frame.loadEnabled),resetRejectedWhenOpen:frames.some(frame=>frame.resetRejected),restartRequiresResetAndStart:frames.some(frame=>frame.action==="start"&&frame.loadEnabled),frames}};
}
