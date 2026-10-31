const DIGITS=Object.freeze({black:0,brown:1,red:2,orange:3,yellow:4,green:5,blue:6,violet:7,grey:8,gray:8,white:9});
const MULTIPLIERS=Object.freeze({...Object.fromEntries(Object.entries(DIGITS).map(([color,digit])=>[color,10**digit])),gold:0.1,silver:0.01});
const TOLERANCE=Object.freeze({brown:1,red:2,green:0.5,blue:0.25,violet:0.1,grey:0.05,gray:0.05,gold:5,silver:10,none:20});

function formatResistance(ohms) {
  if(ohms>=1e6)return Number((ohms/1e6).toPrecision(4))+" MΩ";
  if(ohms>=1e3)return Number((ohms/1e3).toPrecision(4))+" kΩ";
  return Number(ohms.toPrecision(4))+" Ω";
}

export function readResistorBands(bands) {
  if(!Array.isArray(bands)||(bands.length!==4&&bands.length!==5))return {valid:false,error:"Use exactly four or five bands."};
  const colors=bands.map(color=>typeof color==="string"?color.trim().toLowerCase():"");
  const digitCount=colors.length-2,digits=colors.slice(0,digitCount),multiplierColor=colors[digitCount],toleranceColor=colors[digitCount+1];
  if(digits.some(color=>DIGITS[color]===undefined)||DIGITS[digits[0]]===0)return {valid:false,error:"Significant bands must use digit colors and the first band cannot be black or metallic."};
  if(MULTIPLIERS[multiplierColor]===undefined)return {valid:false,error:"Multiplier band color is not supported."};
  if(TOLERANCE[toleranceColor]===undefined)return {valid:false,error:"Tolerance band color is not supported."};
  const significant=Number(digits.map(color=>DIGITS[color]).join("")),resistanceOhms=significant*MULTIPLIERS[multiplierColor];
  if(!Number.isFinite(resistanceOhms)||resistanceOhms<=0)return {valid:false,error:"Band combination does not produce a finite positive resistance."};
  return {valid:true,bandCount:colors.length,resistanceOhms,formattedResistance:formatResistance(resistanceOhms),tolerancePercent:TOLERANCE[toleranceColor],significantDigits:digitCount};
}

export function runResistorColorCodeReader(project) {
  const cfg=project?.resistorColorCodeReader;
  if(cfg?.kind!=="resistor-band-cases"||!Array.isArray(cfg.cases)||cfg.cases.length===0)return {state:"blocked",engine:"Resistor color-code reader",message:"Provide resistor band cases.",errors:[{code:"RESISTOR_BAND_CONFIGURATION",message:"At least one case is required."}],warnings:[],result:null};
  const results=cfg.cases.map(item=>({id:item.id,bands:item.bands,reading:readResistorBands(item.bands)}));
  return {state:"complete",engine:"Standard four- and five-band resistor code",message:"Valid bands display nominal resistance and tolerance; malformed or unsupported combinations are rejected.",errors:[],warnings:[],result:{kind:"resistor-color-code-cases",caseCount:results.length,validCount:results.filter(item=>item.reading.valid).length,rejectedCount:results.filter(item=>!item.reading.valid).length,results}};
}