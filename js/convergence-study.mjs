const FIXTURES=Object.freeze({
  "nonlinear-diode-loop":{
    title:"Unregularized nonlinear diode loop",
    diagnosis:"The fixture requires a nonlinear SPICE operating-point solver, which this bounded analytical simulator does not provide.",
    actions:["Use a SPICE-capable solver for this circuit.","Inspect the diode model and add a physically justified series resistance or current-limiting path.","Check for floating nodes, contradictory ideal sources, and missing DC paths."]
  }
});
export function analyzeConvergenceStudy(project) {
  const study=project?.convergenceStudy,fixture=FIXTURES[study?.fixture];
  if(!fixture)return {state:"blocked",engine:"Convergence study boundary",message:"Choose a documented convergence-study fixture.",errors:[{code:"CONVERGENCE_FIXTURE_UNKNOWN",message:"No matching convergence fixture is registered."}],warnings:[],result:null};
  return {state:"blocked",engine:"Convergence study boundary",message:fixture.diagnosis,errors:[{code:"SPICE_SOLVER_UNAVAILABLE",message:fixture.diagnosis},{code:"CONVERGENCE_NOT_ATTEMPTED",message:"No numerical iteration was run; iteration count and electrical results are intentionally unavailable."}],warnings:[],result:null,diagnostics:{fixture:study.fixture,actions:[...fixture.actions],solverIterations:null,reportedElectricalResult:null}};
}
