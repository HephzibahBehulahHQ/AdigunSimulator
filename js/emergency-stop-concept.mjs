const ACTIONS=new Set(["start","stop","estop-trip","estop-release","reset"]);
export function runEmergencyStopConcept(project) {
  const cfg=project?.emergencyStopConcept,events=cfg?.events;
  if(cfg?.kind!=="latched-stop-reset-concept"||!Array.isArray(events)||events.length<1||events.length>200||events.some(event=>!ACTIONS.has(event?.action)))
    return {state:"blocked",engine:"Emergency-stop latch logic concept",message:"Provide 1–200 supported start, stop, trip, release, or reset actions.",errors:[{code:"ESTOP_SEQUENCE_CONFIGURATION",message:"The sequence contains an unknown action or is outside the supported range."}],warnings:[],result:null};
  let estopHealthy=true,latched=false,loadEnabled=false;const frames=[];
  events.forEach((event,index)=>{let resetRejected=false,startRejected=false;
    if(event.action==="estop-trip"){estopHealthy=false;latched=true;loadEnabled=false;}
    else if(event.action==="estop-release")estopHealthy=true;
    else if(event.action==="stop")loadEnabled=false;
    else if(event.action==="reset"){if(!estopHealthy)resetRejected=true;else latched=false;}
    else if(event.action==="start"){if(estopHealthy&&!latched)loadEnabled=true;else startRejected=true;}
    frames.push({step:index+1,action:event.action,estopHealthy,latched,loadEnabled,resetRejected,startRejected});
  });
  return {state:"complete",engine:"Deterministic emergency-stop latch concept",message:"An E-stop trip disables the logical load and latches the state; reset while tripped is rejected, and reset alone never restarts the load.",errors:[],warnings:[{code:"ESTOP_CONCEPT_NOT_SAFETY_RATED",message:"This educational Boolean model is not a safety relay, emergency-stop circuit design, validated performance level, risk assessment, or machinery safety function."}],result:{kind:"emergency-stop-latched-sequence",frameCount:frames.length,unsafeResetRejected:frames.some(frame=>frame.resetRejected),restartRequiresNewStart:frames.some((frame,index)=>frame.action==="reset"&&frame.loadEnabled===false&&frames.slice(index+1).some(next=>next.action==="start"&&next.loadEnabled)),frames}};
}
