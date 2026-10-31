const ACTIONS=new Set(["open","close","stop","open-limit","closed-limit"]);
export function runGarageDoorConcept(project) {
  const cfg=project?.garageDoorConcept,events=cfg?.events;
  if(cfg?.kind!=="limit-switch-direction-concept"||!["open","closed"].includes(cfg.initialPosition)||!Array.isArray(events)||events.length<1||events.length>200||events.some(event=>!ACTIONS.has(event?.action)))
    return {state:"blocked",engine:"Garage-door limit-switch logic concept",message:"Set an initial open/closed position and provide 1–200 supported commands or limit events.",errors:[{code:"GARAGE_DOOR_CONFIGURATION",message:"The initial position or event sequence is invalid."}],warnings:[],result:null};
  let mode="stopped",openLimit=cfg.initialPosition==="open",closedLimit=cfg.initialPosition==="closed";const frames=[];
  events.forEach((event,index)=>{let conflictRejected=false;
    if(event.action==="open"){if(mode==="closing")conflictRejected=true;else if(!openLimit){mode="opening";openLimit=false;closedLimit=false;}}
    else if(event.action==="close"){if(mode==="opening")conflictRejected=true;else if(!closedLimit){mode="closing";openLimit=false;closedLimit=false;}}
    else if(event.action==="stop")mode="stopped";
    else if(event.action==="open-limit"&&mode==="opening"){mode="stopped";openLimit=true;closedLimit=false;}
    else if(event.action==="closed-limit"&&mode==="closing"){mode="stopped";closedLimit=true;openLimit=false;}
    frames.push({step:index+1,action:event.action,mode,openLimit,closedLimit,openDriveOn:mode==="opening",closeDriveOn:mode==="closing",conflictRejected});});
  const noDriveOverlap=frames.every(frame=>!(frame.openDriveOn&&frame.closeDriveOn));
  return {state:"complete",engine:"Deterministic door limit and direction logic concept",message:"Limit events stop the corresponding motion command; conflicting direction requests are rejected.",errors:[],warnings:[{code:"GARAGE_DOOR_CONCEPT_ONLY",message:"Synthetic limit events only; no door mass, travel, obstruction sensing, force limits, photoeyes, brakes, wiring, entrapment protection, or safety compliance is modeled."}],result:{kind:"garage-door-limit-sequence",frameCount:frames.length,conflictingRequestsRejected:frames.filter(frame=>frame.conflictRejected).length,noDriveOverlap,frames}};
}
