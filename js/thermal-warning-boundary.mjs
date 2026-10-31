import { runSupportedAnalysis } from "./core.mjs";

export function analyzeThermalWarningBoundary(project) {
  const plan=project?.thermalBoundary;
  if(!plan||plan.kind!=="resistor-power-advisory"||!Number.isFinite(plan.ratedPowerW)||plan.ratedPowerW<=0||!Number.isFinite(plan.deratingFactor)||plan.deratingFactor<=0||plan.deratingFactor>1)
    return {state:"blocked",engine:"Electrical dissipation and rating advisory",errors:[{code:"THERMAL_PLAN_CONFIGURATION",message:"Provide a positive resistor power rating and a derating factor from 0 to 1."}],warnings:[]};
  const resistor=project.components?.find(component=>component.reference===plan.reference&&component.libraryId==="passive.resistor");
  if(!resistor)return {state:"blocked",engine:"Electrical dissipation and rating advisory",errors:[{code:"THERMAL_PLAN_COMPONENT",message:"The configured resistor reference does not exist."}],warnings:[]};
  const analysis=runSupportedAnalysis(project);
  if(analysis.state!=="complete"||analysis.result?.kind!=="voltage-divider")return {state:"blocked",engine:"Electrical dissipation and rating advisory",errors:[{code:"THERMAL_PLAN_UNSUPPORTED",message:"The supported voltage-divider model is required to estimate electrical resistor dissipation."}],warnings:analysis.warnings??[]};
  const currentA=analysis.result.currentA;
  const dissipatedPowerW=currentA**2*analysis.result.upperResistance;
  const deratedLimitW=plan.ratedPowerW*plan.deratingFactor;
  const ratingConcern=dissipatedPowerW>deratedLimitW;
  return {state:"complete",engine:"Analytical voltage-divider dissipation advisory",errors:[],warnings:[{code:"THERMAL_MODEL_NOT_MODELED",message:"No temperature, heatsinking, ambient derating curve, enclosure, reliability, or safety certification is modeled. Verify the exact resistor datasheet and application."},...(ratingConcern?[{code:"POWER_RATING_EXCEEDED",message:"Estimated electrical dissipation exceeds the user-entered derated resistor power rating; select and verify a suitable part."}]:[])],result:{kind:"thermal-warning-boundary",reference:plan.reference,resistorDissipationW:dissipatedPowerW,ratedPowerW:plan.ratedPowerW,deratingFactor:plan.deratingFactor,deratedLimitW,recommendedMinimumRatingW:dissipatedPowerW/plan.deratingFactor,ratingConcern,temperatureRiseC:null,thermalModel:"not-modeled"}};
}
