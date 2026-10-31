export function runElevatorCallQueue(project) {
  const cfg=project?.elevatorCallQueue,events=cfg?.events;
  const valid=event=>event&&((event.action==="call"&&Number.isInteger(event.floor)&&event.floor>=1&&event.floor<=cfg.floorCount)||(event.action==="dispatch"&&!Object.hasOwn(event,"floor")));
  if(cfg?.kind!=="fifo-floor-call-scheduler"||!Number.isInteger(cfg.floorCount)||cfg.floorCount<2||cfg.floorCount>100||!Array.isArray(events)||events.length<1||events.length>300||events.some(event=>!valid(event)))
    return {state:"blocked",engine:"Elevator request-queue concept",message:"Provide a 2–100 floor range and 1–300 valid floor-call or dispatch events.",errors:[{code:"ELEVATOR_QUEUE_CONFIGURATION",message:"Floor bounds or call/dispatch events are invalid."}],warnings:[],result:null};
  const queue=[],frames=[],dispatchedTargets=[];let duplicateCallsIgnored=0;
  events.forEach((event,index)=>{let outcome="";let activeTarget=null;
    if(event.action==="call"){if(queue.includes(event.floor)){duplicateCallsIgnored+=1;outcome="duplicate-pending-call-ignored";}else{queue.push(event.floor);outcome="queued";}}
    else if(queue.length){activeTarget=queue.shift();dispatchedTargets.push(activeTarget);outcome="next-target-dispatched";}
    else outcome="queue-empty";
    frames.push({step:index+1,action:event.action,floor:event.floor??null,outcome,activeTarget,queue:[...queue]});});
  return {state:"complete",engine:"Deterministic FIFO elevator call scheduler",message:"Calls are queued first-in-first-out; duplicate pending floor calls are coalesced.",errors:[],warnings:[{code:"ELEVATOR_LOGIC_CONCEPT_ONLY",message:"Queue scheduling only; no car movement, travel time, position sensing, door behavior, load, overspeed protection, interlocks, emergency systems, or elevator safety compliance is modeled."}],result:{kind:"elevator-fifo-call-queue",floorCount:cfg.floorCount,eventCount:frames.length,duplicateCallsIgnored,dispatchedTargets,frames}};
}
