const MIN_RESISTANCE_OHMS=0.01;
const MAX_RESISTANCE_OHMS=1e9;
function parseResistance(value) {
  const match=String(value??"").trim().replaceAll(",","").match(/^([+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*(Ω|ohms?|kΩ|kOhm|MΩ|MOhm|GΩ|GOhm)?$/i);
  if(!match)return Number.NaN;
  const suffix=match[2]??"";
  const multiplier=/^k/i.test(suffix)?1e3:/^m/i.test(suffix)?1e6:/^g/i.test(suffix)?1e9:1;
  return Number(match[1])*multiplier;
}
export function validateComponentProperty(component,value) {
  if(component?.libraryId!=="passive.resistor")return {valid:true,errors:[]};
  const resistanceOhms=parseResistance(value);
  if(!Number.isFinite(resistanceOhms)||resistanceOhms<MIN_RESISTANCE_OHMS||resistanceOhms>MAX_RESISTANCE_OHMS)return {valid:false,errors:[{code:"RESISTANCE_RANGE",message:"Enter a finite resistance from 0.01 Ω through 1 GΩ."}]};
  return {valid:true,resistanceOhms,errors:[]};
}
