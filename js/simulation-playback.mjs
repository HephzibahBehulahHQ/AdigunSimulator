import { createFeedbackTimeline } from "./simulation-feedback-timeline.mjs";

// Calculations run in a worker; playback displays their actual sample timestamps.
// Wall-clock playback is intentionally slowed to five seconds per recorded trace.
export function createSimulationPlayback({run,onResult=()=>{},onPaint=()=>{},schedule=setTimeout,unschedule=clearTimeout,now=()=>performance.now(),delay=150,playbackDurationMs=5000}) {
  let generation=0,timer=null,job=null,playTimer=null,key=null,active=false,status="idle",data=null,timeline=null,index=-1,playback="idle";
  let anchorWall=0,anchorTime=0;
  let pausedIntent=false;
  const cancelPlayback=()=>{if(playTimer!==null)unschedule(playTimer);playTimer=null;};
  const cancel=()=>{generation++;if(timer!==null)unschedule(timer);timer=null;job?.cancel();job=null;cancelPlayback();};
  const time=()=>timeline?.time(index)??0;
  const scale=()=>timeline?.kind==="transient"?timeline.time(timeline.length-1)/(playbackDurationMs/1000):0;
  const paintFrame=()=>{data=timeline?.frame(index)??null;onPaint({frameOnly:true});};
  function queuePlayback(){
    cancelPlayback();if(playback!=="running"||timeline?.kind!=="transient")return;
    if(index===timeline.length-1){playback="complete";return;}
    anchorWall=now();anchorTime=time();
    const tick=()=>{
      playTimer=null;if(playback!=="running"||!timeline||status!=="ready")return;
      const target=anchorTime+(now()-anchorWall)/1000*scale();
      let next=index;while(next+1<timeline.length&&timeline.time(next+1)<=target)next++;
      if(next!==index){index=next;if(index===timeline.length-1)playback="complete";paintFrame();}
      if(playback==="running")playTimer=schedule(tick,40);
    };
    playTimer=schedule(tick,40);
  }
  function load(project,result,preserve=false){
    const savedTime=time(),savedPlayback=playback;
    timeline=createFeedbackTimeline(project,result);key=JSON.stringify(project);active=Boolean(timeline);status=active?"ready":"unsupported";
    index=active?0:-1;
    if(preserve&&timeline?.kind==="transient")while(index+1<timeline.length&&timeline.time(index+1)<=savedTime)index++;
    playback=active?(preserve&&pausedIntent?"paused":"running"):"idle";
    if(preserve&&savedPlayback==="complete"&&timeline?.kind==="transient"&&index===timeline.length-1)playback="complete";
    data=timeline?.frame(index)??null;
    queuePlayback();
  }
  function accept(project,result){cancel();pausedIntent=false;load(project,result);onPaint();}
  function observe(project){
    if(!active)return;
    const next=JSON.stringify(project);if(next===key)return;
    cancel();key=next;data=null;status="updating";
    const ticket=generation,snapshot=JSON.parse(next);
    timer=schedule(()=>{
      timer=null;job=run(snapshot);
      job.promise.then(result=>{
        if(ticket!==generation||!active)return;
        job=null;load(snapshot,result,true);
        // Keep listening after a failed edit so correcting it can recover.
        active=true;onResult(result);onPaint();
      }).catch(()=>{if(ticket===generation){job=null;data=null;timeline=null;status="unavailable";playback="idle";onPaint();}});
    },delay);
  }
  function pause(){if(!active||playback!=="running")return false;cancelPlayback();pausedIntent=true;playback="paused";onPaint({frameOnly:true});return true;}
  function resume(){if(!timeline||status!=="ready")return false;if(playback==="running")return true;if(index===timeline.length-1&&timeline.kind==="transient")index=0;pausedIntent=false;playback="running";queuePlayback();paintFrame();return true;}
  function step(){if(!timeline||timeline.kind!=="transient"||status!=="ready"||index>=timeline.length-1)return false;cancelPlayback();pausedIntent=true;playback="paused";index++;paintFrame();return true;}
  function stop(paint=true){cancel();active=false;key=null;data=null;timeline=null;index=-1;status="idle";playback="stopped";pausedIntent=false;if(paint)onPaint();}
  return {accept,observe,stop,pause,resume,step,canResume:project=>key===JSON.stringify(project)&&status==="ready"&&["running","paused","complete"].includes(playback),read:()=>({active,status,data,playback,timeSeconds:time(),sampleIndex:index,sampleCount:timeline?.length??0,kind:timeline?.kind??null,speed:scale()})};
}
