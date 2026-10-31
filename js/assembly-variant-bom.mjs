const csv=(value)=>'"'+String(value??"").replaceAll('"','""')+'"';
export function createAssemblyVariantBoms(project){
  const parts=project?.pcbFabrication?.parts,components=project?.components,variants=project?.assemblyVariants;
  if(!Array.isArray(parts)||!Array.isArray(components))return {status:"blocked",errors:["PCB parts and project components are required for assembly variants."],files:{}};
  if(variants===undefined)return {status:"passed",errors:[],files:{},variants:[]};
  if(!Array.isArray(variants)||variants.length<2)return {status:"blocked",errors:["At least two assembly variants are required when variant data is present."],files:{}};
  const refs=new Set(parts.map(part=>part.reference)),ids=new Set(),files={};
  for(const variant of variants){
    if(!variant||typeof variant!=="object"||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(variant.id??"")||!variant.name?.trim()||ids.has(variant.id))return {status:"blocked",errors:["Assembly variant IDs and names must be unique and valid."],files:{}};
    ids.add(variant.id);
    if(!Array.isArray(variant.dnpReferences)||variant.dnpReferences.some(ref=>!refs.has(ref))||new Set(variant.dnpReferences).size!==variant.dnpReferences.length)return {status:"blocked",errors:["Variant "+variant.id+" contains an unknown or duplicate DNP designator."],files:{}};
    const dnp=new Set(variant.dnpReferences),rows=[["Designator","Quantity","Value","Footprint","Technology","Status"]];
    for(const part of [...parts].sort((a,b)=>a.reference.localeCompare(b.reference))){
      if(dnp.has(part.reference))continue;
      const component=components.find(item=>item.instanceId===part.instanceId);
      if(!component)return {status:"blocked",errors:["No project component exists for "+part.reference+"."],files:{}};
      rows.push([part.reference,"1",component.value??"",part.footprint,part.technology,"Fit"]);
    }
    files["BOM-"+variant.id+".csv"]=rows.map(row=>row.map(csv).join(",")).join("\r\n")+"\r\n";
  }
  return {status:"passed",errors:[],files,variants:variants.map(({id,name,dnpReferences})=>({id,name,dnpReferences:[...dnpReferences]}))};
}
