import { readPcbNetClasses, savePcbNetClass, removePcbNetClass, savePcbClassClearance, removePcbClassClearance } from "./pcb-net-classes.mjs";
import { validatePcbFabrication } from "./pcb-export.mjs";

export function createPcbNetClassEditor({ state, $, $$, t, escape, captureHistory, render, activateView, log }) {
  const dialog=$("#pcb-classes-dialog"); let openedProject=null, selectedId="", policy;
  const option=(value,text)=>`<option value="${escape(value)}">${escape(text)}</option>`;
  function fillClass() {
    const selected=policy.classes.find(item=>item.id===selectedId), board=state.project.pcbFabrication?.board;
    $("#pcb-class-name").value=selected?.name??"";
    $("#pcb-class-width").value=selected?.minimumWidthMm??board?.minimumTraceWidthMm??0.25;
    $("#pcb-class-clearance").value=selected?.minimumClearanceMm??board?.minimumClearanceMm??0.2;
    $("#pcb-class-members").innerHTML=state.project.nets.filter(net=>net.id!=="NC").map(net=>`<label class="net-member"><input type="checkbox" data-class-net="${escape(net.id)}" ${selected?.netIds.includes(net.id)?"checked":""}/><span>${escape(net.id)}</span></label>`).join("") || `<p>${escape(t("pcbClassNoNets"))}</p>`;
    $("#pcb-class-remove").disabled=!selected||Boolean(policy.errors.length);
  }
  function fillRule() {
    const a=$("#pcb-rule-a").value,b=$("#pcb-rule-b").value;
    const rule=policy.rules.find(r=>r.classA===a&&r.classB===b||r.classA===b&&r.classB===a);
    $("#pcb-rule-clearance").value=rule?.minimumClearanceMm??state.project.pcbFabrication?.board?.minimumClearanceMm??0.2;
    $("#pcb-rule-remove").disabled=!rule||Boolean(policy.errors.length);
  }
  function refresh() {
    policy=readPcbNetClasses(state.project.pcbFabrication,new Set(state.project.nets.map(net=>net.id)));
    $("#pcb-class-error").textContent=policy.errors.join(" ");
    $("#pcb-class-picker").innerHTML=option("",t("pcbClassNew"))+policy.classes.map(item=>option(item.id,item.name)).join("");
    if(!policy.classes.some(item=>item.id===selectedId))selectedId="";
    $("#pcb-class-picker").value=selectedId;
    const options=policy.classes.map(item=>option(item.id,item.name)).join("");
    for(const id of ["#pcb-rule-a","#pcb-rule-b"]){const old=$(id).value;$(id).innerHTML=options;if(policy.classes.some(item=>item.id===old))$(id).value=old;}
    $("#pcb-rule-picker").innerHTML=option("",t("pcbRuleNew"))+policy.rules.map((rule,index)=>option(String(index),`${rule.classA} ↔ ${rule.classB} · ${rule.minimumClearanceMm} mm`)).join("");
    $("#pcb-class-apply").disabled=Boolean(policy.errors.length);
    $("#pcb-rule-apply").disabled=!policy.classes.length||Boolean(policy.errors.length);
    fillClass(); fillRule();
  }
  function commit(result, id=selectedId) {
    if(state.project!==openedProject){$("#pcb-class-error").textContent=t("pcbClassStale");return;}
    if(result.status==="blocked"){$("#pcb-class-error").textContent=result.errors.join(" ");return;}
    if(result.status==="unchanged")return;
    captureHistory(); state.project=result.project; openedProject=state.project; selectedId=id;
    state.dirty=true;state.lastValidation=null;state.pcbRouteDraft=null;state.pcbRouteHintKey=null;state.pcbViaDraft=null;state.activeTool="select";
    activateView("pcb");render();refresh();
    const checks=validatePcbFabrication(state.project);
    const summary=checks.status==="passed"?t("pcbClassChecksPass"):`${checks.errors.length} PCB check(s): ${checks.errors.slice(0,4).join(" ")}`;
    $("#pcb-class-result").textContent=summary;log(`[PCB NET CLASSES] ${summary}`);
  }
  function action(name) {
    if(name!=="pcb-net-classes")return false;
    openedProject=state.project;selectedId="";refresh();$("#pcb-class-result").textContent="";
    if(!state.project.pcbFabrication?.board){$("#pcb-class-error").textContent=t("pcbClassNeedBoard");$("#pcb-class-apply").disabled=true;}
    dialog.showModal();return true;
  }
  $("#pcb-classes-close").addEventListener("click",()=>dialog.close());
  $("#pcb-class-picker").addEventListener("change",()=>{selectedId=$("#pcb-class-picker").value;fillClass();});
  $("#pcb-class-form").addEventListener("submit",event=>{event.preventDefault();const result=savePcbNetClass(state.project,{id:selectedId||undefined,name:$("#pcb-class-name").value,netIds:$$('[data-class-net]:checked').map(input=>input.dataset.classNet),minimumWidthMm:Number($("#pcb-class-width").value),minimumClearanceMm:Number($("#pcb-class-clearance").value)});commit(result,result.classId??selectedId);});
  $("#pcb-class-remove").addEventListener("click",()=>commit(removePcbNetClass(state.project,selectedId),""));
  for(const id of ["#pcb-rule-a","#pcb-rule-b"])$(id).addEventListener("change",fillRule);
  $("#pcb-rule-picker").addEventListener("change",()=>{const value=$("#pcb-rule-picker").value;if(value==="")return;const rule=policy.rules[Number(value)];if(!rule)return;$("#pcb-rule-a").value=rule.classA;$("#pcb-rule-b").value=rule.classB;fillRule();});
  const pair=()=>({classA:$("#pcb-rule-a").value,classB:$("#pcb-rule-b").value});
  $("#pcb-rule-form").addEventListener("submit",event=>{event.preventDefault();commit(savePcbClassClearance(state.project,{...pair(),minimumClearanceMm:Number($("#pcb-rule-clearance").value)}));});
  $("#pcb-rule-remove").addEventListener("click",()=>commit(removePcbClassClearance(state.project,pair())));
  return { action };
}
