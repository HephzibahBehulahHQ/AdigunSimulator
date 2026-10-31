const REQUESTS=new Set(["forward","reverse","stop"]);
export function runForwardReverseInterlock(project) {
  const cfg=project?.forwardReverseMotor,events=cfg?.events;
  if(cfg?.kind!=="mutually-exclusive-direction-concept"||!Array.isArray(events)||events.length<1||events.length>200||events.some(event=>!REQUESTS.has(event?.request)))
    return {state:"blocked",engine:"PLC forward/reverse interlock concept",message:"Provide 1–200 forward, reverse, or stop requests.",errors:[{code:"DIRECTION_SEQUENCE_CONFIGURATION",message:"The control sequence contains an unknown or out-of-range request."}],warnings:[],result:null};
  let direction="stopped";const frames=[];
  events.forEach((event,index)=>{let conflictRejected=false;if(event.request==="stop")direction="stopped";else if(direction!=="stopped"&&direction!==event.request)conflictRejected=true;else direction=event.request;
    frames.push({step:index+1,request:event.request,direction,forwardEnergized:direction==="forward",reverseEnergized:direction==="reverse",conflictRejected});});
  const noOverlap=frames.every(frame=>!(frame.forwardEnergized&&frame.reverseEnergized));
  return {state:"complete",engine:"Deterministic mutually-exclusive direction logic",message:"Opposite-direction requests are rejected until the active logical direction is stopped.",errors:[],warnings:[{code:"MOTOR_DIRECTION_CONCEPT_ONLY",message:"No contactor, motor, drive, reversing-current transient, mechanical coast, electrical interlock wiring, overload or safety behavior is modeled."}],result:{kind:"forward-reverse-interlock-sequence",frameCount:frames.length,conflictRequestsRejected:frames.filter(frame=>frame.conflictRejected).length,noOverlap,frames}};
}
