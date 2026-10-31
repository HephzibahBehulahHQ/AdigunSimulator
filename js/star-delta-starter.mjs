const COMMANDS=new Set(["start","stop","tick"]);
export function runStarDeltaStarter(project) {
  const cfg=project?.starDeltaStarter,events=cfg?.events;
  if(cfg?.kind!=="timed-star-delta-concept"||!Number.isInteger(cfg.starTimeMs)||cfg.starTimeMs<100||cfg.starTimeMs>60000||!Number.isInteger(cfg.deadTimeMs)||cfg.deadTimeMs<10||cfg.deadTimeMs>5000||!Array.isArray(events)||events.length<1||events.length>200||events.some((event,index)=>!Number.isInteger(event?.atMs)||event.atMs<0||event.atMs>600000||!COMMANDS.has(event.command)||(index>0&&event.atMs<events[index-1].atMs)))
    return {state:"blocked",engine:"PLC star-delta transition concept",message:"Use bounded star/dead-time settings and timestamped start, stop, or tick events in nondecreasing order.",errors:[{code:"STAR_DELTA_CONFIGURATION",message:"The transition parameters or event sequence is invalid."}],warnings:[],result:null};
  let running=false,startedAtMs=null;const frames=[];
  for(const event of events){if(event.command==="start"&&!running){running=true;startedAtMs=event.atMs;}else if(event.command==="stop"){running=false;startedAtMs=null;}
    const elapsedMs=running?event.atMs-startedAtMs:null;
    const mode=!running?"stopped":elapsedMs<cfg.starTimeMs?"star":elapsedMs<cfg.starTimeMs+cfg.deadTimeMs?"transition":"delta";
    frames.push({atMs:event.atMs,command:event.command,mode,elapsedMs,starEnergized:mode==="star",deltaEnergized:mode==="delta"});
  }
  const noOverlap=frames.every(frame=>!(frame.starEnergized&&frame.deltaEnergized));
  return {state:"complete",engine:"Deterministic star/dead-time/delta state model",message:"The logical starter moves through star, both-off transition dead time, and delta; the two commands are mutually exclusive.",errors:[],warnings:[{code:"STARTER_CONCEPT_ONLY",message:"No contactor coil, arc, motor current, torque, interlock wiring, overload, supply transient, or machine-safety behavior is modeled."}],result:{kind:"star-delta-transition-sequence",frameCount:frames.length,starTimeMs:cfg.starTimeMs,deadTimeMs:cfg.deadTimeMs,frames,noOverlap}};
}
