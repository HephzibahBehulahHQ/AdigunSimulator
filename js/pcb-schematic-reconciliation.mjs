const csv=v=>'"'+String(v??"").replaceAll('"','""')+'"';
export function reviewPcbSchematicReconciliation(project,decisions=project?.pcbFabrication?.reconciliationDecisions??{}){
  const pcb=project?.pcbFabrication,changes=pcb?.reconciliationChanges,snapshot=pcb?.schematicSnapshot,rows=[["Change","Reference","Field","Schematic_source","PCB_current","Proposed_PCB","Decision","Status"]],errors=[],items=[];
  if(!Array.isArray(changes)||!snapshot)return {status:"blocked",errors:["A schematic snapshot and proposed PCB changes are required."],items:[],report:rows.map(r=>r.map(csv).join(",")).join("\r\n")+"\r\n"};
  const parts=new Map((pcb.parts??[]).map(x=>[x.reference,x])),pads=new Map((pcb.pads??[]).map(x=>[x.reference+":"+x.pin,x]));
  const ids=new Set();
  for(const change of changes){
    if(!change?.id||ids.has(change.id)||!["footprint","net"].includes(change.kind)||!change.reference||!change.proposedValue){errors.push("Reconciliation changes need unique IDs, a supported field, reference and proposed value.");continue;}ids.add(change.id);
    let source,current;
    if(change.kind==="footprint"){source=snapshot.footprints?.[change.reference];current=parts.get(change.reference)?.footprint;}
    else{source=snapshot.padNets?.[change.reference+":"+change.pin];current=pads.get(change.reference+":"+change.pin)?.netId;}
    if(!source||!current){errors.push("The source snapshot or current PCB item is missing for "+change.id+".");continue;}
    const decision=decisions?.[change.id]??"",valid=decision==="schematic"||decision==="pcb";
    const status=valid?"CHOICE_RECORDED":"CHOICE_REQUIRED";
    if(!valid)errors.push(change.id+": choose whether to keep the schematic source or accept the proposed PCB edit.");
    const item={id:change.id,reference:change.reference,field:change.kind,sourceValue:source,currentPcbValue:current,proposedPcbValue:change.proposedValue,decision:valid?decision:null,status};
    items.push(item);rows.push([item.id,item.reference,item.field,item.sourceValue,item.currentPcbValue,item.proposedPcbValue,item.decision??"",item.status]);
  }
  const report=rows.map(r=>r.map(csv).join(",")).join("\r\n")+"\r\n";
  return {status:errors.length?"choice-required":"choice-recorded",errors,items,report,sourceProjectUnchanged:true,limitations:["This review records conflicts and choices only; it never rewrites the schematic or PCB project.","A recorded choice is not applied to the project. Re-run electrical validation and PCB DRC after a separately reviewed edit."]};
}
