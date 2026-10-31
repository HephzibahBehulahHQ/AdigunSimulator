export function runConveyorCounter(project) {
  const cfg=project?.conveyorCounter,events=cfg?.photoeyeEvents;
  if(cfg?.kind!=="rising-edge-target-counter"||!Number.isInteger(cfg.targetCount)||cfg.targetCount<1||cfg.targetCount>100||!Array.isArray(events)||events.length<1||events.length>500||events.some(value=>typeof value!=="boolean"))
    return {state:"blocked",engine:"PLC conveyor counter concept",message:"Provide a target from 1–100 and 1–500 Boolean photoeye samples.",errors:[{code:"CONVEYOR_COUNTER_CONFIGURATION",message:"Target and event samples are outside the supported bounded input range."}],warnings:[],result:null};
  let count=0,previous=false,running=true,stoppedAtEvent=null;const frames=[];
  events.forEach((photoeye,index)=>{const risingEdge=running&&photoeye&&!previous;if(risingEdge){count+=1;if(count>=cfg.targetCount){running=false;stoppedAtEvent=index+1;}}frames.push({step:index+1,photoeye,count,risingEdge,motorRunning:running});previous=photoeye;});
  return {state:"complete",engine:"Deterministic PLC photoeye edge counter",message:"Counts rising photoeye edges and latches the logical conveyor command off at its target.",errors:[],warnings:[{code:"CONVEYOR_CONCEPT_ONLY",message:"Boolean event model only; no photoeye electrical behavior, conveyor inertia, braking distance, motor drive, jam detection, guarding, or machine-safety validation is modeled."}],result:{kind:"conveyor-edge-counter",targetCount:cfg.targetCount,finalCount:count,eventCount:events.length,stoppedAtEvent,motorStopped:!running,frames}};
}
