const UNITS=Object.freeze({
  "Ω":{dimension:"resistance",scale:1},"mΩ":{dimension:"resistance",scale:1e-3},"kΩ":{dimension:"resistance",scale:1e3},"MΩ":{dimension:"resistance",scale:1e6},
  "W":{dimension:"power",scale:1},"mW":{dimension:"power",scale:1e-3},"kW":{dimension:"power",scale:1e3},
  "m":{dimension:"length",scale:1},"cm":{dimension:"length",scale:1e-2},"mm":{dimension:"length",scale:1e-3},"km":{dimension:"length",scale:1e3}
});

export function convertEngineeringUnit(value,fromUnit,toUnit,precision=6) {
  if(typeof value!=="number"||!Number.isFinite(value))return {ok:false,error:"Value must be a finite number."};
  if(!Number.isInteger(precision)||precision<1||precision>12)return {ok:false,error:"Precision must be an integer from 1 to 12 significant digits."};
  const from=UNITS[fromUnit],to=UNITS[toUnit];if(!from||!to)return {ok:false,error:"Choose a supported SI unit."};
  if(from.dimension!==to.dimension)return {ok:false,error:"Units must belong to the same physical dimension."};
  const baseValue=value*from.scale,result=baseValue/to.scale;if(!Number.isFinite(result))return {ok:false,error:"Converted value is outside the finite numeric range."};
  const rounded=Number(result.toPrecision(precision));return {ok:true,value:rounded,dimension:from.dimension,fromUnit,toUnit,precision};
}

export function runUnitConversionCalculator(project) {
  const cfg=project?.unitConversionCalculator;
  if(cfg?.kind!=="si-conversion-cases"||!Array.isArray(cfg.cases)||cfg.cases.length===0)return {state:"blocked",engine:"SI unit conversion calculator",message:"Provide at least one declared conversion case.",errors:[{code:"UNIT_CONVERSION_CONFIGURATION",message:"Conversion cases are required."}],warnings:[],result:null};
  const results=[];for(const item of cfg.cases){const converted=convertEngineeringUnit(item.value,item.fromUnit,item.toUnit,item.precision??6);if(!converted.ok)return {state:"blocked",engine:"SI unit conversion calculator",message:"A conversion case has an invalid value or unit.",errors:[{code:"UNIT_CONVERSION_INVALID",message:item.id+": "+converted.error}],warnings:[],result:null};results.push({id:item.id,category:item.category,value:item.value,fromUnit:item.fromUnit,toUnit:item.toUnit,convertedValue:converted.value,dimension:converted.dimension,precision:converted.precision});}
  return {state:"complete",engine:"Deterministic SI prefix conversion",message:"Resistor, power, and length conversions use exact SI scale factors with explicit significant-digit rounding.",errors:[],warnings:[],result:{kind:"si-unit-conversion-cases",caseCount:results.length,results}};
}