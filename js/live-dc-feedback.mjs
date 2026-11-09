import { buildDcWireFeedback } from "./dc-wire-feedback.mjs";

// One debounced worker per edit generation; stale/cancelled results never paint.
export function createLiveDcFeedback({ run, onResult=()=>{}, onPaint=()=>{}, schedule=setTimeout, unschedule=clearTimeout, delay=150 }) {
  let generation=0,timer=null,job=null,key=null,active=false,status="idle",data=null;
  const cancel=()=>{generation++;if(timer!==null)unschedule(timer);timer=null;job?.cancel();job=null;};
  function accept(project,result) {
    cancel();key=JSON.stringify(project);data=buildDcWireFeedback(project,result);active=data.available;status=active?"ready":"unsupported";onPaint();
  }
  function observe(project) {
    if(!active)return;
    const next=JSON.stringify(project);if(next===key)return;
    cancel();key=next;data=null;status="updating";
    const ticket=generation,snapshot=JSON.parse(next);
    timer=schedule(()=>{
      timer=null;const pending=run(snapshot);job=pending;
      pending.promise.then(result=>{
        if(ticket!==generation||!active)return;
        job=null;data=buildDcWireFeedback(snapshot,result);status=data.available?"ready":"unsupported";
        onResult(result);onPaint();
      }).catch(()=>{if(ticket===generation){job=null;data=null;status="unavailable";onPaint();}});
    },delay);
  }
  function stop(paint=true){cancel();active=false;key=null;data=null;status="idle";if(paint)onPaint();}
  return {accept,observe,stop,read:()=>({active,status,data})};
}
