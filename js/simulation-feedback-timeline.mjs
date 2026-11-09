import { buildDcWireFeedback } from "./dc-wire-feedback.mjs";

export function createFeedbackTimeline(project, analysis) {
  const result=analysis?.result, layout=analysis?.feedbackLayout;
  if(analysis?.state==="complete" && result?.kind==="linear-rlc-transient") {
    const samples=result.samples;
    if(!layout || !Array.isArray(layout.nets) || !Array.isArray(layout.branches) || !Array.isArray(samples) || !samples.length || samples.length>2000)return null;
    const components=new Map(project.components.map(c=>[c.instanceId,c])),nets=new Set(project.nets.map(n=>n.id));
    if(!nets.has(layout.groundNet)||new Set(layout.nets).size!==layout.nets.length||layout.nets.some(n=>!nets.has(n)||n===layout.groundNet)||new Set(layout.branches.map(b=>b.instanceId)).size!==layout.branches.length)return null;
    if(layout.branches.some(b=>{const c=components.get(b.instanceId);return !c||c.reference!==b.reference||!Array.isArray(b.pins)||b.pins.join(",")!==(c.libraryId==="power.dc-source"?"+,-":"1,2");}))return null;
    let previous=0;
    for(const s of samples){
      if(!Number.isFinite(s.timeSeconds)||s.timeSeconds<=previous||s.nodeVoltages?.length!==layout.nets.length||s.branchCurrents?.length!==layout.branches.length||![...s.nodeVoltages,...s.branchCurrents].every(Number.isFinite))return null;
      previous=s.timeSeconds;
    }
    return {kind:"transient",length:samples.length,time:index=>samples[index]?.timeSeconds??0,frame:index=>{
      const sample=samples[index];if(!sample)return null;
      const terminalCurrents={};
      layout.branches.forEach((branch,i)=>{terminalCurrents[`${branch.instanceId}:${branch.pins[0]}`]=sample.branchCurrents[i];terminalCurrents[`${branch.instanceId}:${branch.pins[1]}`]=-sample.branchCurrents[i];});
      return buildDcWireFeedback(project,{state:"complete",result:{kind:"linear-rlc-frame",nodeVoltages:Object.fromEntries([[layout.groundNet,0],...layout.nets.map((net,i)=>[net,sample.nodeVoltages[i]])]),terminalCurrents}});
    }};
  }
  const dc=buildDcWireFeedback(project,analysis);
  return dc.available?{kind:"dc",length:1,time:()=>0,frame:()=>dc}:null;
}
